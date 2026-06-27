import dagre from 'dagre';
import { DiagramNode } from '../types';

export function autoLayoutNodes(nodes: DiagramNode[]): DiagramNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', ranksep: 180, nodesep: 150 });
  g.setDefaultEdgeLabel(() => ({}));

  const isEdge = (n: DiagramNode) => ['arrow', 'line', 'custom-connector'].includes(n.type);

  const realNodes = nodes.filter(n => !isEdge(n));
  const edges = nodes.filter(n => isEdge(n));

  realNodes.forEach(node => {
    g.setNode(node.id, { 
      width: node.dimensions?.width || 220, 
      height: node.dimensions?.height || 90 
    });
  });

  edges.forEach(edge => {
    if (edge.startConnection?.nodeId && edge.endConnection?.nodeId) {
      g.setEdge(edge.startConnection.nodeId, edge.endConnection.nodeId);
    }
  });

  dagre.layout(g);

  // Apply calculated layout back to the real nodes
  const layoutedNodes = nodes.map(node => {
    if (!isEdge(node)) {
      const dagreNode = g.node(node.id);
      if (dagreNode) {
        return {
          ...node,
          position: {
            x: Math.round(dagreNode.x - (node.dimensions?.width || 220) / 2),
            y: Math.round(dagreNode.y - (node.dimensions?.height || 90) / 2)
          }
        };
      }
    }
    return node;
  });

  // Now that nodes are positioned, update edge startPoint and endPoint for the initial render
  return layoutedNodes.map(node => {
    if (isEdge(node) && node.startConnection?.nodeId && node.endConnection?.nodeId) {
      const sourceNode = layoutedNodes.find(n => n.id === node.startConnection!.nodeId);
      const targetNode = layoutedNodes.find(n => n.id === node.endConnection!.nodeId);

      if (sourceNode && targetNode) {
        // Automatically calculate anchor points (bottom of source, top of target)
        node.startConnection.anchor = 'bottom';
        node.endConnection.anchor = 'top';
        
        node.startPoint = {
          x: sourceNode.position.x + (sourceNode.dimensions.width / 2),
          y: sourceNode.position.y + sourceNode.dimensions.height
        };
        node.endPoint = {
          x: targetNode.position.x + (targetNode.dimensions.width / 2),
          y: targetNode.position.y
        };
      }
    }
    return node;
  });
}
