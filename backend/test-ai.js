const apiKey = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";

const PASS1_SLD_PROMPT = `You are an expert software architecture and diagram designer. 
Given the user's request, produce a Semantic Layout Description (SLD).
Write ONLY plain text — no JSON, no styling, no colors. Do not use markdown blocks.

For each node write: [type] id — content; optional details
For each connection write: source_id --relationship--> target_id

Available node types: uml-class, uml-interface, uml-abstract, uml-enum, actor, use-case, component, cloud, cylinder, queue, server, browser, rounded-rect, terminator, process, document, diamond, group-frame, callout, box, circle, database, hexagon, pill, badge

For connections, specify the relationship name and arrowHead type:
arrowHead options: filled, hollow (inheritance), open (dependency), diamond-filled (composition), diamond-hollow (aggregation), circle, none
lineStyle options: solid, dashed, dotted`;

const PASS2_STYLE_PROMPT = `You are a diagram JSON formatter. Given the SLD (Semantic Layout Description) below, produce a valid JSON array of DiagramNode objects.

Each node in the array must strictly adhere to this schema:
{
  "id": "string (unique)",
  "type": "string (MUST match exactly one of the types from the SLD, e.g. terminator, process, diamond, etc.)",
  "content": "string (the text inside the node)",
  "tag": "string (e.g. start, process, decision, end, etc.)",
  "startConnection": { "nodeId": "source_node_id" } (Required ONLY for connections),
  "endConnection": { "nodeId": "target_node_id" } (Required ONLY for connections),
  "arrowHead": "string (e.g. filled, hollow, open)",
  "label": "string (optional text on the connection)"
}

Rules:
1. You MUST include 'id', 'type', and 'content' fields for EVERY node based on the SLD. Use the exact type names from the SLD.
2. CONNECTORS: For EVERY connection defined in the SLD, you MUST create a node with 'type': 'arrow'.
   - You MUST set 'startConnection.nodeId' and 'endConnection.nodeId' to valid IDs.
3. Set 'tag' for EVERY node. The tag determines its color (options: interface, abstract, class, enum, service, controller, repository, entity, database, queue, cache, gateway, client, server, start, end, decision, input, output).
4. DO NOT set position or dimension fields — auto-layout handles it.

You MUST output ONLY a valid JSON array starting with [ and ending with ]. Do not wrap in markdown or include any explanations.`;

async function callGemini(systemPrompt, userPrompt) {
  // Using gemini-1.5-pro-latest or gemini-3.1-pro-latest. The user mentioned Gemini 3.1 Pro (High) earlier? Wait, Gemini is usually gemini-1.5-pro-latest
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.1 }
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

async function test() {
  console.log("=== PASS 1: SLD Generation ===");
  const sld = await callGemini(PASS1_SLD_PROMPT, "create a flow chart for if else latter in programming");
  console.log(sld);
  
  console.log("\n=== PASS 2: JSON Generation ===");
  const json = await callGemini(PASS2_STYLE_PROMPT, "SLD:\n" + sld);
  console.log(json);
}

test().catch(console.error);
