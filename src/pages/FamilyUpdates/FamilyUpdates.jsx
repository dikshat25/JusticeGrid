import React, { useEffect, useState } from 'react';
import { getAllFamilyUpdates } from '../../services/familyService';
import { Users, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import '../CaseDetails/CaseDetails.css'; // Reuse some CSS

const FamilyUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [filteredUpdates, setFilteredUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const data = await getAllFamilyUpdates();
        setUpdates(data);
        setFilteredUpdates(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  useEffect(() => {
    let result = updates;
    if (searchTerm) {
      result = result.filter(u => u.caseId.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredUpdates(result);
  }, [searchTerm, updates]);

  if (loading) return <div className="loading-spinner" style={{ margin: 'auto' }}></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="dashboard-header">
        <h1>Family Updates</h1>
        <p>Translated status updates for undertrial families.</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="input-group" style={{ margin: 0, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by Case ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      <div className="family-updates-list">
        {filteredUpdates.map((update, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={update.id} 
            className="family-update-card card"
            style={{ border: 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="var(--accent-brown)" />
                <h4 style={{ margin: 0 }}>Case: {update.caseId}</h4>
              </div>
              <div className="update-date" style={{ margin: 0 }}>{new Date(update.date).toLocaleDateString()}</div>
            </div>
            
            <div className="update-langs">
              <div className="lang-box">
                <span className="lang-label">English</span>
                <p>{update.english}</p>
              </div>
              <div className="lang-box">
                <span className="lang-label">Hindi</span>
                <p>{update.hindi}</p>
              </div>
              <div className="lang-box">
                <span className="lang-label">Marathi</span>
                <p>{update.marathi}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredUpdates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No updates found.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FamilyUpdates;
