// ============================================
//  src/services/api.js
// ============================================
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Automatically attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token expired or invalid
//       localStorage.clear();
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// Handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';

    const authEndpoints = [
      '/api/patient/login',
      '/api/doctor/login',
      '/api/admin/login',
      '/api/patient/signup',
      '/api/doctor/signup',
    ];

    const isAuthRequest = authEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);



export const authAPI = {
  // FIXED: Changed from /auth/* to /api/*
  patientLogin: (data) => api.post('/api/patient/login', data),
  doctorLogin: (data) => api.post('/api/doctor/login', data),
  adminLogin: (data) => api.post('/api/admin/login', data),
  
  patientSignup: (data) => api.post('/api/patient/signup', data),
  // FIXED: Changed from /auth/doctor/activate to /api/doctor/signup
  doctorSignup: (data) => api.post('/api/doctor/signup', data),
};

export const storage = {
  saveAuth: (data) => {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  },
  clearAuth: () => {
    localStorage.clear();
  },
  getToken: () => localStorage.getItem('token'),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default api;