import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/sidebar.css';

const menuItems = [
  { icon: '⬡',  label: 'Dashboard',        page: 'dashboard' },
  { icon: '📦', label: 'Products',          page: 'products'  },
  { icon: '🏪', label: 'Inventory',         page: 'inventory' },
  { icon: '📊', label: 'Reports',           page: 'reports'   },
  { icon: '👥', label: 'Staff Management',  page: 'staff',    adminOnly: true },
  { icon: '⚙️',  label: 'Settings',         page: 'settings'  },
];

function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const { user, isAdmin } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">SQ</div>
        <div>
          <span className="logo-text">StockIQ</span>
          <span className="logo-sub">Inventory Pro</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">MENU</p>
        {menuItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <button
              key={item.page}
              className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.page)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {currentPage === item.page && <span className="active-dot" />}
            </button>
          ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-badge">
          <div className="admin-avatar">
            {(user?.username?.[0] || user?.name?.[0] || 'A').toUpperCase()}
          </div>
          <div>
            <p className="admin-name">{user?.username || user?.name || 'User'}</p>
            <p className="admin-role">{user?.role || 'User'}</p>
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
