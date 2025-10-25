import axios from 'axios';

const API_URL = 'http://localhost:5000/api/activities';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export const activityService = {
  getByTask: (taskId) => api.get(`/task/${taskId}`)
};

export default activityService;
