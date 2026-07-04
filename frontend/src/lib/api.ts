import axios from 'axios';

const DEFAULT_LOCAL_API_URL = 'http://localhost:5000/api';
const DEFAULT_PRODUCTION_API_URL = 'https://swifter-admin-panel.onrender.com/api';

const normalizeApiBaseUrl = (value?: string) => {
  if (!value) {
    return DEFAULT_LOCAL_API_URL;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return DEFAULT_LOCAL_API_URL;
  }

  if (trimmedValue.endsWith('/api')) {
    return trimmedValue;
  }

  if (trimmedValue.endsWith('/')) {
    return `${trimmedValue}api`;
  }

  return `${trimmedValue}/api`;
};

const getDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
      return DEFAULT_LOCAL_API_URL;
    }
  }

  return DEFAULT_PRODUCTION_API_URL;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL || getDefaultApiBaseUrl());

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
