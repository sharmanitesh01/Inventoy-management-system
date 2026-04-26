import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/products.css';

const emptyForm = { name: '', quantity: '', category: 'Electronics', price: '', description: '' };
const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Sports', 'Books', 'Other'];

function Products() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [form,       setForm]       = useState(emptyForm);
  const [search,     setSearch]     = useState('');
  const [msg,        setMsg]        = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (product) => {
    setEditItem(product);
    setForm({
      name:        product.name,
      quantity:    product.quantity,
      category:    product.category,
      price:       product.price,
      description: product.description || '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateProduct(editItem._id, form);
        showMsg('✅ Product updated!');
      } else {
        await createProduct(form);
        showMsg('✅ Product added!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      showMsg('❌ Error: ' + (err.response?.data?.message || 'Failed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      showMsg('🗑️ Product deleted');
      fetchProducts();
    } catch (err) {
      showMsg('❌ Delete failed: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'In Stock')    return <span className="badge badge-green">{status}</span>;
    if (status === 'Low Stock')   return <span className="badge badge-yellow">{status}</span>;
    return <span className="badge badge-red">{status}</span>;
  };

  if (loading) return <div className="loading-screen"><div className="loader" /><p>Loading Products…</p></div>;

  return (
    <div className="products-page fade-in">
      <div className="products-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Product Catalog</h1>
          <p>{products.length} products total</p>
        </div>
        <div className="header-actions">
          <input
            className="input-field search-input"
            placeholder="🔍 Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openAdd}>＋ Add Product</button>
        </div>
      </div>

      {msg && (
        <div className={`flash-msg ${msg.startsWith('❌') ? 'flash-err' : 'flash-ok'}`}>
          {msg}
        </div>
      )}

      <div className="card table-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '2.5rem' }}>📦</p>
            <p>{search ? 'No products match your search.' : 'No products yet. Add your first one!'}</p>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                {['#', 'Name', 'Category', 'Qty', 'Price', 'Status', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p._id}>
                  <td className="row-num">{i + 1}</td>
                  <td className="product-name">{p.name}</td>
                  <td><span className="cat-pill">{p.category}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{p.quantity}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>₹{p.price.toLocaleString()}</td>
                  <td>{getStatusBadge(p.status)}</td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                      {isAdmin && (
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

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ Edit Product' : '＋ Add New Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input className="input-field" name="name" value={form.name}
                    onChange={handleChange} placeholder="e.g. Samsung TV" required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="input-field" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input className="input-field" name="quantity" type="number" min="0"
                    value={form.quantity} onChange={handleChange} placeholder="0" required />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input className="input-field" name="price" type="number" min="0"
                    value={form.price} onChange={handleChange} placeholder="0" required />
                </div>
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea className="input-field" name="description"
                  value={form.description} onChange={handleChange} placeholder="Short description…" />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editItem ? '💾 Save Changes' : '＋ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
