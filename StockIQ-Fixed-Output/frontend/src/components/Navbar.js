import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

function Navbar({ currentPage }) {
  const { user } = useAuth();

  const pageTitles = {
    dashboard: '📊 Dashboard Overview',
    products:  '📦 Product Catalog',
    inventory: '🏪 Inventory Monitor',
    reports:   '📈 Analytics & Reports',
    settings:  '⚙️ System Settings',
    staff:     '👥 Staff Management',
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = user?.username || user?.name || 'User';

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">{pageTitles[currentPage] || 'StockIQ'}</h2>
        <p className="navbar-date">{new Date().toDateString()}</p>
      </div>
      <div className="navbar-right">
        <div className="greeting-badge">
          <span className="greeting-wave">👋</span>
          <span>{getGreeting()}, <strong style={{ textTransform: 'capitalize' }}>{displayName}</strong></span>
        </div>
        <div className="notif-btn">🔔</div>
      </div>
    </div>
  );
}

export default Navbar;
