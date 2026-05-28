import { useState, useRef, useEffect } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { useAuth } from '@/context/AuthContext';
import { Folder, Plus, Check, X, FolderKanban, LogIn } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import styles from './ProjectsSidebar.module.css';

export function ProjectsSidebar({ onBackToDashboard }: { onBackToDashboard?: () => void }) {
  const { projects, activeProjectId, switchProject, addProject, isSidebarOpen, toggleSidebar } = useDiagram();
  const { isGuest, user, login, logout, isAuthenticated } = useAuth();
  
  // Track adding project
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim(), 'Loom Diagrams');
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    if (!isCreating) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsCreating(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isCreating]);

  // Collapsed Sidebar view (simple icons)
  if (!isSidebarOpen) {
    return (
      <div className={`${styles.sidebar} ${styles.collapsed}`}>
        {/* Top Logo - Clickable to open */}
        <div 
          className={styles.logoContainerCollapsed} 
          onClick={toggleSidebar} 
          title="Expand sidebar"
        >
          <Logo className={styles.logo} />
        </div>

        <div className={styles.divider} />

        {/* Single Projects Folder Icon */}
        <div className={styles.projectListCollapsed}>
          <button 
            className={styles.projectIconBtn} 
            onClick={toggleSidebar}
            title="Projects"
          >
            <FolderKanban size={20} />
          </button>
        </div>

        {/* Footer with Plus icon and Profile */}
        <div className={styles.footerCollapsed}>
          <button
            className={styles.addBtnCollapsed}
            onClick={() => {
              if (isGuest) {
                login();
                return;
              }
              toggleSidebar();
              setIsCreating(true);
            }}
            title={isGuest ? "Sign in to create projects" : "New File / Project"}
          >
            <Plus size={20} />
          </button>

          <div 
            onClick={toggleSidebar}
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: isGuest ? '#f59e0b20' : 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: isGuest ? '1px solid #f59e0b' : '1px solid var(--border-default)',
              overflow: 'hidden',
              marginTop: '8px'
            }}
          >
            {isGuest ? (
              <LogIn size={14} color="#f59e0b" />
            ) : user?.picture ? (
              <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <LogIn size={14} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      {/* Top Logo - Clickable to collapse sidebar */}
      <div 
        className={styles.logoContainer} 
        onClick={toggleSidebar} 
        title="Collapse sidebar"
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.logoWrapper}>
          <Logo className={styles.logo} />
          <span className={styles.logoText}>Loom</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Projects List */}
      <div className={styles.projectList}>
        {projects.map((project) => {
          const isActive = project.id === activeProjectId;
          return (
            <button
              key={project.id}
              className={`${styles.projectBtn} ${isActive ? styles.activeProject : ''}`}
              onClick={() => switchProject(project.id)}
            >
              <Folder size={14} className={styles.itemIcon} />
              <span className={styles.projectName}>{project.name}</span>
              <span className={styles.itemCount}>{project.nodes.length}</span>
            </button>
          );
        })}
      </div>

      {/* Footer / Add Project Button + Profile */}
      <div className={styles.footer}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {!isCreating ? (
            <button
              className={styles.addBtn}
              onClick={() => setIsCreating(true)}
              title="New File / Project"
            >
              <Plus size={14} />
              <span>New File / Project</span>
            </button>
          ) : (
            <div ref={popoverRef} className={styles.inputContainer}>
              <input
                type="text"
                className={styles.input}
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  else if (e.key === 'Escape') setIsCreating(false);
                }}
                autoFocus
              />
              <div className={styles.inputActions}>
                <button className={styles.confirmBtn} onClick={handleCreateProject} title="Save">
                  <Check size={12} />
                </button>
                <button className={styles.cancelBtn} onClick={() => setIsCreating(false)} title="Cancel">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* User Profile Info - acts as Sign In CTA for guests */}
          <div style={{ 
            padding: '12px 8px', 
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '4px'
          }}>
            <div 
              onClick={isGuest ? login : undefined}
              style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                backgroundColor: isGuest ? '#f59e0b20' : 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: isGuest ? '1px solid #f59e0b' : '1px solid var(--border-default)',
                overflow: 'hidden',
                cursor: isGuest ? 'pointer' : 'default'
              }}
            >
              {isGuest ? (
                <LogIn size={12} color="#f59e0b" />
              ) : user?.picture ? (
                <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <LogIn size={12} />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                {isGuest ? 'Guest User' : user?.name || 'User'}
              </span>
              {isGuest ? (
                <button 
                  onClick={login}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: '9px', color: '#f59e0b', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}
                >
                  Sign in to save
                </button>
              ) : (
                <button 
                  onClick={onBackToDashboard}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: '9px', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                >
                  Dashboard
                </button>
              )}
            </div>
            {isAuthenticated && (
              <button 
                onClick={logout} 
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Logout"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
