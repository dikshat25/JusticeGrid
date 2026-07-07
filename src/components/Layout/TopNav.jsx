import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const TopNav = () => {
  const { userData } = useAuth();

  return (
    <header className="topnav">
      <div className="topnav-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search cases, reports, or documents..." className="search-input" />
      </div>

      <div className="topnav-right">
        <button className="topnav-icon-btn relative">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        
        <div className="topnav-profile" onClick={() => window.location.href='/dashboard/profile'}>
          <div className="profile-info">
            <span className="profile-name">{userData?.name || 'User Name'}</span>
            <span className="profile-district" style={{ textTransform: 'capitalize' }}>{userData?.role || 'Role'}</span>
          </div>
          <div className="profile-avatar">
            {userData?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
