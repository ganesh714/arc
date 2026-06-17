package com.arqulat.loom_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

public class ProjectRequests {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProjectRequest {
        private String name;
        private String category;
        private String backgroundColor; // For the initial file
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProjectRequest {
        private String name;
        private String category;
    }
}
