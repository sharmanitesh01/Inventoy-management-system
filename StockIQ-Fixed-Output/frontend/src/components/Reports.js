import React, { useState, useEffect } from 'react';
import { getProducts, getProductStats } from '../services/api';  // ✅ FIX: use shared api service
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend,
} from 'recharts';
import '../styles/reports.css';

const COLORS = ['#3b82f6', '#06d6a0', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function Reports() {
  const [stats, setStats]     = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, prodRes] = await Promise.all([
        getProductStats(),   // ✅ FIX: uses api.js interceptor (auto-adds token)
        getProducts(),
      ]);
      setStats(statsRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare bar chart data from categories
  const barData = stats?.byCategory?.map((c, i) => ({
    name: c._id,
    Products: c.count,
    'Total Qty': c.totalQty,
    fill: COLORS[i % COLORS.length],
  })) || [];

  // Top 5 products by quantity
  const top5 = [...products].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Radial chart data for stock status
  const radialData = [
    { name: 'In Stock',    value: stats?.inStock    || 0, fill: '#06d6a0' },
    { name: 'Low Stock',   value: stats?.lowStock   || 0, fill: '#f59e0b' },
    { name: 'Out of Stock',value: stats?.outOfStock || 0, fill: '#ef4444' },
  ];

  if (loading) return <div className="loading-screen"><div className="loader" /><p>Loading Reports...</p></div>;

  return (
    <div className="reports-page fade-in">
      <div className="page-header">
        <h1>Analytics & Reports</h1>
        <p>Visual insights into your inventory performance</p>
      </div>

      {/* KPI row */}
      <div className="kpi-row">
        {[
          { label: 'Total SKUs',    val: stats?.total,    unit: 'products', color: '#3b82f6' },
          { label: 'Health Rate',   val: stats?.total ? Math.round((stats.inStock / stats.total) * 100) : 0, unit: '%', color: '#06d6a0' },
          { label: 'Reorder Alert', val: (stats?.lowStock || 0) + (stats?.outOfStock || 0), unit: 'items', color: '#f59e0b' },
        ].map((k) => (
          <div className="kpi-card" key={k.label} style={{ '--kc': k.color }}>
            <span className="kpi-val" style={{ color: k.color }}>{k.val}<small> {k.unit}</small></span>
            <span className="kpi-label">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="reports-grid">
        {/* Bar chart - Category breakdown */}
        <div className="card report-chart-card">
          <h3 className="chart-title">📊 Products by Category</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0d1b35', border: '1px solid #1e3a6e', borderRadius: '10px', color: '#e2e8f0' }} />
                <Bar dataKey="Products" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <rect key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-chart">No category data yet</div>}
        </div>

        {/* Radial chart - Status */}
        <div className="card report-chart-card">
          <h3 className="chart-title">🎯 Stock Status Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="80%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar minAngle={15} dataKey="value" cornerRadius={8} />
              <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
              <Tooltip contentStyle={{ background: '#0d1b35', border: '1px solid #1e3a6e', borderRadius: '10px', color: '#e2e8f0' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products table */}
      <div className="card top-products-card">
        <h3 className="chart-title">🏆 Top 5 Products by Stock Quantity</h3>
        {top5.length === 0 ? (
          <div className="empty-state">No products yet</div>
        ) : (
          <div className="top-list">
            {top5.map((p, i) => (
              <div className="top-row" key={p._id}>
                <span className="top-rank" style={{ color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c3b' : 'var(--text-muted)' }}>
                  #{i + 1}
                </span>
                <div className="top-info">
                  <span className="top-name">{p.name}</span>
                  <span className="top-cat">{p.category}</span>
                </div>
                <div className="top-bar-wrap">
                  <div className="stock-bar-track" style={{ flex: 1 }}>
                    <div className="stock-bar-fill" style={{ width: `${Math.min((p.quantity / (top5[0]?.quantity || 1)) * 100, 100)}%`, background: COLORS[i] }} />
                  </div>
                </div>
                <span className="top-qty" style={{ color: COLORS[i], fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {p.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
