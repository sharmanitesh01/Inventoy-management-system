import React, { useState, useEffect } from 'react';
import { getAllTenants, toggleTenant, freezeTenant, updateTenantPlan, deleteTenant } from '../../services/api';
import '../../styles/products.css';

const PLAN_COLORS = { trial: '#f59e0b', basic: '#3b82f6', pro: '#8b5cf6', enterprise: '#06d6a0' };
const ALL_PLANS   = ['trial','basic','pro','enterprise'];

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashMsg, setFlash]  = useState('');

  const load = () =>
    getAllTenants().then(r => setTenants(r.data)).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const flash = (msg) => { setFlash(msg); setTimeout(() => setFlash(''), 3500); };

  const handleToggle = async (id, name, isActive) => {
    if (!window.confirm(`${isActive ? 'Deactivate' : 'Activate'} ${name}?`)) return;
    try { await toggleTenant(id); flash(`✅ ${name} ${isActive ? 'deactivated' : 'activated'}`); load(); }
    catch { flash('❌ Failed'); }
  };

  const handleFreeze = async (id, name, isFrozen) => {
    if (!window.confirm(`${isFrozen ? 'Unfreeze' : 'Freeze'} ${name}?`)) return;
    try { await freezeTenant(id); flash(`🧊 ${name} ${isFrozen ? 'unfrozen' : 'frozen'}`); load(); }
    catch { flash('❌ Failed'); }
  };

  const handlePlan = async (id, plan) => {
    try { await updateTenantPlan(id, plan); flash(`✅ Plan updated to ${plan}`); load(); }
    catch { flash('❌ Failed to update plan'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`PERMANENTLY delete ${name} and ALL its data?\n\nThis cannot be undone.`)) return;
    try { await deleteTenant(id); flash(`🗑️ ${name} and all data deleted`); load(); }
    catch { flash('❌ Failed to delete tenant'); }
  };

  if (loading) return <div className="loading-screen"><div className="loader" /><p>Loading Companies…</p></div>;

  return (
    <div className="products-page fade-in">
      <div className="page-header">
        <h1>All Companies</h1>
        <p>{tenants.length} registered tenant{tenants.length !== 1 ? 's' : ''}</p>
      </div>

      {flashMsg && (
        <div className={`flash-msg ${flashMsg.startsWith('❌') ? 'flash-err' : 'flash-ok'}`}>
          {flashMsg}
        </div>
      )}

      <div className="card table-card" style={{ overflowX: 'auto' }}>
        {tenants.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '3rem' }}>🏢</p>
            <p>No companies registered yet. They will appear here after signing up.</p>
          </div>
        ) : (
          <table className="products-table" style={{ minWidth: 960 }}>
            <thead>
              <tr>
                <th>#</th><th>Company</th><th>Owner</th><th>Plan</th>
                <th>Users</th><th>Products</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t, i) => (
                <tr key={t._id} style={{ opacity: !t.isActive ? 0.55 : 1 }}>
                  <td className="row-num">{i + 1}</td>
                  <td>
                    <p className="product-name">{t.companyName}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{t.email}</p>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{t.ownerName}</td>
                  <td>
                    <select
                      value={t.plan}
                      onChange={e => handlePlan(t._id, e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${PLAN_COLORS[t.plan] || '#94a3b8'}44`,
                        borderRadius: 6, padding: '4px 8px',
                        color: PLAN_COLORS[t.plan] || '#94a3b8',
                        fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                      }}
                    >
                      {ALL_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{t.userCount}</td>
                  <td style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{t.productCount}</td>
                  <td>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 700,
                      color: t.isFrozen ? '#8b5cf6' : t.isActive ? '#06d6a0' : '#ef4444',
                    }}>
                      {t.isFrozen ? '🧊 Frozen' : t.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-cell" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
                      <button
                        className={`btn btn-sm ${t.isActive ? 'btn-danger' : 'btn-success'}`}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                        onClick={() => handleToggle(t._id, t.companyName, t.isActive)}
                      >
                        {t.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderColor: '#8b5cf644', color: '#8b5cf6' }}
                        onClick={() => handleFreeze(t._id, t.companyName, t.isFrozen)}
                      >
                        {t.isFrozen ? '🧊 Unfreeze' : '🧊 Freeze'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                        onClick={() => handleDelete(t._id, t.companyName)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
