package com.arqulat.loom_backend.service.ai.providers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiProvider implements AIProvider {

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GeminiProvider(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String generate(String prompt) throws Exception {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }
        
        // TODO: Implement actual Gemini API call (e.g., https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent)
        // For now, simulate a failure to trigger the fallback ring if it's a dummy key
        if (apiKey.equals("dummy_key")) {
            throw new RuntimeException("Simulated Gemini API failure to trigger fallback.");
        }
        
        throw new UnsupportedOperationException("Gemini generation not fully implemented yet.");
    }

    @Override
    public String getProviderName() {
        return "Gemini";
    }
}
