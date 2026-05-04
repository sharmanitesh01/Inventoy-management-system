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
