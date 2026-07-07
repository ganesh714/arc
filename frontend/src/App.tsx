import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { DiagramProvider, useDiagram } from '@/context/DiagramContext';
import { Layers, Square, LayoutTemplate, FolderKanban } from 'lucide-react';
import { AuthProvider } from '@/context/AuthContext';
import { CollaborationProvider } from '@/context/CollaborationContext';
import { Header } from '@/components/layout/Header';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidePanel } from '@/components/layout/SidePanel';
import { AIChatSidebar } from '@/components/layout/AIChatSidebar';
import { VersionHistorySidebar } from '@/components/layout/VersionHistorySidebar';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { Canvas } from '@/features/diagram/components/Canvas';
import { LandingPage } from '@/features/landing/LandingPage';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui/Loader';

function WorkspaceRoute() {
  const { projectId, fileId } = useParams();
  const navigate = useNavigate();
  const { switchProject, activeProjectId, activeFileId, isAiChatOpen, isDesignPanelOpen, isVersionHistoryOpen } = useDiagram();
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(340);
  const [isLeftSidebarPinned, setIsLeftSidebarPinned] = useState(false); // Collapsed by default
  const [isLeftSidebarHovered, setIsLeftSidebarHovered] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<'files' | 'layers' | 'shapes' | 'templates'>('files');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Responsive layout: collapse panel pinning on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsLeftSidebarPinned(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // trigger initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global keyboard listener for Command Palette shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      // Toggle Command Palette on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, []);

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
      {/* Unified Left Activity Bar (60px) */}
      <div
        onMouseEnter={() => setIsLeftSidebarHovered(true)}
        onMouseLeave={() => setIsLeftSidebarHovered(false)}
        style={{
          width: '60px',
          minWidth: '60px',
          height: '100%',
          backgroundColor: 'var(--bg-panel-solid)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '16px',
          paddingBottom: '16px',
          gap: '24px',
          zIndex: 45, // Elevated above the sliding drawer panel!
          position: 'relative',
          flexShrink: 0
        }}
      >
        {/* Top Logo */}
        <div 
          onClick={() => navigate('/dashboard')}
          style={{ 
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #0c8ce9 0%, #2563eb 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: '0 0 12px rgba(12, 140, 233, 0.35)',
            marginBottom: '8px'
          }}
          title="Go to Dashboard"
        >
          L
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center', flex: 1 }}>
          {/* Files Tab Button */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {activeLeftTab === 'files' && isLeftSidebarHovered && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: '25%',
                height: '50%',
                width: '3px',
                backgroundColor: '#0c8ce9',
                borderRadius: '0 4px 4px 0',
                boxShadow: '0 0 10px #0c8ce9'
              }} />
            )}
            <button 
              onMouseEnter={() => {
                setIsLeftSidebarHovered(true);
                setActiveLeftTab('files');
              }}
              onClick={() => {
                setIsLeftSidebarHovered(true);
                setActiveLeftTab('files');
              }}
              style={{
                color: (activeLeftTab === 'files' && isLeftSidebarHovered) ? '#0c8ce9' : 'var(--text-secondary)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (activeLeftTab === 'files' && isLeftSidebarHovered) ? 'var(--accent-blue-subtle)' : 'transparent',
                transform: (activeLeftTab === 'files' && isLeftSidebarHovered) ? 'scale(1.15) translateZ(0)' : 'scale(1) translateZ(0)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: (activeLeftTab === 'files' && isLeftSidebarHovered) ? '0 0 12px rgba(12, 140, 233, 0.15)' : 'none',
                border: 'none',
                outline: 'none'
              }}
              title="Files Explorer (Hover to open)"
            >
              <FolderKanban size={16} />
            </button>
          </div>

          {/* Layers Tab Button */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {activeLeftTab === 'layers' && isLeftSidebarHovered && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: '25%',
                height: '50%',
                width: '3px',
                backgroundColor: '#0c8ce9',
                borderRadius: '0 4px 4px 0',
                boxShadow: '0 0 10px #0c8ce9'
              }} />
            )}
            <button 
              onMouseEnter={() => {
                setIsLeftSidebarHovered(true);
                setActiveLeftTab('layers');
              }}
              onClick={() => {
                setIsLeftSidebarHovered(true);
                setActiveLeftTab('layers');
              }}
              style={{
                color: (activeLeftTab === 'layers' && isLeftSidebarHovered) ? '#0c8ce9' : 'var(--text-secondary)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (activeLeftTab === 'layers' && isLeftSidebarHovered) ? 'var(--accent-blue-subtle)' : 'transparent',
                transform: (activeLeftTab === 'layers' && isLeftSidebarHovered) ? 'scale(1.15) translateZ(0)' : 'scale(1) translateZ(0)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: (activeLeftTab === 'layers' && isLeftSidebarHovered) ? '0 0 12px rgba(12, 140, 233, 0.15)' : 'none',
                border: 'none',
                outline: 'none'
              }}
              title="Layers List (Hover to open)"
            >
              <Layers size={16} />
            </button>
          </div>

          {/* Shapes Tab Button */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {activeLeftTab === 'shapes' && isLeftSidebarHovered && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: '25%',
                height: '50%',
                width: '3px',
                backgroundColor: '#0c8ce9',
                borderRadius: '0 4px 4px 0',
                boxShadow: '0 0 10px #0c8ce9'
              }} />
            )}
            <button 
              onMouseEnter={() => {
                setIsLeftSidebarHovered(true);
                setActiveLeftTab('shapes');
              }}
              onClick={() => {
                setIsLeftSidebarHovered(true);
                setActiveLeftTab('shapes');
              }}
              style={{
                color: (activeLeftTab === 'shapes' && isLeftSidebarHovered) ? '#0c8ce9' : 'var(--text-secondary)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (activeLeftTab === 'shapes' && isLeftSidebarHovered) ? 'var(--accent-blue-subtle)' : 'transparent',
                transform: (activeLeftTab === 'shapes' && isLeftSidebarHovered) ? 'scale(1.15) translateZ(0)' : 'scale(1) translateZ(0)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: (activeLeftTab === 'shapes' && isLeftSidebarHovered) ? '0 0 12px rgba(12, 140, 233, 0.15)' : 'none',
                border: 'none',
                outline: 'none'
              }}
              title="Shapes Palette (Hover to open)"
            >
              <Square size={14} />
            </button>
          </div>

          {/* Templates Tab Button */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {activeLeftTab === 'templates' && isLeftSidebarHovered && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: '25%',
                height: '50%',
                width: '3px',
                backgroundColor: '#0c8ce9',
                borderRadius: '0 4px 4px 0',
                boxShadow: '0 0 10px #0c8ce9'
              }} />
            )}
            <button 
              onMouseEnter={() => {
                setIsLeftSidebarHovered(true);
                setActiveLeftTab('templates');
              }}
              onClick={() => {
                setIsLeftSidebarHovered(true);
                setActiveLeftTab('templates');
              }}
              style={{
                color: (activeLeftTab === 'templates' && isLeftSidebarHovered) ? '#0c8ce9' : 'var(--text-secondary)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (activeLeftTab === 'templates' && isLeftSidebarHovered) ? 'var(--accent-blue-subtle)' : 'transparent',
                transform: (activeLeftTab === 'templates' && isLeftSidebarHovered) ? 'scale(1.15) translateZ(0)' : 'scale(1) translateZ(0)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: (activeLeftTab === 'templates' && isLeftSidebarHovered) ? '0 0 12px rgba(12, 140, 233, 0.15)' : 'none',
                border: 'none',
                outline: 'none'
              }}
              title="Templates Presets (Hover to open)"
            >
              <LayoutTemplate size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Collapsible LeftSidebar Drawer (when unpinned) */}
      {!isLeftSidebarPinned && (
        <div 
          onMouseEnter={() => setIsLeftSidebarHovered(true)}
          onMouseLeave={() => setIsLeftSidebarHovered(false)}
          style={{
            position: 'absolute',
            left: '60px',
            top: 0,
            bottom: 0,
            width: '260px',
            zIndex: 40,
            transform: isLeftSidebarHovered ? 'translateX(0)' : 'translateX(-105%)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isLeftSidebarHovered ? '12px 0 35px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          <LeftSidebar 
            isPinned={false} 
            onPinToggle={() => setIsLeftSidebarPinned(true)} 
            activeTab={activeLeftTab}
            onTabChange={setActiveLeftTab}
          />
        </div>
      )}

      {/* Main App Workspace Content */}
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        <Header />
        
        <div className="flex flex-1 relative overflow-hidden">
          {/* Static Pinned LeftSidebar */}
          {isLeftSidebarPinned && (
            <div style={{ width: `${leftWidth}px`, minWidth: `${leftWidth}px`, height: '100%', position: 'relative', zIndex: 40 }}>
              <LeftSidebar 
                isPinned={true} 
                onPinToggle={() => setIsLeftSidebarPinned(false)} 
                activeTab={activeLeftTab}
                onTabChange={setActiveLeftTab}
              />
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

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setIsLeftSidebarPinned={setIsLeftSidebarPinned}
        setActiveLeftTab={setActiveLeftTab}
      />
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
