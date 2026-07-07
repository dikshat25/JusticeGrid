import React, { useEffect, useState } from 'react';
import { getCases } from '../../services/caseService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const Analytics = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getCases();
        setCases(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) return <div className="loading-spinner" style={{ margin: 'auto' }}></div>;

  // Process data for charts
  const districtCounts = cases.reduce((acc, c) => {
    acc[c.district] = (acc[c.district] || 0) + 1;
    return acc;
  }, {});
  const districtData = Object.keys(districtCounts).map(d => ({ name: d, count: districtCounts[d] }));

  const statusCounts = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.keys(statusCounts).map(s => ({ name: s, value: statusCounts[s] }));
  
  const eligibilityCounts = cases.reduce((acc, c) => {
    acc[c.policeAssessment] = (acc[c.policeAssessment] || 0) + 1;
    return acc;
  }, {});
  const eligibilityData = Object.keys(eligibilityCounts).map(e => ({ name: e, value: eligibilityCounts[e] }));

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="dashboard-header">
        <h1>Analytics</h1>
        <p>Dynamic insights generated from active caseload.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Cases by District</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={districtData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 79, 58, 0.1)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} axisLine={{ stroke: 'rgba(107, 79, 58, 0.2)' }} />
                <YAxis tick={{ fill: 'var(--text-muted)' }} axisLine={{ stroke: 'rgba(107, 79, 58, 0.2)' }} />
                <RechartsTooltip cursor={{ fill: 'rgba(107, 79, 58, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="count" fill="var(--accent-brown)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Case Status Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Initial Police Assessment</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={eligibilityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {eligibilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Eligible for Bail' ? '#4A9A6A' : '#D94A4A'} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Analytics;
