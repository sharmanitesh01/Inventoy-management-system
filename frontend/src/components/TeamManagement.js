import React, { useEffect, useState } from 'react';
import { getUsers, createUser, toggleUser, deleteUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/teammanagement.css';

const EMPTY = { fullName: '', username: '', email: '', password: '', phone: '', role: 'staff' };

const ROLE_OPTIONS_BY_CALLER = {
  platform_owner: ['company_owner','company_admin','manager','staff'],
  company_owner:  ['company_admin','manager','staff'],
  company_admin:  ['manager','staff'],
};

export default function TeamManagement() {
  const { user } = useAuth();
  const [list,     setList]    = useState([]);
  const [form,     setForm]    = useState(EMPTY);
  const [showForm, setShow]    = useState(false);
  const [error,    setError]   = useState('');
  const [success,  setSuccess] = useState('');
  const [loading,  setLoading] = useState(false);

  const load = async () => {
    try { const r = await getUsers(); setList(r.data); }
    catch { flashErr('Failed to load team members'); }
  };

  useEffect(() => { load(); }, []);

  const flashOk  = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };
  const flashErr = (msg) => { setError(msg);   setTimeout(() => setError(''),   3500); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser(form);
      flashOk('✅ Team member created successfully');
      setForm(EMPTY); setShow(false); load();
    } catch (err) {
      flashErr('❌ ' + (err.response?.data?.message || 'Failed to create user'));
    } finally { setLoading(false); }
  };

  const handleToggle = async (id, name, isActive) => {
    if (!window.confirm(`${isActive ? 'Suspend' : 'Activate'} ${name}?`)) return;
    try {
      await toggleUser(id);
      flashOk(`${isActive ? '⏸️ Suspended' : '▶️ Activated'}: ${name}`);
      load();
    } catch { flashErr('❌ Failed to update status'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      flashOk(`🗑️ ${name} deleted`);
      load();
    } catch (err) { flashErr('❌ ' + (err.response?.data?.message || 'Failed to delete')); }
  };

  const roleColors = {
    company_owner: '#8b5cf6', company_admin: '#3b82f6',
    manager: '#06d6a0', staff: '#94a3b8',
  };

  const availableRoles = ROLE_OPTIONS_BY_CALLER[user?.role] || ['staff'];

  return (
    <div className="staff-page fade-in">
      <div className="staff-header">
        <div className="page-header">
          <h1>Team Management</h1>
          <p>{list.length} team member{list.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`}
          onClick={() => { setShow(!showForm); setError(''); }}
        >
          {showForm ? '✕ Cancel' : '＋ Add Member'}
        </button>
      </div>

      {error   && <div className="flash-msg flash-err">{error}</div>}
      {success && <div className="flash-msg flash-ok">{success}</div>}

      {showForm && (
        <div className="staff-form-card">
          <h3>👤 New Team Member</h3>
          <form onSubmit={handleCreate} className="staff-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Full Name', key: 'fullName',  type: 'text',     ph: 'John Doe'            },
                { label: 'Username',  key: 'username',  type: 'text',     ph: 'johndoe'             },
                { label: 'Email',     key: 'email',     type: 'email',    ph: 'john@example.com'    },
                { label: 'Password',  key: 'password',  type: 'password', ph: 'Min 6 characters'    },
                { label: 'Phone',     key: 'phone',     type: 'text',     ph: '9876543210 (optional)'},
              ].map(({ label, key, type, ph }) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input
                    className="input-field"
                    type={type}
                    placeholder={ph}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={key !== 'phone'}
                  />
                </div>
              ))}
              <div className="form-group">
                <label>Role</label>
                <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {availableRoles.map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShow(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" /> Creating…</> : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {list.length === 0 ? (
        <div className="card">
          <div className="staff-empty">
            <p style={{ fontSize: '3rem' }}>👥</p>
            <p>No team members yet. Click "Add Member" to get started.</p>
          </div>
        </div>
      ) : (
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Username</th><th>Email</th>
                <th>Role</th><th>Status</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u, i) => (
                <tr key={u._id} className={!u.isActive ? 'suspended' : ''}>
                  <td className="row-num">{i + 1}</td>
                  <td className="staff-name">{u.fullName}</td>
                  <td className="staff-username">@{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{
                      padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      background: `${roleColors[u.role] || '#94a3b8'}22`,
                      color: roleColors[u.role] || '#94a3b8',
                      border: `1px solid ${roleColors[u.role] || '#94a3b8'}44`,
                    }}>
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={u.isActive ? 'badge-active' : 'badge-suspended'}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="staff-actions">
                      {u.role !== 'company_owner' && (
                        <>
                          <button
                            className={u.isActive ? 'btn-suspend' : 'btn-activate'}
                            onClick={() => handleToggle(u._id, u.fullName, u.isActive)}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button className="btn-delete-staff" onClick={() => handleDelete(u._id, u.fullName)}>
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
