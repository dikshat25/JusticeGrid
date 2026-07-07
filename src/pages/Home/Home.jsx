import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ShieldAlert, BrainCircuit, Users, FileText, ArrowRight, Gavel, Cpu, BookOpen } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Home.css';

const ParallaxIcon = ({ icon: Icon, delay, initialX, initialY, duration, size, color = 'rgba(107, 79, 58, 0.05)' }) => (
  <motion.div
    className="parallax-icon"
    initial={{ left: initialX, top: initialY, opacity: 0 }}
    animate={{ 
      top: [initialY, `calc(${initialY} - 40px)`, initialY],
      opacity: [1, 1, 1],
      rotate: [0, 10, -10, 0]
    }}
    transition={{ 
      duration: duration, 
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
  >
    <Icon size={size} color={color} />
  </motion.div>
);

const Home = () => {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  
  return (
    <div className="home-container">
      {/* Cinematic Animated Background */}
      <div className="cinematic-bg">
        <ParallaxIcon icon={Scale} delay={0} initialX="15%" initialY="20%" duration={12} size={150} />
        <ParallaxIcon icon={Gavel} delay={3} initialX="80%" initialY="40%" duration={15} size={120} />
        <ParallaxIcon icon={FileText} delay={1} initialX="60%" initialY="70%" duration={18} size={90} />
        <ParallaxIcon icon={BrainCircuit} delay={5} initialX="10%" initialY="80%" duration={14} size={200} />
      </div>

      {/* Public Header */}
      <header className="home-header">
        <div className="home-logo">
          <Scale size={28} className="brand-icon-header" />
          <span>JusticeGrid</span>
        </div>
        <nav className="home-nav">
          <Link to="/login" className="btn btn-outline">Sign In</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
        </nav>
      </header>

      <main className="home-main">
        {/* HERO SECTION */}
        <section className="hero-section">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ y: yHero }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.3 }}
              className="badge badge-eligible hero-badge"
            >
              Enterprise Legal Tech
            </motion.div>
            <h1 className="hero-title">AI-Powered Judicial Decision Support Platform</h1>
            <p className="hero-subtitle">
              Transforming case management with deterministic legal math, multi-agent LLM analysis, and real-time synchronized dashboards for courts and families.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary hero-btn">Explore Platform</Link>
              <Link to="/login" className="btn btn-outline hero-btn">Lawyer Login</Link>
            </div>
          </motion.div>
        </section>

        {/* WORKFLOW SECTION */}
        <section className="workflow-section">
          <motion.h2 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="section-title"
          >
            How JusticeGrid Works
          </motion.h2>
          
          <div className="workflow-diagram">
            <motion.div className="flow-step" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flow-icon"><Users size={32} /></div>
              <h4>1. Case Intake</h4>
              <p>Lawyers upload FIRs and track families.</p>
            </motion.div>
            <ArrowRight className="flow-arrow" />
            <motion.div className="flow-step" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="flow-icon"><Cpu size={32} /></div>
              <h4>2. AI Courtroom</h4>
              <p>Specialist agents analyze the case live.</p>
            </motion.div>
            <ArrowRight className="flow-arrow" />
            <motion.div className="flow-step" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
              <div className="flow-icon"><Gavel size={32} /></div>
              <h4>3. Judge Node</h4>
              <p>Deterministic ruling generated.</p>
            </motion.div>
            <ArrowRight className="flow-arrow" />
            <motion.div className="flow-step" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
              <div className="flow-icon"><FileText size={32} /></div>
              <h4>4. Legal Report</h4>
              <p>PDF transcript stamped for official use.</p>
            </motion.div>
          </div>
        </section>

        {/* ARCHITECTURE SECTION */}
        <section className="architecture-section">
          <div className="arch-content">
            <h2>Powered by LangGraph Architecture</h2>
            <p>
              JusticeGrid doesn't rely on a single, hallucination-prone model. We deploy a structured DAG (Directed Acyclic Graph) of narrow, specialist AI agents. 
              The Eligibility Agent calculates hard Section 436A CrPC limits using Python logic—not an LLM. 
              The Intake, Strategy, and Financial agents merely deliberate within those deterministic guardrails.
            </p>
            <ul className="arch-features">
              <li><CheckCircleIcon /> Deterministic Math (Days Served)</li>
              <li><CheckCircleIcon /> Provider Failover (Groq, OpenRouter, Gemini)</li>
              <li><CheckCircleIcon /> Real-time WebSocket Streaming</li>
            </ul>
          </div>
          <div className="arch-visual">
            <div className="graph-node top-node">Intake Node</div>
            <div className="graph-split">
              <div className="graph-node">Eligibility</div>
              <div className="graph-node">Delay</div>
              <div className="graph-node">Financial</div>
            </div>
            <div className="graph-node bottom-node">Merge & Judge Node</div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="features-section">
          <h2 className="section-title">Core Capabilities</h2>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon"><BrainCircuit size={32} /></div>
              <h3>Multi-Agent AI Analysis</h3>
              <p>Watch five distinct AI entities debate bail strategy, financial feasibility, and procedural delays in a simulated courtroom.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon"><ShieldAlert size={32} /></div>
              <h3>Global Real-Time Sync</h3>
              <p>Powered by Firestore, every dashboard, notification, and timeline updates instantly across Lawyer and Family portals without refreshing.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon"><BookOpen size={32} /></div>
              <h3>Automated Family Updates</h3>
              <p>Stop fielding phone calls. Families log in to track their own case, with AI translating legal jargon into plain English, Hindi, or Marathi.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Scale size={24} className="brand-icon-footer" />
            <span>JusticeGrid</span>
          </div>
          <div className="footer-links">
            <span>About Us</span>
            <span>Security</span>
            <span>API Docs</span>
            <span>Contact</span>
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-brown)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default Home;
