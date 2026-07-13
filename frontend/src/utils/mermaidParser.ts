import type { DiagramNode, NodeType, NodeSection, ArrowHeadType } from '../types';
import { autoLayoutNodes } from './layoutEngine';

const generateId = () => Math.random().toString(36).substring(2, 9);

// ─── MAIN ENTRY ────────────────────────────────────────────────────

export function parseMermaid(code: string): DiagramNode[] | null {
  const trimmed = code.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();

  if (firstLine.startsWith('classdiagram')) {
    return parseClassDiagram(trimmed);
  }
  // Default: flowchart / graph
  return parseFlowchart(trimmed);
}

// ─── FLOWCHART PARSER ──────────────────────────────────────────────

const flowEdgeSplitRegex = /(-->|---|-\.->|==>)/;

const parseFlowNode = (nodeStr: string): { id: string; content: string; type: NodeType } => {
  nodeStr = nodeStr.trim();
  const nodeRegex = /^([a-zA-Z0-9_-]+)(?:\[\((.*?)\)\]|\[\/(.*?)\/\]|\(\((.*?)\)\)|\{(.*?)\}|\(\[(.*?)\]\)|\((.*?)\)|\[(.*?)\])?$/;
  const match = nodeStr.match(nodeRegex);
  if (!match) return { id: nodeStr, content: nodeStr, type: 'box' };

  const id = match[1];
  let type: NodeType = 'box';
  let content = id;

  if (match[2] !== undefined) { type = 'database'; content = match[2]; }
  else if (match[3] !== undefined) { type = 'parallelogram'; content = match[3]; }
  else if (match[4] !== undefined) { type = 'circle'; content = match[4]; }
  else if (match[5] !== undefined) { type = 'diamond'; content = match[5]; }
  else if (match[6] !== undefined) { type = 'pill'; content = match[6]; }
  else if (match[7] !== undefined) { type = 'rounded-rect'; content = match[7]; }
  else if (match[8] !== undefined) { type = 'box'; content = match[8]; }

  return { id, content, type };
};

function createFlowNode(id: string, content: string, type: NodeType, groupId: string | null): DiagramNode {
  return {
    id, type,
    position: { x: 0, y: 0 },
    dimensions: { width: 140, height: 60 },
    content,
    groupId: groupId || undefined,
    style: { backgroundColor: '#0d1117' }
  };
}

function parseFlowchart(code: string): DiagramNode[] | null {
  const lines = code.split('\n');
  const nodes = new Map<string, DiagramNode>();
  const edges: DiagramNode[] = [];
  let currentGroup: string | null = null;
  const groups = new Map<string, string[]>();

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('%%')) continue;
    if (line.startsWith('graph ') || line.startsWith('flowchart ')) continue;

    if (line.startsWith('subgraph ')) {
      const match = line.match(/^subgraph\s+([a-zA-Z0-9_-]+)(?:\s*\[(.*?)\])?/);
      if (match) {
        currentGroup = match[1];
        const groupLabel = match[2] || match[1];
        nodes.set(currentGroup, {
          id: currentGroup, type: 'group-frame',
          position: { x: 0, y: 0 }, dimensions: { width: 300, height: 300 },
          content: groupLabel, style: { backgroundColor: 'transparent' }
        });
        groups.set(currentGroup, []);
      }
      continue;
    }
    if (line === 'end' && currentGroup) { currentGroup = null; continue; }

    let label = '';
    const pipeLabelMatch = line.match(/\|(.*?)\|/);
    if (pipeLabelMatch) { label = pipeLabelMatch[1]; line = line.replace(`|${label}|`, ''); }
    const textLabelMatch = line.match(/--\s+(.*?)\s+-->/);
    if (textLabelMatch) { label = textLabelMatch[1]; line = line.replace(textLabelMatch[0], '-->'); }

    const parts = line.split(flowEdgeSplitRegex);
    if (parts.length >= 3) {
      const left = parseFlowNode(parts[0]);
      const edgeTypeStr = parts[1];
      const right = parseFlowNode(parts.slice(2).join(''));

      let lineStyle: 'solid' | 'dashed' | 'dotted' | 'double' = 'solid';
      let arrowType: 'none' | 'single' | 'double' = 'single';
      if (edgeTypeStr === '---') arrowType = 'none';
      else if (edgeTypeStr === '-.->') lineStyle = 'dashed';
      else if (edgeTypeStr === '==>') lineStyle = 'double';

      // Upsert nodes
      for (const info of [left, right]) {
        if (!nodes.has(info.id)) {
          nodes.set(info.id, createFlowNode(info.id, info.content, info.type, currentGroup));
          if (currentGroup) groups.get(currentGroup)?.push(info.id);
        } else if (info.content !== info.id) {
          const existing = nodes.get(info.id)!;
          existing.content = info.content;
          existing.type = info.type;
        }
      }

      edges.push({
        id: `edge_${generateId()}`, type: arrowType === 'none' ? 'line' : 'arrow',
        position: { x: 0, y: 0 }, dimensions: { width: 0, height: 0 }, content: '',
        label, lineStyle, arrowType,
        startConnection: { nodeId: left.id, anchor: 'closest' },
        endConnection: { nodeId: right.id, anchor: 'closest' }
      });
    } else {
      const info = parseFlowNode(line);
      if (info.id && !nodes.has(info.id)) {
        nodes.set(info.id, createFlowNode(info.id, info.content, info.type, currentGroup));
        if (currentGroup) groups.get(currentGroup)?.push(info.id);
      } else if (info.id && nodes.has(info.id)) {
        const existing = nodes.get(info.id)!;
        existing.content = info.content;
        existing.type = info.type;
      }
    }
  }

  return layoutResult(nodes, edges);
}

