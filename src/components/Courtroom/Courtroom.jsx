import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Users, User, ShieldAlert, Gavel } from 'lucide-react';
import './Courtroom.css';

const fallbackEmojis = {
  'Judge': '👨‍⚖️', 'Intake Agent': '📋', 'Eligibility Agent': '⚖️',
  'Delay Agent': '⏳', 'Financial Agent': '💰', 'Strategy Agent': '♟️',
  'Final Report Generator': '📄'
};

const Courtroom = ({ caseId, onAnalysisComplete }) => {
  const [status, setStatus] = useState('connecting');
  const [transcript, setTranscript] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [progressMsg, setProgressMsg] = useState('Initializing Court...');
  const [showVerdict, setShowVerdict] = useState(false);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    let ws;
    let isMounted = true;

    const connect = async () => {
      try {
        setStatus('connecting');
        const res = await fetch('http://127.0.0.1:8000/api/v1/analyze-case', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ case_id: caseId, document_urls: [] })
        });
        
        if (!res.ok) throw new Error('Failed to start analysis');

        ws = new WebSocket(`ws://127.0.0.1:8000/api/v1/ws/${caseId}`);
        
        ws.onopen = () => {
          if (isMounted) setStatus('active');
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          const data = JSON.parse(event.data);
          
          if (data.type === 'CaseAnalysisStarted') {
            setProgressMsg('Court in Session. Calling Intake Agent...');
            setTranscript(prev => [...prev, { type: 'system', message: 'The court is now in session. Case analysis initialized.', time: new Date().toLocaleTimeString() }]);
          } else if (data.type === 'AgentCompleted') {
            const payload = data.data;
            setActiveAgent(payload.speaker);
            setProgressMsg(`Listening to ${payload.speaker}...`);
            setTranscript(prev => [...prev, { ...payload, type: 'agent', time: new Date().toLocaleTimeString() }]);
          } else if (data.type === 'CaseAnalysisCompleted') {
            setStatus('completed');
            setActiveAgent('Judge');
            setProgressMsg('Judge Deliberating... Verdict Reached.');
            setShowVerdict(true);
            setTranscript(prev => [...prev, { type: 'system', message: 'The court is adjourned. Final verdict recorded.', time: new Date().toLocaleTimeString() }]);
            if (onAnalysisComplete) {
              setTimeout(() => onAnalysisComplete(), 4000);
            }
          }
        };

        ws.onerror = (e) => {
          if (isMounted) {
            setProgressMsg('Connection error occurred.');
            setStatus('error');
          }
        };

        ws.onclose = () => {
          if (isMounted && status !== 'completed') {
            setStatus('closed');
          }
        };
      } catch (err) {
        if (isMounted) {
          setProgressMsg(err.message);
          setStatus('error');
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (ws) ws.close();
    };
  }, [caseId]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const renderConfidenceBars = (score) => {
    const numFilled = Math.round((score / 100) * 5);
    const label = score >= 85 ? 'High' : (score >= 60 ? 'Medium' : 'Low');
    const bars = '■'.repeat(numFilled) + '□'.repeat(5 - numFilled);
    return (
      <span className="confidence-bars" title={`${score}% Confidence`}>
        {bars} <span className={`conf-label conf-${label.toLowerCase()}`}>{label}</span>
      </span>
    );
  };

  const agents = ['Intake Agent', 'Eligibility Agent', 'Strategy Agent', 'Delay Agent', 'Financial Agent'];

  return (
    <div className="courtroom-container">
      <div className="courtroom-header">
        <Scale size={24} className="courtroom-icon" />
        <div className="header-text">
          <h2>Live AI Courtroom</h2>
          <p className="progress-msg">{progressMsg}</p>
        </div>
      </div>

      <div className="courtroom-3d-area">
        {/* Cinematic Background */}
        <div className="court-wall">
          <div className="court-pillar left"></div>
          <div className="court-emblem"><Scale size={48} color="rgba(107, 79, 58, 0.2)" /></div>
          <div className="court-pillar right"></div>
        </div>

        {/* Top Tier: Judge Bench */}
        <div className="tier judge-tier">
          <div className={`agent-pod judge-pod ${activeAgent === 'Judge' ? 'active pulse' : ''} ${showVerdict ? 'gavel-slam' : ''}`}>
            <div className="agent-avatar">{fallbackEmojis['Judge']}</div>
            <div className="agent-name">Hon. AI Judge</div>
            <AnimatePresence>
              {showVerdict && (
                 <motion.div className="chat-bubble" initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}}>
                   <strong>Verdict Reached</strong><br/>
                   Case Adjourned. Generating Report.
                 </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="judge-desk"></div>
        </div>

        {/* Middle Tier: Stakeholders */}
        <div className="tier middle-tier">
          <div className="stakeholder-pod">
            <User size={24} />
            <span>Defense Lawyer</span>
          </div>
          <div className="stakeholder-pod">
            <ShieldAlert size={24} />
            <span>Undertrial</span>
          </div>
          <div className="stakeholder-pod">
            <Users size={24} />
            <span>Family</span>
          </div>
        </div>

        {/* Bottom Tier: Specialists */}
        <div className="tier specialists-tier">
          {agents.map((agentName) => {
            const isActive = activeAgent === agentName;
            const hasSpoken = transcript.some(t => t.speaker === agentName);
            const recentMsg = transcript.slice().reverse().find(t => t.speaker === agentName);

            return (
              <div 
                key={agentName}
                className={`agent-pod specialist-pod ${isActive ? 'active speaking' : 'dimmed'} ${hasSpoken ? 'spoken' : ''}`}
              >
                <div className="agent-avatar">{fallbackEmojis[agentName] || '👤'}</div>
                <div className="agent-name">{agentName.replace(' Agent', '')}</div>
                
                <AnimatePresence>
                  {isActive && recentMsg && (
                    <motion.div 
                      className="chat-bubble up-bubble"
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <div className="chat-content">
                        {recentMsg.finding && <strong>{recentMsg.finding}</strong>}
                        <p>{recentMsg.message.substring(0, 80)}...</p>
                        <div className="chat-meta">
                          {renderConfidenceBars(recentMsg.confidence)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="courtroom-live-transcript">
        <h3>Official Court Transcript</h3>
        <div className="transcript-scroll">
          {transcript.map((msg, idx) => (
            <div key={idx} className={`transcript-line ${msg.type}`}>
              <span className="time">{msg.time}</span>
              {msg.type === 'system' ? (
                <span className="sys-msg">{msg.message}</span>
              ) : (
                <>
                  <strong className="speaker">{msg.speaker}:</strong>
                  <span className="content">{msg.finding || msg.recommendation || msg.message}</span>
                </>
              )}
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
};

export default Courtroom;
