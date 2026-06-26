package com.arqulat.loom_backend.controller;

import com.arqulat.loom_backend.dto.AIGenerateRequest;
import com.arqulat.loom_backend.dto.AIGenerateResponse;
import com.arqulat.loom_backend.service.AIService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody AIGenerateRequest request) {
        try {
            if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Prompt cannot be empty");
            }
            
            String jsonTree = aiService.generateDiagramNodes(request.getPrompt());
            
            AIGenerateResponse response = new AIGenerateResponse(jsonTree, "Fallback-Ring-Resolved");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate AI visual: " + e.getMessage());
        }
    }
}
