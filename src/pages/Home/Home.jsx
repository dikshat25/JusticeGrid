import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ShieldAlert, BrainCircuit, Users, FileText, ArrowRight, Gavel, Cpu, BookOpen, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Home.css';

const Home = () => {
  const { scrollYProgress } = useScroll();
  
  // Massive Gavel Parallax
  const gavelY = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const gavelRotate = useTransform(scrollYProgress, [0, 1], [-10, 15]);
  const gavelScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);
  
  // Hero Text Parallax
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="home-container">
      
      {/* 
        ========================================
        DARK PREMIUM HERO WRAPPER
        ========================================
      */}
      <div className="hero-wrapper">
        {/* Giant Cinematic Background Gavel */}
        <motion.div 
          className="cinematic-gavel-bg"
          style={{ y: gavelY, rotate: gavelRotate, scale: gavelScale }}
        >
          <img src="/light-gavel.png" alt="Cinematic Gavel" />
        </motion.div>

        {/* Ambient Glowing Orbs */}
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>

        {/* Header (White text over dark background) */}
        <header className="home-header">
          <div className="home-logo">
            <Scale size={28} className="brand-icon-header" />
            <span className="logo-text">JusticeGrid</span>
          </div>
          <nav className="home-nav">
            <Link to="/login" className="btn btn-outline">Sign In</Link>
            <Link to="/signup" className="btn btn-primary glow-btn">Sign Up</Link>
          </nav>
        </header>

        {/* Hero Content */}
        <main className="hero-main-content">
          <motion.div 
            className="hero-content"
            style={{ y: textY, opacity: textOpacity }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.4, type: "spring" }}
              className="badge hero-badge-glass"
            >
              <div className="pulse-dot"></div>
              Next-Gen Enterprise Legal Tech
            </motion.div>
            
            <h1 className="hero-title">
              AI-Powered Judicial <br/>
              <span className="text-gradient">Decision Support</span>
            </h1>
            
            <p className="hero-subtitle">
              Transforming case management with deterministic legal math, multi-agent LLM analysis, and real-time synchronized dashboards for courts and families.
            </p>
            
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary hero-btn glow-btn">Explore Platform</Link>
              <Link to="/login" className="btn btn-outline hero-btn">Lawyer Login</Link>
            </div>
          </motion.div>

          <motion.div 
            className="scroll-indicator"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span>Scroll to Discover</span>
            <ChevronDown size={24} />
          </motion.div>
        </main>
      </div>

      {/* 
        ========================================
        LIGHT PREMIUM CONTENT WRAPPER
        ========================================
      */}
      <div className="content-wrapper">
        
        {/* WORKFLOW SECTION */}
        <section className="workflow-section">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            className="section-title"
          >
            How <span className="text-gradient">JusticeGrid</span> Works
          </motion.h2>
          
          <div className="workflow-diagram">
            <motion.div className="flow-step glass-card" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <div className="flow-icon pulse-hover"><Users size={32} /></div>
              <h4>1. Case Intake</h4>
              <p>Lawyers securely upload FIRs & track families.</p>
            </motion.div>
            
            <ArrowRight className="flow-arrow" />
            
            <motion.div className="flow-step glass-card" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="flow-icon pulse-hover"><Cpu size={32} /></div>
              <h4>2. AI Courtroom</h4>
              <p>Specialist agents analyze the case live.</p>
            </motion.div>
            
            <ArrowRight className="flow-arrow" />
            
            <motion.div className="flow-step glass-card" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="flow-icon pulse-hover"><Gavel size={32} /></div>
              <h4>3. Judge Node</h4>
              <p>Deterministic ruling generated seamlessly.</p>
            </motion.div>
            
            <ArrowRight className="flow-arrow" />
            
            <motion.div className="flow-step glass-card" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <div className="flow-icon pulse-hover"><FileText size={32} /></div>
              <h4>4. Legal Report</h4>
              <p>PDF transcript stamped for official use.</p>
            </motion.div>
          </div>
        </section>

        {/* ARCHITECTURE SECTION */}
        <section className="architecture-section">
          <motion.div 
            className="arch-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2>Powered by <span className="text-gradient">LangGraph</span> Architecture</h2>
            <p className="arch-desc">
              JusticeGrid doesn't rely on a single, hallucination-prone model. We deploy a structured DAG (Directed Acyclic Graph) of narrow, specialist AI agents. 
            </p>
            <p className="arch-desc">
              The Eligibility Agent calculates hard Section 436A CrPC limits using Python logic—not an LLM. 
              The Intake, Strategy, and Financial agents merely deliberate within those deterministic guardrails.
            </p>
            <ul className="arch-features">
              <li>
                <div className="feature-check"><CheckCircleIcon /></div> 
                <span>Deterministic Math (Days Served)</span>
              </li>
              <li>
                <div className="feature-check"><CheckCircleIcon /></div> 
                <span>Provider Failover (Groq, OpenRouter, Gemini)</span>
              </li>
              <li>
                <div className="feature-check"><CheckCircleIcon /></div> 
                <span>Real-time WebSocket Streaming</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className="arch-visual glass-panel"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="graph-bg-glow"></div>
            <div className="graph-node top-node float-anim">Intake Node</div>
            <div className="graph-split">
              <div className="graph-node float-anim" style={{animationDelay: '0.2s'}}>Eligibility</div>
              <div className="graph-node float-anim" style={{animationDelay: '0.4s'}}>Delay</div>
              <div className="graph-node float-anim" style={{animationDelay: '0.6s'}}>Financial</div>
            </div>
            <div className="graph-node bottom-node float-anim" style={{animationDelay: '0.8s'}}>Merge & Judge Node</div>
          </motion.div>
        </section>

        {/* FEATURES SECTION */}
        <section className="features-section">
          <h2 className="section-title">Core <span className="text-gradient">Capabilities</span></h2>
          <div className="features-grid">
            <motion.div className="feature-card glass-card hover-lift" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="feature-icon-wrapper">
                <BrainCircuit size={32} />
              </div>
              <h3>Multi-Agent AI Analysis</h3>
              <p>Watch five distinct AI entities debate bail strategy, financial feasibility, and procedural delays in a simulated courtroom.</p>
            </motion.div>
            
            <motion.div className="feature-card glass-card hover-lift" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="feature-icon-wrapper">
                <ShieldAlert size={32} />
              </div>
              <h3>Global Real-Time Sync</h3>
              <p>Powered by Firestore, every dashboard, notification, and timeline updates instantly across Lawyer and Family portals without refreshing.</p>
            </motion.div>
            
            <motion.div className="feature-card glass-card hover-lift" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="feature-icon-wrapper">
                <BookOpen size={32} />
              </div>
              <h3>Automated Family Updates</h3>
              <p>Stop fielding phone calls. Families log in to track their own case, with AI translating legal jargon into plain English, Hindi, or Marathi.</p>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Public Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Scale size={24} className="brand-icon-footer" />
            <span>JusticeGrid</span>
          </div>
          <div className="footer-links">
            <span className="hover-underline">About Us</span>
            <span className="hover-underline">Security</span>
            <span className="hover-underline">API Docs</span>
            <span className="hover-underline">Contact</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JusticeGrid. All rights reserved for judicial production.</p>
        </div>
      </footer>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default Home;
