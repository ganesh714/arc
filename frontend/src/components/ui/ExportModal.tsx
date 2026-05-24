import { useState } from 'react';
import styles from './ExportModal.module.css';
import { Button } from './button';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
}

export function ExportModal({ isOpen, onClose, htmlCode }: ExportModalProps) {
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <button className={styles.close} onClick={onClose}>&times;</button>
        <h2 className={styles.title}>Exported HTML</h2>
        
        <div className={styles.codeSection}>
          <div className={styles.codeHeader}>
            <h3>HTML with Inline CSS</h3>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copiedHtml ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          </div>
          <pre className={styles.pre}><code>{htmlCode}</code></pre>
        </div>
      </div>
    </div>
  );
}
