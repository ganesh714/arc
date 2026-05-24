import { useState } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { generateExportCode } from '@/utils/exportEngine';
import { ExportModal } from '@/components/ui/ExportModal';
import styles from './Header.module.css';
import { Button } from '@/components/ui/button';

export function Header() {
  const { nodes, addBox } = useDiagram();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        <div className={styles.actions}>
          <Button onClick={addBox} variant="default">Add Box</Button>
          <Button onClick={handleExport} variant="outline">Export HTML</Button>
        </div>
      </header>
      <ExportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        htmlCode={exportData}
      />
    </>
  );
}
