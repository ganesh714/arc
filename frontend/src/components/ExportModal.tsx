import { useState } from 'react';

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
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Exported HTML</h2>
        
        <div className="code-section">
          <div className="code-header">
            <h3>HTML with Inline CSS</h3>
            <button className="copy-btn" onClick={handleCopy}>
              {copiedHtml ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <pre><code>{htmlCode}</code></pre>
        </div>
      </div>
    </div>
  );
}
