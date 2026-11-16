import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuspilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle common HTTP errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized, clear token
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('campuspilot_token');
      localStorage.removeItem('campuspilot_user');
    }
    return Promise.reject(error);
  }
);

export default api;

