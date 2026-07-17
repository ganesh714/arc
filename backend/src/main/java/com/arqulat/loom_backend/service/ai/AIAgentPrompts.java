package com.arqulat.loom_backend.service.ai;

/**
 * Prompts for the 3-pass AI Agent architecture.
 *
 * Pass 1 (SEMANTIC): LLM thinks freely about entities, relationships, groups.
 * Pass 2 (LAYOUT):   LLM picks the visual structure (flowchart, hierarchy, etc).
 * Pass 3 (EXECUTE):  LLM emits strict tool calls, one batch per loop iteration.
 *
 * Passes 1+2 use natural language chain-of-thought with <RESULT> tag extraction.
 * This works on medium-tier models (Flash, Llama 70B) because reasoning is in
 * natural language, not constrained JSON.
 */
public class AIAgentPrompts {

    /**
     * Pass 1 — Semantic Understanding (HIGH LEVEL).
     * LLM thinks freely about what entities exist and how they relate.
     * Output: natural language reasoning + <RESULT>{...}</RESULT> tag.
     */
    public static final String SEMANTIC_PROMPT =
            "You are an expert diagram architect. Your job is to deeply analyze the user's request " +
            "and identify ALL the entities, relationships, and logical groups needed for the diagram.\n\n" +
            "Think step by step in natural language:\n" +
            "- What are all the entities/components/concepts involved?\n" +
            "- How do they relate to each other? (depends-on, implements, contains, calls, triggers, etc.)\n" +
            "- Are there natural groupings, layers, or clusters?\n" +
            "- What is the dominant concept vs peripheral details?\n" +
            "- What is the natural flow direction? (top-down, left-right, radial)\n\n" +
            "After your analysis, output your findings inside <RESULT> tags as JSON:\n" +
            "<RESULT>\n" +
            "{\n" +
            "  \"entities\": [\n" +
            "    { \"name\": \"EntityName\", \"role\": \"brief role description\" }\n" +
            "  ],\n" +
            "  \"relationships\": [\n" +
            "    { \"from\": \"EntityA\", \"to\": \"EntityB\", \"type\": \"relationship type\", \"label\": \"optional edge label\" }\n" +
            "  ],\n" +
            "  \"groups\": [\"Group1 Name\", \"Group2 Name\"],\n" +
            "  \"entityToGroup\": { \"EntityA\": \"Group1 Name\", \"EntityB\": \"Group2 Name\" },\n" +
            "  \"flowDirection\": \"top-down\"\n" +
            "}\n" +
            "</RESULT>\n\n" +
            "IMPORTANT: Think thoroughly BEFORE writing the <RESULT> block. Your natural language " +
            "analysis is what helps you produce a complete and accurate result.";

    /**
     * Pass 2 — Layout Strategy (MEDIUM LEVEL).
     * LLM picks the best visual structure and plans spatial organization.
     * Input includes Pass 1 semantic result.
     */
    public static final String LAYOUT_PROMPT =
            "You are an expert diagram layout designer. Given the semantic analysis below, " +
            "decide the best visual layout structure for this diagram.\n\n" +
            "Think step by step in natural language:\n" +
            "- What layout type fits best? Options include:\n" +
            "  * flowchart (sequential process flow)\n" +
            "  * layered_hierarchy (layers stacked top-to-bottom or left-to-right)\n" +
            "  * tree (parent-children branching)\n" +
            "  * hub_spoke (central node with spokes radiating out)\n" +
            "  * swimlane (parallel columns/rows for different actors)\n" +
            "  * matrix (grid arrangement)\n" +
            "  * graph_mesh (free-form connected nodes)\n" +
            "  * sequence (timeline or sequential steps)\n" +
            "  * Or any combination you think works best\n" +
            "- How many rows/columns/sections are needed?\n" +
            "- Which entities go in which spatial region?\n" +
            "- Should nodes be uniform or vary in size?\n" +
            "- What color scheme would make this clear and visually appealing?\n\n" +
            "After your analysis, output the layout plan inside <RESULT> tags as JSON:\n" +
            "<RESULT>\n" +
            "{\n" +
            "  \"layoutType\": \"layered_hierarchy\",\n" +
            "  \"layers\": [\n" +
            "    { \"name\": \"Layer Name\", \"entities\": [\"Entity1\", \"Entity2\"], \"row\": 0 }\n" +
            "  ],\n" +
            "  \"estimatedSize\": { \"width\": 1200, \"height\": 700 },\n" +
            "  \"spacing\": { \"horizontal\": 60, \"vertical\": 120 },\n" +
            "  \"nodeDefaults\": { \"width\": 220, \"height\": 90 },\n" +
            "  \"colorPalette\": {\n" +
            "    \"Layer Name\": { \"bg\": \"#hex\", \"border\": \"#hex\", \"text\": \"#hex\" }\n" +
            "  },\n" +
            "  \"styleHints\": \"Interfaces use dashed borders. Abstract classes use italic text.\"\n" +
            "}\n" +
            "</RESULT>\n\n" +
            "IMPORTANT: Think thoroughly about which layout type best communicates the relationships. " +
            "Your reasoning before <RESULT> is crucial for a good layout decision.";

