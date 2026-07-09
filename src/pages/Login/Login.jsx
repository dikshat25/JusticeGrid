import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';
import { Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <motion.div 
          className="login-branding"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Scale size={48} className="brand-icon" />
          <h1>JusticeGrid</h1>
          <p>AI-Powered Legal Intelligence Platform</p>
        </motion.div>
      </div>
      <div className="login-right">
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to your professional dashboard</p>
          
          {error && <div className="login-error">{error}</div>}
          
          <motion.form 
            onSubmit={handleLogin}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="input-group">
              <label className="input-label">Email</label>
              <input 
                type="email" 
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Password</label>
              <input 
                type="password" 
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            
            <div className="login-actions">
              <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Login'}
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <Link to="/signup" className="btn-link">Create Account</Link>
                <button type="button" className="btn btn-link">Forgot Password?</button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
