import React, { useEffect, useState } from 'react';
import { getNotifications } from '../../services/notificationService';
import { Bell, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <div className="loading-spinner" style={{ margin: 'auto' }}></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="dashboard-header">
        <h1>Notifications</h1>
        <p>System alerts, AI recommendations, and case updates.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((notif, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={notif.id} 
              style={{ 
                display: 'flex', 
                gap: '1rem', 
                padding: '1rem', 
                borderBottom: '1px solid rgba(107, 79, 58, 0.05)',
                background: notif.read === false ? 'var(--bg-cream)' : 'transparent',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div style={{ color: 'var(--status-urgent)', marginTop: '0.25rem' }}>
                <AlertCircle size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0 }}>{notif.title}</h4>
                  {notif.read === false && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-urgent)' }}></span>}
                </div>
                <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-dark)', fontSize: '0.95rem' }}>{notif.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} /> {new Date(notif.date).toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
          {notifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              You have no new notifications.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Notifications;
