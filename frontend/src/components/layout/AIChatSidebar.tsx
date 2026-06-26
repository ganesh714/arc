import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ChevronDown, History, Plus, Mic, MicOff, Settings, Bot } from 'lucide-react';
import styles from './AIChatSidebar.module.css';
import { useDiagram } from '@/context/DiagramContext';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

const MODELS = [
  'Loom GPT-4',
  'Loom Claude 3.5',
  'Loom Gemini Pro'
];

export function AIChatSidebar() {
  const { toggleAiChat } = useDiagram();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: "Hi there! I'm your Loom Design Agent. I can help you create charts, layout diagrams, and apply beautiful designs. Try selecting some nodes or asking me to build a flowchart!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    if (isListening) toggleListen();
    
    // Simulate AI response for now
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `I am simulating a response using ${selectedModel}. Your request was: "${newUserMsg.content}"`
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
            <button className={styles.iconBtn} title="Chat History">
              <History size={14} />
            </button>
            <button className={styles.iconBtn} title="New Chat">
              <Plus size={14} />
            </button>
            <div className={styles.divider} />
            <button onClick={toggleAiChat} className={styles.closeBtn} title="Close AI Assistant">
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messageList}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.messageGroup} ${msg.role === 'user' ? styles.userGroup : styles.aiGroup}`}>
            {msg.role === 'ai' && <span className={styles.aiLabel}><Sparkles size={10} /> AI</span>}
            <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={`${styles.inputContainer} ${isListening ? styles.inputContainerListening : ''}`}>
          <textarea 
            placeholder={isListening ? "Listening..." : "Ask AI to create a chart..."}
            className={styles.textarea}
            rows={Math.min(4, Math.max(1, input.split('\n').length))}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
              disabled={!input.trim() && !isListening}
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
