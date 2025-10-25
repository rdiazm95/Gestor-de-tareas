import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const notificationService = {
  getAll: () => api.get('/'),
  getUnreadCount: () => api.get('/unread-count'),
  markAsRead: (notificationId) => api.put(`/${notificationId}/read`),
  markAllAsRead: () => api.put('/mark-all-read'),
  delete: (notificationId) => api.delete(`/${notificationId}`)
};

export default notificationService;
