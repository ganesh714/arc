package com.arqulat.loom_backend.service.ai.providers;

public interface AIProvider {
    /**
     * Attempts to generate a JSON response for the given prompt using the specific AI provider.
     * @param prompt The user's input prompt.
     * @param systemPrompt The system instructions.
     * @return The JSON string of nodes or raw text.
     * @throws Exception if this provider fails to generate or returns invalid data.
     */
    String generate(String prompt, String systemPrompt) throws Exception;

    /**
     * Attempts to edit the existing nodes based on the prompt.
     * @param prompt The user's edit instructions.
     * @param contextNodes The existing JSON nodes to be edited.
     * @return The updated JSON string of nodes.
     * @throws Exception if this provider fails to generate or returns invalid data.
     */
    String edit(String prompt, String contextNodes) throws Exception;

    /**
     * @return The name of this provider for logging/response tracking.
     */
    String getProviderName();
}
