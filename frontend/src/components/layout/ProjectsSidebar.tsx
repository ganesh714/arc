import { useState } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { Folder, Plus, Check, X } from 'lucide-react';
import styles from './ProjectsSidebar.module.css';

export function ProjectsSidebar() {
  const { projects, activeProjectId, switchProject, addProject } = useDiagram();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>Projects</span>
      </div>
      <div className={styles.list}>
        {projects.map((project) => {
          const isActive = project.id === activeProjectId;
          return (
            <button
              key={project.id}
              className={`${styles.item} ${isActive ? styles.activeItem : ''}`}
              onClick={() => switchProject(project.id)}
            >
              <Folder size={14} className={styles.itemIcon} />
              <span className={styles.itemName}>{project.name}</span>
              <span className={styles.itemCount}>{project.nodes.length}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        {isCreating ? (
          <div className={styles.inputContainer}>
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
              <button className={styles.confirmBtn} onClick={handleCreateProject} title="Save Project">
                <Check size={12} />
              </button>
              <button className={styles.cancelBtn} onClick={() => setIsCreating(false)} title="Cancel">
                <X size={12} />
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.addBtn} onClick={() => setIsCreating(true)}>
            <Plus size={14} />
            <span>New Project</span>
          </button>
        )}
      </div>
    </div>
  );
}
