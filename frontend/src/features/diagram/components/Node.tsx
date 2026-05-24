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
          : (node.type === 'line' || node.type === 'arrow')
          ? {
              top: false,
              bottom: false,
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
        backgroundColor: (node.type === 'diamond' || node.type === 'circle' || node.type === 'triangle' || node.type === 'line' || node.type === 'arrow') ? 'transparent' : (node.style?.backgroundColor || '#f0f0f0'),
        border: (node.type === 'diamond' || node.type === 'circle' || node.type === 'triangle' || node.type === 'line' || node.type === 'arrow')
          ? (isSelected ? '1px dashed #3b82f6' : 'none')
          : `2px solid ${isSelected ? '#3b82f6' : node.style?.borderColor || '#333'}`,
        borderRadius: node.type === 'box' ? (node.style?.borderRadius || '4px') : '0px',
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
            borderRadius: node.style?.borderRadius || '0px',
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
      ) : node.type === 'circle' ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: node.style?.backgroundColor || '#f1f5f9',
            border: `2px solid ${isSelected ? '#3b82f6' : node.style?.borderColor || '#64748b'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ textAlign: 'center', wordBreak: 'break-word', padding: '8px' }}>
            {node.content}
          </div>
        </div>
      ) : node.type === 'triangle' ? (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
            <polygon
              points="50,3 97,97 3,97"
              fill={node.style?.backgroundColor || '#f0fdf4'}
              stroke={isSelected ? '#3b82f6' : node.style?.borderColor || '#16a34a'}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              pointerEvents: 'none' 
            }}
          >
            <div style={{ textAlign: 'center', wordBreak: 'break-word', padding: '30px 15px 15px 15px', color: node.style?.color || '#000', fontSize: node.style?.fontSize || '16px' }}>
              {node.content}
            </div>
          </div>
        </div>
      ) : node.type === 'line' ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke={node.style?.borderColor || '#475569'}
              strokeWidth="3"
            />
          </svg>
        </div>
      ) : node.type === 'arrow' ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            <defs>
              <marker
                id={`arrowhead-${node.id}`}
                markerWidth="8"
                markerHeight="6"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={node.style?.borderColor || '#0284c7'} />
              </marker>
            </defs>
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke={node.style?.borderColor || '#0284c7'}
              strokeWidth="3"
              markerEnd={`url(#arrowhead-${node.id})`}
            />
          </svg>
        </div>
      ) : (
        node.content
      )}
    </Rnd>
  );
}
