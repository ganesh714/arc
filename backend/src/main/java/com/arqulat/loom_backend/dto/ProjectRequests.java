package com.arqulat.loom_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ProjectRequests {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProjectRequest {
        @NotBlank(message = "Project name is required")
        @Size(max = 100, message = "Name must be under 100 characters")
        private String name;

        @Size(max = 50, message = "Category must be under 50 characters")
        private String category;

        @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Invalid hex color format")
        private String backgroundColor; // For the initial file
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProjectRequest {
        @NotBlank(message = "Project name is required")
        @Size(max = 100, message = "Name must be under 100 characters")
        private String name;

        @Size(max = 50, message = "Category must be under 50 characters")
        private String category;
    }
}