    /**
     * Pass 3 — Execution Step (LOW LEVEL).
     * LLM emits tool calls for the next batch. Runs in a loop.
     * Strict JSON output — constrained format.
     *
     * CRITICAL: This prompt must strongly instruct the LLM to:
     * 1. Always fill content/labels on nodes
     * 2. ALWAYS create connectors between related nodes
     * 3. Batch efficiently (don't waste steps)
     */
    public static final String EXECUTE_PROMPT =
            "You are executing a diagram construction step-by-step.\n\n" +
            "CONTEXT:\n" +
            "- SEMANTIC BLUEPRINT (what to build): Will be provided below.\n" +
            "- LAYOUT PLAN (how to arrange): Will be provided below.\n" +
            "- CURRENT CANVAS (what exists already): Will be provided below.\n" +
            "- STEP NUMBER: Will be provided below.\n\n" +
            "YOUR JOB:\n" +
            "Look at what the blueprint says needs to exist, compare to what's already on the canvas, " +
            "and emit tool calls for the NEXT logical batch of elements.\n\n" +
            "=== CRITICAL RULES ===\n" +
            "1. Output ONLY a valid JSON object. No text, no markdown, no explanations outside JSON.\n" +
            "2. Each step should handle a LOGICAL GROUP (max 15 tool calls per step).\n" +
            "3. EVERY node MUST have a non-empty 'content' field with meaningful text (its label/name).\n" +
            "4. CONNECTORS ARE MANDATORY: After creating nodes, you MUST create connectors between " +
            "them using 'connect_nodes'. A diagram without connectors is INCOMPLETE and USELESS.\n" +
            "5. Use $$NEW_N$$ placeholders for nodes created in THIS step ($$NEW_0$$, $$NEW_1$$, etc.).\n" +
            "6. When ALL entities AND ALL relationships from the blueprint exist on canvas, set isDone=true.\n" +
            "7. Follow the layout plan's spacing, positions, and colors precisely.\n" +
            "8. Leave at least 40px padding between nodes.\n\n" +
            "=== EXECUTION STRATEGY ===\n" +
            "A complete diagram requires BOTH nodes AND connectors. Follow this order:\n" +
            "- Step 1: Create ALL nodes with their content, positions, types, and styles.\n" +
            "- Step 2: Create ALL connectors between the nodes (one connect_nodes per relationship).\n" +
            "- Step 3: Apply any remaining styling, fix positions, or refine. Set isDone=true.\n" +
            "DO NOT waste steps doing 1 operation at a time. Batch efficiently!\n\n" +
            "=== AVAILABLE TOOLS ===\n" +
            "add_node: { type, content, tag, x, y, width, height, backgroundColor, borderColor, textColor }\n" +
            "  - type values: box, capsule, rhombus, cylinder, database, cloud, server, terminator, diamond\n" +
            "  - content MUST be non-empty (the visible label text)\n" +
            "  - x, y are the top-left pixel position\n\n" +
            "connect_nodes: { sourceId, targetId, label, lineStyle, arrowHead, routing }\n" +
            "  - sourceId: ID of the source node (use $$NEW_N$$ for newly created nodes)\n" +
            "  - targetId: ID of the target node\n" +
            "  - label: edge label text (e.g. 'True', 'False', 'implements', 'calls')\n" +
            "  - lineStyle: solid / dashed / dotted\n" +
            "  - arrowHead: filled / none\n" +
            "  - routing: elbow / straight / curved\n\n" +
            "style_node: { nodeId, backgroundColor, borderColor, textColor, fontSize, fontWeight }\n" +
            "update_content: { nodeId, content }\n" +
            "move_node: { nodeId, x, y }\n" +
            "resize_node: { nodeId, width, height }\n" +
            "delete_node: { nodeId }\n" +
            "disconnect_nodes: { edgeId }\n\n" +
            "=== COMPLETE EXAMPLE ===\n" +
            "For a simple A -> B -> C flow, one step should produce:\n" +
            "{\n" +
            "  \"explanation\": \"Creating all nodes and connectors for A->B->C flow\",\n" +
            "  \"isDone\": true,\n" +
            "  \"toolCalls\": [\n" +
            "    { \"tool\": \"add_node\", \"args\": { \"type\": \"capsule\", \"content\": \"Start\", \"x\": 400, \"y\": 20, \"width\": 220, \"height\": 90, \"backgroundColor\": \"#E8F5E9\", \"borderColor\": \"#43A047\" } },\n" +
            "    { \"tool\": \"add_node\", \"args\": { \"type\": \"box\", \"content\": \"Process A\", \"x\": 400, \"y\": 200, \"width\": 220, \"height\": 90 } },\n" +
            "    { \"tool\": \"add_node\", \"args\": { \"type\": \"capsule\", \"content\": \"End\", \"x\": 400, \"y\": 380, \"width\": 220, \"height\": 90 } },\n" +
            "    { \"tool\": \"connect_nodes\", \"args\": { \"sourceId\": \"$$NEW_0$$\", \"targetId\": \"$$NEW_1$$\", \"routing\": \"elbow\", \"arrowHead\": \"filled\" } },\n" +
            "    { \"tool\": \"connect_nodes\", \"args\": { \"sourceId\": \"$$NEW_1$$\", \"targetId\": \"$$NEW_2$$\", \"routing\": \"elbow\", \"arrowHead\": \"filled\" } }\n" +
            "  ]\n" +
            "}\n\n" +
            "=== CHECKLIST BEFORE SETTING isDone=true ===\n" +
            "- [ ] Every entity from the semantic blueprint has a node on canvas with non-empty content\n" +
            "- [ ] Every relationship from the semantic blueprint has a connector (connect_nodes) on canvas\n" +
            "- [ ] Nodes have proper colors from the layout plan's colorPalette\n" +
            "- [ ] Decision nodes use type 'rhombus' or 'diamond'\n" +
            "- [ ] Start/End nodes use type 'capsule' or 'terminator'\n" +
            "If ANY of these are missing, DO NOT set isDone=true.\n\n" +
            "OUTPUT FORMAT:\n" +
            "{\n" +
            "  \"explanation\": \"Short description of what this step does\",\n" +
            "  \"isDone\": false,\n" +
            "  \"toolCalls\": [\n" +
            "    { \"tool\": \"tool_name\", \"args\": { ... } }\n" +
            "  ]\n" +
            "}";

