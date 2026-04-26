import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach token automatically on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const adminLogin = (data) => api.post('/auth/login', data);
export const staffLogin = (data) => api.post('/staff/login', data);

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts   = ()         => api.get('/products');
export const getProductStats = ()       => api.get('/products/stats');
export const getProduct    = (id)       => api.get(`/products/${id}`);
export const createProduct = (data)     => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id)       => api.delete(`/products/${id}`);

// ─── Staff (admin only) ───────────────────────────────────────────────────────
export const getStaffList = ()     => api.get('/staff');
export const createStaff  = (data) => api.post('/staff', data);
export const toggleStaff  = (id)   => api.patch(`/staff/${id}/toggle`);
export const deleteStaff  = (id)   => api.delete(`/staff/${id}`);

export default api;
