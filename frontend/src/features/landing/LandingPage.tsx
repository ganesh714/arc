import styles from './LandingPage.module.css';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Code, Zap, Globe, Sparkles } from 'lucide-react';

export function LandingPage() {
  const { login, enterGuestMode } = useAuth();

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
          <a href="#how-it-works">How it works</a>
          <button className={styles.loginBtn} onClick={login}>Sign In</button>
          <button className={styles.getStartedBtn} onClick={enterGuestMode}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            <span>Powered by Advanced AI</span>
          </div>
          <h1 className={styles.heroTitle}>
            Where <span className={styles.gradientText}>Diagrams</span> become <br /> 
            Production <span className={styles.gradientText}>Code</span>.
          </h1>
          <p className={styles.heroSubtitle}>
            The professional node-based modeling tool that weaves visual logic into 
            responsive React, Angular, and Vanilla components instantly. Join the next generation of developers.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryBtn} onClick={enterGuestMode}>
              Start Building Now <ArrowRight size={18} />
            </button>
            <button className={styles.secondaryBtn}>
              <Code size={18} /> View on GitHub
            </button>
          </div>
        </div>

        {/* Mockup Preview / Visuals */}
        <div className={styles.heroVisual}>
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

      {/* Features Grid */}
      <section id="features" className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Code size={24} /></div>
          <h3>Multi-Framework Support</h3>
          <p>Export to React, Angular, or Vanilla JS with optimized, clean code structure. Say goodbye to boilerplate.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Zap size={24} /></div>
          <h3>Instant AI Generation</h3>
          <p>Our internal AI module understands your visual logic and generates flawless frontend components in seconds.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Globe size={24} /></div>
          <h3>Cloud Native</h3>
          <p>Access your diagrams from anywhere. Real-time collaborative features built right into the platform for elite teams.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© 2026 Loom by Neuarc. Built for the next generation of developers.</p>
      </footer>
    </div>
  );
}
