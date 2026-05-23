import { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  scssCode: string;
}

export function ExportModal({ isOpen, onClose, htmlCode, scssCode }: ExportModalProps) {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedScss, setCopiedScss] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async (text: string, type: 'html' | 'scss') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'html') {
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2000);
      } else {
        setCopiedScss(true);
        setTimeout(() => setCopiedScss(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Exported Code</h2>
        
        <div className="code-section">
          <div className="code-header">
            <h3>HTML</h3>
            <button className="copy-btn" onClick={() => handleCopy(htmlCode, 'html')}>
              {copiedHtml ? 'Copied!' : 'Copy HTML'}
            </button>
          </div>
          <pre><code>{htmlCode}</code></pre>
        </div>

        <div className="code-section">
          <div className="code-header">
            <h3>SCSS</h3>
            <button className="copy-btn" onClick={() => handleCopy(scssCode, 'scss')}>
              {copiedScss ? 'Copied!' : 'Copy SCSS'}
            </button>
          </div>
          <pre><code>{scssCode}</code></pre>
        </div>
      </div>
    </div>
  );
}
