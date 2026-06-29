import dagre from 'dagre';
import type { DiagramNode } from '../types';

export function autoLayoutNodes(nodes: DiagramNode[]): DiagramNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', ranksep: 180, nodesep: 150 });
  g.setDefaultEdgeLabel(() => ({}));

  const isEdge = (n: DiagramNode) => ['arrow', 'line', 'custom-connector'].includes(n.type);

  const realNodes = nodes.filter(n => !isEdge(n));
  const edges = nodes.filter(n => isEdge(n));

  realNodes.forEach(node => {
    let defaultWidth = 220;
    let defaultHeight = 90;
    if (node.type === 'diamond' || node.type === 'circle') {
      defaultWidth = 140;
      defaultHeight = 140;
    } else if (node.type === 'terminator') {
      defaultWidth = 160;
      defaultHeight = 70;
    }
    
    g.setNode(node.id, { 
      width: node.dimensions?.width || defaultWidth, 
      height: node.dimensions?.height || defaultHeight 
    });
  });

  const outgoingEdges = new Map<string, DiagramNode[]>();
  edges.forEach(edge => {
    if (edge.startConnection?.nodeId && edge.endConnection?.nodeId) {
      const sourceId = edge.startConnection.nodeId;
      if (!outgoingEdges.has(sourceId)) outgoingEdges.set(sourceId, []);
      outgoingEdges.get(sourceId)!.push(edge);
    }
  });

  edges.forEach(edge => {
    if (edge.startConnection?.nodeId && edge.endConnection?.nodeId) {
      let minlen = 1;
      let weight = 1;
      const labelLower = (edge.label || '').toLowerCase();
      const sourceNode = nodes.find(n => n.id === edge.startConnection!.nodeId);
      
      if (sourceNode?.type === 'diamond') {
        const sourceEdges = outgoingEdges.get(sourceNode.id) || [];
        const isSecondEdge = sourceEdges.length > 1 && sourceEdges[1].id === edge.id;
        const isYes = labelLower === 'yes' || labelLower === 'true' || isSecondEdge;

        if (isYes) {
          minlen = 1;
          weight = 1; // Horizontal branch (Yes/True) has low weight to be pushed aside
        } else {
          minlen = 1;
          weight = 100; // Vertical branch (No/False) has extremely high weight to stay perfectly aligned
        }
      }
      
      g.setEdge(edge.startConnection.nodeId, edge.endConnection.nodeId, { minlen, weight });
    }
  });

  dagre.layout(g);

  // Apply calculated layout back to the real nodes
  const layoutedNodes = nodes.map(node => {
    if (!isEdge(node)) {
      const dagreNode = g.node(node.id);
      if (dagreNode) {
        let defaultWidth = 220;
        let defaultHeight = 90;
        if (node.type === 'diamond' || node.type === 'circle') {
          defaultWidth = 140;
          defaultHeight = 140;
        } else if (node.type === 'terminator') {
          defaultWidth = 160;
          defaultHeight = 70;
        }

        const width = node.dimensions?.width || defaultWidth;
        const height = node.dimensions?.height || defaultHeight;

        return {
          ...node,
          dimensions: { width, height },
          position: {
            x: Math.round(dagreNode.x - width / 2),
            y: Math.round(dagreNode.y - height / 2)
          }
        };
      }
    }
    return node;
  });

  // Now that nodes are positioned, update edge startPoint and endPoint for the initial render
  return layoutedNodes.map(node => {
    if (isEdge(node)) {
      // Default fallback to prevent fatal crashes during render
      node.startPoint = node.startPoint || { x: 0, y: 0 };
      node.endPoint = node.endPoint || { x: 100, y: 100 };

      if (node.startConnection?.nodeId && node.endConnection?.nodeId) {
        const sourceNode = layoutedNodes.find(n => n.id === node.startConnection!.nodeId);
        const targetNode = layoutedNodes.find(n => n.id === node.endConnection!.nodeId);

        if (sourceNode && targetNode) {
          // Force edge to use elbow routing for a clean flowchart look
          node.routing = 'elbow';

          // Automatically calculate anchor points
          const labelLower = (node.label || '').toLowerCase();
          
          if (sourceNode.type === 'diamond') {
            const sourceEdges = outgoingEdges.get(sourceNode.id) || [];
            const isSecondEdge = sourceEdges.length > 1 && sourceEdges[1].id === node.id;
            const isYes = labelLower === 'yes' || labelLower === 'true' || isSecondEdge;
            
            if (isYes) {
              node.startConnection.anchor = 'right';
            } else {
              node.startConnection.anchor = 'bottom';
            }
          } else {
            node.startConnection.anchor = 'bottom';
          }
          
          node.endConnection.anchor = 'top';

          // Calculate start/end points based on anchors
          if (node.startConnection.anchor === 'right') {
            node.startPoint = {
              x: sourceNode.position.x + sourceNode.dimensions.width,
              y: sourceNode.position.y + (sourceNode.dimensions.height / 2)
            };
          } else {
            node.startPoint = {
              x: sourceNode.position.x + (sourceNode.dimensions.width / 2),
              y: sourceNode.position.y + sourceNode.dimensions.height
            };
          }
          
          node.endPoint = {
            x: targetNode.position.x + (targetNode.dimensions.width / 2),
            y: targetNode.position.y
          };
        }
      }
      
      // Calculate bounding box so Rnd in Node.tsx doesn't crash on undefined dimensions
      node.position = {
        x: Math.min(node.startPoint.x, node.endPoint.x),
        y: Math.min(node.startPoint.y, node.endPoint.y)
      };
      node.dimensions = {
        width: Math.max(15, Math.abs(node.endPoint.x - node.startPoint.x)),
        height: Math.max(15, Math.abs(node.endPoint.y - node.startPoint.y))
      };
    }
    return node;
  });
}
