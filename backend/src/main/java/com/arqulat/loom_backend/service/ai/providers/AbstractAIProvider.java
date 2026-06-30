package com.arqulat.loom_backend.service.ai.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public abstract class AbstractAIProvider implements AIProvider {

    protected final ObjectMapper objectMapper;

    protected AbstractAIProvider(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Cleans the markdown wrapping from the response and validates that it's a valid JSON array.
     * Throws an exception if invalid, which triggers the fallback ring.
     */
    protected String cleanAndValidateJsonResponse(String responseText) throws Exception {
        String clean = responseText.trim();
        
        // Remove markdown formatting
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        
        clean = clean.trim();

        // Validate that it is actually a JSON array (so hallucinations fail properly)
        try {
            JsonNode root = objectMapper.readTree(clean);
            if (root.isObject()) {
                if (root.has("nodes") && root.get("nodes").isArray()) {
                    return objectMapper.writeValueAsString(root.get("nodes"));
                } else if (root.has("elements") && root.get("elements").isArray()) {
                    return objectMapper.writeValueAsString(root.get("elements"));
                } else if (root.has("diagram") && root.get("diagram").isArray()) {
                    return objectMapper.writeValueAsString(root.get("diagram"));
                } else if (root.has("data") && root.get("data").isArray()) {
                    return objectMapper.writeValueAsString(root.get("data"));
                } else {
                    throw new IllegalArgumentException("AI returned an object without a recognized array field.");
                }
            } else if (!root.isArray()) {
                throw new IllegalArgumentException("AI returned valid JSON, but it is not a JSON Array.");
            }
            return clean;
        } catch (Exception e) {
            throw new Exception("AI returned invalid JSON: " + e.getMessage() + " | Raw: " + clean.substring(0, Math.min(100, clean.length())));
        }
    }
}
