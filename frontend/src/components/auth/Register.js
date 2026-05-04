import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { register as registerAPI } from '../../services/api';
import '../../styles/login.css';

const PLANS = [
  { key: 'trial',      label: '🎯 Free Trial',   desc: '14 days · 3 users · 100 products' },
  { key: 'basic',      label: '📦 Basic',         desc: '₹999/mo · 10 users · 500 products' },
  { key: 'pro',        label: '🚀 Pro',            desc: '₹2999/mo · 50 users · 5000 products' },
  { key: 'enterprise', label: '🏢 Enterprise',    desc: 'Custom pricing · Unlimited' },
];

export default function Register({ onShowLogin }) {
  const { login } = useAuth();
  const [form, setForm] = useState({
    companyName: '', ownerName: '', email: '', password: '',
    phone: '', businessType: 'Retail', plan: 'trial',
  });
  const [error,   setError]   = useState('');
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
          <p>Start your free 14-day trial — no credit card needed</p>
        </div>

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-box">{error}</div>}

            {[
              { name: 'companyName', label: 'Company Name', ph: 'Gyan Enterprises',    type: 'text'     },
              { name: 'ownerName',   label: 'Your Name',    ph: 'Gyan Singh',           type: 'text'     },
              { name: 'email',       label: 'Email',        ph: 'you@company.com',      type: 'email'    },
              { name: 'password',    label: 'Password',     ph: 'Min 6 characters',     type: 'password' },
              { name: 'phone',       label: 'Phone',        ph: '9876543210 (optional)',type: 'text'     },
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
              <select className="input-field" name="businessType" value={form.businessType} onChange={handleChange}>
                {['Retail','Wholesale','Manufacturing','E-commerce','Distribution','Other'].map(t =>
                  <option key={t}>{t}</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Plan</label>
              <div className="role-toggle" style={{ flexDirection: 'column', gap: '0.4rem' }}>
                {PLANS.map(p => (
                  <label key={p.key} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
                    background: form.plan === p.key ? 'rgba(59,130,246,0.12)' : 'transparent',
                    border: `1px solid ${form.plan === p.key ? 'rgba(59,130,246,0.4)' : 'transparent'}`,
                    transition: 'all 0.2s ease',
                  }}>
                    <input
                      type="radio" name="plan" value={p.key}
                      checked={form.plan === p.key}
                      onChange={handleChange}
                      style={{ accentColor: '#3b82f6' }}
                    />
                    <span>
                      <strong style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{p.label}</strong>
                      <span style={{ marginLeft: 8, color: '#64748b', fontSize: '0.8rem' }}>{p.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button className="btn btn-primary login-btn" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading
                ? <><span className="spinner" /> Creating account…</>
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
