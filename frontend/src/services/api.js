import axios from 'axios';

// const api = axios.create({ baseURL: '/api' });

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

// Auto-attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login    = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe    = ()     => api.get('/auth/me');

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts     = (params) => api.get('/products', { params });
export const getProductStats = ()       => api.get('/products/stats');
export const createProduct   = (data)   => api.post('/products', data);
export const updateProduct   = (id, d)  => api.put(`/products/${id}`, d);
export const deleteProduct   = (id)     => api.delete(`/products/${id}`);

// ── Users (team management) ───────────────────────────────────────────────────
export const getUsers    = ()     => api.get('/users');
export const createUser  = (data) => api.post('/users', data);
export const toggleUser  = (id)   => api.patch(`/users/${id}/toggle`);
export const deleteUser  = (id)   => api.delete(`/users/${id}`);

// ── Settings ──────────────────────────────────────────────────────────────────
export const getSettings    = ()     => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);

// ── Audit logs ────────────────────────────────────────────────────────────────
export const getAuditLogs = () => api.get('/audit');

// ── Super Admin ───────────────────────────────────────────────────────────────
export const getPlatformStats  = ()          => api.get('/superadmin/stats');
export const getAllTenants      = ()          => api.get('/superadmin/tenants');
export const toggleTenant      = (id)        => api.patch(`/superadmin/tenants/${id}/toggle`);
export const freezeTenant      = (id)        => api.patch(`/superadmin/tenants/${id}/freeze`);
export const updateTenantPlan  = (id, plan)  => api.patch(`/superadmin/tenants/${id}/plan`, { plan });
export const deleteTenant      = (id)        => api.delete(`/superadmin/tenants/${id}`);

export default api;
