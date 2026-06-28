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
            "Rules:\n" +
            "1. You MUST include 'id', 'type', and 'content' fields for EVERY node based on the SLD. Use the exact type names from the SLD.\n" +
            "2. Set 'stereotype' field for uml-* types (e.g. \"Interface\", \"Service\").\n" +
            "3. Set 'tag' for EVERY node. The tag determines its color (options: interface, abstract, class, enum, service, controller, repository, entity, database, queue, cache, gateway, client, server, start, end, decision, input, output).\n" +
            "4. For uml-class: use 'sections' array with {title, items[]} for attributes/methods.\n" +
            "5. For connections: set 'arrowHead', 'arrowTail', 'lineStyle', 'label' fields. 'startConnection.nodeId' and 'endConnection.nodeId' MUST point to valid node IDs.\n" +
            "6. DO NOT set position or dimension fields — auto-layout handles it.\n" +
            "7. ONLY use 'style' to OVERRIDE colors when the user explicitly requests a specific color. Otherwise, rely on 'tag' for auto-coloring.\n" +
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
