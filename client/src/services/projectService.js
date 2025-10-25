import axios from 'axios';

const API_URL = 'http://localhost:5000/api/projects';

// Configuración de axios con token
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

export const projectService = {
  getAll: () => api.get('/'),
  getById: (id) => api.get(`/${id}`),
  create: (projectData) => api.post('/', projectData),
  update: (id, projectData) => api.put(`/${id}`, projectData),
  delete: (id) => api.delete(`/${id}`)
};

export default projectService;
