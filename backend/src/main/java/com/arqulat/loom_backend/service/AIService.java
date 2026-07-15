package com.arqulat.loom_backend.service;

public interface AIService {
    /**
     * Generates a JSON tree of diagram nodes based on the prompt.
     * @param prompt The user's input prompt.
     * @param imageBase64 Optional base64 encoded image to provide as context.
     * @return A JSON string representing the generated nodes.
     * @throws Exception if generation fails across all fallback providers.
     */
    String generateDiagramNodes(String prompt, String imageBase64) throws Exception;

    /**
     * Edits the existing diagram nodes based on the prompt and context.
     * @param prompt The user's edit instruction.
     * @param contextNodes The current nodes in JSON format.
     * @param imageBase64 Optional base64 encoded image.
     * @return A JSON string representing the updated nodes.
     * @throws Exception if generation fails.
     */
    String editDiagramNodes(String prompt, String contextNodes, String imageBase64) throws Exception;

    /**
     * Processes an agent tool-calling turn.
     * @param prompt The user's prompt.
     * @param contextNodes The canvas state.
     * @param toolDefinitions The tool definitions schema.
     * @return A JSON string representing the tool calls.
     * @throws Exception if generation fails.
     */
    String agentProcess(String prompt, String contextNodes, String toolDefinitions) throws Exception;
}
