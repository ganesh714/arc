package com.arqulat.loom_backend.service.ai;

import com.arqulat.loom_backend.service.AIService;
import com.arqulat.loom_backend.service.ai.providers.AIProvider;
import com.arqulat.loom_backend.service.ai.providers.GeminiProvider;
import com.arqulat.loom_backend.service.ai.providers.GroqProvider;
import com.arqulat.loom_backend.service.ai.providers.OpenRouterProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class AIFallbackRingManager implements AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIFallbackRingManager.class);
    
    private final List<AIProvider> fallbackRing;

    public AIFallbackRingManager(GeminiProvider geminiProvider, GroqProvider groqProvider, OpenRouterProvider openRouterProvider) {
        // Defines the exact fallback order: Gemini -> Groq -> OpenRouter
        this.fallbackRing = Arrays.asList(geminiProvider, groqProvider, openRouterProvider);
    }

    @Override
    public String generateDiagramNodes(String prompt) throws Exception {
        for (AIProvider provider : fallbackRing) {
            try {
                logger.info("Attempting AI generation using provider: {}", provider.getProviderName());
                String result = provider.generate(prompt);
                
                // If it succeeds, return the valid JSON string immediately
                logger.info("Successfully generated diagram nodes using {}", provider.getProviderName());
                return result;
                
            } catch (Exception e) {
                // Log the failure and continue to the next provider in the ring
                logger.warn("Provider {} failed. Reason: {}. Falling back to next provider...", provider.getProviderName(), e.getMessage());
            }
        }
        
        // If we exit the loop, it means ALL providers have failed.
        logger.error("All AI providers in the fallback ring have failed.");
        throw new Exception("Unable to generate diagram nodes. All configured AI providers failed.");
    }

    @Override
    public String editDiagramNodes(String prompt, String contextNodes) throws Exception {
        for (AIProvider provider : fallbackRing) {
            try {
                logger.info("Attempting AI edit using provider: {}", provider.getProviderName());
                String result = provider.edit(prompt, contextNodes);
                
                logger.info("Successfully edited diagram nodes using {}", provider.getProviderName());
                return result;
                
            } catch (Exception e) {
                logger.warn("Provider {} failed to edit. Reason: {}. Falling back to next provider...", provider.getProviderName(), e.getMessage());
            }
        }
        
        logger.error("All AI providers in the fallback ring have failed to edit.");
        throw new Exception("Unable to edit diagram nodes. All configured AI providers failed.");
    }
}
