package com.arqulat.loom_backend.service.ai.providers;

public interface AIProvider {
    /**
     * Attempts to generate a JSON response for the given prompt using the specific AI provider.
     * @param prompt The user's input prompt.
     * @return The JSON string of nodes.
     * @throws Exception if this provider fails to generate or returns invalid data.
     */
    String generate(String prompt) throws Exception;

    /**
     * @return The name of this provider for logging/response tracking.
     */
    String getProviderName();
}
