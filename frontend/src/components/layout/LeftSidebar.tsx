import { useState } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import styles from './LeftSidebar.module.css';

interface SidebarTab {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { addBox, addDiamond, addCircle, addTriangle, addLine, addArrow } = useDiagram();

  const tabs: SidebarTab[] = [
    { id: 'elements', label: 'Elements', icon: '🎨', description: 'Shapes, arrows, and diagram connectors' },
    { id: 'templates', label: 'Templates', icon: '📋', description: 'Pre-designed diagram layouts' },
    { id: 'layers', label: 'Layers', icon: '🥞', description: 'Manage canvas node hierarchy' },
    { id: 'settings', label: 'Settings', icon: '⚙️', description: 'Canvas and grid preferences' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.navBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
            title={tab.label}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab && (
        <div className={styles.panel}>
          {activeTab === 'elements' && (
            <div className={styles.paneContent}>
              <div className={styles.paneHeader}>
                <h3>Elements</h3>
                <p>Drag or click elements to add them to your workspace.</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Basic Shapes</h4>
                <div className={styles.elementsGrid}>
                  <div 
                    className={`${styles.elementItem} ${styles.interactive}`} 
                    title="Drag or click to add Rectangle"
                    draggable={true}
                    onDragStart={(e) => e.dataTransfer.setData('application/loom-node-type', 'box')}
                    onClick={() => addBox()}
                  >
                    <div className={`${styles.elementPreview} ${styles.shapeRect}`}></div>
                    <span className={styles.elementName}>Rectangle</span>
                  </div>
                  <div 
                    className={`${styles.elementItem} ${styles.interactive}`} 
                    title="Drag or click to add Circle"
                    draggable={true}
                    onDragStart={(e) => e.dataTransfer.setData('application/loom-node-type', 'circle')}
                    onClick={() => addCircle()}
                  >
                    <div className={`${styles.elementPreview} ${styles.shapeCircle}`}></div>
                    <span className={styles.elementName}>Circle</span>
                  </div>
                  <div 
                    className={`${styles.elementItem} ${styles.interactive}`} 
                    title="Drag or click to add Triangle"
                    draggable={true}
                    onDragStart={(e) => e.dataTransfer.setData('application/loom-node-type', 'triangle')}
                    onClick={() => addTriangle()}
                  >
                    <div className={styles.elementPreview}>
                      <svg width="28" height="24" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
                        <polygon points="50,6 94,94 6,94" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="8" />
                      </svg>
                    </div>
                    <span className={styles.elementName}>Triangle</span>
                  </div>
                  <div 
                    className={`${styles.elementItem} ${styles.interactive}`} 
                    title="Drag or click to add Diamond"
                    draggable={true}
                    onDragStart={(e) => e.dataTransfer.setData('application/loom-node-type', 'diamond')}
                    onClick={() => addDiamond()}
                  >
                    <div className={`${styles.elementPreview} ${styles.shapeDiamond}`}></div>
                    <span className={styles.elementName}>Diamond</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Lines & Connectors</h4>
                <div className={styles.elementsGrid}>
                  <div 
                    className={`${styles.elementItem} ${styles.interactive}`} 
                    title="Drag or click to add Straight Line"
                    draggable={true}
                    onDragStart={(e) => e.dataTransfer.setData('application/loom-node-type', 'line')}
                    onClick={() => addLine()}
                  >
                    <div className={styles.elementPreview}>
                      <svg width="36" height="24" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
                        <line x1="0" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="12" />
                      </svg>
                    </div>
                    <span className={styles.elementName}>Line</span>
                  </div>
                  
                  <div 
                    className={`${styles.elementItem} ${styles.interactive}`} 
                    title="Drag or click to add Arrow"
                    draggable={true}
                    onDragStart={(e) => e.dataTransfer.setData('application/loom-node-type', 'arrow')}
                    onClick={() => addArrow()}
                  >
                    <div className={styles.elementPreview}>
                      <svg width="36" height="24" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: 'block' }}>
                        <defs>
                          <marker id="preview-arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="#94a3b8" />
                          </marker>
                        </defs>
                        <line x1="0" y1="50" x2="80" y2="50" stroke="#94a3b8" strokeWidth="12" markerEnd="url(#preview-arrowhead)" />
                      </svg>
                    </div>
                    <span className={styles.elementName}>Arrow</span>
                  </div>
                </div>
              </div>

              <div className={styles.paneFooter}>
                <span className={styles.infoBadge}>Tip</span>
                <p>Drag shapes onto the canvas or click to add them instantly!</p>
              </div>
            </div>
          )}

          {activeTab !== 'elements' && (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full bg-slate-50">
              <span className="text-4xl mb-4">{tabs.find(t => t.id === activeTab)?.icon}</span>
              <h3 className="text-lg font-semibold text-slate-800">{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p className="text-sm text-slate-500 mt-2">{tabs.find(t => t.id === activeTab)?.description}</p>
              <span className="mt-4 px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs font-semibold">Coming Soon</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
