import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { register as registerAPI } from '../../services/api';
import '../../styles/login.css';

export default function Register({ onShowLogin }) {
  const { login } = useAuth();
  const [form, setForm] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    businessType: 'Retail'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await registerAPI(form);
      login(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-container" style={{ width: 500, maxWidth: '95vw' }}>
        <div className="login-brand">
          <div className="brand-icon"><span>SQ</span></div>
          <h1>Register Company</h1>
          <p>Create your business inventory workspace instantly</p>
        </div>

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-box">{error}</div>}

            {[
              { name: 'companyName', label: 'Company Name', ph: 'Gyan Enterprises', type: 'text' },
              { name: 'ownerName', label: 'Owner Name', ph: 'Gyan Singh', type: 'text' },
              { name: 'email', label: 'Email', ph: 'you@company.com', type: 'email' },
              { name: 'password', label: 'Password', ph: 'Minimum 6 characters', type: 'password' },
              { name: 'phone', label: 'Phone', ph: '9876543210 (optional)', type: 'text' }
            ].map(f => (
              <div className="form-group" key={f.name}>
                <label>{f.label}</label>
                <input
                  className="input-field"
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.ph}
                  required={f.name !== 'phone'}
                />
              </div>
            ))}

            <div className="form-group">
              <label>Business Type</label>
              <select
                className="input-field"
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
              >
                {['Retail','Wholesale','Manufacturing','E-commerce','Distribution','Other'].map(t =>
                  <option key={t}>{t}</option>
                )}
              </select>
            </div>

            <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
              {loading
                ? <><span className="spinner" /> Creating Account…</>
                : '🚀 Create Company Account'
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.88rem' }}>
            Already have an account?{' '}
            <button
              onClick={onShowLogin}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}
            >
              Sign in →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}