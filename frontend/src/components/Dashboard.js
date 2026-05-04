import React, { useState, useEffect } from 'react';
import { getProductStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import '../styles/dashboard.css';

const TREND_DATA = [
  { month: 'Jan', stock: 240 }, { month: 'Feb', stock: 180 }, { month: 'Mar', stock: 320 },
  { month: 'Apr', stock: 290 }, { month: 'May', stock: 410 }, { month: 'Jun', stock: 380 },
  { month: 'Jul', stock: 500 }, { month: 'Aug', stock: 460 }, { month: 'Sep', stock: 520 },
  { month: 'Oct', stock: 490 }, { month: 'Nov', stock: 610 }, { month: 'Dec', stock: 580 },
];
const PIE_COLORS = ['#3b82f6', '#06d6a0', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Loading Dashboard…</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Products', value: stats?.total      || 0, icon: '📦', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)'  },
    { label: 'In Stock',       value: stats?.inStock    || 0, icon: '✅', color: '#06d6a0', glow: 'rgba(6,214,160,0.3)'   },
    { label: 'Low Stock',      value: stats?.lowStock   || 0, icon: '⚠️', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
    { label: 'Out of Stock',   value: stats?.outOfStock || 0, icon: '🚫', color: '#ef4444', glow: 'rgba(239,68,68,0.3)'   },
  ];

  const pieData = (stats?.byCategory || []).map(c => ({ name: c._id, value: c.count }));

  return (
    <div className="dashboard fade-in">
      {/* Company header for tenant users */}
      {user?.companyName && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#e2e8f0,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user.companyName}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'capitalize' }}>
            {user.plan} plan · {user.role?.replace(/_/g, ' ')}
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="stats-grid">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="stat-card"
            style={{ animationDelay: `${i * 0.1}s`, '--card-color': card.color, '--card-glow': card.glow }}
          >
            <div className="stat-icon" style={{
              background: `linear-gradient(135deg, ${card.color}33, ${card.color}11)`,
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

      {/* Charts */}
      <div className="charts-row">
        <div className="card chart-card">
          <h3 className="chart-title">📈 Inventory Trend (2025)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1b35', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="stock" stroke="#3b82f6" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card pie-card">
          <h3 className="chart-title">🗂️ By Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1b35', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, color: '#e2e8f0' }} />
                <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">Add products to see category data</div>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="card alerts-panel">
        <h3 className="chart-title">🔔 Stock Alerts</h3>
        <div className="alert-list">
          {stats?.lowStock > 0 && (
            <div className="alert-item warning">
              <span>⚠️</span>
              <p><strong>{stats.lowStock} products</strong> are running low on stock — reorder soon.</p>
            </div>
          )}
          {stats?.outOfStock > 0 && (
            <div className="alert-item danger">
              <span>🚫</span>
              <p><strong>{stats.outOfStock} products</strong> are completely out of stock.</p>
            </div>
          )}
          {!stats?.lowStock && !stats?.outOfStock && (
            <div className="alert-item success">
              <span>✅</span>
              <p>All products are well stocked — no alerts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
