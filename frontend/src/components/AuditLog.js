import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/api';
import '../styles/products.css';

const ACTION_COLORS = {
  CREATE: '#06d6a0', UPDATE: '#3b82f6', DELETE: '#ef4444', LOGIN: '#8b5cf6',
};

export default function AuditLog() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs()
      .then(r => setLogs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="loader" /><p>Loading Audit Log…</p></div>;

  return (
    <div className="products-page fade-in">
      <div className="page-header">
        <h1>Audit Log</h1>
        <p>Last {logs.length} activity records</p>
      </div>

      <div className="card table-card">
        {logs.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '2.5rem' }}>📋</p>
            <p>No audit entries yet. Activity will appear here as your team uses the system.</p>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 700, color: '#e2e8f0' }}>{l.userName || '—'}</td>
                  <td>
                    <span style={{
                      padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      background: `${ACTION_COLORS[l.action] || '#94a3b8'}22`,
                      color: ACTION_COLORS[l.action] || '#94a3b8',
                      border: `1px solid ${ACTION_COLORS[l.action] || '#94a3b8'}44`,
                    }}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{l.module}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
