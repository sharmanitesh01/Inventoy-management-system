import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { login as loginAPI } from '../../services/api';
import '../../styles/login.css';

export default function Login({ onShowRegister }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginAPI({ username, password });
      login(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-container">
        <div className="login-brand">
          <div className="brand-icon"><span>SQ</span></div>
          <h1>StockIQ Cloud</h1>
          <p>Multi-tenant Inventory Platform</p>
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
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                className="input-field"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
              {loading
                ? <><span className="spinner" /> Signing in…</>
                : '🔑 Sign In'
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.88rem' }}>
            New business?{' '}
            <button
              onClick={onShowRegister}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}
            >
              Register your company →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
