import { useState, useEffect, useRef } from 'react';
import styles from './LandingPage.module.css';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowRight, 
  Code, 
  Globe, 
  Sparkles, 
  Shield, 
  Layers, 
  Users, 
  Play, 
  Cpu, 
  MessageSquare,
  History,
  Keyboard,
  Share2,
  Database,
  Server,
  Copy,
  Check
} from 'lucide-react';

interface CodeToken {
  text: string;
  type: 'kw' | 'str' | 'var' | 'com' | 'typ' | 'plain';
}

interface CodeFile {
  name: string;
  tokens: CodeToken[];
}

const FILES_TEMPLATES: CodeFile[] = [
  {
    name: 'AuthGateway.tsx',
    tokens: [
      { text: '// React Flow Component\n', type: 'com' },
      { text: 'import ', type: 'kw' },
      { text: 'React ', type: 'var' },
      { text: 'from ', type: 'kw' },
      { text: "'react'", type: 'str' },
      { text: ';\nimport { ', type: 'plain' },
      { text: 'useAuth ', type: 'var' },
      { text: '} from ', type: 'kw' },
      { text: "'./AuthContext'", type: 'str' },
      { text: ';\n\nexport const ', type: 'kw' },
      { text: 'AuthNode ', type: 'typ' },
      { text: '= () => {\n  const { ', type: 'plain' },
      { text: 'login ', type: 'var' },
      { text: '} = ', type: 'plain' },
      { text: 'useAuth', type: 'typ' },
      { text: '();\n  return (\n    <', type: 'plain' },
      { text: 'div ', type: 'kw' },
      { text: 'className=', type: 'plain' },
      { text: '"border border-blue-500 bg-gray-900"', type: 'str' },
      { text: '>\n      <', type: 'plain' },
      { text: 'h3', type: 'kw' },
      { text: '>OAuth Node</', type: 'plain' },
      { text: 'h3', type: 'kw' },
      { text: '>\n      <', type: 'plain' },
      { text: 'button ', type: 'kw' },
      { text: 'onClick={', type: 'plain' },
      { text: 'login', type: 'var' },
      { text: '}>Trigger OAuth</', type: 'plain' },
      { text: 'button', type: 'kw' },
      { text: '>\n    </', type: 'plain' },
      { text: 'div', type: 'kw' },
      { text: '>\n  );\n};', type: 'plain' }
    ]
  },
  {
    name: 'schema.sql',
    tokens: [
      { text: '-- Postgres DB Table Schemas\n', type: 'com' },
      { text: 'CREATE TABLE ', type: 'kw' },
      { text: 'projects ', type: 'typ' },
      { text: '(\n  id ', type: 'plain' },
      { text: 'UUID ', type: 'kw' },
      { text: 'PRIMARY KEY DEFAULT ', type: 'kw' },
      { text: 'gen_random_uuid()', type: 'var' },
      { text: ',\n  name ', type: 'plain' },
      { text: 'VARCHAR(255) ', type: 'kw' },
      { text: 'NOT NULL', type: 'kw' },
      { text: ',\n  user_id ', type: 'plain' },
      { text: 'UUID ', type: 'kw' },
      { text: 'NOT NULL', type: 'kw' },
      { text: ',\n  created_at ', type: 'plain' },
      { text: 'TIMESTAMP DEFAULT ', type: 'kw' },
      { text: 'CURRENT_TIMESTAMP\n', type: 'var' },
      { text: ');\n\nCREATE TABLE ', type: 'kw' },
      { text: 'files ', type: 'typ' },
      { text: '(\n  id ', type: 'plain' },
      { text: 'UUID ', type: 'kw' },
      { text: 'PRIMARY KEY DEFAULT ', type: 'kw' },
      { text: 'gen_random_uuid()', type: 'var' },
      { text: ',\n  project_id ', type: 'plain' },
      { text: 'UUID REFERENCES ', type: 'kw' },
      { text: 'projects(id) ', type: 'var' },
      { text: 'ON DELETE CASCADE', type: 'kw' },
      { text: ',\n  name ', type: 'plain' },
      { text: 'VARCHAR(255) ', type: 'kw' },
      { text: 'NOT NULL\n', type: 'kw' },
      { text: ');', type: 'plain' }
    ]
  },
  {
    name: 'api.ts',
    tokens: [
      { text: '// Next.js Route Handler\n', type: 'com' },
      { text: 'import ', type: 'kw' },
      { text: '{ NextResponse } ', type: 'plain' },
      { text: 'from ', type: 'kw' },
      { text: "'next/server'", type: 'str' },
      { text: ';\n\nexport async function ', type: 'kw' },
      { text: 'POST', type: 'typ' },
      { text: '(req: ', type: 'plain' },
      { text: 'Request', type: 'typ' },
      { text: ') {\n  const ', type: 'plain' },
      { text: 'payload ', type: 'var' },
      { text: '= await ', type: 'plain' },
      { text: 'req.json', type: 'var' },
      { text: '();\n  \n  ', type: 'plain' },
      { text: '// Save architecture diagram\n  ', type: 'com' },
      { text: 'const ', type: 'kw' },
      { text: 'dbResult ', type: 'var' },
      { text: '= await ', type: 'plain' },
      { text: 'db.save', type: 'var' },
      { text: '(payload);\n  return ', type: 'plain' },
      { text: 'NextResponse.json', type: 'typ' },
      { text: '({ status: ', type: 'plain' },
      { text: "'compiled'", type: 'str' },
      { text: ', dbResult });\n}', type: 'plain' }
    ]
  }
];

