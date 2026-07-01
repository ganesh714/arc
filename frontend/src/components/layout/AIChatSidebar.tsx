import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ChevronDown, Mic, MicOff, Bot, Edit3, ImagePlus } from 'lucide-react';
import styles from './AIChatSidebar.module.css';
import { useDiagram } from '@/context/DiagramContext';
import { autoLayoutNodes } from '../../utils/layoutEngine';

const MODELS = [
  'Loom GPT-4',
  'Loom Claude 3.5',
  'Loom Gemini Pro'
];


interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isError?: boolean;
}

export function AIChatSidebar() {
  const { toggleAiChat, activeProjectId, addFile, setNodes, nodes, projects, selectedNodeIds, saveHistoryState, zoom, panOffset } = useDiagram();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPhase, setAiPhase] = useState<'idle' | 'planning' | 'styling' | 'editing'>('idle');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [aiMode, setAiMode] = useState<'generate' | 'edit'>('generate');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setAiPhase(aiMode === 'generate' ? 'planning' : 'editing');
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: promptText }]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (isListening) toggleListen();
    
    try {
      const loomApiUrl = (import.meta.env.VITE_LOOM_API_URL || 'http://localhost:8081').replace(/\/$/, '');
      // Build chat context
      const chatContextStr = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\\n");
      const fullPrompt = messages.length > 0 ? `PREVIOUS CHAT HISTORY:\\n${chatContextStr}\\n\\nCURRENT REQUEST:\\n${promptText}` : promptText;
      
      let response: Response;
      if (aiMode === 'generate') {
        response = await fetch(`${loomApiUrl}/api/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ prompt: fullPrompt, imageBase64: selectedImage }),
        });
      } else {
        // Prepare context
        const contextPayload = nodes.map(n => {
          const { customConnectorStyle, ...safeNode } = n;
          return {
            ...safeNode,
            isSelected: selectedNodeIds.includes(n.id)
          };
        });
        
        const viewportContext = {
          zoom,
          panOffset,
          visibleBounds: {
            width: window.innerWidth / zoom,
            height: window.innerHeight / zoom,
            centerX: (window.innerWidth / 2) / zoom - panOffset.x,
            centerY: (window.innerHeight / 2) / zoom - panOffset.y
          }
        };
        
        response = await fetch(`${loomApiUrl}/api/ai/edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ prompt: fullPrompt, contextNodes: contextPayload, viewport: viewportContext, imageBase64: selectedImage }),
        });
      }

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = response.statusText;
        }
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (aiMode === 'generate') {
        setAiPhase('styling');
        const fileCount = projects.find(p => p.id === activeProjectId)?.files.length || 0;
        const fileName = "Untitled " + (fileCount + 1) + " (AI)";
        await addFile(activeProjectId, fileName);
      }

      let parsedNodes: any = [];
      let aiExplanation = '';
      let isDiff = false;
      let diffData: any = null;

      if (data.jsonTree) {
        try {
          const parsed = typeof data.jsonTree === 'string' ? JSON.parse(data.jsonTree) : data.jsonTree;
          if (parsed && typeof parsed === 'object') {
            if (parsed.explanation) aiExplanation = parsed.explanation;
            if (aiMode === 'edit' && (parsed.updatedNodes || parsed.addedNodes || parsed.deletedNodeIds)) {
              isDiff = true;
              diffData = {
                updatedNodes: Array.isArray(parsed.updatedNodes) ? parsed.updatedNodes : [],
                addedNodes: Array.isArray(parsed.addedNodes) ? parsed.addedNodes : [],
                deletedNodeIds: Array.isArray(parsed.deletedNodeIds) ? parsed.deletedNodeIds : []
              };
            }
          }
          parsedNodes = parsed;
        } catch (e) {
          console.error("Failed to parse JSON tree from AI response", e);
        }
      }
      
      if (isDiff && diffData) {
        saveHistoryState(nodes);
        
        let nextNodes = nodes.filter(n => !diffData.deletedNodeIds.includes(n.id));
        
        const updatesById = Object.fromEntries(diffData.updatedNodes.map((u: any) => [u.id, u]));
        nextNodes = nextNodes.map(n => {
          if (updatesById[n.id]) {
             // Deep merge style to preserve unedited styles
             const updatedStyle = { ...n.style, ...(updatesById[n.id].style || {}) };
             return { ...n, ...updatesById[n.id], style: updatedStyle };
          }
          return n;
        });
        
        const centerX = (window.innerWidth / 2) / zoom - panOffset.x;
        const centerY = (window.innerHeight / 2) / zoom - panOffset.y;
        
        const additions = diffData.addedNodes.map((n: any, index: number) => {
          // Add a slight offset for each new node so they don't stack exactly on top of each other
          const offset = index * 40;
          return {
            ...n,
            position: n.position || { x: centerX - 110 + offset, y: centerY - 45 + offset },
            dimensions: n.dimensions || { width: 220, height: 90 }
          };
        });
        nextNodes = [...nextNodes, ...additions];
        
        setNodes(nextNodes);
        
        const successMsg = aiExplanation || 'Diagram updated successfully!';
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: successMsg }]);
      } else {
        // Extract nodes array if AI wrapped it in an object
        if (parsedNodes && !Array.isArray(parsedNodes)) {
          if (Array.isArray(parsedNodes.nodes)) {
            parsedNodes = parsedNodes.nodes;
          } else if (Array.isArray(parsedNodes.elements)) {
            parsedNodes = parsedNodes.elements;
          } else if (Array.isArray(parsedNodes.data)) {
            parsedNodes = parsedNodes.data;
          } else {
            if (parsedNodes.id && parsedNodes.type) {
              parsedNodes = [parsedNodes];
            } else {
              throw new Error("AI response could not be parsed into a node array");
            }
          }
        }

        if (Array.isArray(parsedNodes)) {
          parsedNodes = parsedNodes.map((n: any) => ({
            ...n,
            position: n.position || { x: 0, y: 0 },
            dimensions: n.dimensions || { width: 220, height: 90 }
          }));
          
          if (aiMode === 'generate') {
            parsedNodes = autoLayoutNodes(parsedNodes);
          }
          
          saveHistoryState(nodes);
          setNodes(parsedNodes);
          
          const successMsg = aiExplanation || (aiMode === 'generate' ? 'Generated diagram successfully!' : 'Diagram updated successfully!');
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: successMsg }]);
        } else {
          throw new Error("Parsed nodes is not an array");
        }
      }
    } catch (error: any) {
      console.error("Failed to generate AI visual", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: `Error: ${error.message || 'Network error (CORS or Mixed Content)'}. Please check console.`, 
        isError: true 
      }]);
    } finally {
       setIsGenerating(false);
       setSelectedImage(null);
       setAiPhase('idle');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, aiPhase]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
      <div className={styles.messageList} style={{ display: 'flex', flexDirection: 'column', padding: '20px', color: '#888', overflowY: 'auto', flex: 1 }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', marginTop: '40px' }}>
            {aiMode === 'generate' ? (
              <>
                <Sparkles size={48} style={{ marginBottom: '16px', color: '#0c8ce9', opacity: 0.8 }} />
                <h3 style={{ margin: '0 0 8px 0', color: '#e3e3e3', fontSize: '18px' }}>AI Generation</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  Describe what you want to build. The AI will generate a visual diagram in a new file instantly.
                </p>
              </>
            ) : (
              <>
                <Edit3 size={48} style={{ marginBottom: '16px', color: '#10b981', opacity: 0.8 }} />
                <h3 style={{ margin: '0 0 8px 0', color: '#e3e3e3', fontSize: '18px' }}>AI Iteration</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  Ask the AI to modify the existing diagram. E.g., "Change all boxes to blue" or "Add a database node".
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {messages.map(msg => (
              <div 
                key={msg.id} 
                style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? '#0c8ce9' : msg.isError ? '#3f1a1a' : '#1e212b',
                  color: msg.role === 'user' ? '#fff' : msg.isError ? '#ef4444' : '#e3e3e3',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                  borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '12px',
                  maxWidth: '85%',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  border: msg.role === 'ai' && !msg.isError ? '1px solid #2a2e39' : msg.isError ? '1px solid #ef444450' : 'none'
                }}
              >
                {msg.content}
              </div>
            ))}
          </div>
        )}
        
        {isGenerating && (
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#0c8ce9' }}>
             <div style={{ width: '24px', height: '24px', border: '2px solid', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
               <span style={{ fontSize: '14px', fontWeight: 600 }}>
                 {aiPhase === 'planning' ? '🧠 Planning...' : aiPhase === 'styling' ? '🎨 Styling...' : aiPhase === 'editing' ? '✏️ Editing...' : 'Working...'}
               </span>
               <span style={{ fontSize: '11px', color: '#666', textAlign: 'center', lineHeight: 1.4, maxWidth: '160px' }}>
                 {aiPhase === 'planning' ? 'AI is analyzing your request and building a semantic blueprint' : aiPhase === 'styling' ? 'Converting blueprint to styled diagram nodes' : aiPhase === 'editing' ? 'Applying your changes to the diagram' : ''}
               </span>
             </div>
             {aiMode === 'generate' && (
               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                 <div style={{ width: '60px', height: '3px', borderRadius: '2px', background: aiPhase === 'planning' ? '#0c8ce9' : '#0c8ce9', transition: 'opacity 0.3s' }} />
                 <div style={{ width: '60px', height: '3px', borderRadius: '2px', background: aiPhase === 'styling' ? '#10b981' : '#333', transition: 'background 0.5s' }} />
               </div>
              )}
           </div>
        )}
        <div ref={messagesEndRef} style={{ height: 1 }} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', width: '100%' }}>
          <button 
            className={`${styles.modeBtn} ${aiMode === 'generate' ? styles.modeBtnActive : ''}`}
            onClick={() => setAiMode('generate')}
            title="Generate New Canvas"
          >
            <Sparkles size={12} />
            New
          </button>
          <button 
            className={`${styles.modeBtn} ${aiMode === 'edit' ? styles.modeBtnEditActive : ''}`}
            onClick={() => setAiMode('edit')}
            title="Edit Existing Canvas"
          >
            <Edit3 size={12} />
            Edit
          </button>
        </div>

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
              className={styles.micBtn} 
              onClick={() => fileInputRef.current?.click()}
              title="Attach an image"
            >
              <ImagePlus size={14} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
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
              disabled={(!input.trim() && !isListening && !selectedImage) || isGenerating}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
        {selectedImage && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', background: 'var(--bg-elevated)', borderRadius: '6px' }}>
            <img src={selectedImage} alt="Preview" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '12px', padding: 0 }}
            >
              Remove Image
            </button>
          </div>
        )}
        <div className={styles.footerNote}>
          Shift + Enter for new line
        </div>
      </div>

    </div>
  );
}
