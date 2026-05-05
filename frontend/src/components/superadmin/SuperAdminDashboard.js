import React, { useState, useEffect } from 'react';
import { getPlatformStats } from '../../services/api';
import '../../styles/dashboard.css';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="loader" /><p>Loading Platform Stats…</p></div>;

  const cards = [
    { label: 'Total Companies', value: stats?.totalTenants || 0, icon: '🏢', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
    { label: 'Active Companies', value: stats?.activeTenants || 0, icon: '✅', color: '#06d6a0', glow: 'rgba(6,214,160,0.3)' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '📦', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' }
  ];

  return (
    <div className="dashboard fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#e2e8f0,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          👑 Platform Owner Dashboard
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>StockIQ Cloud — Companies Overview</p>
      </div>

      <div className="stats-grid">
        {cards.map((card, i) => (
          <div key={card.label} className="stat-card"
            style={{ animationDelay: `${i * 0.1}s`, '--card-color': card.color, '--card-glow': card.glow }}>
            <div className="stat-icon" style={{
              background: `linear-gradient(135deg,${card.color}33,${card.color}11)`,
              border: `1px solid ${card.color}44`,
            }}>
              <span>{card.icon}</span>
            </div>
            <div className="stat-info">
              <p className="stat-label">{card.label}</p>
              <h2 className="stat-value" style={{ color: card.color }}>{card.value}</h2>
            </div>
            <div className="stat-ring" style={{ borderColor: card.color }} />
          </div>
        ))}
      </div>

      <div className="card chart-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="chart-title">🏢 Recently Registered Companies</h3>

        {(stats?.recentTenants || []).length === 0 ? (
          <div className="empty-chart">No companies registered yet</div>
        ) : (
          <div style={{ paddingTop: '0.5rem' }}>
            {stats.recentTenants.map(t => (
              <div key={t._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div>
                  <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem' }}>{t.companyName}</p>
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span style={{ fontSize: '0.78rem', color: t.isActive ? '#06d6a0' : '#ef4444', fontWeight: 700 }}>
                  {t.isActive ? '● Active' : '● Disabled'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}