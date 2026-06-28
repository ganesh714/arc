package com.arqulat.loom_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.arqulat.loom_backend.dto.SyncMessage;
import com.arqulat.loom_backend.repository.DiagramFileRepository;
import java.security.Principal;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
public class CollaborationController {

    @Autowired
    private DiagramFileRepository fileRepository;

    @MessageMapping("/sync/{fileId}")
    @SendTo("/topic/files/{fileId}")
    public SyncMessage syncAction(@DestinationVariable String fileId, @Payload SyncMessage message, Principal principal) {
        log.trace("Received sync message for fileId={}: type={}, sender={}", fileId, message.getType(), message.getSenderId());
        
        if (principal == null) {
            log.warn("Unauthenticated STOMP message received for fileId={}", fileId);
            throw new IllegalArgumentException("Unauthenticated");
        }

        UUID userId = UUID.fromString(principal.getName());
        UUID parsedFileId = UUID.fromString(fileId);

        // Verify that the user owns the file before broadcasting
        if (!fileRepository.existsByIdAndProjectUserId(parsedFileId, userId)) {
            log.warn("User {} attempted to sync to unauthorized fileId={}", userId, fileId);
            throw new IllegalArgumentException("Unauthorized to access this file");
        }
        
        // Ensure senderId in the payload matches the actual authenticated user to prevent spoofing
        if (!userId.toString().equals(message.getSenderId())) {
            log.warn("User {} attempted to spoof senderId {} for fileId={}", userId, message.getSenderId(), fileId);
            throw new IllegalArgumentException("Sender ID mismatch");
        }
        
        // The message is broadcasted exactly as received to all subscribers of /topic/files/{fileId}
        return message;
    }
}
