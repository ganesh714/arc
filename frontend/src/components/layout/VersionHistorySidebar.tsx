import { useState } from 'react';
import { X, History, RotateCcw, AlertTriangle } from 'lucide-react';
import styles from './VersionHistorySidebar.module.css';
import { useDiagram } from '@/context/DiagramContext';
import { useAuth } from '@/context/AuthContext';

export function VersionHistorySidebar() {
  const { toggleVersionHistory, versions, restoreVersion } = useDiagram();
  const { isGuest } = useAuth();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (versionId: string) => {
    if (window.confirm('Are you sure you want to restore the diagram to this version? Any unsaved current changes will be overwritten.')) {
      setRestoringId(versionId);
      try {
        await restoreVersion(versionId);
      } finally {
        setRestoringId(null);
      }
    }
  };

  const formatVersionDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <History size={16} className={styles.historyIcon} />
          <h2>Version History</h2>
        </div>
        <button onClick={toggleVersionHistory} className={styles.closeBtn} title="Close Version History">
          <X size={16} />
        </button>
      </header>

      <div className={styles.content}>
        {isGuest ? (
          <div className={styles.guestState}>
            <AlertTriangle size={24} className={styles.warningIcon} />
            <p>Version history is only available for cloud-saved projects.</p>
          </div>
        ) : versions.length === 0 ? (
          <div className={styles.emptyState}>
            <History size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            <p>No snapshots recorded yet. Any new changes will trigger a backup version.</p>
          </div>
        ) : (
          <div className={styles.versionList}>
            {versions.map((version, index) => (
              <div 
                key={version.id} 
                className={`${styles.versionItem} ${index === 0 ? styles.latestItem : ''}`}
              >
                <div className={styles.versionDetails}>
                  <div className={styles.versionHeader}>
                    <span className={styles.versionTime}>{formatVersionDate(version.createdAt)}</span>
                    {index === 0 && <span className={styles.badge}>Current</span>}
                  </div>
                  <span className={styles.versionId}>Version ID: {version.id.substring(0, 8)}...</span>
                </div>
                
                <button
                  onClick={() => handleRestore(version.id)}
                  disabled={restoringId !== null}
                  className={styles.restoreBtn}
                  title="Restore this version"
                >
                  <RotateCcw size={14} />
                  <span>{restoringId === version.id ? 'Restoring...' : 'Restore'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
