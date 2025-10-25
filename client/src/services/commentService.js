import axios from 'axios';

const API_URL = 'http://localhost:5000/api/comments';

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

export const commentService = {
  getByTask: (taskId) => api.get(`/task/${taskId}`),
  create: (taskId, content) => api.post(`/task/${taskId}`, { content }),
  update: (commentId, content) => api.put(`/${commentId}`, { content }),
  delete: (commentId) => api.delete(`/${commentId}`)
};

export default commentService;
