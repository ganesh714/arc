import { useState } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { Folder, FolderOpen, File, Plus, Search, Check, X, ChevronDown, ChevronRight, PanelLeftClose } from 'lucide-react';
import styles from './ProjectsSidebar.module.css';

export function ProjectsSidebar() {
  const { projects, activeProjectId, switchProject, addProject, toggleSidebar } = useDiagram();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track collapsed folders (categories)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  
  // Track adding a file under a specific category
  const [activeAddingCategory, setActiveAddingCategory] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');

  // General project creation (from footer)
  const [isCreatingGeneral, setIsCreatingGeneral] = useState(false);
  const [generalProjectName, setGeneralProjectName] = useState('');
  const [generalCategoryName, setGeneralCategoryName] = useState('Loom Diagrams');

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAddFileToCategory = (category: string) => {
    if (newFileName.trim()) {
      addProject(newFileName.trim(), category);
      setNewFileName('');
      setActiveAddingCategory(null);
    }
  };

  const handleCreateGeneralProject = () => {
    if (generalProjectName.trim()) {
      addProject(generalProjectName.trim(), generalCategoryName.trim() || 'Loom Diagrams');
      setGeneralProjectName('');
      setGeneralCategoryName('Loom Diagrams');
      setIsCreatingGeneral(false);
    }
  };

  // Group projects by category
  const groupedProjects = projects.reduce((acc, project) => {
    const category = project.category || 'Other Projects';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(project);
    return acc;
  }, {} as Record<string, typeof projects>);

  // Format last modified timestamp
  const formatLastModified = (timestamp?: number) => {
    if (!timestamp) return 'Just now';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter projects by search term
  const filteredCategories = Object.keys(groupedProjects).reduce((acc, category) => {
    const matchedProjects = groupedProjects[category].filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (matchedProjects.length > 0) {
      acc[category] = matchedProjects;
    }
    return acc;
  }, {} as Record<string, typeof projects>);

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoIcon}>L</div>
          <span className={styles.logoText}>Loom</span>
        </div>
        <button className={styles.collapseBtn} onClick={toggleSidebar} title="Collapse sidebar">
          <PanelLeftClose size={14} />
        </button>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <Search size={12} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search files..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className={styles.searchClearBtn} onClick={() => setSearchTerm('')}>
            <X size={10} />
          </button>
        )}
      </div>

      {/* Tree List */}
      <div className={styles.list}>
        {Object.keys(filteredCategories).length === 0 ? (
          <div className={styles.noResults}>No projects found</div>
        ) : (
          Object.keys(filteredCategories).map(category => {
            const isCollapsed = !!collapsedCategories[category];
            const categoryProjects = filteredCategories[category];
            const isAddingHere = activeAddingCategory === category;

            return (
              <div key={category} className={styles.categoryGroup}>
                {/* Category Folder Header */}
                <div className={styles.categoryHeader}>
                  <button 
                    className={styles.categoryToggleBtn}
                    onClick={() => toggleCategory(category)}
                  >
                    {isCollapsed ? <ChevronRight size={12} className={styles.chevronIcon} /> : <ChevronDown size={12} className={styles.chevronIcon} />}
                    {isCollapsed ? <Folder size={13} className={styles.folderIcon} /> : <FolderOpen size={13} className={styles.folderIcon} />}
                    <span className={styles.categoryName}>{category}</span>
                  </button>

                  {/* Add File directly under this folder */}
                  <button 
                    className={styles.categoryAddBtn}
                    onClick={() => {
                      setActiveAddingCategory(isAddingHere ? null : category);
                      if (isCollapsed) {
                        toggleCategory(category); // Auto-expand when adding
                      }
                    }}
                    title="Add file to this folder"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Adding File Input Inline */}
                {!isCollapsed && isAddingHere && (
                  <div className={styles.inlineInputContainer}>
                    <input
                      type="text"
                      className={styles.inlineInput}
                      placeholder="File name..."
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddFileToCategory(category);
                        else if (e.key === 'Escape') setActiveAddingCategory(null);
                      }}
                      autoFocus
                    />
                    <div className={styles.inlineInputActions}>
                      <button 
                        className={styles.inlineConfirmBtn} 
                        onClick={() => handleAddFileToCategory(category)}
                        title="Add file"
                      >
                        <Check size={10} />
                      </button>
                      <button 
                        className={styles.inlineCancelBtn} 
                        onClick={() => setActiveAddingCategory(null)}
                        title="Cancel"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Folder Children (Files) */}
                {!isCollapsed && (
                  <div className={styles.categoryChildren}>
                    {categoryProjects.map(project => {
                      const isActive = project.id === activeProjectId;
                      return (
                        <button
                          key={project.id}
                          className={`${styles.item} ${isActive ? styles.activeItem : ''}`}
                          onClick={() => switchProject(project.id)}
                        >
                          <File size={12} className={styles.itemIcon} />
                          <div className={styles.itemMeta}>
                            <span className={styles.itemName}>{project.name}</span>
                            <span className={styles.itemModified}>
                              {formatLastModified(project.updatedAt)}
                            </span>
                          </div>
                          <span className={styles.itemCount}>{project.nodes.length}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Create New Project */}
      <div className={styles.footer}>
        {isCreatingGeneral ? (
          <div className={styles.inputContainer}>
            <input
              type="text"
              className={styles.input}
              placeholder="File name..."
              value={generalProjectName}
              onChange={(e) => setGeneralProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateGeneralProject();
                else if (e.key === 'Escape') setIsCreatingGeneral(false);
              }}
              autoFocus
            />
            <input
              type="text"
              className={styles.input}
              placeholder="Folder (e.g. Loom Diagrams)"
              value={generalCategoryName}
              onChange={(e) => setGeneralCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateGeneralProject();
                else if (e.key === 'Escape') setIsCreatingGeneral(false);
              }}
              style={{ marginTop: '4px' }}
            />
            <div className={styles.inputActions} style={{ marginTop: '4px' }}>
              <button className={styles.confirmBtn} onClick={handleCreateGeneralProject} title="Save File">
                <Check size={12} />
              </button>
              <button className={styles.cancelBtn} onClick={() => setIsCreatingGeneral(false)} title="Cancel">
                <X size={12} />
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.addBtn} onClick={() => setIsCreatingGeneral(true)}>
            <Plus size={14} />
            <span>New File / Folder</span>
          </button>
        )}
      </div>
    </div>
  );
}
