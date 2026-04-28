import React, { useState } from 'react';
import '../styles/settings.css';

function Settings() {
  // Profile settings state
  const [profile, setProfile] = useState({
    username: localStorage.getItem('username') || 'admin',
    email: 'admin@stockiq.com',
    company: 'My Business',
  });

  // Toggle switches state - true = ON, false = OFF
  const [notifs, setNotifs] = useState({
    lowStock: true,
    outOfStock: true,
    emailAlerts: false,
    reorderReminder: true,
  });

  // Inventory preferences
  const [prefs, setPrefs] = useState({
    lowStockThreshold: 10,
    defaultReorderQty: 50,
  });

  const [saved, setSaved] = useState('');

  const handleSave = (section) => {
    // In real app, this would send to backend
    setSaved(`✅ ${section} saved!`);
    setTimeout(() => setSaved(''), 3000);
  };

  // Toggle a boolean notification setting
  const toggleNotif = (key) => {
    setNotifs({ ...notifs, [key]: !notifs[key] });
  };

  return (
    <div className="settings-page fade-in">
      <div className="page-header">
        <h1>System Settings</h1>
        <p>Manage your account and system preferences</p>
      </div>

      {saved && <div className="flash-msg flash-ok">{saved}</div>}

      <div className="settings-grid">
        {/* ── PROFILE SETTINGS ── */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <span className="settings-icon">👤</span>
            <div>
              <h3>Profile Settings</h3>
              <p>Update your personal information</p>
            </div>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              className="input-field"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              className="input-field"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Company Name</label>
            <input
              className="input-field"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" onClick={() => handleSave('Profile')}>
            💾 Save Profile
          </button>
        </div>

        {/* ── NOTIFICATION SETTINGS ── */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <span className="settings-icon">🔔</span>
            <div>
              <h3>Notification Settings</h3>
              <p>Control alert preferences</p>
            </div>
          </div>

          {[
            { key: 'lowStock',        label: 'Low Stock Alerts',     desc: 'Alert when stock ≤ threshold' },
            { key: 'outOfStock',      label: 'Out of Stock Alerts',  desc: 'Alert when quantity is zero'  },
            { key: 'emailAlerts',     label: 'Email Notifications',  desc: 'Send alerts to your email'    },
            { key: 'reorderReminder', label: 'Reorder Reminders',    desc: 'Weekly reorder suggestions'   },
          ].map((item) => (
            <div className="toggle-row" key={item.key}>
              <div>
                <p className="toggle-label">{item.label}</p>
                <p className="toggle-desc">{item.desc}</p>
              </div>
              {/* Toggle switch - clicking calls toggleNotif */}
              <div
                className={`toggle-switch ${notifs[item.key] ? 'on' : ''}`}
                onClick={() => toggleNotif(item.key)}
              >
                <div className="toggle-thumb" />
              </div>
            </div>
          ))}

          <button className="btn btn-primary" onClick={() => handleSave('Notifications')}>
            💾 Save Notifications
          </button>
        </div>

        {/* ── INVENTORY PREFERENCES ── */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <span className="settings-icon">📦</span>
            <div>
              <h3>Inventory Preferences</h3>
              <p>Configure inventory thresholds</p>
            </div>
          </div>

          <div className="form-group">
            <label>Low Stock Threshold (units)</label>
            <input
              className="input-field"
              type="number"
              min="1"
              value={prefs.lowStockThreshold}
              onChange={(e) => setPrefs({ ...prefs, lowStockThreshold: e.target.value })}
            />
            <p className="input-hint">Products with qty ≤ this value are marked "Low Stock"</p>
          </div>
          <div className="form-group">
            <label>Default Reorder Quantity</label>
            <input
              className="input-field"
              type="number"
              min="1"
              value={prefs.defaultReorderQty}
              onChange={(e) => setPrefs({ ...prefs, defaultReorderQty: e.target.value })}
            />
            <p className="input-hint">Suggested order quantity when restocking</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleSave('Preferences')}>
            💾 Save Preferences
          </button>
        </div>

        {/* ── SYSTEM INFO ── */}
        <div className="card settings-card system-info-card">
          <div className="settings-card-header">
            <span className="settings-icon">ℹ️</span>
            <div>
              <h3>System Information</h3>
              <p>Technical details</p>
            </div>
          </div>
          <div className="info-grid">
            {[
              { key: 'App Name',    val: 'StockIQ'        },
              { key: 'Version',     val: '1.0.0'           },
              { key: 'Frontend',    val: 'React 18'        },
              { key: 'Backend',     val: 'Node + Express'  },
              { key: 'Database',    val: 'MongoDB'         },
              { key: 'Auth',        val: 'JWT Tokens'      },
            ].map((row) => (
              <div className="info-row" key={row.key}>
                <span className="info-key">{row.key}</span>
                <span className="info-val">{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
