import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useDiagram } from '@/context/DiagramContext';

interface CanvasSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function CanvasSettingsModal({ isOpen, onClose }: CanvasSettingsModalProps) {
  const { projects, activeProjectId, activeFileId, updateCanvasConfig } = useDiagram();
  
  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeFile = activeProject?.files.find(f => f.id === activeFileId);

  const [bgColor, setBgColor] = useState('');

  useEffect(() => {
    if (activeFile && isOpen) {
      setBgColor(activeFile.canvasConfig.backgroundColor);
    }
  }, [activeFile, isOpen]);

  if (!isOpen || !activeFile) return null;

  const handleSave = () => {
    updateCanvasConfig(activeFileId, { backgroundColor: bgColor });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-[400px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <h2 className="text-white font-semibold text-lg">Canvas Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Background Color
            </label>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {PRESET_COLORS.map(color => (
                <div key={color} className="flex flex-col items-center gap-2">
                  <button
                    className={`w-full aspect-video rounded-md border-2 transition-all ${
                      bgColor === color ? 'border-blue-500 scale-105' : 'border-[#444] hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color, position: 'relative' }}
                    onClick={() => setBgColor(color)}
                  >
                    {bgColor === color && (
                      <Check size={16} color={['#ffffff', '#f8f9fa', '#e2e8f0', '#fdf6e3'].includes(color) ? '#000' : '#fff'} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </button>
                  <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">{color}</span>
                </div>
              ))}
            </div>
            
            {/* Multi-color Custom Picker Panel */}
            <div className="flex flex-col gap-2 mt-4">
              <label className="block text-sm font-medium text-gray-300">
                Custom Color Picker
              </label>
              <div 
                className="w-full h-12 rounded-md relative cursor-pointer border-2 border-[#444] hover:border-gray-400 transition-all overflow-hidden" 
                style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
              >
                <input 
                  type="color" 
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="absolute -top-4 -left-4 w-[200%] h-[200%] opacity-0 cursor-pointer"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <span className="bg-black/60 text-white px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm shadow-sm uppercase tracking-wider font-mono">
                    {bgColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#333] bg-[#161616]">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-[#333] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
