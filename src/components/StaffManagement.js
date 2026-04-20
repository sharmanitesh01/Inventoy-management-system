import React, { useEffect, useState } from 'react';
import { getStaffList, createStaff, toggleStaff, deleteStaff } from '../services/api';
import '../styles/staffmanagement.css';

const EMPTY_FORM = { name: '', username: '', email: '', password: '' };

export default function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [showForm, setShowForm]   = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await getStaffList();
      setStaffList(res.data);
    } catch {
      flash('Failed to load staff list', true);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg);   setTimeout(() => setError(''), 3000); }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createStaff(form);
      flash('✅ Staff account created successfully');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchStaff();
    } catch (err) {
      flash('❌ ' + (err.response?.data?.message || 'Failed to create staff'), true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, name, isActive) => {
    if (!window.confirm(`${isActive ? 'Suspend' : 'Activate'} ${name}?`)) return;
    try {
      await toggleStaff(id);
      flash(`${isActive ? '🔴 Suspended' : '✅ Activated'}: ${name}`);
      fetchStaff();
    } catch {
      flash('❌ Failed to update status', true);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteStaff(id);
      flash(`🗑️ ${name} has been deleted`);
      fetchStaff();
    } catch {
      flash('❌ Failed to delete staff', true);
    }
  };

  return (
    <div className="staff-page fade-in">

      {/* ── Header ── */}
      <div className="staff-header">
        <div className="page-header">
          <h1>Staff Management</h1>
          <p>{staffList.length} staff account{staffList.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setError(''); }}
        >
          {showForm ? '✕ Cancel' : '＋ Add Staff'}
        </button>
      </div>

      {/* ── Flash Messages ── */}
      {error   && <div className="flash-msg flash-err">{error}</div>}
      {success && <div className="flash-msg flash-ok">{success}</div>}

      {/* ── Create Staff Form ── */}
      {showForm && (
        <div className="staff-form-card">
          <h3>👤 New Staff Account</h3>
          <form onSubmit={handleCreate} className="staff-form">

            {[
              { label: 'Full Name', key: 'name',     type: 'text',     placeholder: 'John Doe' },
              { label: 'Username',  key: 'username',  type: 'text',     placeholder: 'johndoe' },
              { label: 'Email',     key: 'email',     type: 'email',    placeholder: 'john@example.com' },
              { label: 'Password',  key: 'password',  type: 'password', placeholder: 'Min 6 characters' },
            ].map(({ label, key, type, placeholder }) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input
                  className="input-field"
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required
                />
              </div>
            ))}

            <div className="staff-info-box">
              ℹ️ Staff can <strong>view, add, and update</strong> products. Only admins can delete products.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Creating…</> : 'Create Account'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ── Staff Table ── */}
      {staffList.length === 0 ? (
        <div className="card">
          <div className="staff-empty">
            <p style={{ fontSize: '3rem' }}>👥</p>
            <p>No staff accounts yet. Add your first one!</p>
          </div>
        </div>
      ) : (
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                {['#', 'Name', 'Username', 'Email', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffList.map((s, i) => (
                <tr key={s._id} className={!s.isActive ? 'suspended' : ''}>
                  <td className="row-num">{i + 1}</td>
                  <td className="staff-name">{s.name}</td>
                  <td className="staff-username">@{s.username}</td>
                  <td>{s.email}</td>
                  <td>
                    <span className={s.isActive ? 'badge-active' : 'badge-suspended'}>
                      {s.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="staff-actions">
                      <button
                        className={s.isActive ? 'btn-suspend' : 'btn-activate'}
                        onClick={() => handleToggle(s._id, s.name, s.isActive)}
                      >
                        {s.isActive ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        className="btn-delete-staff"
                        onClick={() => handleDelete(s._id, s.name)}
                      >
                        🗑️
                      </button>
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
