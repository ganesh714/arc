package com.arqulat.loom_backend.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

public class FileRequests {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateFileRequest {
        private String name;
        private String backgroundColor;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateFileRequest {
        private String name;
        private String canvasBgColor;
        private JsonNode nodes;
    }
}
