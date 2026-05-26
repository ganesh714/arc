import { useState } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import styles from './LeftSidebar.module.css';
import { 
  Layers, 
  Square, 
  Circle, 
  Triangle, 
  Diamond, 
  Minus, 
  ArrowRight, 
  Trash2, 
  FolderSync,
  GripVertical
} from 'lucide-react';

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<'layers' | 'assets'>('layers');
  const { nodes, selectedNodeIds, selectNode, setNodes, setSelectedNodeIds, saveHistoryState } = useDiagram();
  
  // Drag and drop states for layer reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getNodeIcon = (type: string) => {
    const size = 12;
    switch (type) {
      case 'box':
        return <Square size={size} className={styles.layerIcon} />;
      case 'circle':
        return <Circle size={size} className={styles.layerIcon} />;
      case 'triangle':
        return <Triangle size={size} className={styles.layerIcon} />;
      case 'diamond':
        return <Diamond size={size} className={styles.layerIcon} />;
      case 'star':
        return <Layers size={size} style={{ color: '#d69e2e' }} className={styles.layerIcon} />;
      case 'line':
        return <Minus size={size} className={styles.layerIcon} />;
      case 'arrow':
        return <ArrowRight size={size} className={styles.layerIcon} />;
      default:
        return <Square size={size} className={styles.layerIcon} />;
    }
  };

  const getNodeLabel = (node: any) => {
    if (node.type === 'line') return 'Line';
    if (node.type === 'arrow') return 'Arrow';
    if (node.content && node.content.trim() !== '') {
      return node.content.length > 20 ? `${node.content.slice(0, 18)}...` : node.content;
    }
    const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);
    return `${typeLabel} (${node.id})`;
  };

  const handleDeleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveHistoryState(nodes);
    setNodes(nodes.filter(n => n.id !== id));
    setSelectedNodeIds(selectedNodeIds.filter(selectedId => selectedId !== id));
  };

  // Reorder HTML5 drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Required for Firefox
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    // Convert display indexes (reversed) back to original nodes array indexes
    const dragOriginalIdx = nodes.length - 1 - draggedIndex;
    const dropOriginalIdx = nodes.length - 1 - targetIndex;

    const newNodes = [...nodes];
    const [removed] = newNodes.splice(dragOriginalIdx, 1);
    newNodes.splice(dropOriginalIdx, 0, removed);

    saveHistoryState(nodes);
    setNodes(newNodes);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Display nodes list reversed so top layer in display is top layer on canvas
  const displayNodes = [...nodes].reverse();

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'layers' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('layers')}
        >
          Layers
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'assets' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </button>
      </div>

      <div className={styles.panelContent}>
        {activeTab === 'layers' ? (
          <>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Layers list</span>
              <span className="text-[10px] text-slate-500 font-bold">{nodes.length} items</span>
            </div>
            
            {nodes.length === 0 ? (
              <div className={styles.emptyState}>
                <Layers size={24} strokeWidth={1.5} />
                <span className={styles.emptyTitle}>No layers yet</span>
                <span className={styles.emptyDesc}>Add shapes to the canvas using the floating toolbar above</span>
              </div>
            ) : (
              <div className={styles.layerList}>
                {displayNodes.map((node, index) => {
                  const isSelected = selectedNodeIds.includes(node.id);
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;

                  return (
                    <div 
                      key={node.id}
                      className={`${styles.layerItem} ${isSelected ? styles.selectedLayer : ''} ${isDragging ? styles.draggingLayer : ''} ${isDragOver ? styles.dragOverLayer : ''}`}
                      onClick={(e) => selectNode(node.id, e.shiftKey)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className={styles.layerLeft}>
                        {/* Grip handle indicator */}
                        <div className={styles.gripHandle} title="Drag to reorder layer">
                          <GripVertical size={11} />
                        </div>
                        {getNodeIcon(node.type)}
                        <span className={styles.layerName}>{getNodeLabel(node)}</span>
                      </div>
                      <div className={styles.layerActions}>
                        <button 
                          className={styles.layerActionBtn}
                          onClick={(e) => handleDeleteNode(node.id, e)}
                          title="Delete element"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <FolderSync size={24} strokeWidth={1.5} />
            <span className={styles.emptyTitle}>Shared Library</span>
            <span className={styles.emptyDesc}>Publish components to access reusable assets and drag them here.</span>
          </div>
        )}
      </div>
    </div>
  );
}
