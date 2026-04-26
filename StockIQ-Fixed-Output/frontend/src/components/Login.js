import React, { useState } from 'react';
import { adminLogin, staffLogin } from '../services/api';
import '../styles/login.css';

export default function Login({ onLogin }) {
  const [role,     setRole]     = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn  = role === 'admin' ? adminLogin : staffLogin;
      const res = await fn({ username, password });
      // Pass user object and token up to App
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="cube-wrap">
        <div className="cube">
          <div className="face front" />
          <div className="face back" />
          <div className="face left" />
          <div className="face right" />
          <div className="face top" />
          <div className="face bottom" />
        </div>
      </div>

      <div className="login-container">
        <div className="login-brand">
          <div className="brand-icon"><span>SQ</span></div>
          <h1>StockIQ</h1>
          <p>Inventory Management System</p>
        </div>

        <div className="role-toggle">
          {['admin', 'staff'].map((r) => (
            <button
              key={r}
              type="button"
              className={`role-btn ${role === r ? 'active' : ''}`}
              onClick={() => { setRole(r); setError(''); }}
            >
              {r === 'admin' ? '🔑 Admin' : '👤 Staff'}
            </button>
          ))}
        </div>

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-box">{error}</div>}

            <div className="form-group">
              <label>Username</label>
              <input
                className="input-field"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                className="input-field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
              {loading
                ? <><span className="spinner" /> Signing in…</>
                : `Sign in as ${role}`
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
