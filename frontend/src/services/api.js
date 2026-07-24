import axios from 'axios';
import toast from 'react-hot-toast';

// Use environment variable or fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://lastproject-backend.onrender.com';

console.log('🔗 API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please login again.');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 404) {
      toast.error(data?.message || 'Resource not found.');
    } else if (status === 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(data?.message || 'An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default api;