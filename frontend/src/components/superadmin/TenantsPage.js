import React, { useState, useEffect } from 'react';
import { getAllTenants, toggleTenant, deleteTenant } from '../../services/api';
import '../../styles/products.css';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashMsg, setFlash] = useState('');

  const load = () =>
    getAllTenants()
      .then(r => setTenants(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const flash = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 3500);
  };

  const handleToggle = async (id, name, isActive) => {
    if (!window.confirm(`${isActive ? 'Deactivate' : 'Activate'} ${name}?`)) return;

    try {
      await toggleTenant(id);
      flash(`✅ ${name} ${isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch {
      flash('❌ Failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`PERMANENTLY delete ${name} and ALL its data?\n\nThis cannot be undone.`)) return;

    try {
      await deleteTenant(id);
      flash(`🗑️ ${name} and all data deleted`);
      load();
    } catch {
      flash('❌ Failed to delete company');
    }
  };

  if (loading) return <div className="loading-screen"><div className="loader" /><p>Loading Companies…</p></div>;

  return (
    <div className="products-page fade-in">
      <div className="page-header">
        <h1>All Companies</h1>
        <p>{tenants.length} registered compan{tenants.length !== 1 ? 'ies' : 'y'}</p>
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
            <p>No companies registered yet. They will appear here after signup.</p>
          </div>
        ) : (
          <table className="products-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Company</th>
                <th>Owner</th>
                <th>Users</th>
                <th>Products</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tenants.map((t, i) => (
                <tr key={t._id} style={{ opacity: !t.isActive ? 0.55 : 1 }}>
                  <td className="row-num">{i + 1}</td>

                  <td>
                    <p className="product-name">{t.companyName}</p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {t.email}
                    </p>
                  </td>

                  <td style={{ color: '#94a3b8' }}>{t.ownerName}</td>

                  <td style={{
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {t.userCount}
                  </td>

                  <td style={{
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {t.productCount}
                  </td>

                  <td>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: t.isActive ? '#06d6a0' : '#ef4444',
                    }}>
                      {t.isActive ? '● Active' : '● Disabled'}
                    </span>
                  </td>

                  <td style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: '#64748b'
                  }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>

                  <td>
                    <div className="action-cell" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
                      <button
                        className={`btn btn-sm ${t.isActive ? 'btn-danger' : 'btn-success'}`}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                        onClick={() => handleToggle(t._id, t.companyName, t.isActive)}
                      >
                        {t.isActive ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                        onClick={() => handleDelete(t._id, t.companyName)}
                      >
                        🗑️ Delete
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