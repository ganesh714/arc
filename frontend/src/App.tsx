import { useState } from 'react';
import { DiagramProvider } from '@/context/DiagramContext';
import { Header } from '@/components/layout/Header';
import { ProjectsSidebar } from '@/components/layout/ProjectsSidebar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidePanel } from '@/components/layout/SidePanel';
import { Canvas } from '@/features/diagram/components/Canvas';

function MainAppContent() {
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(240);

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
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden relative">
      <Header />
      
      {/* Workspace Area */}
      <div className="flex flex-1 relative overflow-hidden bg-[#1e1e1e]">
        {/* Projects Sidebar wrapper (Static leftmost column) */}
        <div style={{ width: '160px', minWidth: '160px', height: '100%', position: 'relative' }}>
          <ProjectsSidebar />
        </div>

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
