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
    public String generateDiagramNodes(String prompt, String imageBase64) throws Exception {
        for (AIProvider provider : fallbackRing) {
            try {
                if (imageBase64 != null && !imageBase64.isEmpty() && !(provider instanceof GeminiProvider)) {
                    logger.info("Skipping provider {} because it does not support Vision. Routing to Gemini.", provider.getProviderName());
                    continue;
                }
                
                logger.info("Attempting AI generation (Pass 1 - SLD) using provider: {}", provider.getProviderName());
                String sld = provider.generate(prompt, AIPrompts.PASS1_SLD_PROMPT, imageBase64);
                
                logger.info("Successfully generated SLD using {}. Now attempting Pass 2 (JSON)...", provider.getProviderName());
                String pass2Prompt = "SLD Blueprint:\n" + sld + "\n\nOriginal Request Context:\n" + prompt;
                String jsonResult = provider.generate(pass2Prompt, AIPrompts.PASS2_STYLE_PROMPT, null);
                
                logger.info("Successfully completed two-pass diagram generation using {}", provider.getProviderName());
                return jsonResult;
                
            } catch (Exception e) {
                logger.warn("Provider {} failed during two-pass generation. Reason: {}. Falling back to next provider...", provider.getProviderName(), e.getMessage());
            }
        }
        
        logger.error("All AI providers in the fallback ring have failed.");
        throw new Exception("Unable to generate diagram nodes. All configured AI providers failed.");
    }

    @Override
    public String editDiagramNodes(String prompt, String contextNodes, String imageBase64) throws Exception {
        for (AIProvider provider : fallbackRing) {
            try {
                if (imageBase64 != null && !imageBase64.isEmpty() && !(provider instanceof GeminiProvider)) {
                    logger.info("Skipping provider {} because it does not support Vision. Routing to Gemini.", provider.getProviderName());
                    continue;
                }
                
                logger.info("Attempting AI edit using provider: {}", provider.getProviderName());
                String result = provider.edit(prompt, contextNodes, imageBase64);
                
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
