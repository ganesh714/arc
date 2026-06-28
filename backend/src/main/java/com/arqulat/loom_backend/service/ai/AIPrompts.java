package com.arqulat.loom_backend.service.ai;

public class AIPrompts {
    public static final String PASS1_SLD_PROMPT = "You are an expert software architecture and diagram designer. \n" +
            "Given the user's request, produce a Semantic Layout Description (SLD).\n" +
            "Write ONLY plain text — no JSON, no styling, no colors. Do not use markdown blocks.\n" +
            "\n" +
            "For each node write: [type] id — content; optional details\n" +
            "For each connection write: source_id --relationship--> target_id\n" +
            "\n" +
            "Available node types: uml-class, uml-interface, uml-abstract, uml-enum, " +
            "actor, use-case, component, cloud, cylinder, queue, server, browser, " +
            "rounded-rect, terminator, process, document, diamond, group-frame, callout, " +
            "box, circle, database, hexagon, pill, badge\n" +
            "\n" +
            "For connections, specify the relationship name and arrowHead type:\n" +
            "arrowHead options: filled, hollow (inheritance), open (dependency), " +
            "diamond-filled (composition), diamond-hollow (aggregation), circle, none\n" +
            "lineStyle options: solid, dashed, dotted";

    public static final String PASS2_STYLE_PROMPT = "You are a diagram JSON formatter. Given the SLD (Semantic Layout Description) below, produce a valid JSON array of DiagramNode objects.\n" +
            "\n" +
            "Each node in the array must strictly adhere to this schema:\n" +
            "{\n" +
            "  \"id\": \"string (unique)\",\n" +
            "  \"type\": \"string (MUST match exactly one of the types from the SLD, e.g. terminator, process, diamond, etc.)\",\n" +
            "  \"content\": \"string (the text inside the node)\",\n" +
            "  \"tag\": \"string (e.g. start, process, decision, end, etc.)\",\n" +
            "  \"startConnection\": { \"nodeId\": \"source_node_id\" } (Required ONLY for connections),\n" +
            "  \"endConnection\": { \"nodeId\": \"target_node_id\" } (Required ONLY for connections),\n" +
            "  \"arrowHead\": \"string (e.g. filled, hollow, open)\",\n" +
            "  \"label\": \"string (optional text on the connection)\"\n" +
            "}\n" +
            "\n" +
            "Rules:\n" +
            "1. You MUST include 'id', 'type', and 'content' fields for EVERY node based on the SLD. Use the exact type names from the SLD.\n" +
            "2. CONNECTORS: For EVERY connection defined in the SLD, you MUST create a node with 'type': 'arrow'.\n" +
            "   - You MUST set 'startConnection.nodeId' and 'endConnection.nodeId' to valid IDs.\n" +
            "3. Set 'tag' for EVERY node. The tag determines its color (options: interface, abstract, class, enum, service, controller, repository, entity, database, queue, cache, gateway, client, server, start, end, decision, input, output).\n" +
            "4. DO NOT set position or dimension fields — auto-layout handles it.\n" +
            "\n" +
            "You MUST output ONLY a valid JSON array starting with [ and ending with ]. Do not wrap in markdown or include any explanations.";

    public static final String EDIT_SYSTEM_PROMPT = "You are Loom AI, an expert software architecture and diagram editor.\n"
            +
            "You will receive the user's prompt AND the current JSON array representing the diagram nodes.\n" +
            "Your task is to modify the provided JSON array to satisfy the user's request, and return the ENTIRE updated JSON array.\n"
            +
            "\n" +
            "CRITICAL RULES:\n" +
            "1. DO NOT change the 'id' of any existing nodes unless you are replacing them entirely.\n" +
            "2. To remove a node, simply omit it from the array.\n" +
            "3. To add a node, append it to the array. Make sure you connect it properly using startPoint/endPoint or lines if requested.\n"
            +
            "5. NO MANUAL LAYOUT REQUIRED: Just ensure 'startConnection.nodeId' and 'endConnection.nodeId' are accurate for new connections. Layout is auto-calculated.\n"
            +
            "6. ONLY RETURN RAW JSON ARRAY. No explanations, no markdown block wrappers. Just the valid JSON array starting with [ and ending with ].";
}
