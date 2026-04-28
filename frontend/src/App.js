import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login          from './components/Login';
import Sidebar        from './components/Sidebar';
import Navbar         from './components/Navbar';
import Dashboard      from './components/Dashboard';
import Products       from './components/Products';
import Inventory      from './components/Inventory';
import Reports        from './components/Reports';
import Settings       from './components/Settings';
import StaffManagement from './components/StaffManagement';
import './index.css';

// ─── Inner App — reads from AuthContext (must be INSIDE AuthProvider) ──────────
function App() {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // While AuthContext restores session from localStorage, show a loading screen.
  // This prevents the login page from flashing on refresh when already logged in.
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0f172a', color: '#94a3b8', fontSize: '1.1rem'
      }}>
        Loading…
      </div>
    );
  }

  // Not logged in → show Login page.
  // Login calls useAuth().login() directly — no onLogin prop needed.
  if (!user) {
    return <Login />;
  }

  // Logged in → show full dashboard layout
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'products':  return <Products />;
      case 'inventory': return <Inventory />;
      case 'reports':   return <Reports />;
      case 'settings':  return <Settings />;
      case 'staff':     return <StaffManagement />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={logout}
      />
      <div className="main-content">
        <Navbar currentPage={currentPage} />
        {renderPage()}
      </div>
    </div>
  );
}

// ─── Root export — wraps everything in AuthProvider ───────────────────────────
export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
