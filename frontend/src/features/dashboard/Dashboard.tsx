import { useState } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  Clock, 
  FolderKanban, 
  MoreVertical,
  Layers,
  Sparkles
} from 'lucide-react';
import styles from './Dashboard.module.css';

interface DashboardProps {
  onEnterWorkspace: () => void;
}

export function Dashboard({ onEnterWorkspace }: DashboardProps) {
  const { projects, addProject, switchProject } = useDiagram();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    const name = `New Project ${projects.length + 1}`;
    addProject(name);
    onEnterWorkspace();
  };

  const handleProjectClick = (id: string) => {
    switchProject(id);
    onEnterWorkspace();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className={styles.container}>
      {/* Top Navigation / Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}</h1>
          <p>You have {projects.length} active projects</p>
        </div>
        
        <div className={styles.actions}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: '#12141a',
                border: '1px solid #222',
                borderRadius: '8px',
                padding: '10px 12px 10px 36px',
                color: '#fff',
                fontSize: '14px',
                width: '240px',
                outline: 'none'
              }}
            />
          </div>
          <button className={styles.newProjectBtn} onClick={handleCreateNew}>
            <Plus size={18} />
            <span>New Project</span>
          </button>
          <button onClick={logout} style={{ backgroundColor: 'transparent', color: '#666', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
        </div>
      </header>

      {/* Main Grid */}
      {filteredProjects.length > 0 ? (
        <div className={styles.grid}>
          {filteredProjects.sort((a, b) => b.updatedAt - a.updatedAt).map((project) => (
            <div 
              key={project.id} 
              className={styles.card}
              onClick={() => handleProjectClick(project.id)}
            >
              <div className={styles.preview}>
                <div className={styles.cardIcon}>
                  <FolderKanban size={48} strokeWidth={1} />
                </div>
                {/* Visual indicator of project size */}
                {project.nodes.length > 0 && (
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                    <Sparkles size={16} color="#0c8ce9" opacity={0.6} />
                  </div>
                )}
              </div>
              
              <div className={styles.info}>
                <div className={styles.projectHeader}>
                  <span className={styles.projectName}>{project.name}</span>
                  <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
                    <MoreVertical size={16} />
                  </button>
                </div>
                
                <div className={styles.projectMeta}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                  <div className={styles.nodeCount}>
                    <Layers size={12} />
                    <span>{project.nodes.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div style={{ backgroundColor: '#1a1d26', padding: '24px', borderRadius: '50%', color: '#0c8ce9' }}>
            <LayoutGrid size={48} />
          </div>
          <h2>No projects found</h2>
          <p>Start by creating your first professional diagram or searching for an existing one.</p>
          <button className={styles.newProjectBtn} onClick={handleCreateNew} style={{ marginTop: '12px' }}>
            Create New Project
          </button>
        </div>
      )}
    </div>
  );
}
