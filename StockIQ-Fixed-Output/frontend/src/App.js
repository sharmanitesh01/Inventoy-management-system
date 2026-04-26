import React, { useState, useEffect } from 'react';
import Login          from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar        from './components/Sidebar';
import Navbar         from './components/Navbar';
import Dashboard      from './components/Dashboard';
import Products       from './components/Products';
import Inventory      from './components/Inventory';
import Reports        from './components/Reports';
import Settings       from './components/Settings';
import StaffManagement from './components/StaffManagement';
import './index.css';

// ─── Inner app — must be inside AuthProvider so useAuth() works ───────────────
function AppInner() {
  const { user, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // If user exists in context, they are logged in
  const isLoggedIn = !!user;

  // Called when login form succeeds
  const handleLogin = (userData, token) => {
    login(userData, token);
    setCurrentPage('dashboard');
  };

  // Called when logout button clicked
  const handleLogout = () => {
    logout();
  };

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

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <Navbar currentPage={currentPage} />
        {renderPage()}
      </div>
    </div>
  );
}

// ─── Root — wraps everything in AuthProvider ──────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
