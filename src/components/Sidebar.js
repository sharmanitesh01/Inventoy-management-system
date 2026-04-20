import React from 'react';
import '../styles/sidebar.css';

// Navigation menu items - each has an icon, label, and page name
const menuItems = [
  { icon: '⬡', label: 'Dashboard',  page: 'dashboard'  },
  { icon: '📦', label: 'Products',   page: 'products'    },
  { icon: '🏪', label: 'Inventory',  page: 'inventory'   },
  { icon: '📊', label: 'Reports',    page: 'reports'     },
  { icon: '⚙️',  label: 'Settings',  page: 'settings'    },
];

function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">SQ</div>
        <div>
          <span className="logo-text">StockIQ</span>
          <span className="logo-sub">Inventory Pro</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">MENU</p>
        {menuItems.map((item) => (
          <button
            key={item.page}
            className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.page)} // Change page on click
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {/* Active indicator dot */}
            {currentPage === item.page && <span className="active-dot" />}
          </button>
        ))}
      </nav>

      {/* Logout Button at bottom */}
      <div className="sidebar-footer">
        <div className="admin-badge">
          <div className="admin-avatar">A</div>
          <div>
            <p className="admin-name">{localStorage.getItem('username') || 'Admin'}</p>
            <p className="admin-role">Administrator</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
