package com.arqulat.loom_backend.dto;

import java.util.List;
import java.util.Map;

public class AIEditRequest {
    private String prompt;
    private List<Map<String, Object>> contextNodes;
    private Map<String, Object> viewport;

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public List<Map<String, Object>> getContextNodes() {
        return contextNodes;
    }

    public void setContextNodes(List<Map<String, Object>> contextNodes) {
        this.contextNodes = contextNodes;
    }

    public Map<String, Object> getViewport() {
        return viewport;
    }

    public void setViewport(Map<String, Object> viewport) {
        this.viewport = viewport;
    }
}
