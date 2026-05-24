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

  const DiamondHandle = () => (
    <div
      style={{
        width: '8px',
        height: '8px',
        backgroundColor: '#ffffff',
        border: '1.5px solid #3b82f6',
        borderRadius: '50%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
      }}
    />
  );

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
      enableResizing={
        node.type === 'diamond'
          ? {
              top: true,
              bottom: true,
              left: true,
              right: true,
              topLeft: false,
              topRight: false,
              bottomLeft: false,
              bottomRight: false,
            }
          : {
              top: true,
              bottom: true,
              left: true,
              right: true,
              topLeft: true,
              topRight: true,
              bottomLeft: true,
              bottomRight: true,
            }
      }
      resizeHandleComponent={
        node.type === 'diamond' && isSelected
          ? {
              top: <DiamondHandle />,
              bottom: <DiamondHandle />,
              left: <DiamondHandle />,
              right: <DiamondHandle />,
            }
          : undefined
      }
      onMouseDown={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
      style={{
        backgroundColor: node.type === 'diamond' ? 'transparent' : (node.style?.backgroundColor || '#f0f0f0'),
        border: node.type === 'diamond'
          ? (isSelected ? '1px dashed #3b82f6' : 'none')
          : `2px solid ${isSelected ? '#3b82f6' : node.style?.borderColor || '#333'}`,
        color: node.style?.color || '#000',
        fontSize: node.style?.fontSize || '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {node.type === 'diamond' ? (
        <div
          style={{
            width: '70.7%',
            height: '70.7%',
            transform: 'rotate(45deg)',
            backgroundColor: node.style?.backgroundColor || '#fff3cd',
            border: `2px solid ${isSelected ? '#3b82f6' : node.style?.borderColor || '#ffc107'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ transform: 'rotate(-45deg)', width: '141.4%', textAlign: 'center', wordBreak: 'break-word', padding: '4px' }}>
            {node.content}
          </div>
        </div>
      ) : (
        node.content
      )}
    </Rnd>
  );
}
