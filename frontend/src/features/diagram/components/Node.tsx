import { MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { useDiagram } from '@/context/DiagramContext';
import type { DiagramNode } from '@/types';
import styles from './Node.module.css';

interface NodeProps {
  node: DiagramNode;
}

export function Node({ node }: NodeProps) {
  const { selectedNodeIds, selectNode, moveNode, moveSelectedNodes, resizeNode, zoom, activeTool, selectToolMode, setNodes, nodes, updateNode, saveHistoryState } = useDiagram();
  const isSelected = selectedNodeIds.includes(node.id);
  const [isCardOpen, setIsCardOpen] = useState(node.content === '');
  const [isHovered, setIsHovered] = useState(false);

  // Figma resize handle - scales inversely with zoom to maintain constant screen size
  const FigmaHandle = ({ position }: { position: string }) => {
    const handleSize = 6 / zoom;
    const borderSize = 1.5 / zoom;
    const offsetPos = -3 / zoom;
    const shadowSize = 1 / zoom;
    const shadowBlur = 2 / zoom;
    const borderRadius = 1 / zoom;

    const offsets: Record<string, React.CSSProperties> = {
      topLeft: { top: `${offsetPos}px`, left: `${offsetPos}px`, cursor: 'nwse-resize' },
      topRight: { top: `${offsetPos}px`, right: `${offsetPos}px`, cursor: 'nesw-resize' },
      bottomLeft: { bottom: `${offsetPos}px`, left: `${offsetPos}px`, cursor: 'nesw-resize' },
      bottomRight: { bottom: `${offsetPos}px`, right: `${offsetPos}px`, cursor: 'nwse-resize' },
      top: { top: `${offsetPos}px`, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
      bottom: { bottom: `${offsetPos}px`, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
      left: { left: `${offsetPos}px`, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
      right: { right: `${offsetPos}px`, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
    };

    return (
      <div
        style={{
          width: `${handleSize}px`,
          height: `${handleSize}px`,
          backgroundColor: '#ffffff',
          border: `${borderSize}px solid #0c8ce9`,
          borderRadius: `${borderRadius}px`,
          position: 'absolute',
          boxShadow: `0 ${shadowSize}px ${shadowBlur}px rgba(0,0,0,0.3)`,
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
    const initialNodes = [...nodes];
    let hasMoved = false;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        hasMoved = true;
      }

      const currentX = initialStart.x + dx;
      const currentY = initialStart.y + dy;

      // Snapping logic
      let bestAnchor: { nodeId: string; anchor: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number } | null = null;
      let minDistance = 20 / zoom;

      for (const n of nodes) {
        if (n.id === node.id || n.type === 'line' || n.type === 'arrow') continue;
        const anchors: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'left', 'right'];
        for (const a of anchors) {
          let ax = n.position.x;
          let ay = n.position.y;
          if (a === 'top') { ax += n.dimensions.width / 2; }
          else if (a === 'bottom') { ax += n.dimensions.width / 2; ay += n.dimensions.height; }
          else if (a === 'left') { ay += n.dimensions.height / 2; }
          else if (a === 'right') { ax += n.dimensions.width; ay += n.dimensions.height / 2; }

          const dist = Math.sqrt(Math.pow(currentX - ax, 2) + Math.pow(currentY - ay, 2));
          if (dist < minDistance) {
            minDistance = dist;
            bestAnchor = { nodeId: n.id, anchor: a, x: ax, y: ay };
          }
        }
      }

      if (bestAnchor) {
        updateNode({
          ...node,
          startPoint: { x: bestAnchor.x, y: bestAnchor.y },
          startConnection: { nodeId: bestAnchor.nodeId, anchor: bestAnchor.anchor }
        });
      } else {
        updateNode({
          ...node,
          startPoint: { x: currentX, y: currentY },
          startConnection: undefined,
          position: { x: Math.min(currentX, node.endPoint!.x), y: Math.min(currentY, node.endPoint!.y) },
          dimensions: { 
            width: Math.max(15, Math.abs(node.endPoint!.x - currentX)), 
            height: Math.max(15, Math.abs(node.endPoint!.y - currentY)) 
          }
        });
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (hasMoved) {
        saveHistoryState(initialNodes);
      }
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
    const initialNodes = [...nodes];
    let hasMoved = false;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        hasMoved = true;
      }

      const currentX = initialEnd.x + dx;
      const currentY = initialEnd.y + dy;

      // Snapping logic
      let bestAnchor: { nodeId: string; anchor: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number } | null = null;
      let minDistance = 20 / zoom;

      for (const n of nodes) {
        if (n.id === node.id || n.type === 'line' || n.type === 'arrow') continue;
        const anchors: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'left', 'right'];
        for (const a of anchors) {
          let ax = n.position.x;
          let ay = n.position.y;
          if (a === 'top') { ax += n.dimensions.width / 2; }
          else if (a === 'bottom') { ax += n.dimensions.width / 2; ay += n.dimensions.height; }
          else if (a === 'left') { ay += n.dimensions.height / 2; }
          else if (a === 'right') { ax += n.dimensions.width; ay += n.dimensions.height / 2; }

          const dist = Math.sqrt(Math.pow(currentX - ax, 2) + Math.pow(currentY - ay, 2));
          if (dist < minDistance) {
            minDistance = dist;
            bestAnchor = { nodeId: n.id, anchor: a, x: ax, y: ay };
          }
        }
      }

      if (bestAnchor) {
        updateNode({
          ...node,
          endPoint: { x: bestAnchor.x, y: bestAnchor.y },
          endConnection: { nodeId: bestAnchor.nodeId, anchor: bestAnchor.anchor }
        });
      } else {
        updateNode({
          ...node,
          endPoint: { x: currentX, y: currentY },
          endConnection: undefined,
          position: { x: Math.min(node.startPoint!.x, currentX), y: Math.min(node.startPoint!.y, currentY) },
          dimensions: { 
            width: Math.max(15, Math.abs(currentX - node.startPoint!.x)), 
            height: Math.max(15, Math.abs(currentY - node.startPoint!.y)) 
          }
        });
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (hasMoved) {
        saveHistoryState(initialNodes);
      }
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

  const isLine = node.type === 'line' || node.type === 'arrow' || node.type === 'custom-connector';
  const isComment = node.type === 'comment';

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
      onDragStart={(e) => {
        // Prevent drag triggers when editing comments
        if (isComment && isCardOpen) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        const newWidth = parseInt(ref.style.width, 10);
        const newHeight = parseInt(ref.style.height, 10);
        
        if (selectToolMode === 'scale') {
          const oldWidth = node.dimensions.width;
          const factor = newWidth / oldWidth;
          const currentFontSizeStr = node.style?.fontSize || '11px';
          const currentFontSizeNum = parseFloat(currentFontSizeStr) || 11;
          const newFontSizeNum = Math.max(8, Math.round(currentFontSizeNum * factor));
          const newFontSizeStr = `${newFontSizeNum}px`;
          
          resizeNode(
            node.id,
            { width: newWidth, height: newHeight },
            position
          );
          
          updateNode({
            ...node,
            position,
            dimensions: { width: newWidth, height: newHeight },
            style: {
              ...node.style,
              fontSize: newFontSizeStr
            }
          });
        } else {
          resizeNode(
            node.id,
            { width: newWidth, height: newHeight },
            position
          );
        }
      }}
      scale={zoom}
      className={`${styles.node} ${isSelected ? styles.selected : ''}`}
      enableResizing={
        (isLine || isComment || activeTool === 'hand' || activeTool === 'erase')
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
      disableDragging={activeTool === 'erase' || activeTool === 'hand' || (isComment && isCardOpen)}
      resizeHandleComponent={(isComment || activeTool === 'hand' || activeTool === 'erase') ? undefined : activeHandles}
      onMouseDown={(e: any) => {
        if (activeTool === 'hand') return; // let mouse down bubble up to pan the canvas
        e.stopPropagation();
        if (activeTool === 'erase') {
          saveHistoryState(nodes);
          setNodes(nodes.filter(n => n.id !== node.id));
          return;
        }
        if (e.shiftKey) {
          selectNode(node.id, true);
          return;
        }
        if (!selectedNodeIds.includes(node.id)) {
          selectNode(node.id, false);
        }
      }}
      onMouseEnter={(e: any) => {
        setIsHovered(true);
        // Drag-erasing functionality
        if (activeTool === 'erase' && e.buttons === 1) {
          saveHistoryState(nodes);
          setNodes(nodes.filter(n => n.id !== node.id));
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onClick={(e: React.MouseEvent) => {
        if (activeTool === 'hand') return;
        e.stopPropagation();
        if (activeTool === 'erase') return;
        if (!e.shiftKey && selectedNodeIds.includes(node.id) && selectedNodeIds.length > 1) {
          selectNode(node.id, false);
        }
      }}
      style={{
        backgroundColor: 'transparent',
        outline: activeTool === 'erase' && isHovered 
          ? `${1.5 / zoom}px solid #f04438` 
          : isSelected 
            ? `${1.5 / zoom}px solid #0c8ce9` 
            : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: isSelected ? 30 : 1,
        opacity: node.style?.opacity !== undefined ? Number(node.style.opacity) : 1,
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
      ) : node.type === 'pill' ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `rotate(${node.rotation || 0}deg)`,
            backgroundColor: node.style?.backgroundColor || '#2c2c2c',
            border: `1.5px solid ${node.style?.borderColor || '#555555'}`,
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            boxShadow: node.style?.boxShadow || 'none'
          }}
        >
          <div style={{ ...textStyle, padding: '8px 20px' }}>
            {node.content}
          </div>
        </div>
      ) : node.type === 'hexagon' ? (
        <div style={{ width: '100%', height: '100%', position: 'relative', transform: `rotate(${node.rotation || 0}deg)`, filter: shadowFilter }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
            <polygon 
              points="25,5 75,5 100,50 75,95 25,95 0,50" 
              fill={node.style?.backgroundColor || '#2e2438'} 
              stroke={node.style?.borderColor || '#824ea0'} 
              strokeWidth="2" 
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
            <div style={{ ...textStyle, padding: '10px' }}>
              {node.content}
            </div>
          </div>
        </div>
      ) : node.type === 'parallelogram' ? (
        <div style={{ width: '100%', height: '100%', position: 'relative', transform: `rotate(${node.rotation || 0}deg)`, filter: shadowFilter }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
            <polygon 
              points="20,5 100,5 80,95 0,95" 
              fill={node.style?.backgroundColor || '#242e38'} 
              stroke={node.style?.borderColor || '#4e82a0'} 
              strokeWidth="2" 
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
            <div style={{ ...textStyle, padding: '10px 20px' }}>
              {node.content}
            </div>
          </div>
        </div>
      ) : node.type === 'database' ? (
        <div style={{ width: '100%', height: '100%', position: 'relative', transform: `rotate(${node.rotation || 0}deg)`, filter: shadowFilter }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
            <path 
              d="M 5,20 C 5,10 95,10 95,20 L 95,80 C 95,90 5,90 5,80 Z" 
              fill={node.style?.backgroundColor || '#382424'} 
              stroke={node.style?.borderColor || '#a04e4e'} 
              strokeWidth="2" 
              vectorEffect="non-scaling-stroke"
            />
            <path 
              d="M 5,20 C 5,30 95,30 95,20" 
              fill="none" 
              stroke={node.style?.borderColor || '#a04e4e'} 
              strokeWidth="2" 
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div 
            style={{ 
              position: 'absolute', 
              top: '25%', 
              left: 0, 
              width: '100%', 
              height: '75%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              pointerEvents: 'none' 
            }}
          >
            <div style={{ ...textStyle, padding: '10px' }}>
              {node.content}
            </div>
          </div>
        </div>
      ) : node.type === 'note' ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `rotate(${node.rotation || 0}deg)`,
            backgroundColor: node.style?.backgroundColor || '#fef3c7',
            border: `1.5px solid ${node.style?.borderColor || '#f59e0b'}`,
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            padding: '12px',
            boxShadow: node.style?.boxShadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)'
          }}
        >
          {/* Note fold */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '15%',
            height: '15%',
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderLeft: `1px solid ${node.style?.borderColor || '#f59e0b'}`,
            borderTop: `1px solid ${node.style?.borderColor || '#f59e0b'}`,
          }} />
          <div style={{ ...textStyle, color: node.style?.color || '#92400e' }}>
            {node.content}
          </div>
        </div>
      ) : node.type === 'custom-block' ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `rotate(${node.rotation || 0}deg)`,
            background: node.style?.background || node.style?.backgroundColor || '#2c2c2c',
            borderWidth: node.style?.borderWidth || '1.5px',
            borderStyle: node.style?.borderStyle || 'solid',
            borderColor: node.style?.borderColor || '#555555',
            borderRadius: node.style?.borderRadius || '0px',
            clipPath: node.style?.clipPath || 'none',
            backdropFilter: node.style?.backdropFilter || 'none',
            filter: node.style?.filter || shadowFilter,
            boxShadow: node.style?.boxShadow || 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            padding: '8px'
          }}
        >
          <div style={textStyle}>
            {node.content}
          </div>
        </div>
      ) : isLine ? (
        node.type === 'custom-connector' ? (() => {
          const startX = node.startPoint!.x - node.position.x;
          const startY = node.startPoint!.y - node.position.y;
          const endX = node.endPoint!.x - node.position.x;
          const endY = node.endPoint!.y - node.position.y;
          const dx = endX - startX;
          const dy = endY - startY;
          const length = Math.sqrt(dx * dx + dy * dy);
          let angle = Math.atan2(dy, dx) * (180 / Math.PI);

          const connectorStyle = node.customConnectorStyle || {};
          const borderWidth = node.style?.borderWidth || '2px';
          const borderStyle = node.style?.borderStyle || 'dashed';
          const borderColor = node.style?.borderColor || '#e74c3c';
          const arrowHeadWidth = connectorStyle.borderWidth || '12px';
          const arrowHeadColor = connectorStyle.borderBottomColor || borderColor;

          const parseCssString = (css: string) => {
            return css.split(';').reduce((acc, rule) => {
              const [key, value] = rule.split(':');
              if (key && value) {
                const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                if (camelKey !== 'position' && camelKey !== 'top' && camelKey !== 'left') {
                  acc[camelKey] = value.trim();
                }
              }
              return acc;
            }, {} as any);
          };

          const startMarkerCss = connectorStyle.startMarkerCss ? parseCssString(String(connectorStyle.startMarkerCss)) : null;
          const endMarkerCss = connectorStyle.endMarkerCss ? parseCssString(String(connectorStyle.endMarkerCss)) : null;

          return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: `${startX}px`,
                top: `${startY}px`,
                width: `${length}px`,
                borderTop: `${borderWidth} ${borderStyle} ${borderColor}`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: '0 0',
                pointerEvents: 'none',
                filter: shadowFilter
              }} />

              {startMarkerCss && (
                <div style={{
                  position: 'absolute',
                  left: `${startX}px`,
                  top: `${startY}px`,
                  pointerEvents: 'none',
                  filter: shadowFilter,
                  ...startMarkerCss
                }} />
              )}

              {endMarkerCss ? (
                <div style={{
                  position: 'absolute',
                  left: `${endX}px`,
                  top: `${endY}px`,
                  pointerEvents: 'none',
                  filter: shadowFilter,
                  ...endMarkerCss
                }} />
              ) : (
                <div style={{
                  position: 'absolute',
                  left: `${endX}px`,
                  top: `${endY}px`,
                  width: 0,
                  height: 0,
                  borderLeft: `calc(${arrowHeadWidth} * 0.6) solid transparent`,
                  borderRight: `calc(${arrowHeadWidth} * 0.6) solid transparent`,
                  borderBottom: `${arrowHeadWidth} solid ${arrowHeadColor}`,
                  transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                  pointerEvents: 'none',
                  filter: shadowFilter
                }} />
              )}
            </div>
          );
        })() : (
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
        )
      ) : node.type === 'path' ? (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <svg width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
            <path
              d={(() => {
                const pts = node.points || [];
                if (pts.length === 0) return '';
                const xs = pts.map(p => p.x);
                const ys = pts.map(p => p.y);
                const minX = Math.min(...xs);
                const minY = Math.min(...ys);
                const maxX = Math.max(...xs);
                const maxY = Math.max(...ys);
                const origW = Math.max(1, maxX - minX);
                const origH = Math.max(1, maxY - minY);
                
                const scaleX = node.dimensions.width / origW;
                const scaleY = node.dimensions.height / origH;
                
                return `M ${pts[0].x * scaleX} ${pts[0].y * scaleY} ` + 
                       pts.slice(1).map(p => `L ${p.x * scaleX} ${p.y * scaleY}`).join(' ');
              })()}
              fill="none"
              stroke={node.style?.borderColor || '#0c8ce9'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : node.type === 'comment' ? (
        <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>
          {/* Comment Bubble Pin */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setIsCardOpen(!isCardOpen);
            }}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50% 50% 50% 4px',
              backgroundColor: 'var(--accent-purple)',
              border: '2px solid #ffffff',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              transform: isSelected ? 'scale(1.15)' : 'scale(1)',
              color: 'white'
            }}
            title={node.content || "Add comment"}
          >
            <MessageSquare size={14} strokeWidth={2.5} />
          </div>

          {/* Comment Details Card */}
          {isCardOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                left: '34px',
                top: '0',
                backgroundColor: 'var(--bg-panel-solid)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                padding: '12px',
                width: '240px',
                boxShadow: 'var(--shadow-depth)',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)' }} />
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Comment</span>
                </div>
                <button
                  onClick={() => setIsCardOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px' }}
                >
                  ✕
                </button>
              </div>

              {node.content ? (
                <>
                  <div style={{ fontSize: '11px', color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: '1.4' }}>
                    {node.content}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Just now</span>
                    <button
                      onClick={() => {
                        saveHistoryState(nodes);
                        setNodes(nodes.filter(n => n.id !== node.id));
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#f04438', cursor: 'pointer', fontSize: '10px' }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <textarea
                    placeholder="Type a comment..."
                    autoFocus
                    style={{
                      width: '100%',
                      height: '60px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '4px',
                      padding: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      outline: 'none',
                      resize: 'none'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const val = (e.target as HTMLTextAreaElement).value.trim();
                        if (val) {
                          updateNode({ ...node, content: val });
                          setIsCardOpen(false);
                        } else {
                          setNodes(nodes.filter(n => n.id !== node.id));
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) {
                        updateNode({ ...node, content: val });
                        setIsCardOpen(false);
                      } else {
                        setNodes(nodes.filter(n => n.id !== node.id));
                      }
                    }}
                  />
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Press Enter to save</span>
                </div>
              )}
            </div>
          )}
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
              width: `${8 / zoom}px`,
              height: `${8 / zoom}px`,
              backgroundColor: '#ffffff',
              border: `${2 / zoom}px solid #0c8ce9`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: 30,
              boxShadow: `0 ${1 / zoom}px ${3 / zoom}px rgba(0,0,0,0.3)`,
            }}
            onMouseDown={handleStartDrag}
          />
          {/* End Point Handle */}
          <div
            style={{
              position: 'absolute',
              left: node.endPoint!.x - node.position.x,
              top: node.endPoint!.y - node.position.y,
              width: `${8 / zoom}px`,
              height: `${8 / zoom}px`,
              backgroundColor: '#ffffff',
              border: `${2 / zoom}px solid #0c8ce9`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: 30,
              boxShadow: `0 ${1 / zoom}px ${3 / zoom}px rgba(0,0,0,0.3)`,
            }}
            onMouseDown={handleEndDrag}
          />
        </>
      )}
    </Rnd>
  );
}