// ─── CLASS DIAGRAM PARSER ──────────────────────────────────────────

function parseClassDiagram(code: string): DiagramNode[] | null {
  const lines = code.split('\n');
  const nodes = new Map<string, DiagramNode>();
  const edges: DiagramNode[] = [];

  let currentClassName: string | null = null;
  let currentMethods: string[] = [];
  let currentProperties: string[] = [];
  let currentStereotype: string | undefined = undefined;

  // Class diagram edge regex:
  // Matches: A --> B, A --|> B, A ..> B, A ..|> B, A -- B
  // With optional label: A --> B : label
  const classEdgeRegex = /^([a-zA-Z0-9_]+)\s+(-->|--|>|\.\.>|\.\.\|>|--|\*--|o--|<\|--|<\.\.)\s+([a-zA-Z0-9_]+)(?:\s*:\s*(.*))?$/;

  const flushClass = () => {
    if (!currentClassName) return;

    const isInterface = currentStereotype === 'interface';
    const isAbstract = currentStereotype === 'abstract';
    const isEnum = currentStereotype === 'enumeration';

    let type: NodeType = 'uml-class';
    if (isInterface) type = 'uml-interface';
    else if (isAbstract) type = 'uml-abstract';
    else if (isEnum) type = 'uml-enum';

    const sections: NodeSection[] = [];
    if (currentProperties.length > 0) {
      sections.push({ title: 'Properties', items: currentProperties });
    }
    if (currentMethods.length > 0) {
      sections.push({ title: 'Methods', items: currentMethods });
    }

    // Calculate dimensions based on content
    const longestItem = [currentClassName, ...currentProperties, ...currentMethods]
      .reduce((a, b) => a.length > b.length ? a : b, '');
    const width = Math.max(180, longestItem.length * 8 + 40);
    const height = Math.max(80, 40 + (currentProperties.length + currentMethods.length) * 22 + 20);

    nodes.set(currentClassName, {
      id: currentClassName,
      type,
      position: { x: 0, y: 0 },
      dimensions: { width, height },
      content: currentClassName,
      stereotype: currentStereotype,
      sections,
      tag: isInterface ? 'interface' : isAbstract ? 'abstract' : isEnum ? 'enum' : 'class',
      style: { backgroundColor: '#0d1117' }
    });

    currentClassName = null;
    currentMethods = [];
    currentProperties = [];
    currentStereotype = undefined;
  };

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('%%')) continue;
    if (line.toLowerCase().startsWith('classdiagram')) continue;
    if (line.toLowerCase().startsWith('direction ')) continue;

    // Opening a class block: class ClassName {
    const classBlockMatch = line.match(/^class\s+([a-zA-Z0-9_]+)\s*\{?\s*$/);
    if (classBlockMatch) {
      flushClass();
      currentClassName = classBlockMatch[1];
      continue;
    }

    // Closing brace
    if (line === '}') {
      flushClass();
      continue;
    }

    // Inside a class block
    if (currentClassName) {
      // Stereotype: <<interface>>
      const stereoMatch = line.match(/^<<\s*(.*?)\s*>>$/);
      if (stereoMatch) {
        currentStereotype = stereoMatch[1].toLowerCase();
        continue;
      }

      // Method or property line (e.g., +createProductA() AbstractProductA)
      const memberLine = line.replace(/^\s*/, '');
      if (memberLine) {
        if (memberLine.includes('(')) {
          currentMethods.push(memberLine);
        } else {
          currentProperties.push(memberLine);
        }
      }
      continue;
    }

    // Simple class declaration without block: class ConcreteProductA1
    const simpleClassMatch = line.match(/^class\s+([a-zA-Z0-9_]+)\s*$/);
    if (simpleClassMatch) {
      const className = simpleClassMatch[1];
      if (!nodes.has(className)) {
        nodes.set(className, {
          id: className, type: 'uml-class',
          position: { x: 0, y: 0 },
          dimensions: { width: Math.max(180, className.length * 8 + 40), height: 50 },
          content: className,
          tag: 'class',
          style: { backgroundColor: '#0d1117' }
        });
      }
      continue;
    }

    // Edge/relationship line
    const edgeMatch = line.match(classEdgeRegex);
    if (edgeMatch) {
      const sourceId = edgeMatch[1];
      const edgeTypeStr = edgeMatch[2];
      const targetId = edgeMatch[3];
      const label = edgeMatch[4]?.trim() || '';

      // Ensure both nodes exist (they may not have had a class block)
      for (const id of [sourceId, targetId]) {
        if (!nodes.has(id)) {
          nodes.set(id, {
            id, type: 'uml-class',
            position: { x: 0, y: 0 },
            dimensions: { width: Math.max(180, id.length * 8 + 40), height: 50 },
            content: id, tag: 'class',
            style: { backgroundColor: '#0d1117' }
          });
        }
      }

      // Map Mermaid edge types to Arc arrow styles
      let lineStyle: 'solid' | 'dashed' | 'dotted' | 'double' = 'solid';
      let arrowHead: ArrowHeadType = 'filled';
      let arrowTail: ArrowHeadType = 'none';

      if (edgeTypeStr === '-->') {
        // Dependency (dashed arrow in UML, but mermaid uses solid)
        lineStyle = 'solid'; arrowHead = 'open';
      } else if (edgeTypeStr === '--|>') {
        // Inheritance
        lineStyle = 'solid'; arrowHead = 'hollow';
      } else if (edgeTypeStr === '..>') {
        // Dependency (dashed)
        lineStyle = 'dashed'; arrowHead = 'open';
      } else if (edgeTypeStr === '..|>') {
        // Implementation
        lineStyle = 'dashed'; arrowHead = 'hollow';
      } else if (edgeTypeStr === '--') {
        // Association
        lineStyle = 'solid'; arrowHead = 'none';
      } else if (edgeTypeStr === '*--') {
        // Composition
        lineStyle = 'solid'; arrowTail = 'diamond-filled';
      } else if (edgeTypeStr === 'o--') {
        // Aggregation
        lineStyle = 'solid'; arrowTail = 'diamond-hollow';
      } else if (edgeTypeStr === '<|--') {
        // Reverse inheritance
        lineStyle = 'solid'; arrowTail = 'hollow';
      } else if (edgeTypeStr === '<..') {
        // Reverse implementation
        lineStyle = 'dashed'; arrowTail = 'hollow';
      }

      edges.push({
        id: `edge_${generateId()}`, type: 'arrow',
        position: { x: 0, y: 0 }, dimensions: { width: 0, height: 0 },
        content: '', label, lineStyle,
        arrowHead, arrowTail,
        startConnection: { nodeId: sourceId, anchor: 'closest' },
        endConnection: { nodeId: targetId, anchor: 'closest' }
      });
      continue;
    }
  }

  // Flush any remaining class being parsed
  flushClass();

  return layoutResult(nodes, edges);
}

// ─── SHARED LAYOUT ─────────────────────────────────────────────────

function layoutResult(nodes: Map<string, DiagramNode>, edges: DiagramNode[]): DiagramNode[] | null {
  const allNodes = Array.from(nodes.values()).concat(edges);
  if (allNodes.length === 0) return null;

  try {
    return autoLayoutNodes(allNodes);
  } catch (e) {
    console.error('Layout engine failed on mermaid parse', e);
    return allNodes;
  }
}
