import { X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { category: 'Tools', items: [
      { key: 'V', label: 'Select (Move)' },
      { key: 'K', label: 'Select (Scale)' },
      { key: 'H', label: 'Hand Tool (Pan)' },
      { key: 'P', label: 'Pen Tool' },
      { key: 'E', label: 'Eraser Tool' },
    ]},
    { category: 'Shapes', items: [
      { key: 'R', label: 'Rectangle / Box' },
      { key: 'C', label: 'Circle' },
      { key: 'L', label: 'Line' },
      { key: '⇧ + L', label: 'Arrow' },
      { key: 'T', label: 'Text / Note' },
      { key: 'M', label: 'Comment' },
    ]},
    { category: 'Actions', items: [
      { key: 'Ctrl + C', label: 'Copy' },
      { key: 'Ctrl + V', label: 'Paste' },
      { key: 'Ctrl + X', label: 'Cut' },
      { key: 'Ctrl + D', label: 'Duplicate' },
      { key: 'Ctrl + Z', label: 'Undo' },
      { key: 'Ctrl + Y', label: 'Redo' },
      { key: 'Ctrl + G', label: 'Group' },
      { key: 'Ctrl + ⇧ + G', label: 'Ungroup' },
      { key: 'Delete', label: 'Delete Selected' },
    ]}
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          <h2 className="text-[var(--text-primary)] font-semibold text-lg">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex flex-col gap-8">
          {shortcuts.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-[var(--text-secondary)] text-xs uppercase tracking-wider font-semibold mb-4">{section.category}</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between">
                    <span className="text-[var(--text-primary)] text-sm">{item.label}</span>
                    <kbd className="bg-[var(--bg-active)] border border-[var(--border-default)] text-[var(--text-secondary)] px-2 py-1 rounded text-xs font-mono font-medium">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-[var(--border-default)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--accent-blue)] text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
