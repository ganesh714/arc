import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

interface CreateEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, backgroundColor: string) => Promise<void> | void;
  title: string;
  defaultName: string;
}

const PRESET_COLORS = [
  '#0f0f0f', // Dark Canvas
  '#ffffff', // White
  '#f8f9fa', // Light Gray
  '#e2e8f0', // Slate
  '#fdf6e3', // Solarized Light
  '#1a1a1a', // Dark Gray
  '#0f172a', // Slate Dark
  '#002b36', // Solarized Dark
];

export function CreateEntityModal({ isOpen, onClose, onConfirm, title, defaultName }: CreateEntityModalProps) {
  const [name, setName] = useState('');
  const [bgColor, setBgColor] = useState('#0f0f0f');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      await onConfirm(name || defaultName, bgColor);
      onClose();
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-[420px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#121212] border border-[#333] rounded px-3 py-2 text-white text-sm w-full outline-none focus:border-blue-500"
              placeholder={defaultName}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Initial Canvas Background
            </label>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  className={`w-full aspect-video rounded-md border-2 transition-all ${
                    bgColor === color ? 'border-blue-500 scale-105' : 'border-[#444] hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color, position: 'relative' }}
                  onClick={() => setBgColor(color)}
                  title={color}
                >
                  {bgColor === color && (
                    <Check size={16} color={['#ffffff', '#f8f9fa', '#e2e8f0', '#fdf6e3'].includes(color) ? '#000' : '#fff'} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-400">Custom hex:</span>
              <input 
                type="text" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="bg-[#121212] border border-[#333] rounded px-3 py-1.5 text-white text-sm w-full outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 flex gap-3">
              <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200/80 leading-relaxed">
                <strong>Caution:</strong> The canvas color you select here is absolute. It will <em>not</em> automatically flip when you toggle the app's global dark/light UI theme later. You can always change it in Canvas Settings.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 pb-2 text-sm text-red-500 font-medium text-center">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#333] bg-[#161616]">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-[#333] transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
              isSubmitting ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
