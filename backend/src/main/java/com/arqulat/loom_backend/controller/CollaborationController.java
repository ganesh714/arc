package com.arqulat.loom_backend.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.arqulat.loom_backend.dto.SyncMessage;

import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
public class CollaborationController {

    @MessageMapping("/sync/{fileId}")
    @SendTo("/topic/files/{fileId}")
    public SyncMessage syncAction(@DestinationVariable String fileId, @Payload SyncMessage message) {
        log.trace("Received sync message for fileId={}: type={}, sender={}", fileId, message.getType(), message.getSenderId());
        
        // The message is broadcasted exactly as received to all subscribers of /topic/files/{fileId}
        return message;
    }
}