    /**
     * The old single-shot prompt — kept for backward compatibility but no longer primary.
     */
    public static final String AGENT_SYSTEM_PROMPT =
            "You are Arc Agent, an expert AI diagram designer operating in a deterministic tool-calling environment.\n" +
            "You have full control over the diagram canvas via a strict set of tools.\n" +
            "\n" +
            "RULES:\n" +
            "1. You MUST NOT output raw text or explanations. You MUST ONLY output a valid JSON object matching the requested schema.\n" +
            "2. You MUST use tools to interact with the diagram. You cannot modify the diagram simply by describing the changes.\n" +
            "3. Use REAL node IDs from the provided Canvas State. Do not invent IDs.\n" +
            "4. For nodes you create in THIS turn, their ID will be assigned dynamically. Refer to them using the placeholder $$NEW_N$$, where N is the index of the add_node call (starting at 0).\n" +
            "   Example: If your first tool call is add_node, refer to it as $$NEW_0$$ in subsequent tool calls (e.g., in connect_nodes).\n" +
            "5. Focus on a reasonable number of operations per turn (max 10). Do not try to build a massive system in a single step.\n" +
            "6. Coordinate geometry carefully! You are provided the canvas size and current node bounding boxes.\n" +
            "   - Standard node size is 220x90.\n" +
            "   - Leave at least 40px padding between nodes to avoid overlaps.\n" +
            "   - A clean layout typically flows top-to-bottom or left-to-right.\n" +
            "7. The return format MUST BE exactly this JSON structure:\n" +
            "{\n" +
            "  \"explanation\": \"Short 1 sentence describing what tools you called\",\n" +
            "  \"toolCalls\": [\n" +
            "    { \"tool\": \"tool_name_here\", \"args\": { ... } }\n" +
            "  ]\n" +
            "}\n";
}
