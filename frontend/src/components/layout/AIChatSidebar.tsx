import { X, Send, Sparkles } from 'lucide-react';
import styles from './AIChatSidebar.module.css';
import { useDiagram } from '@/context/DiagramContext';

export function AIChatSidebar() {
  const { toggleAiChat } = useDiagram();

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Sparkles size={14} style={{ color: '#0c8ce9' }} />
          <span>Design Agent</span>
        </div>
        <button onClick={toggleAiChat} className={styles.closeBtn} title="Close AI Assistant">
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className={styles.messageList}>
        <div className={styles.messageGroup}>
          <span className={styles.aiLabel}>AI</span>
          <div className={styles.aiMessage}>
            Hi there! I'm your Loom Design Agent. I can help you create charts, layout diagrams, and apply beautiful designs. Try selecting some nodes or asking me to build a flowchart!
          </div>
        </div>
        
        {/* Placeholder for future messages */}
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <textarea 
            placeholder="Ask AI to create a chart..."
            className={styles.textarea}
            rows={1}
          />
          <button className={styles.sendBtn} title="Send prompt">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
