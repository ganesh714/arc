package com.arqulat.loom_backend.service.ai.providers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OpenRouterProvider implements AIProvider {

    @Value("${ai.openrouter.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public OpenRouterProvider(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String generate(String prompt) throws Exception {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("OpenRouter API key is not configured.");
        }
        
        // TODO: Implement actual OpenRouter API call (e.g., https://openrouter.ai/api/v1/chat/completions)
        if (apiKey.equals("dummy_key")) {
            throw new RuntimeException("Simulated OpenRouter API failure.");
        }

        // Return a dummy JSON response for verification purposes if it reaches the end of the fallback ring
        return "[\n" +
                "  {\n" +
                "    \"id\": \"ai-gen-1\",\n" +
                "    \"type\": \"box\",\n" +
                "    \"position\": { \"x\": 200, \"y\": 200 },\n" +
                "    \"dimensions\": { \"width\": 160, \"height\": 100 },\n" +
                "    \"content\": \"OpenRouter Result for: " + prompt + "\",\n" +
                "    \"style\": {\n" +
                "      \"backgroundColor\": \"#2c2c2c\",\n" +
                "      \"borderColor\": \"#0c8ce9\",\n" +
                "      \"color\": \"#e3e3e3\"\n" +
                "    }\n" +
                "  }\n" +
                "]";
    }

    @Override
    public String getProviderName() {
        return "OpenRouter (GPT-OSS-120B)";
    }
}
