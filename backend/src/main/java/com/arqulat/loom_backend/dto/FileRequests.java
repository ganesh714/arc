package com.arqulat.loom_backend.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class FileRequests {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateFileRequest {
        @NotBlank(message = "File name is required")
        @Size(max = 100, message = "Name must be under 100 characters")
        private String name;

        @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Invalid hex color format")
        private String backgroundColor;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateFileRequest {
        @NotBlank(message = "File name is required")
        @Size(max = 100, message = "Name must be under 100 characters")
        private String name;

        @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Invalid hex color format")
        private String canvasBgColor;
        
        private JsonNode nodes;
    }
}
