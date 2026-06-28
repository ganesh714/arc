import { useState } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { useAuth } from '@/context/AuthContext';
import { Folder, Plus, X, FolderKanban, LogIn } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { CreateEntityModal } from '@/components/layout/CreateEntityModal';
import styles from './ProjectsSidebar.module.css';

export function ProjectsSidebar({ onBackToDashboard }: { onBackToDashboard?: () => void }) {
  const { projects, activeProjectId, activeFileId, switchFile, addFile, isSidebarOpen, toggleSidebar } = useDiagram();
  const { isGuest, user, login, logout, isAuthenticated } = useAuth();
  
  const [isCreating, setIsCreating] = useState(false);

  const handleConfirmCreate = async (name: string, bgColor: string) => {
    if (name.trim()) {
      await addFile(activeProjectId, name.trim(), bgColor);
      setIsCreating(false);
    }
  };

  // (Removed inline popover outside-click listener since we use a modal)

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
              toggleSidebar();
              setIsCreating(true);
            }}
            title="New File"
          >
            <Plus size={20} />
          </button>

          <div 
            onClick={isGuest ? login : toggleSidebar}
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
            title={isGuest ? "Sign in to save" : "View Profile"}
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

      {/* Files List */}
      <div className={styles.projectList}>
        {projects.find(p => p.id === activeProjectId)?.files.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <button
              key={file.id}
              className={`${styles.projectBtn} ${isActive ? styles.activeProject : ''}`}
              onClick={() => switchFile(file.id)}
            >
              <Folder size={14} className={styles.itemIcon} />
              <span className={styles.projectName}>{file.name}</span>
              <span className={styles.itemCount}>{file.nodes.length}</span>
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
              title="New File"
            >
              <Plus size={14} />
              <span>New File</span>
            </button>
          ) : (
            <CreateEntityModal 
              isOpen={isCreating}
              onClose={() => setIsCreating(false)}
              onConfirm={handleConfirmCreate}
              title="Create New File"
              defaultName="Untitled"
            />
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
