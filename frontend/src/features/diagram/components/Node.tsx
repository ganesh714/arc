import type React from 'react';
import { Rnd } from 'react-rnd';
import { useDiagram } from '@/context/DiagramContext';
import type { DiagramNode } from '@/types';
import styles from './Node.module.css';

interface NodeProps {
  node: DiagramNode;
}

export function Node({ node }: NodeProps) {
  const { selectedNodeIds, selectNode, moveNode, moveSelectedNodes, resizeNode, updateLinePoints } = useDiagram();
  const isSelected = selectedNodeIds.includes(node.id);

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

  const handleStartDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialStart = { ...node.startPoint! };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      updateLinePoints(
        node.id,
        { x: initialStart.x + dx, y: initialStart.y + dy },
        node.endPoint!
      );
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleEndDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialEnd = { ...node.endPoint! };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      updateLinePoints(
        node.id,
        node.startPoint!,
        { x: initialEnd.x + dx, y: initialEnd.y + dy }
      );
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Rnd
      position={node.position}
      size={{ width: node.dimensions.width, height: node.dimensions.height }}
      onDragStop={(_e, d) => {
        if (selectedNodeIds.includes(node.id)) {
          moveSelectedNodes(node.id, { x: d.x, y: d.y });
        } else {
          moveNode(node.id, { x: d.x, y: d.y });
        }
      }}
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
              left: false,
              right: false,
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
      onMouseDown={(e: any) => {
        e.stopPropagation();
        
        // If shift is pressed, toggle selection immediately on mouse down
        if (e.shiftKey) {
          selectNode(node.id, true);
          return;
        }

        // If not shift, and not already selected, select it exclusively immediately
        if (!selectedNodeIds.includes(node.id)) {
          selectNode(node.id, false);
        }
        // If already selected, do nothing on mouse down to preserve multi-selection for dragging
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        
        // If we click without shift on an already-selected element within a multi-selection, 
        // refine the selection to only this element on mouse release
        if (!e.shiftKey && selectedNodeIds.includes(node.id) && selectedNodeIds.length > 1) {
          selectNode(node.id, false);
        }
      }}
      style={{
        backgroundColor: 'transparent',
        border: isSelected ? '1px dashed #3b82f6' : 'none',
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
            transform: `rotate(${45 + (node.rotation || 0)}deg)`,
            backgroundColor: node.style?.backgroundColor || '#fff3cd',
            border: `2px solid ${isSelected ? '#3b82f6' : node.style?.borderColor || '#ffc107'}`,
            borderRadius: node.style?.borderRadius || '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ transform: `rotate(${-45 - (node.rotation || 0)}deg)`, width: '141.4%', textAlign: 'center', wordBreak: 'break-word', padding: '4px' }}>
            {node.content}
          </div>
        </div>
      ) : node.type === 'circle' ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `rotate(${node.rotation || 0}deg)`,
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
        <div style={{ width: '100%', height: '100%', position: 'relative', transform: `rotate(${node.rotation || 0}deg)` }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
            {(() => {
              const r = parseInt(node.style?.borderRadius || '0', 10);
              const s = Math.max(0, Math.min(25, r * 0.5));
              
              const p1x = 50 - s * 0.45;
              const p1y = 3 + s * 0.90;
              const p2x = 50 + s * 0.45;
              const p2y = 3 + s * 0.90;
              
              const p3x = 97 - s * 0.45;
              const p3y = 97 - s * 0.90;
              const p4x = 97 - s;
              const p4y = 97;
              
              const p5x = 3 + s;
              const p5y = 97;
              const p6x = 3 + s * 0.45;
              const p6y = 97 - s * 0.90;
              
              const pathData = `M ${p1x} ${p1y} Q 50 3 ${p2x} ${p2y} L ${p3x} ${p3y} Q 97 97 ${p4x} ${p4y} L ${p5x} ${p5y} Q 3 97 ${p6x} ${p6y} Z`;
              
              return (
                <path
                  d={pathData}
                  fill={node.style?.backgroundColor || '#f0fdf4'}
                  stroke={isSelected ? '#3b82f6' : node.style?.borderColor || '#16a34a'}
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })()}
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
      ) : (node.type === 'line' || node.type === 'arrow') ? (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <svg width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
            <defs>
              <marker
                id={`arrowhead-end-${node.id}`}
                markerWidth="8"
                markerHeight="6"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={node.style?.borderColor || (node.type === 'line' ? '#475569' : '#0284c7')} />
              </marker>
              <marker
                id={`arrowhead-start-${node.id}`}
                markerWidth="8"
                markerHeight="6"
                refX="2"
                refY="3"
                orient="auto"
              >
                <polygon points="8 0, 0 3, 8 6" fill={node.style?.borderColor || (node.type === 'line' ? '#475569' : '#0284c7')} />
              </marker>
            </defs>

            {node.lineCurve === 'curved' ? (() => {
              const startX = node.startPoint!.x - node.position.x;
              const startY = node.startPoint!.y - node.position.y;
              const endX = node.endPoint!.x - node.position.x;
              const endY = node.endPoint!.y - node.position.y;
              const dx = endX - startX;
              const dy = endY - startY;
              const len = Math.sqrt(dx * dx + dy * dy);
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;
              const curveOffset = Math.max(15, Math.min(60, len * 0.15));
              const nx = len > 0 ? -dy / len : 0;
              const ny = len > 0 ? dx / len : 0;
              const controlX = midX + nx * curveOffset;
              const controlY = midY + ny * curveOffset;

              const effectiveArrowType = node.arrowType || (node.type === 'arrow' ? 'single' : 'none');

              return (
                <g style={{ cursor: 'move' }}>
                  {/* Invisible generous click/drag target hitbox */}
                  <path
                    d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                    stroke="transparent"
                    strokeWidth="16"
                    fill="none"
                  />
                  {/* Visible thin line/arrow */}
                  <path
                    d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                    stroke={node.style?.borderColor || (node.type === 'line' ? '#475569' : '#0284c7')}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={node.lineStyle === 'dashed' ? '8 6' : undefined}
                    markerStart={effectiveArrowType === 'double' ? `url(#arrowhead-start-${node.id})` : undefined}
                    markerEnd={(effectiveArrowType === 'single' || effectiveArrowType === 'double') ? `url(#arrowhead-end-${node.id})` : undefined}
                  />
                </g>
              );
            })() : (() => {
              const startX = node.startPoint!.x - node.position.x;
              const startY = node.startPoint!.y - node.position.y;
              const endX = node.endPoint!.x - node.position.x;
              const endY = node.endPoint!.y - node.position.y;

              const effectiveArrowType = node.arrowType || (node.type === 'arrow' ? 'single' : 'none');

              return (
                <g style={{ cursor: 'move' }}>
                  {/* Invisible generous click/drag target hitbox */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="transparent"
                    strokeWidth="16"
                  />
                  {/* Visible thin line/arrow */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={node.style?.borderColor || (node.type === 'line' ? '#475569' : '#0284c7')}
                    strokeWidth="3"
                    strokeDasharray={node.lineStyle === 'dashed' ? '8 6' : undefined}
                    markerStart={effectiveArrowType === 'double' ? `url(#arrowhead-start-${node.id})` : undefined}
                    markerEnd={(effectiveArrowType === 'single' || effectiveArrowType === 'double') ? `url(#arrowhead-end-${node.id})` : undefined}
                  />
                </g>
              );
            })()}
          </svg>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `rotate(${node.rotation || 0}deg)`,
            backgroundColor: node.style?.backgroundColor || '#f0f0f0',
            border: `2px solid ${isSelected ? '#3b82f6' : node.style?.borderColor || '#333'}`,
            borderRadius: node.style?.borderRadius || '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          {node.content}
        </div>
      )}

      {isSelected && (node.type === 'line' || node.type === 'arrow') && (
        <>
          {/* Start Point Handle */}
          <div
            style={{
              position: 'absolute',
              left: node.startPoint!.x - node.position.x,
              top: node.startPoint!.y - node.position.y,
              width: '10px',
              height: '10px',
              backgroundColor: '#ffffff',
              border: '2px solid #0284c7',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: 30,
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            onMouseDown={handleStartDrag}
          />
          {/* End Point Handle */}
          <div
            style={{
              position: 'absolute',
              left: node.endPoint!.x - node.position.x,
              top: node.endPoint!.y - node.position.y,
              width: '10px',
              height: '10px',
              backgroundColor: '#ffffff',
              border: '2px solid #0284c7',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: 30,
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            onMouseDown={handleEndDrag}
          />
        </>
      )}
    </Rnd>
  );
}
