import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { userData } = useAuth();

  if (!userData) return <div className="loading-spinner" style={{ margin: 'auto' }}></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="dashboard-header">
        <h1>User Profile</h1>
        <p>Manage your professional details.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', 
            background: 'var(--accent-brown)', color: 'var(--white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem'
          }}>
            {userData.name?.charAt(0) || 'L'}
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>{userData.name}</h2>
          <span className="badge badge-eligible">{userData.role.toUpperCase()}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} /> Email Address
            </label>
            <input type="email" className="input-field" value={userData.email} readOnly />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} /> Phone Number
            </label>
            <input type="text" className="input-field" value={userData.phone || '+91 9876543210'} readOnly />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} /> District Practice
            </label>
            <input type="text" className="input-field" value={userData.district || 'Pune'} readOnly />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={16} /> Organization
            </label>
            <input type="text" className="input-field" value={userData.organization || 'Legal Aid'} readOnly />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} /> About Me
            </label>
            <textarea 
              className="input-field" 
              rows="4" 
              value={userData.aboutMe || 'I am a legal professional dedicated to ensuring justice and fairness in the system.'} 
              readOnly 
              style={{ resize: 'vertical' }}
            />
          </div>


        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
