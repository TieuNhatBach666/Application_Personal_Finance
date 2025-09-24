import axios from 'axios';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },
  
  // Categories
  CATEGORIES: {
    BASE: '/categories',
    BY_TYPE: (type: string) => `/categories/type/${type}`,
    BY_ID: (id: string) => `/categories/${id}`,
  },
  
  // Transactions (to be implemented)
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ID: (id: string) => `/transactions/${id}`,
    SUMMARY: '/transactions/summary',
  },
  
  // Budgets (to be implemented)
  BUDGETS: {
    BASE: '/budgets',
    BY_ID: (id: string) => `/budgets/${id}`,
    PROGRESS: '/budgets/progress',
  },
  
  // Statistics (to be implemented)
  STATISTICS: {
    OVERVIEW: '/statistics/overview',
    BY_CATEGORY: '/statistics/by-category',
    TRENDS: '/statistics/trends',
  },
} as const;