import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/settings.css';

const PLAN_INFO = {
  trial:      { label: 'Free Trial',  color: '#f59e0b', features: '3 users · 100 products · 14 days' },
  basic:      { label: 'Basic',       color: '#3b82f6', features: '10 users · 500 products'           },
  pro:        { label: 'Pro',         color: '#8b5cf6', features: '50 users · 5000 products'          },
  enterprise: { label: 'Enterprise',  color: '#06d6a0', features: 'Unlimited users & products'        },
};

export default function Settings() {
  const { user, isAdminUp } = useAuth();
  const [form,    setForm]    = useState({ companyName: '', ownerName: '', phone: '', businessType: '', gstNumber: '', address: '' });
  const [msg,     setMsg]     = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.tenantId) {
      getSettings()
        .then(r => setForm({
          companyName:  r.data.companyName  || '',
          ownerName:    r.data.ownerName    || '',
          phone:        r.data.phone        || '',
          businessType: r.data.businessType || '',
          gstNumber:    r.data.gstNumber    || '',
          address:      r.data.address      || '',
        }))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    try {
      await updateSettings(form);
      setMsg('✅ Settings saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed to save'));
    }
  };

  const plan = PLAN_INFO[user?.plan] || {};

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  return (
    <div className="settings-page fade-in">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your company configuration</p>
      </div>

      {msg && (
        <div className={`flash-msg ${msg.startsWith('❌') ? 'flash-err' : 'flash-ok'}`} style={{ marginBottom: '1.25rem' }}>
          {msg}
        </div>
      )}

      <div className="settings-grid">
        {/* Company Info */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <span className="settings-icon">🏢</span>
            <div>
              <h3>Company Information</h3>
              <p>Update your business details</p>
            </div>
          </div>

          {[
            { key: 'companyName', label: 'Company Name'  },
            { key: 'ownerName',   label: 'Owner Name'    },
            { key: 'phone',       label: 'Phone Number'  },
            { key: 'gstNumber',   label: 'GST Number'    },
          ].map(({ key, label }) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              <input
                className="input-field"
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                disabled={!isAdminUp}
              />
            </div>
          ))}

          <div className="form-group">
            <label>Business Address</label>
            <textarea
              className="input-field"
              value={form.address}
              rows={3}
              onChange={e => setForm({ ...form, address: e.target.value })}
              disabled={!isAdminUp}
            />
          </div>

          {isAdminUp && (
            <button className="btn btn-primary" onClick={handleSave}>💾 Save Settings</button>
          )}
        </div>

        {/* Plan & System Info */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <span className="settings-icon">💎</span>
            <div>
              <h3>Subscription & System</h3>
              <p>Your current plan and system information</p>
            </div>
          </div>

          {user?.plan && (
            <div style={{
              padding: '1.25rem',
              background: `${plan.color}0d`,
              borderRadius: '12px',
              border: `1px solid ${plan.color}33`,
              marginBottom: '1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: plan.color }}>{plan.label}</span>
                <span style={{
                  padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                  background: `${plan.color}22`, color: plan.color, border: `1px solid ${plan.color}44`,
                }}>ACTIVE</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{plan.features}</p>
              {user.plan === 'trial' && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <p style={{ color: '#f59e0b', fontSize: '0.82rem' }}>⚠️ Trial expires in 14 days. Upgrade to keep your data.</p>
                </div>
              )}
            </div>
          )}

          <div className="info-grid">
            {[
              { key: 'Your Role',    val: user?.role?.replace(/_/g, ' ')  },
              { key: 'Username',     val: user?.username                    },
              { key: 'Email',        val: user?.email                       },
              { key: 'Platform',     val: 'StockIQ Cloud v2.0'             },
              { key: 'Backend',      val: 'Node.js + Express'              },
              { key: 'Database',     val: 'MongoDB Atlas'                  },
            ].map(row => (
              <div className="info-row" key={row.key}>
                <span className="info-key">{row.key}</span>
                <span className="info-val" style={{ textTransform: 'capitalize' }}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