export function LandingPage() {
  const { login, enterGuestMode } = useAuth();
  
  // Code Editor typing states
  const [activeTab, setActiveTab] = useState(0);
  const [typedCharsCount, setTypedCharsCount] = useState(0);

  // Bento Cards Spotlights
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Copy Cli states
  const [copied, setCopied] = useState(false);

  // Multiplayer Live Simulation State Machine
  const [simStep, setSimStep] = useState(0);
  const [simCursors, setSimCursors] = useState({
    sarah: { x: 50, y: 150 },
    ganesh: { x: 300, y: 100 }
  });
  const [simNodes, setSimNodes] = useState({
    client: false,
    database: false,
    clientActive: false,
    databaseActive: false
  });
  const [simLineVisible, setSimLineVisible] = useState(false);
  const [simPulseVisible, setSimPulseVisible] = useState(false);

  // Intersection Observer for scroll reveal
  useEffect(() => {
    const revealElements = document.querySelectorAll(`.${styles.reveal}`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealVisible);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Code Typing Simulation Character Counter Loop
  useEffect(() => {
    const totalChars = FILES_TEMPLATES[activeTab].tokens.reduce((acc, t) => acc + t.text.length, 0);
    if (typedCharsCount < totalChars) {
      const timeout = setTimeout(() => {
        setTypedCharsCount(prev => prev + 1);
      }, 15);
      return () => clearTimeout(timeout);
    } else {
      const timer = setTimeout(() => {
        const nextIndex = (activeTab + 1) % FILES_TEMPLATES.length;
        setActiveTab(nextIndex);
        setTypedCharsCount(0);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [typedCharsCount, activeTab]);

  const selectTab = (index: number) => {
    setActiveTab(index);
    setTypedCharsCount(0);
  };

  // Helper to render typed tokens with syntax highlighting
  const renderTypedTokens = () => {
    const tokens = FILES_TEMPLATES[activeTab].tokens;
    let charAccumulator = 0;
    const renderedSpans = [];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (charAccumulator >= typedCharsCount) break;

      const remainingChars = typedCharsCount - charAccumulator;
      if (remainingChars >= t.text.length) {
        renderedSpans.push(
          <span key={i} className={styles[t.type] || ''}>
            {t.text}
          </span>
        );
        charAccumulator += t.text.length;
      } else {
        renderedSpans.push(
          <span key={i} className={styles[t.type] || ''}>
            {t.text.substring(0, remainingChars)}
          </span>
        );
        charAccumulator += remainingChars;
        break;
      }
    }

    return renderedSpans;
  };

  // Bento Card Cursor Spotlight Track
  const handleBentoMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  // Copy command code
  const handleCopyCommand = () => {
    navigator.clipboard.writeText('npx create-loom-app@latest workspace');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Multiplayer Diagram Workspace Simulation State Machine Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSimStep(prev => (prev + 1) % 8);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    switch (simStep) {
      case 0:
        setSimCursors({ sarah: { x: 30, y: 160 }, ganesh: { x: 260, y: 180 } });
        setSimNodes({ client: false, database: false, clientActive: false, databaseActive: false });
        setSimLineVisible(false);
        setSimPulseVisible(false);
        break;
      case 1:
        setSimCursors(prev => ({ ...prev, sarah: { x: 60, y: 60 } }));
        break;
      case 2:
        setSimNodes(prev => ({ ...prev, client: true, clientActive: true }));
        setSimCursors(prev => ({ ...prev, sarah: { x: 180, y: 80 } }));
        break;
      case 3:
        setSimCursors(prev => ({ ...prev, ganesh: { x: 230, y: 150 } }));
        break;
      case 4:
        setSimNodes(prev => ({ ...prev, database: true, databaseActive: true }));
        setSimCursors(prev => ({ ...prev, ganesh: { x: 280, y: 80 } }));
        break;
      case 5:
        setSimLineVisible(true);
        break;
      case 6:
        setSimPulseVisible(true);
        break;
      case 7:
        break;
    }
  }, [simStep]);

  const testimonials = [
    {
      name: "Jonah Dubois",
      handle: "@jonahships_",
      avatar: "J",
      text: "Setup @loom yesterday. All I have to say is, wow. I mapped my DB model visually and Loom generated the migration schemas and React flow routes in seconds."
    },
    {
      name: "Aryeh Dubois",
      handle: "@AryehDubois",
      avatar: "A",
      text: "Tried Loom. I tried to build my own visual mockups and compilers before, and I am very impressed how many hard things Loom gets right. Visual connections are awesome."
    },
    {
      name: "Mark Jaquith",
      handle: "@markjaquith",
      avatar: "M",
      text: "I've been saying for like six months that even if LLMs suddenly stopped improving, we could spend years discovering new uses. @loom feels like that kind of 'just had to glue all the parts together' leap."
    },
    {
      name: "Dan Peguine",
      handle: "@danpeguine",
      avatar: "D",
      text: "Why @loom is nuts: your context and code layout designs live on YOUR computer, not a walled garden. Growing community building custom blocks. Context persists 24/7."
    },
    {
      name: "Nate Eliason",
      handle: "@nateliason",
      avatar: "N",
      text: "Yeah this was 1,000% worth it. Separate Claude/Gemini model + Loom, managing visual canvas components I can compile anywhere, autonomously resolving SQL routes."
    },
    {
      name: "Nathan Clark",
      handle: "@nathanclark_",
      avatar: "N",
      text: "A smart compiler with eyes and hands. You message it like a coworker and it draws diagram connections and spins up SQL backends."
    }
  ];

  return (
    <div className={styles.container}>
      {/* Dynamic Blue-Theme Mesh Grid Background */}
      <div className={styles.background}>
        <div className={styles.glow}></div>
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
          <button className={styles.loginBtn} onClick={login}>Sign In</button>
          <button className={styles.getStartedBtn} onClick={enterGuestMode}>Get Started Free</button>
        </div>
      </nav>

      {/* OpenClaw-style Centered Hero Section */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles size={14} />
          <span>AI-Driven Visual Development</span>
        </div>
        <h1 className={styles.heroTitle}>
          Diagram to code. <span className={styles.gradientText}>Instantly.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Weave complex charts directly into React & SQL. Free, fast, and local-first.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.primaryBtn} onClick={enterGuestMode}>
            Start Weaving Code <ArrowRight size={18} />
          </button>
          <button className={styles.secondaryBtn} onClick={login}>
            <Play size={18} /> Sign In
          </button>
        </div>
        
        {/* OpenClaw-Style Installation Code Snippet */}
        <div className={styles.bashCommand} onClick={handleCopyCommand}>
          <code>npx create-loom-app@latest workspace</code>
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
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
            <div className={styles.marqueeItem}><Database size={18} /> PostgreSQL</div>
            <div className={styles.marqueeItem}><Shield size={18} /> OAuth 2.0</div>
            {/* Duplicate for infinite loop effect */}
            <div className={styles.marqueeItem}><Cpu size={18} /> React Framework</div>
            <div className={styles.marqueeItem}><Layers size={18} /> Next.js App Router</div>
            <div className={styles.marqueeItem}><Code size={18} /> TypeScript</div>
            <div className={styles.marqueeItem}><Globe size={18} /> Spring Boot API</div>
            <div className={styles.marqueeItem}><Database size={18} /> PostgreSQL</div>
            <div className={styles.marqueeItem}><Shield size={18} /> OAuth 2.0</div>
          </div>
        </div>
      </section>

      {/* Storyline Timeline: Section 1 - AI Code Generation */}
      <div id="code-generation" className={`${styles.timelineSection} ${styles.reveal}`}>
        <div className={styles.timelineConnector}>
          <div className={styles.timelineDot}><Sparkles size={16} /></div>
          <div className={styles.timelineLine}></div>
        </div>
        <div className={styles.timelineContent}>
          <div className={styles.splitGrid}>
            <div>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Visual Compiler</span>
                <h2 className={styles.sectionTitle}>Design to Code</h2>
              </div>
              
              {/* High Fidelity SVG Diagram showing compiler flow */}
              <div className={styles.svgVisualContainer}>
                <svg className={styles.svgDiagram} viewBox="0 0 400 250">
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#0c8ce9" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                  
                  {/* Flow Lines */}
                  <path d="M 60,120 L 170,120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 5" />
                  <path d="M 230,120 L 320,120" stroke="#0c8ce9" strokeWidth="2" />
                  
                  {/* Glowing pulses */}
                  <circle cx="115" cy="120" r="4" className={styles.pulsePoint}>
                    <animate attributeName="cx" values="60;170" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="275" cy="120" r="4" className={styles.pulsePoint} style={{ fill: '#38bdf8' }}>
                    <animate attributeName="cx" values="230;320" dur="1.5s" repeatCount="indefinite" />
                  </circle>

                  {/* Flow Nodes */}
                  <rect x="20" y="95" width="50" height="50" rx="8" fill="#121620" stroke="rgba(255,255,255,0.08)" />
                  <Cpu x="33" y="108" size="24" color="#38bdf8" />

                  {/* Compiler Engine Node */}
                  <circle cx="200" cy="120" r="30" fill="url(#blueGrad)" className={styles.glowRect} />
                  <Sparkles x="188" y="108" size="24" color="#fff" />

                  {/* Output Node */}
                  <rect x="320" y="95" width="50" height="50" rx="8" fill="#121620" stroke="rgba(255,255,255,0.08)" />
                  <Code x="333" y="108" size="24" color="#10b981" />
                </svg>
              </div>
            </div>
            {/* Live Typing Code Box mockup with Tab Files */}
            <div className={styles.editorMockup}>
              <div className={styles.editorHeader}>
                <div className={styles.editorTabs}>
                  {FILES_TEMPLATES.map((file, idx) => (
                    <button 
                      key={idx} 
                      className={`${styles.tab} ${activeTab === idx ? styles.tabActive : ''}`}
                      onClick={() => selectTab(idx)}
                    >
                      <Code size={10} />
                      {file.name}
                    </button>
                  ))}
                </div>
                <div className={styles.dots} style={{ marginRight: '8px' }}>
                  <span></span><span></span><span></span>
                </div>
              </div>
              <pre className={styles.editorBody}>
                <code>{renderTypedTokens()}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Storyline Timeline: Section 2 - Collaborative Multiplayer */}
      <div id="collaboration" className={`${styles.timelineSection} ${styles.reveal}`}>
        <div className={styles.timelineConnector}>
          <div className={styles.timelineDot}><Users size={16} /></div>
          <div className={styles.timelineLine}></div>
        </div>
        <div className={styles.timelineContent}>
          <div className={`${styles.splitGrid} ${styles.reverseSplit}`}>
            {/* Live Multiplayer Construct Visual */}
            <div className={styles.collabCard}>
              <div className={styles.multiplayerDemo}>
                {/* SVG link line drawn dynamically */}
                <svg className={styles.svgLayer}>
                  {simLineVisible && (
                    <>
                      <path 
                        d="M 130,70 L 220,130" 
                        fill="none" 
                        stroke="rgba(12, 140, 233, 0.4)" 
                        strokeWidth="2" 
                      />
                      <path 
                        d="M 130,70 L 220,130" 
                        fill="none" 
                        stroke="#0c8ce9" 
                        strokeWidth="2" 
                        className={styles.connectionLine}
                      />
                    </>
                  )}
                  {simPulseVisible && (
                    <circle cx="175" cy="100" r="5" fill="#0c8ce9" style={{ filter: 'drop-shadow(0 0 8px #0c8ce9)' }}>
                      <animateMotion dur="1.2s" repeatCount="indefinite" path="M 130,70 L 220,130" />
                    </circle>
                  )}
                </svg>

                {/* Simulated Cursors */}
                <div 
                  className={`${styles.cursor} ${styles.cursor1}`} 
                  style={{ left: `${simCursors.sarah.x}px`, top: `${simCursors.sarah.y}px` }}
                >
                  <MessageSquare size={12} /> Sarah
                </div>
                <div 
                  className={`${styles.cursor} ${styles.cursor2}`} 
                  style={{ left: `${simCursors.ganesh.x}px`, top: `${simCursors.ganesh.y}px` }}
                >
                  <Code size={12} /> Ganesh
                </div>

                {/* Client Node */}
                <div 
                  className={`${styles.simNode} ${simNodes.client ? styles.simNodeActive : ''} ${simNodes.clientActive ? styles.simNodeHighlight : ''}`}
                  style={{ left: '30px', top: '40px' }}
                >
                  <Server size={12} color="#0c8ce9" /> Client.ts
                </div>

                {/* DB Node */}
                <div 
                  className={`${styles.simNode} ${simNodes.database ? styles.simNodeActive : ''} ${simNodes.databaseActive ? styles.simNodeHighlight : ''}`}
                  style={{ left: '210px', top: '120px' }}
                >
                  <Database size={12} color="#10b981" /> Database.sql
                </div>
              </div>
            </div>

            {/* Content on the Right */}
            <div>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>Multiplayer</span>
                <h2 className={styles.sectionTitle}>Realtime Sync</h2>
              </div>
              
              {/* High Fidelity SVG Diagram showing websocket client synchronization */}
              <div className={styles.svgVisualContainer}>
                <svg className={styles.svgDiagram} viewBox="0 0 400 250">
                  {/* Central WS Sync Gateway */}
                  <circle cx="200" cy="120" r="35" fill="none" stroke="#0c8ce9" strokeWidth="2" className={styles.glowRect} />
                  <Globe x="186" y="106" size="28" color="#38bdf8" />
                  
                  {/* Left Client */}
                  <rect x="30" y="90" width="70" height="60" rx="8" fill="#121620" stroke="rgba(255,255,255,0.06)" />
                  <Cpu x="53" y="105" size="24" color="#8b949e" />
                  <text x="65" y="142" fill="#8b949e" fontSize="8" textAnchor="middle">Client A</text>
                  
                  {/* Right Client */}
                  <rect x="300" y="90" width="70" height="60" rx="8" fill="#121620" stroke="rgba(255,255,255,0.06)" />
                  <Cpu x="323" y="105" size="24" color="#8b949e" />
                  <text x="335" y="142" fill="#8b949e" fontSize="8" textAnchor="middle">Client B</text>

                  {/* Sync Arrows */}
                  <path d="M 100,120 L 165,120" stroke="#0c8ce9" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d="M 235,120 L 300,120" stroke="#0c8ce9" strokeWidth="1.5" strokeDasharray="4 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OpenClaw-Style Testimonials Wall */}
      <section className={`${styles.testimonialsSection} ${styles.reveal}`}>
        <h2 className={styles.testimonialsTitle}>Loved by Devs</h2>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((t, idx) => (
            <div key={idx} className={styles.testimonialCard}>
              <div className={styles.tweetHeader}>
                <div className={styles.avatar}>{t.avatar}</div>
                <div className={styles.tweetUser}>
                  <span className={styles.userName}>{t.name}</span>
                  <span className={styles.userHandle}>{t.handle}</span>
                </div>
              </div>
              <p className={styles.tweetBody}>{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className={`${styles.bentoSection} ${styles.reveal}`}>
        <div className={styles.sectionHeader} style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className={styles.sectionTag}>Engineered for Teams</span>
          <h2 className={styles.sectionTitle}>Productivity Kit</h2>
        </div>
        <div className={styles.bentoGrid}>
          {/* Card 1 (Large) */}
          <div 
            ref={el => { cardRefs.current[0] = el; }}
            className={`${styles.bentoCard} ${styles.bentoLarge}`}
            onMouseMove={e => handleBentoMouseMove(e, 0)}
          >
            <div className={styles.bentoSpotlight}></div>
            <div className={styles.bentoGlow}></div>
            <div className={styles.bentoCardIcon}><History size={24} /></div>
            <h3>Rewind</h3>
            <p>Rewind changes instantly.</p>
          </div>
          {/* Card 2 */}
          <div 
            ref={el => { cardRefs.current[1] = el; }}
            className={styles.bentoCard}
            onMouseMove={e => handleBentoMouseMove(e, 1)}
          >
            <div className={styles.bentoSpotlight}></div>
            <div className={styles.bentoGlow}></div>
            <div className={styles.bentoCardIcon}><Keyboard size={24} /></div>
            <h3>Hotkeys</h3>
            <p>Accelerate your workspace.</p>
          </div>
          {/* Card 3 */}
          <div 
            ref={el => { cardRefs.current[2] = el; }}
            className={styles.bentoCard}
            onMouseMove={e => handleBentoMouseMove(e, 2)}
          >
            <div className={styles.bentoSpotlight}></div>
            <div className={styles.bentoGlow}></div>
            <div className={styles.bentoCardIcon}><Layers size={24} /></div>
            <h3>Infinite Spaces</h3>
            <p>Map massive nested schemas.</p>
          </div>
          {/* Card 4 (Large) */}
          <div 
            ref={el => { cardRefs.current[3] = el; }}
            className={`${styles.bentoCard} ${styles.bentoLarge}`}
            onMouseMove={e => handleBentoMouseMove(e, 3)}
          >
            <div className={styles.bentoSpotlight}></div>
            <div className={styles.bentoGlow}></div>
            <div className={styles.bentoCardIcon}><Share2 size={24} /></div>
            <h3>Universal Export</h3>
            <p>Deploy React & SQL.</p>
          </div>
        </div>
      </section>

      {/* CTA Card Section */}
      <section className={`${styles.ctaSection} ${styles.reveal}`}>
        <div className={styles.ctaCard}>
          <div className={styles.logoIcon} style={{ width: '48px', height: '48px', fontSize: '24px' }}>L</div>
          <h2>Ready?</h2>
          <p>
            Weave node models to code. Free Guest Mode.
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
