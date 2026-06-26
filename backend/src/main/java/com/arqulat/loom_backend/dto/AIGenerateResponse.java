package com.arqulat.loom_backend.dto;

public class AIGenerateResponse {
    private String jsonTree;
    private String providerUsed;

    public AIGenerateResponse() {}

    public AIGenerateResponse(String jsonTree, String providerUsed) {
        this.jsonTree = jsonTree;
        this.providerUsed = providerUsed;
    }

    public String getJsonTree() {
        return jsonTree;
    }

    public void setJsonTree(String jsonTree) {
        this.jsonTree = jsonTree;
    }

    public String getProviderUsed() {
        return providerUsed;
    }

    public void setProviderUsed(String providerUsed) {
        this.providerUsed = providerUsed;
    }
}
