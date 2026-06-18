package com.arqulat.loom_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.databind.JsonNode;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncMessage {
    private String type; // e.g., NODE_MOVED, NODE_ADDED, CURSOR_MOVED
    private String fileId;
    private String senderId;
    private String senderName;
    private JsonNode payload;
}
