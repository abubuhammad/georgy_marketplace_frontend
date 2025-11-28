import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Resolve base URL from environment variables (support both VITE_API_BASE_URL and VITE_API_URL)
const resolvedBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').toString();

// Ensure a sensible default including `/api` so calls like `/customers/...` resolve correctly
const defaultBase = resolvedBaseUrl
  ? resolvedBaseUrl.replace(/\/$/, '')
  : 'http://localhost:5000';

const apiClient: AxiosInstance = axios.create({
  baseURL: defaultBase.endsWith('/api') ? defaultBase : `${defaultBase}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
