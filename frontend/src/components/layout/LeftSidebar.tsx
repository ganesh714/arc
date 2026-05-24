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
  const { addBox } = useDiagram();

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
                    title="Add Rectangle"
                    onClick={addBox}
                  >
                    <div className={`${styles.elementPreview} ${styles.shapeRect}`}></div>
                    <span className={styles.elementName}>Rectangle</span>
                  </div>
                  <div className={styles.elementItem} title="Add Circle">
                    <div className={`${styles.elementPreview} ${styles.shapeCircle}`}></div>
                    <span className={styles.elementName}>Circle</span>
                  </div>
                  <div className={styles.elementItem} title="Add Diamond">
                    <div className={`${styles.elementPreview} ${styles.shapeDiamond}`}></div>
                    <span className={styles.elementName}>Diamond</span>
                  </div>
                </div>
              </div>

              <div className={styles.paneFooter}>
                <span className={styles.infoBadge}>Soon</span>
                <p>Interactive drag-and-drop shape rendering is coming soon!</p>
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
