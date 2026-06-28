package com.arqulat.loom_backend.service;

public interface AIService {
    /**
     * Generates a JSON tree of diagram nodes based on the prompt.
     * @param prompt The user's input prompt.
     * @return A JSON string representing the generated nodes.
     * @throws Exception if generation fails across all fallback providers.
     */
    String generateDiagramNodes(String prompt) throws Exception;

    /**
     * Edits the existing diagram nodes based on the prompt and context.
     * @param prompt The user's edit instruction.
     * @param contextNodes The current nodes in JSON format.
     * @return A JSON string representing the updated nodes.
     * @throws Exception if generation fails.
     */
    String editDiagramNodes(String prompt, String contextNodes) throws Exception;
}
