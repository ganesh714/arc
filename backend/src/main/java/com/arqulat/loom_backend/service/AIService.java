package com.arqulat.loom_backend.service;

public interface AIService {
    /**
     * Generates a JSON tree of diagram nodes based on the prompt.
     * @param prompt The user's input prompt.
     * @return A JSON string representing the generated nodes.
     * @throws Exception if generation fails across all fallback providers.
     */
    String generateDiagramNodes(String prompt) throws Exception;
}
