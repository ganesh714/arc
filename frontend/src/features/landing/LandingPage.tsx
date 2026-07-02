import { useState, useEffect, useRef } from 'react';
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
  Share2,
  Database,
  Server
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
      { text: '"border border-purple-500 bg-gray-900"', type: 'str' },
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
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  
  // Code Editor typing states
  const [activeTab, setActiveTab] = useState(0);
  const [typedCharsCount, setTypedCharsCount] = useState(0);
  
  // HTML5 Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bento Cards Spotlights
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

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

  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

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

  // HTML5 Premium Particle/Galaxy Background Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulseSpeed: number;
    }> = [];

    // Initialize particles (stars)
    const particleCount = Math.min(Math.floor(width / 16), 110);
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005
      });
    }

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Gently pulse alpha
        p.alpha += p.pulseSpeed;
        if (p.alpha > 0.8 || p.alpha < 0.2) {
          p.pulseSpeed = -p.pulseSpeed;
        }

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha * 0.45})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#8b5cf6';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Connect nearby particles with glowing filaments
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Draw connections to mouse cursor with gravitation effect
        const mouseDist = Math.hypot(p.x - mouseX, p.y - mouseY);
        if (mouseDist < 200) {
          // Subtle gravitational attraction
          p.x += (mouseX - p.x) * 0.003;
          p.y += (mouseY - p.y) * 0.003;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.22 * (1 - mouseDist / 200)})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
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
        // Fully typed token
        renderedSpans.push(
          <span key={i} className={styles[t.type] || ''}>
            {t.text}
          </span>
        );
        charAccumulator += t.text.length;
      } else {
        // Partially typed token
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
        // Reset
        setSimCursors({ sarah: { x: 30, y: 160 }, ganesh: { x: 260, y: 180 } });
        setSimNodes({ client: false, database: false, clientActive: false, databaseActive: false });
        setSimLineVisible(false);
        setSimPulseVisible(false);
        break;
      case 1:
        // Sarah moves to click/spawn client node
        setSimCursors(prev => ({ ...prev, sarah: { x: 60, y: 60 } }));
        break;
      case 2:
        // Client node appears, Sarah moves away
        setSimNodes(prev => ({ ...prev, client: true, clientActive: true }));
        setSimCursors(prev => ({ ...prev, sarah: { x: 180, y: 80 } }));
        break;
      case 3:
        // Ganesh moves to click/spawn db node
        setSimCursors(prev => ({ ...prev, ganesh: { x: 230, y: 150 } }));
        break;
      case 4:
        // Database node appears
        setSimNodes(prev => ({ ...prev, database: true, databaseActive: true }));
        setSimCursors(prev => ({ ...prev, ganesh: { x: 280, y: 80 } }));
        break;
      case 5:
        // Connecting line draws between client and db node
        setSimLineVisible(true);
        break;
      case 6:
        // Pulse signal fires down the path
        setSimPulseVisible(true);
        break;
      case 7:
        // Idle showing finished layout
        break;
    }
  }, [simStep]);

  return (
    <div className={styles.container}>
      {/* Dynamic Interactive Background */}
      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} className={styles.canvas} />
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

        {/* High-Fidelity Active Diagram Mockup Visual */}
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
                {/* SVG Connecting Path Layer */}
                <svg className={styles.svgLayer}>
                  <path 
                    d="M 180,85 C 240,85 240,215 320,215" 
                    fill="none" 
                    stroke="rgba(139, 92, 246, 0.4)" 
                    strokeWidth="2" 
                  />
                  <path 
                    d="M 180,85 C 240,85 240,215 320,215" 
                    fill="none" 
                    stroke="#a78bfa" 
                    strokeWidth="2" 
                    className={styles.connectionLine}
                  />
                </svg>

                {/* Node Card 1 */}
                <div className={`${styles.nodeCard} ${styles.nodeCardActive} ${styles.nodeCard1}`}>
                  <div className={styles.nodeHeader}>
                    <Server size={14} className={styles.nodeIcon} />
                    <span className={styles.nodeTitle}>AuthGateway</span>
                  </div>
                  <div className={styles.nodeBody}>
                    <div className={styles.nodeRow}>
                      <span>Provider</span>
                      <span style={{ color: '#a78bfa' }}>OAuth 2.0</span>
                    </div>
                    <div className={styles.nodeRow}>
                      <span>Type</span>
                      <span>Security</span>
                    </div>
                  </div>
                  <div className={`${styles.nodePin} ${styles.nodePinRight}`}></div>
                </div>

                {/* Node Card 2 */}
                <div className={`${styles.nodeCard} ${styles.nodeCard2}`}>
                  <div className={styles.nodeHeader}>
                    <Database size={14} className={styles.nodeIcon} style={{ color: '#38bdf8' }} />
                    <span className={styles.nodeTitle}>UserDatabase</span>
                  </div>
                  <div className={styles.nodeBody}>
                    <div className={styles.nodeRow}>
                      <span>Postgres</span>
                      <span style={{ color: '#38bdf8' }}>v16.2</span>
                    </div>
                    <div className={styles.nodeRow}>
                      <span>Status</span>
                      <span style={{ color: '#10b981' }}>Healthy</span>
                    </div>
                  </div>
                  <div className={`${styles.nodePin} ${styles.nodePinLeft}`}></div>
                </div>
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

      {/* Storyline Timeline: Section 2 - Collaborative Multiplayer (REVERSED COLUMNS) */}
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
                        stroke="rgba(16, 185, 129, 0.4)" 
                        strokeWidth="2" 
                      />
                      <path 
                        d="M 130,70 L 220,130" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2" 
                        className={styles.connectionLine}
                      />
                    </>
                  )}
                  {simPulseVisible && (
                    <circle cx="175" cy="100" r="5" fill="#10b981" style={{ filter: 'drop-shadow(0 0 8px #10b981)' }}>
                      <animateMotion dur="1.2s" repeatCount="indefinite" path="M 130,70 L 220,130" />
                    </circle>
                  )}
                </svg>

                {/* Simulated Cursors */}
                <div 
                  className={`${styles.cursor} ${styles.cursor1}`} 
                  style={{ left: `${simCursors.sarah.x}px`, top: `${simCursors.sarah.y}px` }}
                >
                  <MessageSquare size={12} /> Sarah (UX Architect)
                </div>
                <div 
                  className={`${styles.cursor} ${styles.cursor2}`} 
                  style={{ left: `${simCursors.ganesh.x}px`, top: `${simCursors.ganesh.y}px` }}
                >
                  <Code size={12} /> Ganesh (Backend Dev)
                </div>

                {/* Client Node */}
                <div 
                  className={`${styles.simNode} ${simNodes.client ? styles.simNodeActive : ''} ${simNodes.clientActive ? styles.simNodeHighlight : ''}`}
                  style={{ left: '30px', top: '40px' }}
                >
                  <Server size={12} color="#f43f5e" /> Client.ts
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
      <section id="features" className={`${styles.bentoSection} ${styles.reveal}`}>
        <div className={styles.sectionHeader} style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className={styles.sectionTag}>Productivity Kit</span>
          <h2 className={styles.sectionTitle}>Engineered for Modern Teams</h2>
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
            <h3>Historical Reversions</h3>
            <p>Full undo/redo stack allows developers to rewind through layout variations and canvas edits safely, ensuring you never lose code changes.</p>
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
            <h3>Keyboard Hotkeys</h3>
            <p>Speed up layout modeling with custom keyboard shortcuts for shapes, lines, grouping, and layer order.</p>
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
            <h3>Infinite Canvas</h3>
            <p>Model complex architectures with nested schemas, modular frames, and sub-systems on a smooth zooming grid.</p>
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
            <h3>Multi-framework Exports</h3>
            <p>One-click code compile outputs clean, typed modules for React, Next.js routes, or raw DDL SQL code schemas natively.</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section (New styled Cards) */}
      <section id="faq" className={`${styles.faqSection} ${styles.reveal}`}>
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
      <section className={`${styles.ctaSection} ${styles.reveal}`}>
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
