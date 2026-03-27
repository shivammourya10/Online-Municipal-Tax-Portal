import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Tax APIs
export const taxAPI = {
  calculateIncomeTax: (data) => api.post('/tax/calculate/income', data),
  calculateGST: (data) => api.post('/tax/calculate/gst', data),
  calculatePropertyTax: (data) => api.post('/tax/calculate/property', data),
  calculateCorporateTax: (data) => api.post('/tax/calculate/corporate', data),
  getTaxRules: (params) => api.get('/tax/rules', { params }),
  createTaxRule: (data) => api.post('/tax/rules', data),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyRazorpay: (data) => api.post('/payments/verify/razorpay', data),
  verifyStripe: (data) => api.post('/payments/verify/stripe', data),
  handleFailure: (data) => api.post('/payments/failure', data),
  getTransactions: (params) => api.get('/payments', { params }),
  getTransaction: (id) => api.get(`/payments/${id}`),
  createRefund: (id, data) => api.post(`/payments/${id}/refund`, data),
};

// Document APIs
export const documentAPI = {
  upload: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDocuments: (params) => api.get('/documents', { params }),
  getDocument: (id) => api.get(`/documents/${id}`),
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  verifyDocument: (id, data) => api.put(`/documents/${id}/verify`, data),
  getPending: (params) => api.get('/documents/pending/verification', { params }),
  archive: (id) => api.put(`/documents/${id}/archive`),
};

// Tax Profile APIs
export const taxProfileAPI = {
  createOrUpdate: (data) => api.post('/tax-profile', data),
  get: () => api.get('/tax-profile'),
  addIncomeSource: (data) => api.post('/tax-profile/income-sources', data),
  updateIncomeSource: (id, data) => api.put(`/tax-profile/income-sources/${id}`, data),
  deleteIncomeSource: (id) => api.delete(`/tax-profile/income-sources/${id}`),
  addInvestment: (data) => api.post('/tax-profile/investments', data),
  verifyPAN: () => api.post('/tax-profile/verify-pan'),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getTaxpayer: () => api.get('/dashboard/taxpayer'),
  getAdmin: () => api.get('/dashboard/admin'),
  getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
  getUsers: (params) => api.get('/dashboard/users', { params }),
  updateUserStatus: (id, data) => api.put(`/dashboard/users/${id}/status`, data),
};
