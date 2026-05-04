import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/products.css';

// const EMPTY_FORM = { name: '', quantity: '', category: 'Electronics', price: '', description: '', sku: '' };
const EMPTY_FORM = { name: '', quantity: 0, category: 'Electronics', price: 0, description: '', sku: '' };
const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Sports', 'Books', 'Other'];

export default function Products() {
  const { can, isAdminUp } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [flashMsg, setFlashMsg] = useState('');

  const load = async () => {
    try {
      const res = await getProducts(search ? { search } : {});
      setProducts(res.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const flash = (msg) => { setFlashMsg(msg); setTimeout(() => setFlashMsg(''), 3500); };

  const openAdd = () => { setEditItem(null); setForm({ ...EMPTY_FORM }); setShowModal(true); };
  const openEdit = (p) => {
    setEditItem(p);
    setForm({ name: p.name, quantity: p.quantity, category: p.category, price: p.price, description: p.description || '', sku: p.sku || '' });
    setShowModal(true);
  };

  // const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === 'quantity' || name === 'price'
        ? Number(value)
        : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
    ...form,
    quantity: Number(form.quantity),
    price: Number(form.price)
    };
    
    try {
      // if (editItem) { await updateProduct(editItem._id, form); flash('✅ Product updated!'); }
      // else { await createProduct(form); flash('✅ Product added!'); }

      if (editItem) {
        await updateProduct(editItem._id, payload);
        flash('✅ Product updated!');
      } else {
        await createProduct(payload);
        flash('✅ Product added!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      flash('❌ ' + (err.response?.data?.message || 'Failed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await deleteProduct(id); flash('🗑️ Product deleted'); load(); }
    catch (err) { flash('❌ ' + (err.response?.data?.message || 'Failed')); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s) => {
    if (s === 'In Stock') return <span className="badge badge-green">{s}</span>;
    if (s === 'Low Stock') return <span className="badge badge-yellow">{s}</span>;
    return <span className="badge badge-red">{s}</span>;
  };

  if (loading) return <div className="loading-screen"><div className="loader" /><p>Loading Products…</p></div>;

  return (
    <div className="products-page fade-in">
      <div className="products-header">
        <div className="page-header">
          <h1>Product Catalog</h1>
          <p>{products.length} total products</p>
        </div>
        <div className="header-actions">
          <input
            className="input-field search-input"
            type="text"
            placeholder="🔍 Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
          />
          {can('products.create') && (
            <button className="btn btn-primary" onClick={openAdd}>＋ Add Product</button>
          )}
        </div>
      </div>

      {flashMsg && (
        <div className={`flash-msg ${flashMsg.startsWith('❌') ? 'flash-err' : 'flash-ok'}`}>
          {flashMsg}
        </div>
      )}

      <div className="card table-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '3rem' }}>📦</p>
            <p>No products found. {can('products.create') && 'Click "+ Add Product" to get started.'}</p>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p._id}>
                  <td className="row-num">{i + 1}</td>
                  <td className="product-name">{p.name}</td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{p.sku || '—'}</td>
                  <td><span className="cat-pill">{p.category}</span></td>
                  <td>
                    <span style={{
                      fontWeight: 700, fontFamily: 'var(--font-mono)',
                      color: p.quantity === 0 ? '#ef4444' : p.quantity <= 10 ? '#f59e0b' : '#06d6a0',
                    }}>
                      {p.quantity}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                    ₹{Number(p.price).toLocaleString('en-IN')}
                  </td>
                  <td>{statusBadge(p.status)}</td>
                  <td>
                    <div className="action-cell">
                      {can('products.edit') && (
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                      )}
                      {isAdminUp && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ Edit Product' : '➕ Add Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input className="input-field" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Samsung TV" required />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input className="input-field" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. ELEC-001" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select className="input-field" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input className="input-field" name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input className="input-field" name="price" type="number" min="0" value={form.price} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input-field" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Optional product description" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? '💾 Update' : '➕ Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
