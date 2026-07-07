import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../../services/authService';
import { Scale } from 'lucide-react';
import '../Login/Login.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('lawyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signUp(email, password, name, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-branding">
          <Scale size={48} className="brand-icon" />
          <h1>JusticeGrid</h1>
          <p>Join the future of Legal Intelligence</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2>Create Account</h2>
          <p className="login-subtitle">Register to access the platform</p>
          
          {error && <div className="login-error">{error}</div>}
          
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>

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
                minLength="6"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Role</label>
              <select 
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="lawyer">Lawyer / Legal Professional</option>
                <option value="family">Undertrial Family Member</option>
              </select>
            </div>
            
            <div className="login-actions">
              <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
              <Link to="/login" className="btn-link" style={{ marginTop: '0.5rem', display: 'block', textAlign: 'center' }}>
                Already have an account? Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
