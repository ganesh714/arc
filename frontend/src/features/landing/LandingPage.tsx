import styles from './LandingPage.module.css';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Code, Zap, Globe, Github, Sparkles } from 'lucide-react';

export function LandingPage() {
  const { login } = useAuth();

  return (
    <div className={styles.container}>
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
          <button className={styles.getStartedBtn} onClick={login}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles size={14} />
          <span>Powered by Advanced AI</span>
        </div>
        <h1 className={styles.heroTitle}>
          Turn your <span className={styles.gradientText}>Diagrams</span> into <br /> 
          Production-Ready <span className={styles.gradientText}>Code</span>
        </h1>
        <p className={styles.heroSubtitle}>
          The professional node-based modeling tool that weaves visual logic into 
          responsive React, Angular, and Vanilla components instantly.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.primaryBtn} onClick={login}>
            Start Building Now <ArrowRight size={18} />
          </button>
          <button className={styles.secondaryBtn}>
            <Github size={18} /> View on GitHub
          </button>
        </div>

        {/* Mockup Preview */}
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
              <div className={styles.nodeMockup}></div>
              <div className={styles.nodeMockup2}></div>
              <div className={styles.arrowMockup}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Code /></div>
          <h3>Multi-Framework Support</h3>
          <p>Export to React, Angular, or Vanilla JS with optimized, clean code structure.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Zap /></div>
          <h3>Instant AI Generation</h3>
          <p>Our internal AI module understands your visual logic and generates components in seconds.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.iconBox}><Globe /></div>
          <h3>Cloud Native</h3>
          <p>Access your diagrams from anywhere. Collaborative features built-in for teams.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© 2026 Loom by Neuarc. Built for the next generation of developers.</p>
      </footer>
    </div>
  );
}
