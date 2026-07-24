import axios from 'axios';
import toast from 'react-hot-toast';

// Use environment variable or fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔗 API URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add token to headers
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

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      console.error('Network error:', error);
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please login again.');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
      
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      
      case 404:
        toast.error(data?.message || 'Resource not found.');
        break;
      
      case 500:
        toast.error('Server error. Please try again later.');
        console.error('Server error:', error);
        break;
      
      default:
        toast.error(data?.message || 'An unexpected error occurred.');
        console.error('API error:', error);
    }
    
    return Promise.reject(error);
  }
);

export default api;