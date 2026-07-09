import React, { useEffect, useState } from 'react';
import { getCases } from '../../services/caseService';
import { Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getCases(currentUser.uid, userData?.role);
        setCases(data);
        setFilteredCases(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser && userData) {
      fetchCases();
    }
  }, [currentUser, userData]);

  useEffect(() => {
    let result = cases;
    if (searchTerm) {
      result = result.filter(c => 
        c.undertrialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.caseId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterPriority !== 'All') {
      result = result.filter(c => c.priority === filterPriority);
    }
    setFilteredCases(result);
  }, [searchTerm, filterPriority, cases]);

  if (loading) return <div className="loading-spinner" style={{ margin: 'auto' }}></div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="cases-page"
    >
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Assigned Cases</h1>
          <p>Manage and monitor undertrial case files in your roster.</p>
        </div>
        {userData?.role === 'lawyer' && (
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/dashboard/cases/new')}>
            <Plus size={18} /> Create New Case
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="input-group" style={{ margin: 0, flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by name or case ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <div className="input-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            className="input-field" 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Name</th>
                <th>Court</th>
                <th>Priority</th>
                <th>AI Review</th>
                <th>Police Assessment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={c.id}
                >
                  <td>{c.caseId}</td>
                  <td>
                    <strong>{c.undertrialName}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.age} / {c.gender}</div>
                  </td>
                  <td>{c.court}</td>
                  <td>
                    <span className={`badge badge-${c.priority === 'High' ? 'urgent' : 'pending'}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td>
                    {c.analysisCompleted ? (
                      <span className="badge badge-eligible">Completed</span>
                    ) : (
                      <span className="badge badge-pending">Pending</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${c.policeAssessment === 'Eligible for Bail' ? 'eligible' : 'pending'}`}>
                      {c.policeAssessment}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline" onClick={() => navigate(`/dashboard/cases/${c.id}`)}>Open Details</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredCases.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No cases found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Cases;
