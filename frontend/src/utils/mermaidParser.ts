import type { DiagramNode, NodeType } from '../types';
import { autoLayoutNodes } from './layoutEngine';

// Generates a random ID for edges
const generateId = () => Math.random().toString(36).substring(2, 9);

const edgeSplitRegex = /(-->|---|-\.-\>|==>)/;

const parseNode = (nodeStr: string): { id: string, content: string, type: NodeType } => {
  nodeStr = nodeStr.trim();
  const nodeRegex = /^([a-zA-Z0-9_-]+)(?:\[\((.*?)\)\]|\[\/(.*?)\/\]|\(\((.*?)\)\)|\{(.*?)\}|\(\[(.*?)\]\)|\((.*?)\)|\[(.*?)\])?$/;
  const match = nodeStr.match(nodeRegex);
  if (!match) return { id: nodeStr, content: nodeStr, type: 'box' };
  
  const id = match[1];
  let type: NodeType = 'box';
  let content = id;
  
  if (match[2] !== undefined) { type = 'database'; content = match[2]; } // [()]
  else if (match[3] !== undefined) { type = 'parallelogram'; content = match[3]; } // [/ /]
  else if (match[4] !== undefined) { type = 'circle'; content = match[4]; } // (())
  else if (match[5] !== undefined) { type = 'diamond'; content = match[5]; } // {}
  else if (match[6] !== undefined) { type = 'pill'; content = match[6]; } // ([])
  else if (match[7] !== undefined) { type = 'rounded-rect'; content = match[7]; } // ()
  else if (match[8] !== undefined) { type = 'box'; content = match[8]; } // []
  
  return { id, content, type };
};

function createDefaultNode(id: string, content: string, type: NodeType, groupId: string | null): DiagramNode {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    dimensions: { width: 140, height: 60 },
    content,
    groupId: groupId || undefined,
    style: { backgroundColor: '#0d1117' }
  };
}

export function parseMermaid(code: string): DiagramNode[] | null {
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
          id: currentGroup,
          type: 'group-frame',
          position: { x: 0, y: 0 },
          dimensions: { width: 300, height: 300 },
          content: groupLabel,
          style: { backgroundColor: 'transparent' }
        });
        groups.set(currentGroup, []);
      }
      continue;
    }
    
    if (line === 'end' && currentGroup) {
      currentGroup = null;
      continue;
    }

    let label = '';
    
    // Extract |label| if present
    const pipeLabelMatch = line.match(/\|(.*?)\|/);
    if (pipeLabelMatch) {
        label = pipeLabelMatch[1];
        line = line.replace(`|${label}|`, '');
    }
    
    // Alternative label: A -- label --> B
    const textLabelMatch = line.match(/--\s+(.*?)\s+-->/);
    if (textLabelMatch) {
        label = textLabelMatch[1];
        line = line.replace(textLabelMatch[0], '-->');
    }
    
    const parts = line.split(edgeSplitRegex);
    if (parts.length >= 3) {
      const leftNodeInfo = parseNode(parts[0]);
      const edgeTypeStr = parts[1];
      const rightNodeInfo = parseNode(parts.slice(2).join(''));
      
      let lineStyle: 'solid' | 'dashed' | 'dotted' | 'double' = 'solid';
      let arrowType: 'none' | 'single' | 'double' = 'single';
      
      if (edgeTypeStr === '---') {
        arrowType = 'none';
      } else if (edgeTypeStr === '-.->') {
        lineStyle = 'dashed';
      } else if (edgeTypeStr === '==>') {
        lineStyle = 'double';
      }

      // Upsert left node
      if (!nodes.has(leftNodeInfo.id)) {
        nodes.set(leftNodeInfo.id, createDefaultNode(leftNodeInfo.id, leftNodeInfo.content, leftNodeInfo.type, currentGroup));
        if (currentGroup) groups.get(currentGroup)?.push(leftNodeInfo.id);
      } else {
        const existing = nodes.get(leftNodeInfo.id)!;
        if (leftNodeInfo.content !== leftNodeInfo.id) {
          existing.content = leftNodeInfo.content;
          existing.type = leftNodeInfo.type;
        }
      }

      // Upsert right node
      if (!nodes.has(rightNodeInfo.id)) {
        nodes.set(rightNodeInfo.id, createDefaultNode(rightNodeInfo.id, rightNodeInfo.content, rightNodeInfo.type, currentGroup));
        if (currentGroup) groups.get(currentGroup)?.push(rightNodeInfo.id);
      } else {
        const existing = nodes.get(rightNodeInfo.id)!;
        if (rightNodeInfo.content !== rightNodeInfo.id) {
          existing.content = rightNodeInfo.content;
          existing.type = rightNodeInfo.type;
        }
      }
      
      edges.push({
        id: `edge_${generateId()}`,
        type: arrowType === 'none' ? 'line' : 'arrow',
        position: { x: 0, y: 0 },
        dimensions: { width: 0, height: 0 },
        content: '',
        label,
        lineStyle,
        arrowType,
        startConnection: { nodeId: leftNodeInfo.id, anchor: 'closest' },
        endConnection: { nodeId: rightNodeInfo.id, anchor: 'closest' }
      });
    } else {
      // Just a node definition
      const nodeInfo = parseNode(line);
      if (nodeInfo.id) {
        if (!nodes.has(nodeInfo.id)) {
          nodes.set(nodeInfo.id, createDefaultNode(nodeInfo.id, nodeInfo.content, nodeInfo.type, currentGroup));
          if (currentGroup) groups.get(currentGroup)?.push(nodeInfo.id);
        } else {
          const existing = nodes.get(nodeInfo.id)!;
          existing.content = nodeInfo.content;
          existing.type = nodeInfo.type;
        }
      }
    }
  }

  const allNodes = Array.from(nodes.values()).concat(edges);
  
  if (allNodes.length === 0) return null;

  try {
    return autoLayoutNodes(allNodes);
  } catch (e) {
    console.error("Layout engine failed on mermaid parse", e);
    return allNodes;
  }
}
