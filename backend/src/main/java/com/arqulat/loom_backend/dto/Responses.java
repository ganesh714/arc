package com.arqulat.loom_backend.dto;

import java.util.UUID;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

public class Responses {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectSummaryDTO {
        private UUID id;
        private String name;
        private String category;
        private int fileCount;
        private java.util.List<FileSummaryDTO> files;
        private long updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FileSummaryDTO {
        private UUID id;
        private String name;
        private String canvasBgColor;
        private int nodeCount;
        private long updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FileDetailDTO {
        private UUID id;
        private String name;
        private String canvasBgColor;
        private JsonNode nodes;
        private long updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FileVersionDTO {
        private UUID id;
        private long createdAt;
    }
}
