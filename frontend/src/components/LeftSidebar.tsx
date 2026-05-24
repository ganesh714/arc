import { useState } from 'react';

interface SidebarTab {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleTabClick = (tabId: string) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  const tabs: SidebarTab[] = [
    { id: 'elements', label: 'Elements', icon: '🎨', description: 'Shapes, arrows, and diagram connectors' },
    { id: 'templates', label: 'Templates', icon: '📋', description: 'Pre-designed diagram layouts' },
    { id: 'layers', label: 'Layers', icon: '🥞', description: 'Manage canvas node hierarchy' },
    { id: 'settings', label: 'Settings', icon: '⚙️', description: 'Canvas and grid preferences' },
  ];

  return (
    <div className={`left-sidebar ${activeTab ? 'expanded' : ''}`}>
      {/* Tab Navigation */}
      <div className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            title={tab.label}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Expanded Tab Content Panel */}
      {activeTab && (
        <div className="sidebar-content">
        {activeTab === 'elements' && (
          <div className="tab-pane">
            <div className="pane-header">
              <h3>Elements</h3>
              <p>Drag or click elements to add them to your workspace.</p>
            </div>

            <div className="pane-section">
              <h4>Basic Shapes</h4>
              <div className="elements-grid">
                <div className="element-item" title="Add Rectangle">
                  <div className="element-preview shape-rect"></div>
                  <span className="element-name">Rectangle</span>
                </div>
                <div className="element-item" title="Add Circle">
                  <div className="element-preview shape-circle"></div>
                  <span className="element-name">Circle</span>
                </div>
                <div className="element-item" title="Add Diamond">
                  <div className="element-preview shape-diamond"></div>
                  <span className="element-name">Diamond</span>
                </div>
              </div>
            </div>

            <div className="pane-section">
              <h4>Connectors</h4>
              <div className="elements-grid">
                <div className="element-item" title="Add Right Arrow">
                  <div className="element-preview shape-arrow">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                  <span className="element-name">Arrow</span>
                </div>
                <div className="element-item" title="Add Straight Line">
                  <div className="element-preview shape-line">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                  <span className="element-name">Line</span>
                </div>
              </div>
            </div>

            <div className="pane-footer">
              <span className="info-badge">Soon</span>
              <p>Interactive drag-and-drop shape rendering is coming soon!</p>
            </div>
          </div>
        )}

        {activeTab !== 'elements' && (
          <div className="tab-pane placeholder-pane">
            <div className="pane-placeholder-content">
              <span className="placeholder-icon">{tabs.find(t => t.id === activeTab)?.icon}</span>
              <h3>{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p>{tabs.find(t => t.id === activeTab)?.description}</p>
              <span className="coming-soon-tag">Coming Soon</span>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
