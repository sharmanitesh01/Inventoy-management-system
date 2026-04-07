import React, { useState } from 'react';
import axios from 'axios';
import '../styles/login.css';

function Login({ onLogin }) {
  // State = variables that React watches for changes
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // Called when user clicks Login button
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);
    setError('');

    try {
      // Send POST request to backend
      const res = await axios.post('/api/auth/login', { username, password });
      
      // Save token in browser storage so we stay logged in
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      
      // Tell parent component (App.js) we are logged in
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* 3D Floating cube decoration */}
      <div className="cube-wrap">
        <div className="cube">
          <div className="face front" />
          <div className="face back"  />
          <div className="face left"  />
          <div className="face right" />
          <div className="face top"   />
          <div className="face bottom"/>
        </div>
      </div>

      <div className="login-container">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="brand-icon">
            <span>SQ</span>
          </div>
          <h1>StockIQ</h1>
          <p>Smart Inventory Management</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>
          <p className="sub">Sign in to your dashboard</p>

          {error && <div className="error-box">{error}</div>}

          <div className="form-group">
            <label>Username</label>
            <input
              className="input-field"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Update state on typing
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : '🚀 Sign In'}
          </button>

          <p className="hint">Default: admin / admin123</p>
        </form>
      </div>
    </div>
  );
}

export default Login;
