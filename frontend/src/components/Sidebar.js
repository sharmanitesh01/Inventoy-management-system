import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/sidebar.css';

export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const { user, isPlatformOwner, isAdminUp, can } = useAuth();

  // Build menu items dynamically based on role/permissions
  const menuItems = [];

  if (isPlatformOwner) {
    menuItems.push(
      { icon: '🌐', label: 'Platform Overview', page: 'superadmin' },
      { icon: '🏢', label: 'All Companies',      page: 'tenants'    },
    );
  } else {
    menuItems.push({ icon: '⬡', label: 'Dashboard', page: 'dashboard' });
    if (can('products.view'))  menuItems.push({ icon: '📦', label: 'Products',  page: 'products'  });
    if (can('inventory.view')) menuItems.push({ icon: '🏪', label: 'Inventory', page: 'inventory' });
    if (can('reports.view'))   menuItems.push({ icon: '📊', label: 'Reports',   page: 'reports'   });
    if (isAdminUp)             menuItems.push({ icon: '👥', label: 'Team',      page: 'team'      });
    if (isAdminUp)             menuItems.push({ icon: '📋', label: 'Audit Log', page: 'audit'     });
    menuItems.push(            { icon: '⚙️',  label: 'Settings',  page: 'settings'  });
  }

  const roleLabel = {
    platform_owner: '👑 Platform Owner',
    company_owner:  '🏢 Owner',
    company_admin:  '🔑 Admin',
    manager:        '📋 Manager',
    staff:          '👤 Staff',
  }[user?.role] || user?.role;

  const planColors = { trial: '#f59e0b', basic: '#3b82f6', pro: '#8b5cf6', enterprise: '#06d6a0' };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">SQ</div>
        <div>
          <span className="logo-text">StockIQ</span>
          <span className="logo-sub">Cloud</span>
        </div>
      </div>

      {/* Company badge (for tenant users) */}
      {user?.companyName && (
        <div style={{
          margin: '0 1rem 1rem',
          padding: '0.6rem 0.85rem',
          background: 'rgba(59,130,246,0.06)',
          borderRadius: '10px',
          border: '1px solid rgba(59,130,246,0.15)',
        }}>
          <p style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>COMPANY</p>
          <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.companyName}
          </p>
          {user.plan && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
              color: planColors[user.plan] || '#94a3b8',
            }}>
              {user.plan} plan
            </span>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">MENU</p>
        {menuItems.map(item => (
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

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="admin-badge">
          <div className="admin-avatar">{user?.fullName?.[0]?.toUpperCase() || 'U'}</div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <p className="admin-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || 'User'}
            </p>
            <p className="admin-role">{roleLabel}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>🚪 Logout</button>
      </div>
    </div>
  );
}
