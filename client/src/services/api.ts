import axios from 'axios';

let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && rawUrl.startsWith('http:')) {
  rawUrl = rawUrl.replace(/^http:/, 'https:');
}
const API_URL = rawUrl;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT Bearer token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('processpilot_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('processpilot_token');
        localStorage.removeItem('processpilot_user');
      }
    }
    return Promise.reject(error);
  }
);
