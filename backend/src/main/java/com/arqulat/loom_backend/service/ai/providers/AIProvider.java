package com.arqulat.loom_backend.service.ai.providers;

public interface AIProvider {
    /**
     * Attempts to generate a JSON response for the given prompt using the specific AI provider.
     * @param prompt The user's input prompt.
     * @param systemPrompt The system instructions.
     * @return The JSON string of nodes or raw text.
     * @throws Exception if this provider fails to generate or returns invalid data.
     */
    String generate(String prompt, String systemPrompt, String imageBase64) throws Exception;

    /**
     * Edits an existing JSON structure based on a prompt.
     * @param prompt The edit request.
     * @param contextNodes The existing JSON elements.
     * @param imageBase64 Optional base64 encoded image to provide as context.
     * @return The updated JSON string.
     * @throws Exception if generation fails.
     */
    String edit(String prompt, String contextNodes, String imageBase64) throws Exception;

    /**
     * @return The name of this provider for logging/response tracking.
     */
    String getProviderName();
}
