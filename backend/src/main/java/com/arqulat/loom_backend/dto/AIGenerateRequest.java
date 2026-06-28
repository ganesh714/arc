package com.arqulat.loom_backend.dto;

public class AIGenerateRequest {
    private String prompt;

    public AIGenerateRequest() {}

    public AIGenerateRequest(String prompt) {
        this.prompt = prompt;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
}
