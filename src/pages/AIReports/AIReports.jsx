import React, { useEffect, useState } from 'react';
import { getAllReports } from '../../services/reportService';
import { BrainCircuit, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AIReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getAllReports();
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    let result = reports;
    if (searchTerm) {
      result = result.filter(r => r.caseId.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterAgent !== 'All') {
      result = result.filter(r => r.agent === filterAgent);
    }
    setFilteredReports(result);
  }, [searchTerm, filterAgent, reports]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="loading-spinner" style={{ margin: 'auto' }}></div>;

  const agents = ['All', 'Eligibility Agent', 'Delay Analysis Agent', 'Legal Strategy Agent', 'Financial Intelligence Agent', 'Independent Third Opinion Agent'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="dashboard-header">
        <h1>AI Reports</h1>
        <p>Comprehensive AI analysis across all cases.</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="input-group" style={{ margin: 0, flex: 1, position: 'relative' }}>
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
        <div className="input-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            className="input-field" 
            value={filterAgent} 
            onChange={(e) => setFilterAgent(e.target.value)}
          >
            {agents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredReports.map((report, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={report.id} 
            className="card" 
            style={{ padding: '1rem 1.5rem', cursor: 'pointer' }}
            onClick={() => toggleExpand(report.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <BrainCircuit size={24} color="var(--accent-brown)" />
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {report.agent} 
                    <span className="badge badge-pending" style={{ fontSize: '0.75rem' }}>{report.confidence}% Match</span>
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Case: {report.caseId}</p>
                </div>
              </div>
              <div>
                {expandedId === report.id ? <ChevronUp /> : <ChevronDown />}
              </div>
            </div>

            {expandedId === report.id && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(107,79,58,0.1)' }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: 'var(--text-muted)' }}>Recommendation:</strong>
                  <p style={{ margin: '0.25rem 0 0 0' }}>{report.recommendation}</p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: 'var(--text-muted)' }}>Reasoning:</strong>
                  <p style={{ margin: '0.25rem 0 0 0' }}>{report.reasoning}</p>
                </div>
                {report.rootCause && (
                  <div>
                    <strong style={{ color: 'var(--text-muted)' }}>Root Cause:</strong>
                    <p style={{ margin: '0.25rem 0 0 0' }}>{report.rootCause}</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
        {filteredReports.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No AI reports match your search criteria.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIReports;
