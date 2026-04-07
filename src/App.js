import React, { useState, useEffect } from 'react';
import Login     from './components/Login';
import Sidebar   from './components/Sidebar';
import Navbar    from './components/Navbar';
import Dashboard from './components/Dashboard';
import Products  from './components/Products';
import Inventory from './components/Inventory';
import Reports   from './components/Reports';
import Settings  from './components/Settings';
import './index.css';

function App() {
  // isLoggedIn = true means show dashboard, false means show login
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Check if user was already logged in (token exists in storage)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true); // Auto-login if token found
    }
  }, []); // Empty array = run only once on app start

  // Called when login succeeds
  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  // Called when logout button clicked
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
  };

  // Render the correct page based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'products':  return <Products />;
      case 'inventory': return <Inventory />;
      case 'reports':   return <Reports />;
      case 'settings':  return <Settings />;
      default:          return <Dashboard />;
    }
  };

  // If not logged in → show Login screen
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // If logged in → show full dashboard layout
  return (
    <div className="app-layout">
      {/* Left sidebar navigation */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />

      {/* Right main content area */}
      <div className="main-content">
        <Navbar currentPage={currentPage} />
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
