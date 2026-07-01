import { useState, useEffect } from 'react';
import styles from './LandingPage.module.css';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowRight, 
  Code, 
  Zap, 
  Globe, 
  Sparkles, 
  Shield, 
  Layers, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Cpu, 
  MessageSquare,
  History,
  Keyboard,
  Share2
} from 'lucide-react';

const CODE_TEMPLATES = [
  `// React Flow Component
import React from 'react';
import { AuthContext } from './Auth';

export const AuthNode = () => {
  const { login } = useAuth();
  return (
    <div className="p-4 border-2 border-purple-500 rounded-lg bg-gray-900">
      <h3>OAuth Node</h3>
      <button onClick={login}>Trigger flow</button>
    </div>
  );
};`,
  `// PostgreSQL Connection Pool
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};`,
  `// Next.js Route Handler
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.json();
  // Process visual logic mapping
  return NextResponse.json({ status: 'success' });
}`
];

export function LandingPage() {
  const { login, enterGuestMode } = useAuth();
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  
  // Interactive typing code simulation
  const [typedCode, setTypedCode] = useState('');
  const [templateIndex, setTemplateIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const fullText = CODE_TEMPLATES[templateIndex];
    if (charIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedCode(prev => prev + fullText[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 20);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setTypedCode('');
        setCharIndex(0);
        setTemplateIndex(prev => (prev + 1) % CODE_TEMPLATES.length);
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, templateIndex]);

  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  const faqItems = [
    {
      q: "How does the Diagram-to-Code compiler work?",
      a: "Loom parses the connections, variables, and shapes on the visual canvas, then uses our advanced semantic code parser alongside Gemini/Groq LLMs to construct clean React component syntax or robust SQL schemas in seconds."
    },
    {
      q: "Is Postgres required to use Loom?",
      a: "No! Loom supports a complete local storage Guest Mode. If you want persistent workspaces and database backups, you can link your Postgres database (e.g. Supabase, Render) by creating an account."
    },
    {
      q: "Can I self-host Loom's backend?",
      a: "Yes. Loom's API backend is built with Spring Boot and standard JPA models, making it extremely easy to dockerize and run on Render, AWS, or local Kubernetes clusters."
    },
    {
      q: "Which LLM models are supported?",
      a: "We natively routing vision and logic requests to Gemini 1.5 Pro, Gemini 1.5 Flash, and Groq's high-speed models using our built-in failover-ring manager."
    }
  ];

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.background}>
        <div className={styles.glow}></div>
        <div className={styles.grid}></div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>L</div>
          <span>Loom</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#code-generation">AI Compiler</a>
          <a href="#collaboration">Multiplayer</a>
          <a href="#faq">FAQ</a>
          <button className={styles.loginBtn} onClick={login}>Sign In</button>
          <button className={styles.getStartedBtn} onClick={enterGuestMode}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            <span>AI-Driven Visual Development</span>
          </div>
          <h1 className={styles.heroTitle}>
            Diagram visually.<br />
            Compile to <span className={styles.gradientText}>Code</span> instantly.
          </h1>
          <p className={styles.heroSubtitle}>
            The professional developer-first modeling canvas that weaves diagrams and architecture maps directly into production React, Angular, and SQL code. 
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryBtn} onClick={enterGuestMode}>
              Start Building Now <ArrowRight size={18} />
            </button>
            <button className={styles.secondaryBtn} onClick={login}>
              <Play size={18} /> Sign In
            </button>
          </div>
        </div>

        {/* Mockup Preview / Visuals */}
        <div className={styles.heroVisual}>
          <div className={styles.visualGlow}></div>
          <div className={styles.previewContainer}>
            <div className={styles.previewHeader}>
              <div className={styles.dots}>
                <span></span><span></span><span></span>
              </div>
              <div className={styles.addressBar}>loom.neuarc.in/workspace/interactive-diagram</div>
            </div>
            <div className={styles.previewContent}>
              <div className={styles.previewSidebar}></div>
              <div className={styles.previewCanvas}>
                <div className={styles.nodeMockup}>
                  <div style={{ padding: '8px 12px', color: '#c9d1d9', fontSize: '10px', fontWeight: 600 }}>Authentication</div>
                  <div style={{ padding: '8px 12px', borderTop: '1px solid #30363d', color: '#8b949e', fontSize: '9px' }}>OAuth 2.0 Flow</div>
                </div>
                <div className={styles.nodeMockup2}>
                  <div style={{ padding: '8px 12px', color: '#c9d1d9', fontSize: '10px', fontWeight: 600 }}>User Database</div>
                  <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(139, 92, 246, 0.3)', color: '#a78bfa', fontSize: '9px' }}>PostgreSQL Cluster</div>
                </div>
                <div className={styles.arrowMockup}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Logo Marquee */}
      <section className={styles.logosSection}>
        <div className={styles.logosTitle}>Supported Tech Ecosystem</div>
        <div className={styles.marqueeWrapper}>
          <div className={styles.marquee}>
            <div className={styles.marqueeItem}><Cpu size={18} /> React Framework</div>
            <div className={styles.marqueeItem}><Layers size={18} /> Next.js App Router</div>
            <div className={styles.marqueeItem}><Code size={18} /> TypeScript</div>
            <div className={styles.marqueeItem}><Globe size={18} /> Spring Boot API</div>
            <div className={styles.marqueeItem}><Zap size={18} /> PostgreSQL</div>
            <div className={styles.marqueeItem}><Shield size={18} /> OAuth 2.0</div>
            {/* Duplicate for infinite loop effect */}
            <div className={styles.marqueeItem}><Cpu size={18} /> React Framework</div>
            <div className={styles.marqueeItem}><Layers size={18} /> Next.js App Router</div>
            <div className={styles.marqueeItem}><Code size={18} /> TypeScript</div>
            <div className={styles.marqueeItem}><Globe size={18} /> Spring Boot API</div>
            <div className={styles.marqueeItem}><Zap size={18} /> PostgreSQL</div>
            <div className={styles.marqueeItem}><Shield size={18} /> OAuth 2.0</div>
          </div>
        </div>
      </section>

      {/* Storyline Timeline: Section 1 - AI Code Generation */}
      <div id="code-generation" className={styles.timelineSection}>
        <div className={styles.timelineConnector}>
          <div className={styles.timelineDot}><Sparkles size={16} /></div>
          <div className={styles.timelineLine}></div>
        </div>
        <div className={styles.timelineContent}>
          <div className={styles.splitGrid}>
            <div>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Visual Compiler</span>
                <h2 className={styles.sectionTitle}>Engineered for pure speed. Powered by AI.</h2>
              </div>
              <div className={styles.featuresList}>
                <div className={styles.featurePoint}>
                  <div className={styles.featurePointIcon}><Zap size={20} /></div>
                  <div>
                    <h4>Interactive Live Previews</h4>
                    <p>Build, connect, and customize architecture schemas, UI blocks, or microservices maps, and watch code update in real-time.</p>
                  </div>
                </div>
                <div className={styles.featurePoint}>
                  <div className={styles.featurePointIcon}><Cpu size={20} /></div>
                  <div>
                    <h4>Gemini & Groq Fallbacks</h4>
                    <p>Our intelligent middleware routes complex code layout problems to Gemini for rich context analysis, falling back to Groq for light speed compilation.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Live Typing Code Box mockup */}
            <div className={styles.editorMockup}>
              <div className={styles.editorHeader}>
                <div className={styles.dots}>
                  <span></span><span></span><span></span>
                </div>
                <span className={styles.editorTitle}>visual-compiler.tsx</span>
              </div>
              <pre className={styles.editorBody}>
                <code>{typedCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Storyline Timeline: Section 2 - Collaborative Multiplayer (REVERSED COLUMNS) */}
      <div id="collaboration" className={styles.timelineSection}>
        <div className={styles.timelineConnector}>
          <div className={styles.timelineDot}><Users size={16} /></div>
          <div className={styles.timelineLine}></div>
        </div>
        <div className={styles.timelineContent}>
          <div className={`${styles.splitGrid} ${styles.reverseSplit}`}>
            {/* Visual on the Left */}
            <div className={styles.collabCard}>
              <div className={styles.multiplayerDemo}>
                <div className={`${styles.cursor} ${styles.cursor1}`}>
                  <MessageSquare size={12} /> Sarah (UX Architect)
                </div>
                <div className={`${styles.cursor} ${styles.cursor2}`}>
                  <Code size={12} /> Ganesh (Backend Dev)
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#21262d', fontSize: '18px', fontWeight: 700, pointerEvents: 'none' }}>
                  Real-Time Sync active
                </div>
              </div>
            </div>
            {/* Content on the Right */}
            <div>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Multiplayer Workflow</span>
                <h2 className={styles.sectionTitle}>Built for teams. Real-time collaboration.</h2>
              </div>
              <div className={styles.featuresList}>
                <div className={styles.featurePoint}>
                  <div className={styles.featurePointIcon}><Users size={20} /></div>
                  <div>
                    <h4>Multiplayer Synchronization</h4>
                    <p>Co-edit models, link services, and plan backend databases with your team synchronously using high-performance WebSocket signaling.</p>
                  </div>
                </div>
                <div className={styles.featurePoint}>
                  <div className={styles.featurePointIcon}><Globe size={20} /></div>
                  <div>
                    <h4>Global Deployment</h4>
                    <p>Save diagrams instantly. Accessible on any client machine anywhere, keeping the entire product team perfectly in sync.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Features Section */}
      <section id="features" className={styles.bentoSection}>
        <div className={styles.sectionHeader} style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className={styles.sectionTag}>Productivity Kit</span>
          <h2 className={styles.sectionTitle}>Engineered for Modern Teams</h2>
        </div>
        <div className={styles.bentoGrid}>
          {/* Card 1 (Large) */}
          <div className={`${styles.bentoCard} ${styles.bentoLarge}`}>
            <div className={styles.bentoGlow}></div>
            <div className={styles.bentoCardIcon}><History size={24} /></div>
            <h3>Historical Reversions</h3>
            <p>Full undo/redo stack allows developers to rewind through layout variations and canvas edits safely, ensuring you never lose code changes.</p>
          </div>
          {/* Card 2 */}
          <div className={styles.bentoCard}>
            <div className={styles.bentoGlow}></div>
            <div className={styles.bentoCardIcon}><Keyboard size={24} /></div>
            <h3>Keyboard Hotkeys</h3>
            <p>Speed up layout modeling with custom keyboard shortcuts for shapes, lines, grouping, and layer order.</p>
          </div>
          {/* Card 3 */}
          <div className={styles.bentoCard}>
            <div className={styles.bentoGlow}></div>
            <div className={styles.bentoCardIcon}><Layers size={24} /></div>
            <h3>Infinite Canvas</h3>
            <p>Model complex architectures with nested schemas, modular frames, and sub-systems on a smooth zooming grid.</p>
          </div>
          {/* Card 4 (Large) */}
          <div className={`${styles.bentoCard} ${styles.bentoLarge}`}>
            <div className={styles.bentoGlow}></div>
            <div className={styles.bentoCardIcon}><Share2 size={24} /></div>
            <h3>Multi-framework Exports</h3>
            <p>One-click code compile outputs clean, typed modules for React, Next.js routes, or raw DDL SQL code schemas natively.</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section (New styled Cards) */}
      <section id="faq" className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {faqItems.map((item, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${faqOpenIndex === index ? styles.faqItemActive : ''}`}
            >
              <div className={styles.faqQuestion} onClick={() => toggleFaq(index)}>
                <span>{item.q}</span>
                {faqOpenIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              <div className={styles.faqAnswer}>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Card Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.logoIcon} style={{ width: '48px', height: '48px', fontSize: '24px' }}>L</div>
          <h2>Ready to weave code?</h2>
          <p>
            Start mapping node models to code in seconds. Sign in with Github or continue in offline Guest Mode.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryBtn} onClick={enterGuestMode}>
              Open Free Workspace <ArrowRight size={18} />
            </button>
            <button className={styles.secondaryBtn} onClick={login}>
              Sign In to Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Loom by Neuarc. Built for the next generation of developers.</p>
      </footer>
    </div>
  );
}
