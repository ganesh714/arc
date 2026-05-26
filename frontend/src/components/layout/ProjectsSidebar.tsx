import { useState, useRef, useEffect } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { Folder, Plus, Check, X, PanelLeftClose } from 'lucide-react';
import styles from './ProjectsSidebar.module.css';

export function ProjectsSidebar() {
  const { projects, activeProjectId, switchProject, addProject, toggleSidebar } = useDiagram();
  
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

  return (
    <div className={styles.sidebar}>
      {/* Top Logo */}
      <div className={styles.logoContainer}>
        <img src="/main logo.png" className={styles.logo} alt="Loom Logo" />
      </div>

      <div className={styles.divider} />

      {/* Projects List */}
      <div className={styles.projectList}>
        {projects.map((project) => {
          const isActive = project.id === activeProjectId;
          return (
            <div key={project.id} className={styles.itemWrapper}>
              <button
                className={`${styles.projectBtn} ${isActive ? styles.activeProject : ''}`}
                onClick={() => switchProject(project.id)}
              >
                <Folder size={18} />
              </button>
              {/* Tooltip */}
              <div className={styles.tooltip}>
                <span className={styles.tooltipName}>{project.name}</span>
                <span className={styles.tooltipCount}>{project.nodes.length} shapes</span>
                {project.category && <span className={styles.tooltipCategory}>{project.category}</span>}
              </div>
              {isActive && <div className={styles.activeIndicator} />}
            </div>
          );
        })}

        {/* Add Project Button */}
        <div className={styles.itemWrapper}>
          <button
            className={styles.addBtn}
            onClick={() => setIsCreating(!isCreating)}
            title="New File / Project"
          >
            <Plus size={18} />
          </button>

          {/* Inline Popover to type new project name */}
          {isCreating && (
            <div ref={popoverRef} className={styles.popover}>
              <span className={styles.popoverTitle}>New Project</span>
              <div className={styles.popoverInputContainer}>
                <input
                  type="text"
                  className={styles.popoverInput}
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateProject();
                    else if (e.key === 'Escape') setIsCreating(false);
                  }}
                  autoFocus
                />
                <div className={styles.popoverActions}>
                  <button className={styles.confirmBtn} onClick={handleCreateProject} title="Save">
                    <Check size={12} />
                  </button>
                  <button className={styles.cancelBtn} onClick={() => setIsCreating(false)} title="Cancel">
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Sidebar Button at the bottom */}
      <div className={styles.footer}>
        <button className={styles.collapseBtn} onClick={toggleSidebar} title="Collapse sidebar">
          <PanelLeftClose size={16} />
        </button>
      </div>
    </div>
  );
}
