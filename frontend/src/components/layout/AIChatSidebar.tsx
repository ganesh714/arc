import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Sparkles, ChevronDown, Mic, MicOff, Settings, Bot } from 'lucide-react';
import styles from './AIChatSidebar.module.css';
import { useDiagram } from '@/context/DiagramContext';

const MODELS = [
  'Loom GPT-4',
  'Loom Claude 3.5',
  'Loom Gemini Pro'
];

export function AIChatSidebar() {
  const { toggleAiChat, activeProjectId, addFile, setNodes } = useDiagram();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            setInput((prev) => prev + (prev ? ' ' : '') + finalTranscript);
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
              textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert('Speech recognition is not supported in this browser.');
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const promptText = input.trim();
    setInput('');
    setIsGenerating(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (isListening) toggleListen();
    
    // Simulate AI generating JSON tree and visual
    setTimeout(async () => {
      try {
        const fileName = promptText.length > 20 ? promptText.substring(0, 20) + '...' : promptText;
        await addFile(activeProjectId, fileName);
        
        const mockNodes: any[] = [
          {
            id: Math.random().toString(36).substring(2, 10),
            type: 'box',
            position: { x: 300, y: 150 },
            dimensions: { width: 200, height: 100 },
            content: promptText,
            style: {
              backgroundColor: '#2c2c2c',
              borderColor: '#0c8ce9',
              color: '#e3e3e3'
            }
          },
          {
            id: Math.random().toString(36).substring(2, 10),
            type: 'arrow',
            position: { x: 400, y: 250 },
            dimensions: { width: 20, height: 100 },
            content: '',
            style: { borderColor: '#555555' },
            startPoint: { x: 400, y: 250 },
            endPoint: { x: 400, y: 350 }
          },
          {
            id: Math.random().toString(36).substring(2, 10),
            type: 'diamond',
            position: { x: 340, y: 350 },
            dimensions: { width: 120, height: 120 },
            content: 'AI Gen Result',
            style: {
              backgroundColor: '#2e2c24',
              borderColor: '#c69c3a',
              color: '#e3e3e3',
              borderRadius: '2px'
            }
          }
        ];
        
        setNodes(mockNodes);
      } catch (error) {
         console.error("Failed to generate AI visual", error);
      } finally {
         setIsGenerating(false);
      }
    }, 1500);
  };

  // Removed message history scroll

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className={styles.sidebar}>
      {/* Advanced Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.modelSelectorWrapper}>
            <button 
              className={styles.modelSelectorBtn}
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            >
              <Bot size={14} className={styles.modelIcon} />
              <span>{selectedModel}</span>
              <ChevronDown size={12} className={styles.chevron} />
            </button>

            {isModelDropdownOpen && (
              <div className={styles.modelDropdown}>
                {MODELS.map(model => (
                  <button 
                    key={model}
                    className={`${styles.modelOption} ${selectedModel === model ? styles.modelOptionActive : ''}`}
                    onClick={() => {
                      setSelectedModel(model);
                      setIsModelDropdownOpen(false);
                    }}
                  >
                    {model}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.headerActions}>
            <button onClick={toggleAiChat} className={styles.closeBtn} title="Close AI Assistant">
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      {/* Main Content Area */}
      <div className={styles.messageList} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px', color: '#888' }}>
        <Sparkles size={48} style={{ marginBottom: '16px', color: '#0c8ce9', opacity: 0.8 }} />
        <h3 style={{ margin: '0 0 8px 0', color: '#e3e3e3', fontSize: '18px' }}>AI Generation</h3>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          Describe what you want to build. The AI will generate a visual diagram in a new file instantly.
        </p>
        {isGenerating && (
          <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0c8ce9' }}>
             <div style={{ width: '16px', height: '16px', border: '2px solid', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
             Generating visual...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={`${styles.inputContainer} ${isListening ? styles.inputContainerListening : ''}`}>
          <textarea 
            ref={textareaRef}
            placeholder={isListening ? "Listening..." : "Ask AI to create a chart..."}
            className={styles.textarea}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className={styles.inputActions}>
            <button 
              className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ''}`} 
              onClick={toggleListen}
              title={isListening ? "Stop listening" : "Dictate with voice"}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
            <button 
              className={`${styles.sendBtn} ${input.trim() ? styles.sendBtnReady : ''}`} 
              onClick={handleSend}
              title="Send prompt"
              disabled={(!input.trim() && !isListening) || isGenerating}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
        <div className={styles.footerNote}>
          Shift + Enter for new line
        </div>
      </div>

    </div>
  );
}
