import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { DiagramProvider, useDiagram } from '@/context/DiagramContext';
import { AuthProvider } from '@/context/AuthContext';
import { CollaborationProvider } from '@/context/CollaborationContext';
import { Header } from '@/components/layout/Header';
import { ProjectsSidebar } from '@/components/layout/ProjectsSidebar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidePanel } from '@/components/layout/SidePanel';
import { AIChatSidebar } from '@/components/layout/AIChatSidebar';
import { Canvas } from '@/features/diagram/components/Canvas';
import { LandingPage } from '@/features/landing/LandingPage';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui/Loader';

function WorkspaceRoute() {
  const { projectId, fileId } = useParams();
  const { switchProject, activeProjectId, activeFileId, isSidebarOpen, isAiChatOpen, isDesignPanelOpen } = useDiagram();
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(340);

  useEffect(() => {
    if (projectId && fileId && (projectId !== activeProjectId || fileId !== activeFileId)) {
      switchProject(projectId, fileId);
    }
  }, [projectId, fileId, switchProject, activeProjectId, activeFileId]);

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
        <ProjectsSidebar />
      </div>

      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        <Header />
        
        <div className="flex flex-1 relative overflow-hidden">
          <div style={{ width: `${leftWidth}px`, minWidth: `${leftWidth}px`, height: '100%', position: 'relative' }}>
            <LeftSidebar />
          </div>

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

          <div className="flex-1 h-full relative overflow-hidden">
            <Canvas />
          </div>

          {isAiChatOpen && (
            <div style={{ width: '320px', minWidth: '320px', height: '100%', position: 'relative' }}>
              <AIChatSidebar />
            </div>
          )}

          {isDesignPanelOpen && (
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
          )}

          {isDesignPanelOpen && (
            <div style={{ width: `${rightWidth}px`, minWidth: `${rightWidth}px`, height: '100%', position: 'relative' }}>
              <SidePanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MainAppContent() {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#08090d]">
        <Loader size="lg" text="Authenticating..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated || isGuest ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/dashboard" element={isAuthenticated || isGuest ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/project/:projectId/file/:fileId" element={isAuthenticated || isGuest ? <WorkspaceRoute /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CollaborationProvider>
          <DiagramProvider>
            <MainAppContent />
          </DiagramProvider>
        </CollaborationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
