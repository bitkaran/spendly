import axios from 'axios';

// Get backend base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spendly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      // If unauthorized, clear local session (if it exists)
      if (status === 401) {
        localStorage.removeItem('spendly_token');
        localStorage.removeItem('spendly_user');
        
        // Dispatch custom event to trigger app rerender/redirect if needed
        window.dispatchEvent(new Event('spendly_logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
