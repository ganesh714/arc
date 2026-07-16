package com.arqulat.loom_backend.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Java-side virtual canvas that applies agent tool calls to an in-memory node list.
 * Mirrors the logic in frontend's agentTools.ts so the backend can track canvas state
 * across multiple agent loop iterations without round-tripping to the frontend.
 */
@Component
public class VirtualCanvasApplicator {

    private static final Logger logger = LoggerFactory.getLogger(VirtualCanvasApplicator.class);
    private final ObjectMapper objectMapper;

    public VirtualCanvasApplicator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Applies a list of tool calls to the current canvas state and returns the updated canvas JSON.
     * Handles $$NEW_N$$ placeholder resolution for cross-referencing newly created nodes.
     *
     * @param toolCallsNode  The JSON array of tool calls from the LLM
     * @param currentCanvas  The current canvas state as a JSON array string
     * @return The updated canvas state as a JSON array string
     */
    public String applyToolCalls(JsonNode toolCallsNode, String currentCanvas) throws Exception {
        ArrayNode canvasArray = (ArrayNode) objectMapper.readTree(currentCanvas);
        Map<String, String> newIdMap = new HashMap<>(); // $$NEW_0$$ -> actual UUID
        int newCounter = 0;

        if (!toolCallsNode.isArray()) {
            logger.warn("toolCalls is not an array, returning canvas unchanged");
            return currentCanvas;
        }

        for (JsonNode call : toolCallsNode) {
            String tool = call.path("tool").asText("");
            JsonNode args = call.path("args");

            try {
                switch (tool) {
                    case "add_node":
                        String newId = UUID.randomUUID().toString();
                        newIdMap.put("$$NEW_" + newCounter + "$$", newId);
                        newCounter++;

                        ObjectNode node = objectMapper.createObjectNode();
                        node.put("id", newId);
                        node.put("type", args.path("type").asText("box"));
                        node.put("content", args.path("content").asText(""));

                        ObjectNode position = objectMapper.createObjectNode();
                        position.put("x", args.path("x").asDouble(0));
                        position.put("y", args.path("y").asDouble(0));
                        node.set("position", position);

                        ObjectNode dimensions = objectMapper.createObjectNode();
                        dimensions.put("width", args.path("width").asDouble(220));
                        dimensions.put("height", args.path("height").asDouble(90));
                        node.set("dimensions", dimensions);

                        ObjectNode style = objectMapper.createObjectNode();
                        if (args.has("backgroundColor")) style.put("backgroundColor", args.path("backgroundColor").asText());
                        if (args.has("borderColor")) style.put("borderColor", args.path("borderColor").asText());
                        if (args.has("textColor")) style.put("color", args.path("textColor").asText());
                        node.set("style", style);

                        if (args.has("tag")) node.put("tag", args.path("tag").asText());

                        canvasArray.add(node);
                        logger.debug("add_node: {} '{}' at ({}, {})", args.path("type").asText("box"),
                                args.path("content").asText(""), args.path("x").asDouble(), args.path("y").asDouble());
                        break;

                    case "delete_node": {
                        String targetId = resolveId(args.path("nodeId").asText(), newIdMap);
                        ArrayNode filtered = objectMapper.createArrayNode();
                        for (JsonNode n : canvasArray) {
                            if (!n.path("id").asText().equals(targetId)) {
                                // Also remove edges connected to this node
                                String startConn = n.path("startConnection").path("nodeId").asText("");
                                String endConn = n.path("endConnection").path("nodeId").asText("");
                                if (!startConn.equals(targetId) && !endConn.equals(targetId)) {
                                    filtered.add(n);
                                }
                            }
                        }
                        canvasArray = filtered;
                        logger.debug("delete_node: {}", targetId);
                        break;
                    }

                    case "update_content": {
                        String targetId = resolveId(args.path("nodeId").asText(), newIdMap);
                        for (int i = 0; i < canvasArray.size(); i++) {
                            if (canvasArray.get(i).path("id").asText().equals(targetId)) {
                                ((ObjectNode) canvasArray.get(i)).put("content", args.path("content").asText());
                                break;
                            }
                        }
                        break;
                    }

                    case "move_node": {
                        String targetId = resolveId(args.path("nodeId").asText(), newIdMap);
                        for (int i = 0; i < canvasArray.size(); i++) {
                            if (canvasArray.get(i).path("id").asText().equals(targetId)) {
                                ObjectNode pos = objectMapper.createObjectNode();
                                pos.put("x", args.path("x").asDouble());
                                pos.put("y", args.path("y").asDouble());
                                ((ObjectNode) canvasArray.get(i)).set("position", pos);
                                break;
                            }
                        }
                        break;
                    }

                    case "resize_node": {
                        String targetId = resolveId(args.path("nodeId").asText(), newIdMap);
                        for (int i = 0; i < canvasArray.size(); i++) {
                            if (canvasArray.get(i).path("id").asText().equals(targetId)) {
                                ObjectNode dim = objectMapper.createObjectNode();
                                dim.put("width", args.path("width").asDouble());
                                dim.put("height", args.path("height").asDouble());
                                ((ObjectNode) canvasArray.get(i)).set("dimensions", dim);
                                break;
                            }
                        }
                        break;
                    }

                    case "style_node": {
                        String targetId = resolveId(args.path("nodeId").asText(), newIdMap);
                        for (int i = 0; i < canvasArray.size(); i++) {
                            if (canvasArray.get(i).path("id").asText().equals(targetId)) {
                                ObjectNode existingStyle = canvasArray.get(i).has("style")
                                        ? (ObjectNode) canvasArray.get(i).path("style")
                                        : objectMapper.createObjectNode();
                                if (args.has("backgroundColor")) existingStyle.put("backgroundColor", args.path("backgroundColor").asText());
                                if (args.has("borderColor")) existingStyle.put("borderColor", args.path("borderColor").asText());
                                if (args.has("textColor")) existingStyle.put("color", args.path("textColor").asText());
                                if (args.has("fontSize")) existingStyle.put("fontSize", args.path("fontSize").asText());
                                if (args.has("fontWeight")) existingStyle.put("fontWeight", args.path("fontWeight").asText());
                                if (args.has("borderRadius")) existingStyle.put("borderRadius", args.path("borderRadius").asText());
                                if (args.has("opacity")) existingStyle.put("opacity", args.path("opacity").asText());
                                ((ObjectNode) canvasArray.get(i)).set("style", existingStyle);
                                break;
                            }
                        }
                        break;
                    }

                    case "connect_nodes": {
                        String sourceId = resolveId(args.path("sourceId").asText(), newIdMap);
                        String targetNodeId = resolveId(args.path("targetId").asText(), newIdMap);
                        String edgeId = UUID.randomUUID().toString();
                        newIdMap.put("$$NEW_" + newCounter + "$$", edgeId);
                        newCounter++;

                        ObjectNode edge = objectMapper.createObjectNode();
                        edge.put("id", edgeId);
                        edge.put("type", "arrow");
                        edge.put("content", "");

                        ObjectNode edgePos = objectMapper.createObjectNode();
                        edgePos.put("x", 0);
                        edgePos.put("y", 0);
                        edge.set("position", edgePos);

                        ObjectNode edgeDim = objectMapper.createObjectNode();
                        edgeDim.put("width", 0);
                        edgeDim.put("height", 0);
                        edge.set("dimensions", edgeDim);

                        ObjectNode startConn = objectMapper.createObjectNode();
                        startConn.put("nodeId", sourceId);
                        startConn.put("anchor", "closest");
                        edge.set("startConnection", startConn);

                        ObjectNode endConn = objectMapper.createObjectNode();
                        endConn.put("nodeId", targetNodeId);
                        endConn.put("anchor", "closest");
                        edge.set("endConnection", endConn);

                        if (args.has("label")) edge.put("label", args.path("label").asText());
                        edge.put("lineStyle", args.path("lineStyle").asText("solid"));
                        edge.put("arrowHead", args.path("arrowHead").asText("filled"));
                        edge.put("arrowTail", args.path("arrowTail").asText("none"));
                        edge.put("routing", args.path("routing").asText("elbow"));

                        canvasArray.add(edge);
                        logger.debug("connect_nodes: {} -> {}", sourceId, targetNodeId);
                        break;
                    }

                    case "disconnect_nodes": {
                        String edgeIdToRemove = resolveId(args.path("edgeId").asText(), newIdMap);
                        ArrayNode filtered = objectMapper.createArrayNode();
                        for (JsonNode n : canvasArray) {
                            if (!n.path("id").asText().equals(edgeIdToRemove)) {
                                filtered.add(n);
                            }
                        }
                        canvasArray = filtered;
                        break;
                    }

                    default:
                        logger.warn("Unknown tool: {}", tool);
                        break;
                }
            } catch (Exception e) {
                logger.error("Failed to apply tool '{}': {}", tool, e.getMessage());
            }
        }

        return objectMapper.writeValueAsString(canvasArray);
    }

    private String resolveId(String id, Map<String, String> newIdMap) {
        return newIdMap.getOrDefault(id, id);
    }

    /**
     * Counts non-edge nodes in the canvas.
     */
    public int countNodes(String canvasJson) throws Exception {
        JsonNode canvas = objectMapper.readTree(canvasJson);
        int count = 0;
        for (JsonNode node : canvas) {
            String type = node.path("type").asText();
            if (!type.equals("arrow") && !type.equals("line")) {
                count++;
            }
        }
        return count;
    }
}
