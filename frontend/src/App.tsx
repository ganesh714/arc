import { useState } from 'react';
import { DiagramProvider, useDiagram } from '@/context/DiagramContext';
import { Header } from '@/components/layout/Header';
import { ProjectsSidebar } from '@/components/layout/ProjectsSidebar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidePanel } from '@/components/layout/SidePanel';
import { Canvas } from '@/features/diagram/components/Canvas';
import { PanelLeftOpen } from 'lucide-react';

function MainAppContent() {
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(240);
  const { isSidebarOpen, toggleSidebar } = useDiagram();

  const startLeftResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(160, Math.min(400, startWidth + (moveEvent.clientX - startX)));
      setLeftWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startRightResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(400, startWidth - (moveEvent.clientX - startX)));
      setRightWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
      {/* Projects Sidebar wrapper (collapsible leftmost column - full height like Gemini/ChatGPT) */}
      <div 
        style={{ 
          width: isSidebarOpen ? '60px' : '0px', 
          minWidth: isSidebarOpen ? '60px' : '0px', 
          height: '100%', 
          position: 'relative',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <ProjectsSidebar />
      </div>

      {/* Main Content Area (Header + Workspace) */}
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        <Header />
        
        {/* Workspace Area */}
        <div className="flex flex-1 relative overflow-hidden bg-[#1e1e1e]">
          {/* Collapse Toggle floating button when sidebar is closed */}
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                zIndex: 100,
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'all 0.15s ease'
              }}
              title="Expand sidebar"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <PanelLeftOpen size={14} />
            </button>
          )}

          {/* Left Sidebar wrapper */}
          <div style={{ width: `${leftWidth}px`, minWidth: `${leftWidth}px`, height: '100%', position: 'relative' }}>
            <LeftSidebar />
          </div>

          {/* Left Resize Divider */}
          <div
            onMouseDown={startLeftResize}
            style={{
              width: '4px',
              cursor: 'col-resize',
              backgroundColor: 'transparent',
              position: 'relative',
              zIndex: 49,
              display: 'flex',
              justifyContent: 'center',
              height: '100%',
              flexShrink: 0
            }}
            className="group"
          >
            <div style={{ width: '1px', backgroundColor: 'var(--border-default)', height: '100%', transition: 'background-color 0.15s' }} className="group-hover:bg-[#0c8ce9]" />
          </div>

          {/* Main Canvas */}
          <div className="flex-1 h-full relative overflow-hidden">
            <Canvas />
          </div>

          {/* Right Resize Divider */}
          <div
            onMouseDown={startRightResize}
            style={{
              width: '4px',
              cursor: 'col-resize',
              backgroundColor: 'transparent',
              position: 'relative',
              zIndex: 49,
              display: 'flex',
              justifyContent: 'center',
              height: '100%',
              flexShrink: 0
            }}
            className="group"
          >
            <div style={{ width: '1px', backgroundColor: 'var(--border-default)', height: '100%', transition: 'background-color 0.15s' }} className="group-hover:bg-[#0c8ce9]" />
          </div>

          {/* Right Sidebar wrapper */}
          <div style={{ width: `${rightWidth}px`, minWidth: `${rightWidth}px`, height: '100%', position: 'relative' }}>
            <SidePanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <DiagramProvider>
      <MainAppContent />
    </DiagramProvider>
  );
}

export default App;
