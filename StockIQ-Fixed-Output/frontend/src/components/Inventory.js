import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';  // ✅ FIX: use shared api service (auto-attaches token)
import '../styles/inventory.css';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all'); // 'all' | 'low' | 'out'

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();  // ✅ FIX: no need to manually set auth header
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on selected tab
  const filtered = products.filter((p) => {
    if (filter === 'low')  return p.status === 'Low Stock';
    if (filter === 'out')  return p.status === 'Out of Stock';
    if (filter === 'good') return p.status === 'In Stock';
    return true; // 'all'
  });

  // Calculate stock percentage for progress bar (max 100)
  const getStockPct = (qty) => Math.min((qty / 100) * 100, 100);

  const getBarColor = (status) => {
    if (status === 'In Stock')    return '#06d6a0';
    if (status === 'Low Stock')   return '#f59e0b';
    return '#ef4444';
  };

  const summary = {
    total:    products.length,
    good:     products.filter(p => p.status === 'In Stock').length,
    low:      products.filter(p => p.status === 'Low Stock').length,
    out:      products.filter(p => p.status === 'Out of Stock').length,
  };

  if (loading) return <div className="loading-screen"><div className="loader" /><p>Loading Inventory...</p></div>;

  return (
    <div className="inventory-page fade-in">
      <div className="page-header">
        <h1>Inventory Monitor</h1>
        <p>Track stock levels and reorder points</p>
      </div>

      {/* Summary row */}
      <div className="inv-summary">
        {[
          { label: 'Total Items', val: summary.total, color: '#3b82f6' },
          { label: 'In Stock',    val: summary.good,  color: '#06d6a0' },
          { label: 'Low Stock',   val: summary.low,   color: '#f59e0b' },
          { label: 'Out of Stock',val: summary.out,   color: '#ef4444' },
        ].map((s) => (
          <div className="inv-summary-card" key={s.label} style={{ '--c': s.color }}>
            <span className="inv-val" style={{ color: s.color }}>{s.val}</span>
            <span className="inv-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {[
          { key: 'all',  label: '📋 All'        },
          { key: 'good', label: '✅ In Stock'    },
          { key: 'low',  label: '⚠️ Low Stock'  },
          { key: 'out',  label: '🚫 Out of Stock'},
        ].map((tab) => (
          <button
            key={tab.key}
            className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stock cards grid */}
      <div className="stock-grid">
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <p style={{ fontSize: '2.5rem' }}>🎉</p>
            <p>No products in this category!</p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <div
              className="stock-card"
              key={p._id}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="stock-card-top">
                <div>
                  <h4 className="stock-name">{p.name}</h4>
                  <span className="stock-cat">{p.category}</span>
                </div>
                {/* Status badge */}
                {p.status === 'In Stock' &&    <span className="badge badge-green">{p.status}</span>}
                {p.status === 'Low Stock' &&   <span className="badge badge-yellow">{p.status}</span>}
                {p.status === 'Out of Stock' &&<span className="badge badge-red">{p.status}</span>}
              </div>

              {/* Stock level progress bar */}
              <div className="stock-bar-wrap">
                <div className="stock-bar-track">
                  <div
                    className="stock-bar-fill"
                    style={{
                      width: `${getStockPct(p.quantity)}%`,
                      background: getBarColor(p.status),
                      boxShadow: `0 0 8px ${getBarColor(p.status)}66`,
                    }}
                  />
                </div>
                <span className="stock-qty" style={{ color: getBarColor(p.status) }}>
                  {p.quantity} units
                </span>
              </div>

              {/* Reorder alert */}
              {p.status !== 'In Stock' && (
                <div className="reorder-tag">
                  🔄 Reorder Required — Qty: {p.quantity}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Inventory;
