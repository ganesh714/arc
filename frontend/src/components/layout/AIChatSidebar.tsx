import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ChevronDown, Mic, MicOff, Bot } from 'lucide-react';
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
    
    try {
      const loomApiUrl = (import.meta.env.VITE_LOOM_API_URL || 'http://localhost:8081').replace(/\/$/, '');
      const response = await fetch(`${loomApiUrl}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      const fileName = promptText.length > 20 ? promptText.substring(0, 20) + '...' : promptText;
      await addFile(activeProjectId, fileName);

      let parsedNodes = [];
      if (data.jsonTree) {
        try {
          parsedNodes = typeof data.jsonTree === 'string' ? JSON.parse(data.jsonTree) : data.jsonTree;
        } catch (e) {
          console.error("Failed to parse JSON tree from AI response", e);
        }
      }
      
      setNodes(parsedNodes);
    } catch (error) {
       console.error("Failed to generate AI visual", error);
       alert("Failed to generate AI visual. Please try again.");
    } finally {
       setIsGenerating(false);
    }
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
