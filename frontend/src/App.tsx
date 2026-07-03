import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { DiagramProvider, useDiagram } from '@/context/DiagramContext';
import { Layers, Square } from 'lucide-react';
import { AuthProvider } from '@/context/AuthContext';
import { CollaborationProvider } from '@/context/CollaborationContext';
import { Header } from '@/components/layout/Header';
import { ProjectsSidebar } from '@/components/layout/ProjectsSidebar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidePanel } from '@/components/layout/SidePanel';
import { AIChatSidebar } from '@/components/layout/AIChatSidebar';
import { VersionHistorySidebar } from '@/components/layout/VersionHistorySidebar';
import { Canvas } from '@/features/diagram/components/Canvas';
import { LandingPage } from '@/features/landing/LandingPage';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui/Loader';

function WorkspaceRoute() {
  const { projectId, fileId } = useParams();
  const { switchProject, activeProjectId, activeFileId, isSidebarOpen, isAiChatOpen, isDesignPanelOpen, isVersionHistoryOpen } = useDiagram();
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(340);
  const [isLeftSidebarPinned, setIsLeftSidebarPinned] = useState(false); // Collapsed by default
  const [isLeftSidebarHovered, setIsLeftSidebarHovered] = useState(false);

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
          {/* Static Pinned LeftSidebar */}
          {isLeftSidebarPinned && (
            <div style={{ width: `${leftWidth}px`, minWidth: `${leftWidth}px`, height: '100%', position: 'relative' }}>
              <LeftSidebar isPinned={true} onPinToggle={() => setIsLeftSidebarPinned(false)} />
            </div>
          )}

          {/* Resizer handle (only when pinned) */}
          {isLeftSidebarPinned && (
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
          )}

          {/* Floating Collapsible LeftSidebar (when unpinned) */}
          {!isLeftSidebarPinned && (
            <>
              {/* Thin visible activity bar */}
              <div
                onMouseEnter={() => setIsLeftSidebarHovered(true)}
                style={{
                  width: '36px',
                  minWidth: '36px',
                  height: '100%',
                  backgroundColor: '#020306',
                  borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: '16px',
                  gap: '12px',
                  zIndex: 35,
                  position: 'relative'
                }}
              >
                <div 
                  style={{
                    color: isLeftSidebarHovered ? '#38bdf8' : '#8b949e',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isLeftSidebarHovered ? 'rgba(12, 140, 233, 0.08)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  title="Hover to open Layers & Shapes panel"
                >
                  <Layers size={16} />
                </div>
                <div 
                  style={{
                    color: '#8b949e',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Hover to open Layers & Shapes panel"
                >
                  <Square size={14} />
                </div>
              </div>

              {/* Sidebar drawer card */}
              <div 
                onMouseEnter={() => setIsLeftSidebarHovered(true)}
                onMouseLeave={() => setIsLeftSidebarHovered(false)}
                style={{
                  position: 'absolute',
                  left: '36px', // Align right next to the thin visible bar
                  top: 0,
                  bottom: 0,
                  width: '260px',
                  zIndex: 40,
                  transform: isLeftSidebarHovered ? 'translateX(0)' : 'translateX(-120%)',
                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isLeftSidebarHovered ? '10px 0 30px rgba(0,0,0,0.5)' : 'none',
                }}
              >
                <LeftSidebar isPinned={false} onPinToggle={() => setIsLeftSidebarPinned(true)} />
              </div>
            </>
          )}

          <div className="flex-1 h-full relative overflow-hidden">
            <Canvas />
          </div>

          {isAiChatOpen && (
            <div style={{ width: '320px', minWidth: '320px', height: '100%', position: 'relative' }}>
              <AIChatSidebar />
            </div>
          )}

          {isVersionHistoryOpen && (
            <div style={{ width: '320px', minWidth: '320px', height: '100%', position: 'relative' }}>
              <VersionHistorySidebar />
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
