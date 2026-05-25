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

  // Figma resize handle
  const FigmaHandle = ({ position }: { position: string }) => {
    const offsets: Record<string, React.CSSProperties> = {
      topLeft: { top: '-3px', left: '-3px', cursor: 'nwse-resize' },
      topRight: { top: '-3px', right: '-3px', cursor: 'nesw-resize' },
      bottomLeft: { bottom: '-3px', left: '-3px', cursor: 'nesw-resize' },
      bottomRight: { bottom: '-3px', right: '-3px', cursor: 'nwse-resize' },
      top: { top: '-3px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
      bottom: { bottom: '-3px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
      left: { left: '-3px', top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
      right: { right: '-3px', top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
    };

    return (
      <div
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: '#ffffff',
          border: '1.5px solid #0c8ce9',
          borderRadius: '1px',
          position: 'absolute',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          ...offsets[position],
        }}
      />
    );
  };

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

  const activeHandles = isSelected ? {
    topLeft: <FigmaHandle position="topLeft" />,
    topRight: <FigmaHandle position="topRight" />,
    bottomLeft: <FigmaHandle position="bottomLeft" />,
    bottomRight: <FigmaHandle position="bottomRight" />,
    top: <FigmaHandle position="top" />,
    bottom: <FigmaHandle position="bottom" />,
    left: <FigmaHandle position="left" />,
    right: <FigmaHandle position="right" />,
  } : undefined;

  const isLine = node.type === 'line' || node.type === 'arrow';

  // Build text style object
  const textStyle: React.CSSProperties = {
    color: node.style?.color || '#e3e3e3',
    fontSize: node.style?.fontSize || '11px',
    fontWeight: node.style?.fontWeight || 'normal',
    textAlign: node.style?.textAlign || 'center',
    width: '100%',
    wordBreak: 'break-word',
  };

  // Shadow filters vs css box shadows
  const hasShadow = !!node.style?.boxShadow;
  const shadowFilter = hasShadow ? `drop-shadow(${node.style!.boxShadow})` : 'none';

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
        isLine
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
      resizeHandleComponent={activeHandles}
      onMouseDown={(e: any) => {
        e.stopPropagation();
        if (e.shiftKey) {
          selectNode(node.id, true);
          return;
        }
        if (!selectedNodeIds.includes(node.id)) {
          selectNode(node.id, false);
        }
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        if (!e.shiftKey && selectedNodeIds.includes(node.id) && selectedNodeIds.length > 1) {
          selectNode(node.id, false);
        }
      }}
      style={{
        backgroundColor: 'transparent',
        outline: isSelected ? '1.5px solid #0c8ce9' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: isSelected ? 30 : 1,
      }}
    >
      {node.type === 'diamond' ? (
        <div
          style={{
            width: '70.7%',
            height: '70.7%',
            transform: `rotate(${45 + (node.rotation || 0)}deg)`,
            backgroundColor: node.style?.backgroundColor || '#2e2c24',
            border: `1.5px solid ${node.style?.borderColor || '#c69c3a'}`,
            borderRadius: node.style?.borderRadius || '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            filter: shadowFilter
          }}
        >
          <div style={{ transform: `rotate(${-45 - (node.rotation || 0)}deg)`, width: '141.4%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ ...textStyle, padding: '4px' }}>
              {node.content}
            </div>
          </div>
        </div>
      ) : node.type === 'circle' ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `rotate(${node.rotation || 0}deg)`,
            borderRadius: '50%',
            backgroundColor: node.style?.backgroundColor || '#2c2c2c',
            border: `1.5px solid ${node.style?.borderColor || '#555555'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            boxShadow: node.style?.boxShadow || 'none'
          }}
        >
          <div style={{ ...textStyle, padding: '8px' }}>
            {node.content}
          </div>
        </div>
      ) : node.type === 'triangle' ? (
        <div style={{ width: '100%', height: '100%', position: 'relative', transform: `rotate(${node.rotation || 0}deg)`, filter: shadowFilter }}>
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
                  fill={node.style?.backgroundColor || '#1c2e24'}
                  stroke={node.style?.borderColor || '#2b8a4e'}
                  strokeWidth="2"
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
            <div style={{ ...textStyle, padding: '30px 15px 15px 15px' }}>
              {node.content}
            </div>
          </div>
        </div>
      ) : node.type === 'star' ? (
        <div style={{ width: '100%', height: '100%', position: 'relative', transform: `rotate(${node.rotation || 0}deg)`, filter: shadowFilter }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: 'block' }}>
            <polygon 
              points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" 
              fill={node.style?.backgroundColor || '#38301b'} 
              stroke={node.style?.borderColor || '#9e7c1d'} 
              strokeWidth="2" 
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
            <div style={{ ...textStyle, padding: '24px 20px 20px 20px' }}>
              {node.content}
            </div>
          </div>
        </div>
      ) : isLine ? (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <svg width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
            <defs>
              <marker
                id={`arrowhead-end-${node.id}`}
                markerWidth="6"
                markerHeight="5"
                refX="5"
                refY="2.5"
                orient="auto"
              >
                <polygon points="0 0, 6 2.5, 0 5" fill={node.style?.borderColor || (node.type === 'line' ? '#888888' : '#0c8ce9')} />
              </marker>
              <marker
                id={`arrowhead-start-${node.id}`}
                markerWidth="6"
                markerHeight="5"
                refX="1"
                refY="2.5"
                orient="auto"
              >
                <polygon points="6 0, 0 2.5, 6 5" fill={node.style?.borderColor || (node.type === 'line' ? '#888888' : '#0c8ce9')} />
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
                  <path
                    d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                    stroke="transparent"
                    strokeWidth="16"
                    fill="none"
                  />
                  <path
                    d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                    stroke={node.style?.borderColor || (node.type === 'line' ? '#888888' : '#0c8ce9')}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={node.lineStyle === 'dashed' ? '5 4' : undefined}
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
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="transparent"
                    strokeWidth="16"
                  />
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={node.style?.borderColor || (node.type === 'line' ? '#888888' : '#0c8ce9')}
                    strokeWidth="2"
                    strokeDasharray={node.lineStyle === 'dashed' ? '5 4' : undefined}
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
            backgroundColor: node.style?.backgroundColor || '#2c2c2c',
            border: `1.5px solid ${node.style?.borderColor || '#555555'}`,
            borderRadius: node.style?.borderRadius || '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            padding: '8px',
            boxShadow: node.style?.boxShadow || 'none'
          }}
        >
          <div style={textStyle}>
            {node.content}
          </div>
        </div>
      )}

      {isSelected && isLine && (
        <>
          {/* Start Point Handle */}
          <div
            style={{
              position: 'absolute',
              left: node.startPoint!.x - node.position.x,
              top: node.startPoint!.y - node.position.y,
              width: '8px',
              height: '8px',
              backgroundColor: '#ffffff',
              border: '2px solid #0c8ce9',
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
              width: '8px',
              height: '8px',
              backgroundColor: '#ffffff',
              border: '2px solid #0c8ce9',
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
