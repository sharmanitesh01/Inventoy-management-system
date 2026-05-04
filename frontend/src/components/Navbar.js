import React from 'react';
import '../styles/navbar.css';
import StaffManagement from './TeamManagement';

function Navbar({ currentPage }) {
  // Map page names to display titles
  const pageTitles = {
    dashboard: '📊 Dashboard Overview',
    products:  '📦 Product Catalog',
    inventory: '🏪 Inventory Monitor',
    reports:   '📈 Analytics & Reports',
    settings:  '⚙️ System Settings',
  };
import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

const pageTitles = {
  dashboard:  '📊 Dashboard',
  products:   '📦 Products',
  inventory:  '🏪 Inventory',
  reports:    '📈 Reports',
  team:       '👥 Team Management',
  settings:   '⚙️ Settings',
  audit:      '📋 Audit Log',
  superadmin: '🌐 Platform Overview',
  tenants:    '🏢 All Companies',
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export default function Navbar({ currentPage }) {
  const { user } = useAuth();
  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">{pageTitles[currentPage] || 'StockIQ Cloud'}</h2>
        <p className="navbar-date">{new Date().toDateString()}</p>
      </div>
      <div className="navbar-right">
        <div className="greeting-badge">
          <span className="greeting-wave">👋</span>
          <span>{getGreeting()}, <strong>{user?.fullName?.split(' ')[0] || 'User'}</strong></span>
        </div>
      </div>
    </div>
  );
}

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const username = localStorage.getItem('username') || 'Admin';

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">{pageTitles[currentPage]}</h2>
        <p className="navbar-date">{new Date().toDateString()}</p>
      </div>
      <div className="navbar-right">
        <div className="greeting-badge">
          <span className="greeting-wave">👋</span>
          <span>{getGreeting()}, <strong style={{textTransform:'capitalize'}}>{username}</strong></span>
        </div>
        <div className="notif-btn">🔔</div>
      </div>
    </div>
  );
}

export default Navbar;
