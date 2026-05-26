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
  Trash2,
  ChevronDown,
  Pencil,
  Eraser,
  MessageSquare,
  Scaling as ScalingIcon,
  Hand
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
    setZoom,
    activeTool,
    setActiveTool,
    selectToolMode,
    setSelectToolMode,
    undo,
    redo,
    copySelected,
    pasteSelected,
    cutSelected,
    deleteSelected
  } = useDiagram();

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [drawingPreview, setDrawingPreview] = useState<{
    type: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    points?: { x: number; y: number }[];
  } | null>(null);

  const drawingPreviewRef = useRef(drawingPreview);
  drawingPreviewRef.current = drawingPreview;

  const [selectDropdownOpen, setSelectDropdownOpen] = useState(false);
  const [shapeDropdownOpen, setShapeDropdownOpen] = useState(false);
  const [currentShapeType, setCurrentShapeType] = useState<'box' | 'circle' | 'triangle' | 'star' | 'diamond' | 'line' | 'arrow'>('box');

  // Close shape and select dropdown on click away
  useEffect(() => {
    if (!shapeDropdownOpen && !selectDropdownOpen) return;
    const handleOutsideClick = () => {
      setShapeDropdownOpen(false);
      setSelectDropdownOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [shapeDropdownOpen, selectDropdownOpen]);

  // Keyboard Space detection for panning cursor and tool hotkeys
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      const targetTag = document.activeElement?.tagName;
      if (
        targetTag === 'INPUT' ||
        targetTag === 'TEXTAREA' ||
        targetTag === 'SELECT' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setSpacePressed(true);
        return;
      }

      const key = e.key.toLowerCase();

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Copy / Paste / Cut
      if ((e.ctrlKey || e.metaKey) && key === 'c') {
        e.preventDefault();
        copySelected();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === 'v') {
        e.preventDefault();
        pasteSelected();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === 'x') {
        e.preventDefault();
        cutSelected();
        return;
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      // Hotkeys for switching tools
      if (key === 'v' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        setActiveTool('select');
        setSelectToolMode('move');
      } else if (key === 'k' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        setActiveTool('select');
        setSelectToolMode('scale');
      } else if (key === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        setActiveTool('hand');
      } else if (key === 'p' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        setActiveTool('pen');
      } else if (key === 'e' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        setActiveTool('erase');
      } else if (key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        setActiveTool('comment');
      } else if (key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        setActiveTool('box');
        setCurrentShapeType('box');
      } else if (key === 'o' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        setActiveTool('circle');
        setCurrentShapeType('circle');
      } else if (key === 'l' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.shiftKey) {
          setActiveTool('arrow');
          setCurrentShapeType('arrow');
        } else {
          setActiveTool('line');
          setCurrentShapeType('line');
        }
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
  }, [undo, redo, copySelected, pasteSelected, cutSelected, deleteSelected]);

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

  const [isDragSelecting, setIsDragSelecting] = useState(false);
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
    const isSpaceDrag = spacePressed || activeTool === 'hand';

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

    if (activeTool !== 'select') {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const startX = (e.clientX - rect.left) / zoom - panOffset.x;
      const startY = (e.clientY - rect.top) / zoom - panOffset.y;

      if (activeTool === 'comment') {
        const id = crypto.randomUUID().split('-')[0];
        const newNode: any = {
          id,
          type: 'comment',
          position: { x: startX - 16, y: startY - 16 },
          dimensions: { width: 32, height: 32 },
          content: '',
          style: {
            backgroundColor: '#ffc000'
          }
        };
        setNodes([...nodes, newNode]);
        selectNode(id, false);
        setActiveTool('select');
        return;
      }

      if (activeTool === 'pen') {
        const pointsList = [{ x: startX, y: startY }];
        setDrawingPreview({
          type: 'pen',
          startX,
          startY,
          currentX: startX,
          currentY: startY,
          points: pointsList
        });

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const currentX = (moveEvent.clientX - rect.left) / zoom - panOffset.x;
          const currentY = (moveEvent.clientY - rect.top) / zoom - panOffset.y;
          pointsList.push({ x: currentX, y: currentY });
          setDrawingPreview({
            type: 'pen',
            startX,
            startY,
            currentX,
            currentY,
            points: [...pointsList]
          });
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);

          const currentPreview = drawingPreviewRef.current;
          if (currentPreview && currentPreview.points && currentPreview.points.length > 1) {
            const pts = currentPreview.points;
            const xs = pts.map(p => p.x);
            const ys = pts.map(p => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            const w = Math.max(10, maxX - minX);
            const h = Math.max(10, maxY - minY);

            const relativePoints = pts.map(p => ({
              x: p.x - minX,
              y: p.y - minY
            }));

            const id = crypto.randomUUID().split('-')[0];
            const newNode: any = {
              id,
              type: 'path',
              position: { x: minX, y: minY },
              dimensions: { width: w, height: h },
              content: '',
              style: {
                borderColor: '#0c8ce9'
              },
              points: relativePoints
            };

            setNodes([...nodes, newNode]);
            selectNode(id, false);
          }

          setDrawingPreview(null);
          setActiveTool('select');
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return;
      }

      // Regular shape drawing mode (box, circle, triangle, diamond, star, line, arrow)
      setDrawingPreview({
        type: activeTool,
        startX,
        startY,
        currentX: startX,
        currentY: startY
      });

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentX = (moveEvent.clientX - rect.left) / zoom - panOffset.x;
        const currentY = (moveEvent.clientY - rect.top) / zoom - panOffset.y;
        setDrawingPreview(prev => prev ? { ...prev, currentX, currentY } : null);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        const currentPreview = drawingPreviewRef.current;
        if (currentPreview) {
          const sX = currentPreview.startX;
          const sY = currentPreview.startY;
          const cX = currentPreview.currentX;
          const cY = currentPreview.currentY;

          const left = Math.min(sX, cX);
          const top = Math.min(sY, cY);
          const width = Math.max(10, Math.abs(cX - sX));
          const height = Math.max(10, Math.abs(cY - sY));

          if (width > 5 || height > 5) {
            const id = crypto.randomUUID().split('-')[0];
            const isLineType = activeTool === 'line' || activeTool === 'arrow';
            let newNode: any;

            if (isLineType) {
              newNode = {
                id,
                type: activeTool,
                position: { x: left, y: top },
                dimensions: { width, height },
                content: '',
                style: {
                  borderColor: activeTool === 'arrow' ? '#0c8ce9' : '#888888',
                },
                startPoint: { x: sX, y: sY },
                endPoint: { x: cX, y: cY }
              };
            } else {
              let defaultBg = 'var(--bg-hover)';
              let defaultBorder = 'var(--border-active)';
              let defaultText = 'Rectangle';
              let customStyle: any = {};

              if (activeTool === 'diamond') {
                defaultBg = 'var(--bg-hover)';
                defaultBorder = '#c69c3a';
                defaultText = 'Diamond';
                customStyle = { borderRadius: '2px' };
              } else if (activeTool === 'circle') {
                defaultText = 'Ellipse';
              } else if (activeTool === 'triangle') {
                defaultBg = 'var(--bg-hover)';
                defaultBorder = '#2b8a4e';
                defaultText = 'Triangle';
              } else if (activeTool === 'star') {
                defaultBg = 'var(--bg-hover)';
                defaultBorder = '#9e7c1d';
                defaultText = 'Star';
              }

              newNode = {
                id,
                type: activeTool,
                position: { x: left, y: top },
                dimensions: { width, height },
                content: defaultText,
                style: {
                  backgroundColor: defaultBg,
                  borderColor: defaultBorder,
                  color: 'var(--text-primary)',
                  ...customStyle
                }
              };
            }

            setNodes([...nodes, newNode]);
            selectNode(id, false);
          }
        }

        setDrawingPreview(null);
        setActiveTool('select');
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return;
    }

    // Select tool — check if we should drag-select or interact with a node
    if (e.button !== 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / zoom - panOffset.x;
    const startY = (e.clientY - rect.top) / zoom - panOffset.y;

    // Begin marquee regardless of whether we hit a node or empty space.
    // The marquee will only commit if the user dragged more than a threshold.
    setMarquee({ startX, startY, currentX: startX, currentY: startY });
    setIsDragSelecting(false);

    // Record where we started for click-vs-drag detection
    const startClientX = e.clientX;
    const startClientY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startClientX;
      const dy = moveEvent.clientY - startClientY;
      const dragDist = Math.sqrt(dx * dx + dy * dy);

      if (dragDist > 4) {
        setIsDragSelecting(true);
      }

      const currentX = (moveEvent.clientX - rect.left) / zoom - panOffset.x;
      const currentY = (moveEvent.clientY - rect.top) / zoom - panOffset.y;
      setMarquee(prev => prev ? { ...prev, currentX, currentY } : null);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      setMarquee(currentMarquee => {
        setIsDragSelecting(false);
        if (!currentMarquee) return null;

        const left = Math.min(currentMarquee.startX, currentMarquee.currentX);
        const top = Math.min(currentMarquee.startY, currentMarquee.currentY);
        const right = Math.max(currentMarquee.startX, currentMarquee.currentX);
        const bottom = Math.max(currentMarquee.startY, currentMarquee.currentY);
        const width = right - left;
        const height = bottom - top;

        // Small drag (< 5px) = treat as a click, not a marquee
        if (width < 5 && height < 5) {
          // Only deselect if clicking directly on the canvas (not a node)
          if (upEvent.target === upEvent.currentTarget || (upEvent.target as HTMLElement).classList.contains('canvas')) {
            if (!upEvent.shiftKey) selectNode(null);
          }
          return null;
        }

        const intersectingIds = nodes
          .filter(node => {
            const nodeLeft = node.position.x;
            const nodeTop = node.position.y;
            const nodeRight = node.position.x + node.dimensions.width;
            const nodeBottom = node.position.y + node.dimensions.height;
            return nodeLeft < right && nodeRight > left && nodeTop < bottom && nodeBottom > top;
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

  const shapeIcons = {
    box: <Square size={15} />,
    circle: <Circle size={15} />,
    triangle: <Triangle size={15} />,
    diamond: <DiamondIcon size={15} />,
    star: <StarIcon size={15} />,
    line: <Minus size={15} />,
    arrow: <ArrowRight size={15} />
  };

  const shapeLabels = {
    box: 'Rectangle (R)',
    circle: 'Ellipse (O)',
    triangle: 'Triangle',
    diamond: 'Diamond',
    star: 'Star',
    line: 'Line (L)',
    arrow: 'Arrow (Shift+L)'
  };

  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (spacePressed || activeTool === 'hand') return 'grab';
    if (activeTool === 'erase') return 'cell';
    if (isDragSelecting) return 'crosshair';
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

            {/* Live Drawing Preview */}
            {drawingPreview && (() => {
              const { type, startX, startY, currentX, currentY } = drawingPreview;
              const left = Math.min(startX, currentX);
              const top = Math.min(startY, currentY);
              const width = Math.abs(currentX - startX);
              const height = Math.abs(currentY - startY);

              if (type === 'pen' && drawingPreview.points && drawingPreview.points.length > 0) {
                const pts = drawingPreview.points;
                const xs = pts.map(p => p.x);
                const ys = pts.map(p => p.y);
                const minX = Math.min(...xs);
                const minY = Math.min(...ys);
                const maxX = Math.max(...xs);
                const maxY = Math.max(...ys);
                const w = Math.max(1, maxX - minX);
                const h = Math.max(1, maxY - minY);
                
                const d = `M ${pts[0].x - minX} ${pts[0].y - minY} ` + pts.slice(1).map(p => `L ${p.x - minX} ${p.y - minY}`).join(' ');

                return (
                  <div style={{
                    position: 'absolute',
                    left: `${minX}px`,
                    top: `${minY}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    pointerEvents: 'none',
                    overflow: 'visible'
                  }}>
                    <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                      <path
                        d={d}
                        fill="none"
                        stroke="#0c8ce9"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                );
              }

              if (type === 'line' || type === 'arrow') {
                const minX = Math.min(startX, currentX);
                const minY = Math.min(startY, currentY);
                const w = Math.max(1, Math.abs(currentX - startX));
                const h = Math.max(1, Math.abs(currentY - startY));
                const x1 = startX - minX;
                const y1 = startY - minY;
                const x2 = currentX - minX;
                const y2 = currentY - minY;

                return (
                  <div style={{
                    position: 'absolute',
                    left: `${minX}px`,
                    top: `${minY}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    pointerEvents: 'none',
                    overflow: 'visible'
                  }}>
                    <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                      {type === 'arrow' && (
                        <defs>
                          <marker
                            id="preview-arrowhead"
                            markerWidth="6"
                            markerHeight="5"
                            refX="5"
                            refY="2.5"
                            orient="auto"
                          >
                            <polygon points="0 0, 6 2.5, 0 5" fill="#0c8ce9" />
                          </marker>
                        </defs>
                      )}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#0c8ce9"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        markerEnd={type === 'arrow' ? "url(#preview-arrowhead)" : undefined}
                      />
                    </svg>
                  </div>
                );
              }

              // Rendering box, circle, diamond, triangle, star
              let innerElement = null;
              if (type === 'box') {
                innerElement = (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    border: '1.5px dashed #0c8ce9',
                    backgroundColor: 'rgba(12, 140, 233, 0.1)',
                    boxSizing: 'border-box',
                    borderRadius: '4px'
                  }} />
                );
              } else if (type === 'circle') {
                innerElement = (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    border: '1.5px dashed #0c8ce9',
                    backgroundColor: 'rgba(12, 140, 233, 0.1)',
                    boxSizing: 'border-box',
                    borderRadius: '50%'
                  }} />
                );
              } else if (type === 'diamond') {
                innerElement = (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{
                      width: '70.7%',
                      height: '70.7%',
                      transform: 'rotate(45deg)',
                      border: '1.5px dashed #0c8ce9',
                      backgroundColor: 'rgba(12, 140, 233, 0.1)',
                      boxSizing: 'border-box',
                      borderRadius: '2px'
                    }} />
                  </div>
                );
              } else if (type === 'triangle') {
                innerElement = (
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
                    <polygon
                      points="50,5 95,95 5,95"
                      fill="rgba(12, 140, 233, 0.1)"
                      stroke="#0c8ce9"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  </svg>
                );
              } else if (type === 'star') {
                innerElement = (
                  <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: 'block' }}>
                    <polygon
                      points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"
                      fill="rgba(12, 140, 233, 0.1)"
                      stroke="#0c8ce9"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  </svg>
                );
              }

              return (
                <div style={{
                  position: 'absolute',
                  left: `${left}px`,
                  top: `${top}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  pointerEvents: 'none'
                }}>
                  {innerElement}
                </div>
              );
            })()}

            {/* Marquee Selection inside scaled viewport (canvas coordinates) */}
            {marquee && isDragSelecting && (() => {
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
        <div className={styles.shapeSelectorContainer}>
          <button 
            className={`${styles.toolButton} ${activeTool === 'select' ? styles.toolButtonActive : ''}`}
            onClick={() => {
              setActiveTool('select');
            }}
            title={selectToolMode === 'move' ? "Move (V)" : "Scale (K)"}
          >
            {selectToolMode === 'move' ? <MousePointer2 size={15} /> : <ScalingIcon size={15} />}
          </button>
          <button
            className={`${styles.chevronButton} ${selectDropdownOpen ? styles.chevronButtonActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectDropdownOpen(!selectDropdownOpen);
            }}
            title="Select mode options"
          >
            <ChevronDown size={12} />
          </button>

          {selectDropdownOpen && (
            <div className={styles.shapeDropdown} style={{ left: 0 }} onClick={(e) => e.stopPropagation()}>
              <button
                className={`${styles.dropdownItem} ${selectToolMode === 'move' ? styles.dropdownItemActive : ''}`}
                onClick={() => {
                  setSelectToolMode('move');
                  setActiveTool('select');
                  setSelectDropdownOpen(false);
                }}
              >
                <span className={styles.dropdownItemIcon}><MousePointer2 size={14} /></span>
                <span className={styles.dropdownItemLabel}>Move</span>
                <span className={styles.dropdownItemShortcut}>V</span>
              </button>
              <button
                className={`${styles.dropdownItem} ${selectToolMode === 'scale' ? styles.dropdownItemActive : ''}`}
                onClick={() => {
                  setSelectToolMode('scale');
                  setActiveTool('select');
                  setSelectDropdownOpen(false);
                }}
              >
                <span className={styles.dropdownItemIcon}><ScalingIcon size={14} /></span>
                <span className={styles.dropdownItemLabel}>Scale</span>
                <span className={styles.dropdownItemShortcut}>K</span>
              </button>
            </div>
          )}
        </div>

        {/* Hand tool */}
        <button
          className={`${styles.toolButton} ${activeTool === 'hand' ? styles.toolButtonActive : ''}`}
          onClick={() => setActiveTool('hand')}
          title="Hand / Pan Canvas (H)"
        >
          <Hand size={15} />
        </button>

        <div className={styles.divider} />
        
        <div className={styles.shapeSelectorContainer}>
          <button
            className={`${styles.toolButton} ${['box', 'circle', 'triangle', 'diamond', 'star', 'line', 'arrow'].includes(activeTool) ? styles.toolButtonActive : ''}`}
            onClick={() => setActiveTool(currentShapeType)}
            title={shapeLabels[currentShapeType]}
          >
            {shapeIcons[currentShapeType]}
          </button>
          <button
            className={`${styles.chevronButton} ${shapeDropdownOpen ? styles.chevronButtonActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShapeDropdownOpen(!shapeDropdownOpen);
            }}
            title="More shapes"
          >
            <ChevronDown size={12} />
          </button>

          {shapeDropdownOpen && (
            <div className={styles.shapeDropdown} onClick={(e) => e.stopPropagation()}>
              {Object.entries(shapeIcons).map(([type, icon]) => {
                const isSelected = currentShapeType === type;
                return (
                  <button
                    key={type}
                    className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemActive : ''}`}
                    onClick={() => {
                      setCurrentShapeType(type as any);
                      setActiveTool(type);
                      setShapeDropdownOpen(false);
                    }}
                  >
                    <span className={styles.dropdownItemIcon}>{icon}</span>
                    <span className={styles.dropdownItemLabel}>{shapeLabels[type as keyof typeof shapeLabels].split(' (')[0]}</span>
                    <span className={styles.dropdownItemShortcut}>
                      {type === 'box' ? 'R' : type === 'circle' ? 'O' : type === 'line' ? 'L' : type === 'arrow' ? '⇧L' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* Pen/Pencil drawing tool */}
        <button
          className={`${styles.toolButton} ${activeTool === 'pen' ? styles.toolButtonActive : ''}`}
          onClick={() => setActiveTool('pen')}
          title="Pen / Freehand (P)"
        >
          <Pencil size={15} />
        </button>

        {/* Eraser tool */}
        <button
          className={`${styles.toolButton} ${activeTool === 'erase' ? styles.toolButtonActive : ''}`}
          onClick={() => setActiveTool('erase')}
          title="Eraser (E)"
        >
          <Eraser size={15} />
        </button>

        <div className={styles.divider} />

        {/* Comments tool */}
        <button
          className={`${styles.toolButton} ${activeTool === 'comment' ? styles.toolButtonActive : ''}`}
          onClick={() => setActiveTool('comment')}
          title="Add Comment (C)"
        >
          <MessageSquare size={15} />
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
