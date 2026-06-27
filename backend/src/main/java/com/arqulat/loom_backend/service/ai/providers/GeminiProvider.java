package com.arqulat.loom_backend.service.ai.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.arqulat.loom_backend.service.ai.AIPrompts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiProvider extends AbstractAIProvider {

    @Value("${ai.gemini.api-key:dummy-key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    public GeminiProvider(RestTemplate restTemplate, ObjectMapper objectMapper) {
        super(objectMapper);
        this.restTemplate = restTemplate;
    }

    @Override
    public String generate(String prompt) throws Exception {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("dummy-key")) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        try {
            return callGeminiApi(prompt, "gemini-1.5-pro");
        } catch (Exception e) {
            System.err.println("Gemini 1.5 Pro failed (" + e.getMessage() + "). Falling back to Gemini 1.5 Flash...");
            return callGeminiApi(prompt, "gemini-1.5-flash");
        }
    }

    private String callGeminiApi(String prompt, String model) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key="
                + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> systemPart = new HashMap<>();
        systemPart.put("text", AIPrompts.SYSTEM_PROMPT);
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(systemPart));
        requestBody.put("system_instruction", systemInstruction);

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Gemini API call failed with status " + response.getStatusCode());
        }

        JsonNode root = objectMapper.readTree(response.getBody());
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && !parts.isEmpty()) {
                String text = parts.get(0).path("text").asText();
                return cleanAndValidateJsonResponse(text);
            }
        }

        throw new RuntimeException("Failed to parse Gemini response: " + response.getBody());
    }

    @Override
    public String edit(String prompt, String contextNodes) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> systemPart = new HashMap<>();
        systemPart.put("text", AIPrompts.EDIT_SYSTEM_PROMPT);
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(systemPart));
        requestBody.put("system_instruction", systemInstruction);

        Map<String, Object> part1 = new HashMap<>();
        part1.put("text", "CURRENT DIAGRAM JSON:\n" + contextNodes);
        Map<String, Object> part2 = new HashMap<>();
        part2.put("text", "USER REQUEST:\n" + prompt);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part1, part2));
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
        ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.POST, entity, JsonNode.class);
        JsonNode root = response.getBody();

        if (root == null) {
            throw new RuntimeException("Empty response from Gemini");
        }

        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && !parts.isEmpty()) {
                String text = parts.get(0).path("text").asText();
                return cleanAndValidateJsonResponse(text);
            }
        }

        throw new RuntimeException("Failed to parse Gemini response: " + response.getBody());
    }

    @Override
    public String getProviderName() {
        return "Gemini";
    }
}
