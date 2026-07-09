import React, { useEffect, useState } from 'react';
import { subscribeToCases } from '../../services/caseService';
import { getNotifications } from '../../services/notificationService';
import { Briefcase, AlertCircle, Clock, ShieldAlert, BrainCircuit, Zap, CheckCircle } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './Dashboard.css';

const CountUp = ({ to, duration = 2 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * to));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [to, duration]);

  return <span>{count}</span>;
};

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [health, setHealth] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const isAdmin = userData?.role === 'admin';
  const isLawyer = userData?.role === 'lawyer';
  const isFamily = userData?.role === 'family';

  // Live Toast Notifications for Case Updates
  useEffect(() => {
    // We check if any case just switched to analysisCompleted
    const checkCaseUpdates = (newCases) => {
      setCases(prevCases => {
        if (prevCases.length > 0) {
          newCases.forEach(newCase => {
            const oldCase = prevCases.find(c => c.id === newCase.id);
            if (oldCase && !oldCase.analysisCompleted && newCase.analysisCompleted) {
              toast.success(`AI Review Completed for ${newCase.undertrialName}`, {
                icon: '⚖️',
              });
            }
          });
        }
        return newCases;
      });
    };

    if (currentUser && userData) {
      const unsubscribe = subscribeToCases(currentUser.uid, userData.role, (liveCases) => {
        checkCaseUpdates(liveCases);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser, userData]);

  useEffect(() => {
    const fetchAncillaryData = async () => {
      try {
        if (isAdmin || isLawyer) {
          const healthRes = await fetch('https://justicegrid-backend.onrender.com/api/v1/health').then(r => r.ok ? r.json() : null).catch(() => null);
          setHealth(healthRes);
        }
        if (currentUser) {
          const notifData = await getNotifications(currentUser.uid, userData?.role);
          setNotifications(notifData);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAncillaryData();
  }, [isAdmin, isLawyer, currentUser, userData]);

  if (loading) return <div className="loading-spinner" style={{ margin: 'auto' }}></div>;

  const totalCases = cases.length;
  const eligibleCases = cases.filter(c => c.policeAssessment === 'Eligible for Bail').length;
  const highPriorityCases = cases.filter(c => c.priority === 'High');
  const upcomingHearings = cases.filter(c => new Date(c.nextHearing) > new Date()).length;
  const pendingReviews = cases.filter(c => !c.analysisCompleted).length;
  const completedReviews = cases.filter(c => c.analysisCompleted).length;
  
  const activeProvider = health?.groq?.status === 'connected' ? 'Groq' : 
                         (health?.openrouter?.status === 'connected' ? 'OpenRouter' : 'Gemini');

  let statCards = [];
  if (isAdmin) {
    statCards = [
      { label: 'Active Provider', value: activeProvider, icon: <Zap />, color: '#10b981', isString: true },
      { label: 'Current Model', value: health?.[activeProvider.toLowerCase()]?.model || 'Unknown', icon: <BrainCircuit />, color: 'var(--accent-brown)', isString: true },
      { label: 'Average Latency (ms)', value: 1200, icon: <Clock />, color: 'var(--status-pending)' },
      { label: 'Total API Calls', value: 12450, icon: <Briefcase />, color: 'var(--status-urgent)' },
      { label: 'Success Rate (%)', value: 98, icon: <ShieldAlert />, color: 'var(--status-eligible)' },
      { label: 'Total Active Cases', value: totalCases, icon: <Briefcase />, color: 'var(--accent-brown)' }
    ];
  } else if (isLawyer) {
    statCards = [
      { label: 'My Assigned Cases', value: totalCases, icon: <Briefcase />, color: 'var(--accent-brown)' },
      { label: 'Cases Awaiting Review', value: pendingReviews, icon: <Clock />, color: 'var(--status-pending)' },
      { label: 'Completed Reviews', value: completedReviews, icon: <CheckCircle />, color: 'var(--status-eligible)' },
      { label: 'Upcoming Hearings', value: upcomingHearings, icon: <AlertCircle />, color: 'var(--status-urgent)' }
    ];
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{isAdmin ? 'System Overview' : isLawyer ? 'Lawyer Dashboard' : 'Family Dashboard'}</h1>
        <p>{isAdmin ? 'Global platform health and API metrics.' : isLawyer ? 'Manage your assigned cases and AI reviews.' : 'Track real-time updates for your case.'}</p>
      </div>

      {!isFamily && (
        <div className="stats-grid" style={isAdmin ? { gridTemplateColumns: 'repeat(3, 1fr)' } : { gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {statCards.map((stat, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="stat-card card"
              whileHover={{ y: -5, boxShadow: 'var(--shadow-md)' }}
            >
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <h3>{stat.isString ? stat.value : <CountUp to={stat.value} />}</h3>
                <p>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="dashboard-grid" style={isFamily ? { gridTemplateColumns: '1fr' } : {}}>
        <motion.div 
          className="main-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="card">
            <div className="card-header">
              <h2>{isFamily ? 'My Case' : isAdmin ? 'All High Priority Cases' : 'My Urgent Cases'}</h2>
              {!isFamily && <button className="btn btn-outline" onClick={() => navigate('/dashboard/cases')}>View All</button>}
            </div>
            
            {cases.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No cases assigned to your account.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>AI Review</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isFamily ? cases : highPriorityCases).slice(0, 5).map((c, idx) => (
                      <motion.tr 
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (idx * 0.1) }}
                      >
                        <td>{c.caseId}</td>
                        <td>{c.undertrialName}</td>
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
                          <button className="btn-link" onClick={() => navigate(`/dashboard/cases/${c.id}`)}>View Details</button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {!isFamily && (
          <motion.div 
            className="side-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="card">
              <h2>Recent System Alerts</h2>
              <div className="alert-list">
                {notifications.slice(0, 5).map(notif => (
                  <div key={notif.id} className="alert-item">
                    <div className="alert-icon">
                      <AlertCircle size={16} />
                    </div>
                    <div className="alert-content">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="alert-time">{new Date(notif.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
