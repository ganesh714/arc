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
  FolderSync
} from 'lucide-react';

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<'layers' | 'assets'>('layers');
  const { nodes, selectedNodeIds, selectNode, setNodes, setSelectedNodeIds } = useDiagram();

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
    setNodes(nodes.filter(n => n.id !== id));
    setSelectedNodeIds(selectedNodeIds.filter(selectedId => selectedId !== id));
  };

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
                {nodes.map((node) => {
                  const isSelected = selectedNodeIds.includes(node.id);
                  return (
                    <div 
                      key={node.id}
                      className={`${styles.layerItem} ${isSelected ? styles.selectedLayer : ''}`}
                      onClick={(e) => selectNode(node.id, e.shiftKey)}
                    >
                      <div className={styles.layerLeft}>
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
