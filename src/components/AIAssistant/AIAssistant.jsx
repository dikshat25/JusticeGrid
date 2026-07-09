import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, X, Send, Loader2, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AIAssistant.css';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { userData } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  
  const userRole = userData?.role || 'guest';
  const currentPage = location.pathname;
  
  // Extract caseId from URL if we are on a case details page
  const caseIdMatch = currentPage.match(/\/cases\/([a-zA-Z0-9_-]+)$/);
  const caseId = caseIdMatch ? caseIdMatch[1] : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const getSuggestedPrompts = () => {
    if (userRole === 'family') {
      return [
        "Explain today's AI verdict",
        "What documents are needed for bail?",
        "How do I upload an FIR?"
      ];
    } else if (userRole === 'lawyer') {
      return [
        "Explain the Eligibility Agent",
        "What is Section 479 BNSS?",
        "What should I do next in this case?"
      ];
    } else if (userRole === 'admin') {
      return [
        "Explain system health metrics",
        "What models are currently active?",
        "How are API calls tracked?"
      ];
    }
    return ["What is JusticeGrid?"];
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMsg = { role: 'user', content: text };
    const currentMessages = [...messages, newMsg];
    
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          context: {
            user_role: userRole,
            current_page: currentPage,
            case_id: caseId !== 'new' ? caseId : null
          }
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting to the JusticeGrid servers right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content) => {
    // Basic formatting for newlines and bold text
    return content.split('\n').map((line, i) => {
      // Bold text handling **text**
      const boldParts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return <span key={i}>{boldParts}<br/></span>;
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button 
        className="ai-chat-toggle"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? 50 : 0, pointerEvents: isOpen ? 'none' : 'auto' }}
      >
        <Gavel size={24} />
      </motion.button>

      {/* Slide-out Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ai-chat-drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="ai-chat-header">
              <div className="ai-chat-header-title">
                <Gavel size={20} color="var(--accent-brown)" />
                <div>
                  <h3>JusticeGrid Legal Assistant</h3>
                  <span className="ai-chat-subtitle">Context: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
                </div>
              </div>
              <button className="ai-chat-close" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="ai-chat-messages">
              {messages.length === 0 ? (
                <div className="ai-chat-empty">
                  <Gavel size={48} color="rgba(107, 79, 58, 0.2)" style={{ marginBottom: '1rem' }} />
                  <h4>How can I help you?</h4>
                  <p>I can explain AI verdicts, legal terms, and guide you through JusticeGrid.</p>
                  
                  <div className="ai-chat-suggestions">
                    {getSuggestedPrompts().map((prompt, idx) => (
                      <button 
                        key={idx} 
                        className="ai-chat-suggestion-btn"
                        onClick={() => handleSend(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`ai-chat-msg-row ${msg.role}`}>
                    <div className="ai-chat-msg-bubble">
                      {formatMessage(msg.content)}
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="ai-chat-msg-row assistant">
                  <div className="ai-chat-msg-bubble typing">
                    <Loader2 size={16} className="spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="ai-chat-input-area">
              <input 
                type="text" 
                placeholder="Ask about JusticeGrid..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
              />
              <button 
                className="ai-chat-send-btn" 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </div>
            <div className="ai-chat-disclaimer">
              AI responses are for guidance only. Not official legal advice.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
