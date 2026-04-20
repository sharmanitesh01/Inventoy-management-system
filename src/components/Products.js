import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/products.css';
import { useAuth } from '../context/AuthContext';

// Empty form template - used for both Add and Edit
const emptyForm = { name: '', quantity: '', category: 'Electronics', price: '', description: '' };

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Sports', 'Books', 'Other'];

function Products() {
  const [products, setProducts] = useState([]);   // List of all products
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false); // Show/hide the form modal
  const [editItem, setEditItem]   = useState(null);  // null = adding, object = editing
  const [form, setForm]           = useState(emptyForm);
  const [search, setSearch]       = useState('');
  const [msg, setMsg]             = useState('');
  const { isAdmin }     = useAuth();  

  // Run once when component loads
  useEffect(() => {
    fetchProducts();
  }, []);

  // Get auth header (token needed for all API calls)
  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products', authHeader());
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new product
  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // Open modal for editing existing product
  const openEdit = (product) => {
    setEditItem(product);
    setForm({
      name: product.name,
      quantity: product.quantity,
      category: product.category,
      price: product.price,
      description: product.description || '',
    });
    setShowModal(true);
  };

  // Handle form field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Spread operator copies all existing form fields, then overwrites the changed one
  };

  // Submit form - either add or edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        // PUT = update existing
        await axios.put(`/api/products/${editItem._id}`, form, authHeader());
        showMsg('✅ Product updated!');
      } else {
        // POST = create new
        await axios.post('/api/products', form, authHeader());
        showMsg('✅ Product added!');
      }
      setShowModal(false);
      fetchProducts(); // Refresh list
    } catch (err) {
      showMsg('❌ Error: ' + (err.response?.data?.message || 'Failed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, authHeader());
      showMsg('🗑️ Product deleted');
      fetchProducts();
    } catch (err) {
      showMsg('❌ Delete failed');
    }
  };

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000); // Hide after 3 seconds
  };

  // Filter products by search term
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'In Stock')    return <span className="badge badge-green">{status}</span>;
    if (status === 'Low Stock')   return <span className="badge badge-yellow">{status}</span>;
    if (status === 'Out of Stock') return <span className="badge badge-red">{status}</span>;
  };

  if (loading) return <div className="loading-screen"><div className="loader" /><p>Loading Products...</p></div>;

  return (
    <div className="products-page fade-in">
      {/* Header Row */}
      <div className="products-header">
        <div className="page-header">
          <h1>Product Catalog</h1>
          <p>{products.length} products in database</p>
        </div>
        <div className="header-actions">
          <input
            className="input-field search-input"
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openAdd}>
            ＋ Add Product
          </button>
        </div>
      </div>

      {/* Flash message */}
      {msg && <div className={`flash-msg ${msg.startsWith('❌') ? 'flash-err' : 'flash-ok'}`}>{msg}</div>}

      {/* Products Table */}
      <div className="card table-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '3rem' }}>📦</p>
            <p>No products found. Add your first product!</p>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p._id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <td className="row-num">{i + 1}</td>
                  <td className="product-name">{p.name}</td>
                  <td><span className="cat-pill">{p.category}</span></td>
                  <td className="qty-cell">
                    <span style={{ color: p.quantity <= 10 ? '#f59e0b' : '#06d6a0', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {p.quantity}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>₹{p.price}</td>
                  <td>{getStatusBadge(p.status)}</td>
                  <td className="action-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                    {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>🗑️</button>
                  )     }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL FORM ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input className="input-field" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Samsung TV" required />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="input-field" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input className="input-field" name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} placeholder="0" required />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input className="input-field" name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="0" required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input-field" name="description" value={form.description} onChange={handleChange} placeholder="Optional product description..." rows={3} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
