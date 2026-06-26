package com.arqulat.loom_backend.service.ai.providers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GroqProvider implements AIProvider {

    @Value("${ai.groq.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GroqProvider(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String generate(String prompt) throws Exception {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Groq API key is not configured.");
        }
        
        // TODO: Implement actual Groq API call (e.g., https://api.groq.com/openai/v1/chat/completions)
        if (apiKey.equals("dummy_key")) {
            throw new RuntimeException("Simulated Groq API failure to trigger fallback.");
        }
        
        throw new UnsupportedOperationException("Groq generation not fully implemented yet.");
    }

    @Override
    public String getProviderName() {
        return "Groq (Llama-3.3 70B)";
    }
}
