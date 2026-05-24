import { useState } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { generateExportCode } from '@/utils/exportEngine';
import { ExportModal } from '@/components/ui/ExportModal';
import { ImportModal } from '@/components/ui/ImportModal';
import styles from './Header.module.css';
import { Button } from '@/components/ui/button';

export function Header() {
  const { nodes } = useDiagram();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [exportData, setExportData] = useState('');

  const handleExport = () => {
    const html = generateExportCode(nodes);
    setExportData(html);
    setIsModalOpen(true);
  };

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Project Loom</h1>
        <div className={styles.actions} style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={() => setIsImportOpen(true)} variant="outline">Import Diagram</Button>
          <Button onClick={handleExport} variant="outline">Export</Button>
        </div>
      </header>
      <ExportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        htmlCode={exportData}
      />
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </>
  );
}
