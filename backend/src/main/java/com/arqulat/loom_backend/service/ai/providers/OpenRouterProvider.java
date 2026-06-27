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
public class OpenRouterProvider extends AbstractAIProvider {

    @Value("${ai.openrouter.api-key:dummy-key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    public OpenRouterProvider(RestTemplate restTemplate, ObjectMapper objectMapper) {
        super(objectMapper);
        this.restTemplate = restTemplate;
    }

    @Override
    public String generate(String prompt) throws Exception {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("dummy-key")) {
            throw new IllegalStateException("OpenRouter API key is not configured.");
        }

        String url = "https://openrouter.ai/api/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        headers.set("HTTP-Referer", "http://localhost:8081");
        headers.set("X-Title", "Loom AI");

        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", AIPrompts.SYSTEM_PROMPT);

        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt + "\n\nCRITICAL INSTRUCTION: You MUST output ONLY a valid JSON array. Do not wrap in markdown or include any explanations.");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "meta-llama/llama-3.1-70b-instruct");
        requestBody.put("messages", List.of(systemMessage, userMessage));
        requestBody.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("OpenRouter API call failed with status " + response.getStatusCode());
        }

        JsonNode root = objectMapper.readTree(response.getBody());
        JsonNode choices = root.path("choices");
        if (choices.isArray() && !choices.isEmpty()) {
            String text = choices.get(0).path("message").path("content").asText();
            return cleanAndValidateJsonResponse(text);
        }
        
        throw new RuntimeException("Failed to parse OpenRouter response: " + response.getBody());
    }

    @Override
    public String edit(String prompt, String contextNodes) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        headers.set("HTTP-Referer", "http://localhost:8081");
        headers.set("X-Title", "Loom AI");

        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", AIPrompts.EDIT_SYSTEM_PROMPT);

        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", "CURRENT DIAGRAM JSON:\n" + contextNodes + "\n\nUSER REQUEST:\n" + prompt + "\n\nCRITICAL INSTRUCTION: You MUST output ONLY a valid JSON array. Do not wrap in markdown or include any explanations.");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "meta-llama/llama-3.1-70b-instruct");
        requestBody.put("messages", List.of(systemMessage, userMessage));
        requestBody.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = "https://openrouter.ai/api/v1/chat/completions";
        ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.POST, entity, JsonNode.class);
        JsonNode root = response.getBody();

        if (root == null) {
            throw new RuntimeException("Empty response from OpenRouter");
        }

        JsonNode choices = root.path("choices");
        if (choices.isArray() && !choices.isEmpty()) {
            String text = choices.get(0).path("message").path("content").asText();
            return cleanAndValidateJsonResponse(text);
        }
        
        throw new RuntimeException("Failed to parse OpenRouter response: " + response.getBody());
    }

    @Override
    public String getProviderName() {
        return "OpenRouter";
    }
}
