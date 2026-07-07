package com.arqulat.loom_backend.dto;

public class AIGenerateRequest {
    private String prompt;
    private String imageBase64;

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

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }
}
