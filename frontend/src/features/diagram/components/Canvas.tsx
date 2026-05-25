import { useState, useEffect } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { Node } from './Node';
import styles from './Canvas.module.css';
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Triangle, 
  Diamond as DiamondIcon, 
  Minus, 
  ArrowRight,
  Star as StarIcon,
  Plus,
  Minus as ZoomOutIcon
} from 'lucide-react';

export function Canvas() {
  const { 
    nodes, 
    selectedNodeIds,
    selectNode,
    setSelectedNodeIds,
    setNodes,
    addBox,
    addDiamond,
    addCircle,
    addTriangle,
    addStar,
    addLine,
    addArrow,
    zoom,
    setZoom
  } = useDiagram();

  const [activeTool, setActiveTool] = useState<string>('select');

  // Keyboard arrow keys nudging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = document.activeElement?.tagName;
      if (
        targetTag === 'INPUT' ||
        targetTag === 'TEXTAREA' ||
        targetTag === 'SELECT'
      ) {
        return;
      }

      if (selectedNodeIds.length === 0) return;

      let dx = 0;
      let dy = 0;
      const nudgeAmount = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'ArrowUp':
        case 'Up':
          dy = -nudgeAmount;
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 'Down':
          dy = nudgeAmount;
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'Left':
          dx = -nudgeAmount;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'Right':
          dx = nudgeAmount;
          e.preventDefault();
          break;
        default:
          return;
      }

      const updatedNodes = nodes.map((node) => {
        if (selectedNodeIds.includes(node.id)) {
          const newPos = { x: node.position.x + dx, y: node.position.y + dy };
          if (node.startPoint && node.endPoint) {
            return {
              ...node,
              position: newPos,
              startPoint: { x: node.startPoint.x + dx, y: node.startPoint.y + dy },
              endPoint: { x: node.endPoint.x + dx, y: node.endPoint.y + dy }
            };
          }
          return { ...node, position: newPos };
        }
        return node;
      });
      setNodes(updatedNodes);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeIds, setNodes, nodes]);

  const [marquee, setMarquee] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/loom-node-type');
    if (!type) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (type === 'box') addBox({ x, y });
    else if (type === 'diamond') addDiamond({ x, y });
    else if (type === 'circle') addCircle({ x, y });
    else if (type === 'triangle') addTriangle({ x, y });
    else if (type === 'star') addStar({ x, y });
    else if (type === 'line') addLine({ x, y });
    else if (type === 'arrow') addArrow({ x, y });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / zoom;
    const startY = (e.clientY - rect.top) / zoom;

    setMarquee({
      startX,
      startY,
      currentX: startX,
      currentY: startY
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = (moveEvent.clientX - rect.left) / zoom;
      const currentY = (moveEvent.clientY - rect.top) / zoom;
      setMarquee(prev => prev ? { ...prev, currentX, currentY } : null);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      setMarquee(currentMarquee => {
        if (!currentMarquee) return null;

        const left = Math.min(currentMarquee.startX, currentMarquee.currentX);
        const top = Math.min(currentMarquee.startY, currentMarquee.currentY);
        const right = Math.max(currentMarquee.startX, currentMarquee.currentX);
        const bottom = Math.max(currentMarquee.startY, currentMarquee.currentY);
        const width = right - left;
        const height = bottom - top;

        if (width < 3 && height < 3) {
          if (!upEvent.shiftKey) {
            selectNode(null);
          }
          return null;
        }

        const intersectingIds = nodes
          .filter(node => {
            const nodeLeft = node.position.x;
            const nodeTop = node.position.y;
            const nodeRight = node.position.x + node.dimensions.width;
            const nodeBottom = node.position.y + node.dimensions.height;

            return (
              nodeLeft < right &&
              nodeRight > left &&
              nodeTop < bottom &&
              nodeBottom > top
            );
          })
          .map(node => node.id);

        if (upEvent.shiftKey) {
          setSelectedNodeIds(Array.from(new Set([...selectedNodeIds, ...intersectingIds])));
        } else {
          setSelectedNodeIds(intersectingIds);
        }

        return null;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleToolClick = (tool: string, action: () => void) => {
    setActiveTool(tool);
    action();
    setTimeout(() => {
      setActiveTool('select');
    }, 200);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(2.0, zoom + 0.1));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(0.5, zoom - 0.1));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
  };

  return (
    <div className={styles.canvasWrapper}>
      {/* Figma Floating Toolbar */}
      <div className={styles.toolbar}>
        <button 
          className={`${styles.toolButton} ${activeTool === 'select' ? styles.toolButtonActive : ''}`}
          onClick={() => setActiveTool('select')}
          title="Move/Select (V)"
        >
          <MousePointer2 size={15} />
        </button>
        <div className={styles.divider} />
        
        <button 
          className={`${styles.toolButton} ${activeTool === 'box' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('box', () => addBox({ x: 350, y: 200 }))}
          title="Rectangle (R)"
        >
          <Square size={15} />
        </button>
        
        <button 
          className={`${styles.toolButton} ${activeTool === 'circle' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('circle', () => addCircle({ x: 350, y: 200 }))}
          title="Ellipse (O)"
        >
          <Circle size={15} />
        </button>

        <button 
          className={`${styles.toolButton} ${activeTool === 'triangle' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('triangle', () => addTriangle({ x: 350, y: 200 }))}
          title="Triangle"
        >
          <Triangle size={15} />
        </button>

        <button 
          className={`${styles.toolButton} ${activeTool === 'diamond' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('diamond', () => addDiamond({ x: 350, y: 200 }))}
          title="Diamond"
        >
          <DiamondIcon size={15} />
        </button>

        <button 
          className={`${styles.toolButton} ${activeTool === 'star' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('star', () => addStar({ x: 350, y: 200 }))}
          title="Star"
        >
          <StarIcon size={15} />
        </button>

        <button 
          className={`${styles.toolButton} ${activeTool === 'line' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('line', () => addLine({ x: 250, y: 200 }))}
          title="Line (L)"
        >
          <Minus size={15} />
        </button>

        <button 
          className={`${styles.toolButton} ${activeTool === 'arrow' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('arrow', () => addArrow({ x: 250, y: 200 }))}
          title="Arrow (Shift+L)"
        >
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Floating Zoom HUD */}
      <div className={styles.zoomHUD}>
        <button className={styles.zoomBtn} onClick={handleZoomOut} title="Zoom Out">
          <ZoomOutIcon size={10} />
        </button>
        <span className={styles.zoomLabel} onClick={handleZoomReset} title="Reset to 100%">
          {Math.round(zoom * 100)}%
        </span>
        <button className={styles.zoomBtn} onClick={handleZoomIn} title="Zoom In">
          <Plus size={10} />
        </button>
      </div>

      <div 
        className={styles.canvas} 
        onMouseDown={handleMouseDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Scaled viewport container */}
        <div style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: `${100 / zoom}%`,
          height: `${100 / zoom}%`,
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}>
          <div style={{ pointerEvents: 'auto', width: '100%', height: '100%', position: 'relative' }}>
            {nodes.map((node) => (
              <Node key={node.id} node={node} />
            ))}
          </div>
        </div>

        {/* Marquee Selection (stays standard overlay scale) */}
        {marquee && (() => {
          const left = Math.min(marquee.startX, marquee.currentX) * zoom;
          const top = Math.min(marquee.startY, marquee.currentY) * zoom;
          const width = Math.abs(marquee.currentX - marquee.startX) * zoom;
          const height = Math.abs(marquee.currentY - marquee.startY) * zoom;
          
          return (
            <div 
              className={styles.marqueeBox}
              style={{
                left,
                top,
                width,
                height
              }}
            />
          );
        })()}
      </div>
    </div>
  );
}
