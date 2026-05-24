import type React from 'react';
import { Rnd } from 'react-rnd';
import { useDiagram } from '@/context/DiagramContext';
import type { DiagramNode } from '@/types';
import styles from './Node.module.css';

interface NodeProps {
  node: DiagramNode;
}

export function Node({ node }: NodeProps) {
  const { selectedNodeId, selectNode, moveNode, resizeNode } = useDiagram();
  const isSelected = selectedNodeId === node.id;

  return (
    <Rnd
      position={node.position}
      size={{ width: node.dimensions.width, height: node.dimensions.height }}
      onDragStart={() => selectNode(node.id)}
      onDragStop={(_e, d) => moveNode(node.id, { x: d.x, y: d.y })}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        resizeNode(
          node.id,
          {
            width: parseInt(ref.style.width, 10),
            height: parseInt(ref.style.height, 10),
          },
          position
        );
      }}
      bounds="parent"
      className={`${styles.node} ${isSelected ? styles.selected : ''}`}
      onMouseDown={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
      style={{
        backgroundColor: node.style?.backgroundColor || '#f0f0f0',
        border: `2px solid ${isSelected ? '#3b82f6' : node.style?.borderColor || '#333'}`,
        color: node.style?.color || '#000',
        fontSize: node.style?.fontSize || '16px',
      }}
    >
      {node.content}
    </Rnd>
  );
}
