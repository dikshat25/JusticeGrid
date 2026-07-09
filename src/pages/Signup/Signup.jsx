import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../../services/authService';
import { Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import '../Login/Login.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'lawyer',
    phone: '',
    relationship: '',
    undertrialName: '',
    prisonId: '',
    aadhaar: '',
    city: '',
    state: '',
    barCouncilId: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signUp(formData);
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
        <motion.div 
          className="login-branding"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Scale size={48} className="brand-icon" />
          <h1>JusticeGrid</h1>
          <p>Complete Case Management Platform</p>
        </motion.div>
      </div>
      <div className="login-right" style={{ overflowY: 'auto', padding: '2rem' }}>
        <motion.div 
          className="login-card" 
          style={{ maxWidth: '500px', margin: 'auto' }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <h2>Create Account</h2>
          <p className="login-subtitle">Register to access the platform</p>
          
          {error && <div className="login-error">{error}</div>}
          
          <motion.form 
            onSubmit={handleSignup}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="input-group">
              <label className="input-label">Role</label>
              <select className="input-field" name="role" value={formData.role} onChange={handleInputChange}>
                <option value="lawyer">Lawyer / Legal Professional</option>
                <option value="family">Undertrial Family Member</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input type="tel" className="input-field" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" className="input-field" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" className="input-field" name="password" value={formData.password} onChange={handleInputChange} required minLength="6" />
            </div>

            {formData.role === 'lawyer' && (
              <div className="input-group">
                <label className="input-label">Bar Council ID (Optional)</label>
                <input type="text" className="input-field" name="barCouncilId" value={formData.barCouncilId} onChange={handleInputChange} />
              </div>
            )}

            {formData.role === 'family' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Relationship to Undertrial</label>
                    <select className="input-field" name="relationship" value={formData.relationship} onChange={handleInputChange} required>
                      <option value="">Select...</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Undertrial Name</label>
                    <input type="text" className="input-field" name="undertrialName" value={formData.undertrialName} onChange={handleInputChange} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">City</label>
                    <input type="text" className="input-field" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">State</label>
                    <input type="text" className="input-field" name="state" value={formData.state} onChange={handleInputChange} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Prison ID (Optional)</label>
                    <input type="text" className="input-field" name="prisonId" value={formData.prisonId} onChange={handleInputChange} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Aadhaar (Optional)</label>
                    <input type="text" className="input-field" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} />
                  </div>
                </div>
              </>
            )}
            
            <div className="login-actions" style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
              <Link to="/login" className="btn-link" style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}>
                Already have an account? Sign In
              </Link>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
