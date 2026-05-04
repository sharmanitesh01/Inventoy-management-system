import React, { useState,useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login               from './components/auth/Login';
import Register            from './components/auth/Register';
import Sidebar             from './components/Sidebar';
import Navbar              from './components/Navbar';
import Dashboard           from './components/Dashboard';
import Products            from './components/Products';
import Inventory           from './components/Inventory';
import Reports             from './components/Reports';
import TeamManagement      from './components/TeamManagement';
import Settings            from './components/Settings';
import AuditLog            from './components/AuditLog';
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
import TenantsPage         from './components/superadmin/TenantsPage';
import './index.css';

function App() {
  const { user, loading, logout, isPlatformOwner } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  // const [currentPage,  setCurrentPage]  = useState('dashboard');
  const [currentPage, setCurrentPage] = useState(
  user?.role === 'platform_owner' ? 'superadmin' : 'dashboard'
  );

    useEffect(() => {
    if (user?.role === 'platform_owner') {
      setCurrentPage('superadmin');
    } else if (user) {
      setCurrentPage('dashboard');
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#050b1a', color: '#94a3b8', fontSize: '1.1rem', gap: '1rem',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid rgba(59,130,246,0.3)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        Loading StockIQ Cloud…
      </div>
    );
  }

  if (!user) {
    return showRegister
      ? <Register onShowLogin={() => setShowRegister(false)} />
      : <Login    onShowRegister={() => setShowRegister(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':  return <Dashboard />;
      case 'products':   return <Products />;
      case 'inventory':  return <Inventory />;
      case 'reports':    return <Reports />;
      case 'team':       return <TeamManagement />;
      case 'settings':   return <Settings />;
      case 'audit':      return <AuditLog />;
      case 'superadmin': return <SuperAdminDashboard />;
      case 'tenants':    return <TenantsPage />;
      default:           return isPlatformOwner ? <SuperAdminDashboard /> : <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={() => { logout(); setCurrentPage('dashboard'); }}
      />
      <div className="main-content">
        <Navbar currentPage={currentPage} />
        {renderPage()}
      </div>
    </div>
  );
}

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
