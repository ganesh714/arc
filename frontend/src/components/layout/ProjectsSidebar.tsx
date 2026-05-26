import { useState, useRef, useEffect } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { Folder, Plus, Check, X, FolderKanban } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import styles from './ProjectsSidebar.module.css';

export function ProjectsSidebar() {
  const { projects, activeProjectId, switchProject, addProject, isSidebarOpen, toggleSidebar } = useDiagram();
  
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

        {/* Footer with Plus icon */}
        <div className={styles.footerCollapsed}>
          <button
            className={styles.addBtnCollapsed}
            onClick={() => {
              toggleSidebar();
              setIsCreating(true);
            }}
            title="New File / Project"
          >
            <Plus size={20} />
          </button>
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

      {/* Footer / Add Project Button */}
      <div className={styles.footer}>
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
      </div>
    </div>
  );
}
