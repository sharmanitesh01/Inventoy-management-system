import React, { useState, useEffect } from 'react';
import { getProductStats } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import '../styles/dashboard.css';

const trendData = [
  { month: 'Jan', stock: 240 }, { month: 'Feb', stock: 180 },
  { month: 'Mar', stock: 320 }, { month: 'Apr', stock: 290 },
  { month: 'May', stock: 410 }, { month: 'Jun', stock: 380 },
  { month: 'Jul', stock: 500 }, { month: 'Aug', stock: 460 },
  { month: 'Sep', stock: 520 }, { month: 'Oct', stock: 490 },
  { month: 'Nov', stock: 610 }, { month: 'Dec', stock: 580 },
];

const PIE_COLORS = ['#3b82f6', '#06d6a0', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await getProductStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = stats?.byCategory?.map((c) => ({ name: c._id, value: c.count })) || [];

  const cards = [
    { label: 'Total Products', value: stats?.total      || 0, icon: '📦', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)'  },
    { label: 'In Stock',       value: stats?.inStock    || 0, icon: '✅', color: '#06d6a0', glow: 'rgba(6,214,160,0.3)'   },
    { label: 'Low Stock',      value: stats?.lowStock   || 0, icon: '⚠️', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
    { label: 'Out of Stock',   value: stats?.outOfStock || 0, icon: '🚫', color: '#ef4444', glow: 'rgba(239,68,68,0.3)'   },
  ];

  if (loading) return (
    <div className="loading-screen">
      <div className="loader" />
      <p>Loading Dashboard…</p>
    </div>
  );

  return (
    <div className="dashboard fade-in">
      {/* ── STAT CARDS ── */}
      <div className="stats-grid">
        {cards.map((card, i) => (
          <div
            className="stat-card"
            key={card.label}
            style={{ animationDelay: `${i * 0.1}s`, '--card-color': card.color, '--card-glow': card.glow }}
          >
            <div className="stat-icon" style={{ background: `linear-gradient(135deg, ${card.color}33, ${card.color}11)`, border: `1px solid ${card.color}44` }}>
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

      {/* ── CHARTS ROW ── */}
      <div className="charts-row">
        <div className="card chart-card">
          <h3 className="chart-title">📈 Inventory Trend (2025)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0d1b35', border: '1px solid #1e3a6e', borderRadius: '10px', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="stock" stroke="#3b82f6" strokeWidth={2} fill="url(#stockGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">🗂️ Category Split</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1b35', border: '1px solid #1e3a6e', borderRadius: '10px', color: '#e2e8f0' }} />
                <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">Add products to see category data</div>
          )}
        </div>
      </div>

      {/* ── ALERTS PANEL ── */}
      <div className="card alerts-panel">
        <h3 className="chart-title">🔔 Stock Alerts</h3>
        <div className="alert-list">
          {stats?.lowStock > 0 && (
            <div className="alert-item warning">
              <span>⚠️</span>
              <p><strong>{stats.lowStock} products</strong> are running low on stock (qty ≤ 10)</p>
            </div>
          )}
          {stats?.outOfStock > 0 && (
            <div className="alert-item danger">
              <span>🚫</span>
              <p><strong>{stats.outOfStock} products</strong> are completely out of stock</p>
            </div>
          )}
          {stats?.lowStock === 0 && stats?.outOfStock === 0 && (
            <div className="alert-item success">
              <span>✅</span>
              <p>All products are well stocked. No alerts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
