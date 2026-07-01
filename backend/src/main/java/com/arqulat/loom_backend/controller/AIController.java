package com.arqulat.loom_backend.controller;

import com.arqulat.loom_backend.dto.AIGenerateRequest;
import com.arqulat.loom_backend.dto.AIGenerateResponse;
import com.arqulat.loom_backend.dto.AIEditRequest;
import com.arqulat.loom_backend.service.AIService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;
    private final ObjectMapper objectMapper;

    public AIController(AIService aiService, ObjectMapper objectMapper) {
        this.aiService = aiService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody AIGenerateRequest request) {
        try {
            if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Prompt cannot be empty");
            }
            
            String jsonTree = aiService.generateDiagramNodes(request.getPrompt(), request.getImageBase64());
            
            AIGenerateResponse response = new AIGenerateResponse(jsonTree, "Fallback-Ring-Resolved");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate AI visual: " + e.getMessage());
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody AIEditRequest request) {
        try {
            if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Prompt cannot be empty");
            }
            if (request.getContextNodes() == null) {
                return ResponseEntity.badRequest().body("Context nodes cannot be null");
            }
            
            String contextNodesJson = objectMapper.writeValueAsString(request.getContextNodes());
            String jsonTree = aiService.editDiagramNodes(request.getPrompt(), contextNodesJson, request.getImageBase64());
            
            AIGenerateResponse response = new AIGenerateResponse(jsonTree, "Fallback-Ring-Resolved");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to edit AI visual: " + e.getMessage());
        }
    }
}
