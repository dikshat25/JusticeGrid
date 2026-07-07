import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, BrainCircuit, Bell, Users, BarChart2, User, LogOut, Scale } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../services/authService';
import './Layout.css';

const Sidebar = () => {
  const { userData } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const role = userData?.role || 'lawyer';

  let navItems = [];
  
  if (role === 'admin') {
    navItems = [
      { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'System Health' },
      { path: '/dashboard/cases', icon: <Briefcase size={20} />, label: 'All Cases' },
      { path: '/dashboard/analytics', icon: <BarChart2 size={20} />, label: 'API / Model Usage' }
    ];
  } else if (role === 'family') {
    navItems = [
      { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Family Dashboard' },
      { path: '/dashboard/cases', icon: <Briefcase size={20} />, label: 'My Cases' },
      { path: '/dashboard/family-updates', icon: <Users size={20} />, label: 'Communications' }
    ];
  } else {
    // Lawyer default
    navItems = [
      { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      { path: '/dashboard/cases', icon: <Briefcase size={20} />, label: 'Assigned Cases' },
      { path: '/dashboard/ai-reports', icon: <BrainCircuit size={20} />, label: 'Legal Reports' },
      { path: '/dashboard/notifications', icon: <Bell size={20} />, label: 'Court Alerts' },
      { path: '/dashboard/profile', icon: <User size={20} />, label: 'Profile' }
    ];
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Scale size={28} className="sidebar-logo-icon" />
        <h2 className="sidebar-title">JusticeGrid</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            end={item.path === '/dashboard'}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
