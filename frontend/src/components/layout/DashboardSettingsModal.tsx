import { X, Sun, Moon } from 'lucide-react';
import { useDiagram } from '@/context/DiagramContext';

interface DashboardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSettingsModal({ isOpen, onClose }: DashboardSettingsModalProps) {
  const { theme, toggleTheme } = useDiagram();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-2xl w-[400px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          <h2 className="text-[var(--text-primary)] font-semibold text-lg">Dashboard Settings</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-4">
              App Theme
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-3 rounded-md border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-[var(--accent-blue)] bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]' 
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                }`}
              >
                <Sun size={18} />
                <span className="font-medium text-sm">Light</span>
              </button>
              <button
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-3 rounded-md border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-[var(--accent-blue)] bg-[var(--bg-active)] text-[var(--accent-blue)]' 
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                }`}
              >
                <Moon size={18} />
                <span className="font-medium text-sm">Dark</span>
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              This sets the overall UI theme of the Loom application across the Dashboard and Canvas.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border-default)] bg-[var(--bg-panel)]">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
