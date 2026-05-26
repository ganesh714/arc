import { useState, useEffect, useRef } from 'react';
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
  Minus as ZoomOutIcon,
  Bold,
  Trash2
} from 'lucide-react';

export function Canvas() {
  const { 
    nodes, 
    selectedNodeIds,
    selectNode,
    setSelectedNodeIds,
    setNodes,
    updateNode,
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
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Keyboard Space detection for panning cursor
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      const targetTag = document.activeElement?.tagName;
      if (
        targetTag === 'INPUT' ||
        targetTag === 'TEXTAREA' ||
        targetTag === 'SELECT'
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setSpacePressed(true);
      }
    };

    const handleKeyUpGlobal = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDownGlobal);
    window.addEventListener('keyup', handleKeyUpGlobal);
    return () => {
      window.removeEventListener('keydown', handleKeyDownGlobal);
      window.removeEventListener('keyup', handleKeyUpGlobal);
    };
  }, []);

  // Wheel listener: Ctrl + scroll zooms, regular scroll pans (trackpad)
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleWheelRaw = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = 0.05;
        const direction = e.deltaY < 0 ? 1 : -1;
        const newZoom = Math.min(3.0, Math.max(0.1, zoom + direction * zoomFactor));
        setZoom(Number(newZoom.toFixed(2)));
      } else {
        e.preventDefault();
        setPanOffset(prev => ({
          x: prev.x - e.deltaX / zoom,
          y: prev.y - e.deltaY / zoom
        }));
      }
    };

    canvasEl.addEventListener('wheel', handleWheelRaw, { passive: false });
    return () => {
      canvasEl.removeEventListener('wheel', handleWheelRaw);
    };
  }, [zoom]);

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
    const x = (e.clientX - rect.left) / zoom - panOffset.x;
    const y = (e.clientY - rect.top) / zoom - panOffset.y;

    if (type === 'box') addBox({ x, y });
    else if (type === 'diamond') addDiamond({ x, y });
    else if (type === 'circle') addCircle({ x, y });
    else if (type === 'triangle') addTriangle({ x, y });
    else if (type === 'star') addStar({ x, y });
    else if (type === 'line') addLine({ x, y });
    else if (type === 'arrow') addArrow({ x, y });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const isMiddleClick = e.button === 1;
    const isSpaceDrag = spacePressed;

    if (isMiddleClick || isSpaceDrag) {
      e.preventDefault();
      setIsPanning(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const initialPan = { ...panOffset };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        setPanOffset({
          x: initialPan.x + dx / zoom,
          y: initialPan.y + dy / zoom
        });
      };

      const handleMouseUp = () => {
        setIsPanning(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return;
    }

    if (e.target !== e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / zoom - panOffset.x;
    const startY = (e.clientY - rect.top) / zoom - panOffset.y;

    setMarquee({
      startX,
      startY,
      currentX: startX,
      currentY: startY
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = (moveEvent.clientX - rect.left) / zoom - panOffset.x;
      const currentY = (moveEvent.clientY - rect.top) / zoom - panOffset.y;
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
    setZoom(Math.min(3.0, zoom + 0.1));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(0.1, zoom - 0.1));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Helper to place shapes at current visible center of the canvas viewport
  const getCanvasCenter = () => {
    const canvasEl = canvasRef.current;
    if (canvasEl) {
      const rect = canvasEl.getBoundingClientRect();
      return {
        x: rect.width / 2 / zoom - panOffset.x,
        y: rect.height / 2 / zoom - panOffset.y
      };
    }
    return { x: 350 - panOffset.x, y: 200 - panOffset.y };
  };

  // Quick contextual changes
  const selectedNode = selectedNodeIds.length === 1 ? nodes.find(n => n.id === selectedNodeIds[0]) : null;

  const handleQuickChange = (field: string, value: string) => {
    if (!selectedNode) return;
    updateNode({
      ...selectedNode,
      style: {
        ...selectedNode.style,
        [field]: value
      }
    });
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setSelectedNodeIds([]);
  };

  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (spacePressed) return 'grab';
    return 'default';
  };

  return (
    <div className={styles.canvasWrapper}>
      {/* Main Canvas Area */}
      <div 
        ref={canvasRef}
        className={styles.canvas} 
        onMouseDown={handleMouseDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          cursor: getCursor(),
          backgroundColor: 'var(--bg-canvas)',
          backgroundImage: 'radial-gradient(var(--border-default) 1px, transparent 1px)',
          backgroundSize: `${16 * zoom}px ${16 * zoom}px`,
          backgroundPosition: `${panOffset.x * zoom}px ${panOffset.y * zoom}px`,
        }}
      >
        {/* Scaled viewport container */}
        <div style={{
          transform: `translate(${panOffset.x * zoom}px, ${panOffset.y * zoom}px) scale(${zoom})`,
          transformOrigin: 'top left',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}>
          <div style={{ pointerEvents: 'auto', width: '100%', height: '100%', position: 'relative' }}>
            {nodes.map((node) => (
              <Node key={node.id} node={node} />
            ))}

            {/* Floating Contextual Menu directly above the selected shape */}
            {selectedNode && (() => {
              const isLine = selectedNode.type === 'line' || selectedNode.type === 'arrow';
              
              // Menu layout dimensions logic
              const menuTop = selectedNode.position.y < 50 
                ? (selectedNode.position.y + selectedNode.dimensions.height + 8) 
                : (selectedNode.position.y - 40);
                
              const menuLeft = Math.max(10, selectedNode.position.x + (selectedNode.dimensions.width / 2) - 80);

              return (
                <div 
                  className={styles.contextMenu}
                  style={{
                    top: `${menuTop}px`,
                    left: `${menuLeft}px`
                  }}
                >
                  {/* Fill Color Picker (Only if shape) */}
                  {!isLine && (
                    <div className={styles.contextColorWrapper} title="Fill Color">
                      <input 
                        type="color" 
                        className={styles.contextColorPicker}
                        value={selectedNode.style?.backgroundColor || '#2c2c2c'}
                        onChange={(e) => handleQuickChange('backgroundColor', e.target.value)}
                      />
                    </div>
                  )}

                  {/* Border / Line Color Picker */}
                  <div className={styles.contextColorWrapper} title={isLine ? "Line Color" : "Stroke Color"}>
                    <input 
                      type="color" 
                      className={styles.contextColorPicker}
                      value={selectedNode.style?.borderColor || (isLine ? '#888888' : '#555555')}
                      onChange={(e) => handleQuickChange('borderColor', e.target.value)}
                    />
                  </div>

                  {/* Text Bold Toggle (Only if shape) */}
                  {!isLine && (
                    <>
                      <div className={styles.divider} style={{ height: '12px' }} />
                      <button 
                        className={`${styles.contextBtn} ${selectedNode.style?.fontWeight === 'bold' ? styles.contextBtnActive : ''}`}
                        onClick={() => handleQuickChange('fontWeight', selectedNode.style?.fontWeight === 'bold' ? 'normal' : 'bold')}
                        title="Toggle Bold Text"
                      >
                        <Bold size={11} />
                      </button>
                    </>
                  )}

                  <div className={styles.divider} style={{ height: '12px' }} />

                  {/* Delete Element */}
                  <button 
                    className={styles.contextBtn} 
                    onClick={() => handleDeleteNode(selectedNode.id)} 
                    title="Delete element"
                    style={{ color: '#f04438' }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })()}

            {/* Marquee Selection inside scaled viewport (canvas coordinates) */}
            {marquee && (() => {
              const left = Math.min(marquee.startX, marquee.currentX);
              const top = Math.min(marquee.startY, marquee.currentY);
              const width = Math.abs(marquee.currentX - marquee.startX);
              const height = Math.abs(marquee.currentY - marquee.startY);
              
              return (
                <div 
                  className={styles.marqueeBox}
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`
                  }}
                />
              );
            })()}
          </div>
        </div>
      </div>

      {/* Figma Floating Toolbar - Bottom Center (Fixed overlay inside wrapper) */}
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
          onClick={() => handleToolClick('box', () => addBox(getCanvasCenter()))}
          title="Rectangle (R)"
        >
          <Square size={15} />
        </button>
        
        <button 
          className={`${styles.toolButton} ${activeTool === 'circle' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('circle', () => addCircle(getCanvasCenter()))}
          title="Ellipse (O)"
        >
          <Circle size={15} />
        </button>

        <button 
          className={`${styles.toolButton} ${activeTool === 'triangle' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('triangle', () => addTriangle(getCanvasCenter()))}
          title="Triangle"
        >
          <Triangle size={15} />
        </button>

        <button 
          className={`${styles.toolButton} ${activeTool === 'diamond' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('diamond', () => addDiamond(getCanvasCenter()))}
          title="Diamond"
        >
          <DiamondIcon size={15} />
        </button>

        <button 
          className={`${styles.toolButton} ${activeTool === 'star' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('star', () => addStar(getCanvasCenter()))}
          title="Star"
        >
          <StarIcon size={15} />
        </button>

        <button 
          className={`${styles.toolButton} ${activeTool === 'line' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('line', () => addLine(getCanvasCenter()))}
          title="Line (L)"
        >
          <Minus size={15} />
        </button>

        <button 
          className={`${styles.toolButton} ${activeTool === 'arrow' ? styles.toolButtonActive : ''}`}
          onClick={() => handleToolClick('arrow', () => addArrow(getCanvasCenter()))}
          title="Arrow (Shift+L)"
        >
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Floating Zoom HUD (Fixed overlay inside wrapper) */}
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
    </div>
  );
}
