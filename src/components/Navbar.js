import React from 'react';
import '../styles/navbar.css';
import StaffManagement from './StaffManagement';

function Navbar({ currentPage }) {
  // Map page names to display titles
  const pageTitles = {
    dashboard: '📊 Dashboard Overview',
    products:  '📦 Product Catalog',
    inventory: '🏪 Inventory Monitor',
    reports:   '📈 Analytics & Reports',
    settings:  '⚙️ System Settings',
  };

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
