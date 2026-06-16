package in.neuarc.loom.controller;

import in.neuarc.loom.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/convert")
@RequiredArgsConstructor
@Tag(name = "AI Conversion", description = "Endpoints for AI-powered diagram-to-code conversion")
public class ConversionController {

    private final AIService aiService;

    @PostMapping("/{projectId}")
    @Operation(summary = "Convert diagram to code using AI")
    public ResponseEntity<String> convertDiagram(@PathVariable UUID projectId, @RequestParam String targetFramework) {
        // In a real scenario, we'd fetch the diagram data from the project first
        String mockDiagramData = "{ \"nodes\": [], \"edges\": [] }";
        String generatedCode = aiService.generateCode(mockDiagramData, targetFramework);
        return ResponseEntity.ok(generatedCode);
    }
}
