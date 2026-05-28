import { useState } from 'react';
import { DiagramProvider, useDiagram } from '@/context/DiagramContext';
import { AuthProvider } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { ProjectsSidebar } from '@/components/layout/ProjectsSidebar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidePanel } from '@/components/layout/SidePanel';
import { Canvas } from '@/features/diagram/components/Canvas';
import { LandingPage } from '@/features/landing/LandingPage';
import { useAuth } from '@/context/AuthContext';

import { useState, useEffect } from 'react';
import { DiagramProvider, useDiagram } from '@/context/DiagramContext';
import { AuthProvider } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { ProjectsSidebar } from '@/components/layout/ProjectsSidebar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidePanel } from '@/components/layout/SidePanel';
import { Canvas } from '@/features/diagram/components/Canvas';
import { LandingPage } from '@/features/landing/LandingPage';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { useAuth } from '@/context/AuthContext';

type AppView = 'landing' | 'dashboard' | 'workspace';

function MainAppContent() {
  const [view, setView] = useState<AppView>('landing');
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(340);
  const { isSidebarOpen } = useDiagram();
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated || isGuest) {
      setView('dashboard');
    } else {
      setView('landing');
    }
  }, [isAuthenticated, isGuest]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#08090d]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0c8ce9]"></div>
      </div>
    );
  }

  if (view === 'landing') {
    return <LandingPage />;
  }

  if (view === 'dashboard') {
    return <Dashboard onEnterWorkspace={() => setView('workspace')} />;
  }

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
      const newWidth = Math.max(200, Math.min(500, startWidth - (moveEvent.clientX - startX)));
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
    <div className="flex h-screen w-full bg-[var(--bg-canvas)] overflow-hidden relative">
      {/* Projects Sidebar wrapper (collapsible leftmost column - full height like Gemini/ChatGPT) */}
      <div 
        style={{ 
          width: isSidebarOpen ? '200px' : '60px', 
          minWidth: isSidebarOpen ? '200px' : '60px', 
          height: '100%', 
          position: 'relative',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <ProjectsSidebar onBackToDashboard={() => setView('dashboard')} />
      </div>

      {/* Main Content Area (Header + Workspace) */}
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        <Header />
        
        {/* Workspace Area */}
        <div className="flex flex-1 relative overflow-hidden">
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
              zIndex: 10,
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
              zIndex: 10,
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
    <AuthProvider>
      <DiagramProvider>
        <MainAppContent />
      </DiagramProvider>
    </AuthProvider>
  );
}

export default App;
