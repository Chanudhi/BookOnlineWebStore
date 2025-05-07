import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the token and debug requests
instance.interceptors.request.use(
  (config) => {
    // Debug request
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
instance.interceptors.response.use(
  (response) => {
    // Debug successful response with full details
    console.log('API Response Details:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      config: {
        baseURL: response.config.baseURL,
        url: response.config.url,
        method: response.config.method,
        headers: response.config.headers,
        data: response.config.data
      }
    });

    // Ensure response data has the expected format for auth endpoints
    if (response.config.url.includes('/auth/login') || response.config.url.includes('/auth/register')) {
      if (!response.data.token || !response.data.user) {
        console.error('Invalid auth response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      if (!response.data.hasOwnProperty('success')) {
        response.data.success = true;
      }
    }
    if (response.config.url.includes('/auth/verify')) {
      if (!response.data.user || !response.data.success) {
        console.error('Invalid auth verify response format:', response.data);
        throw new Error('Invalid response format from server');
      }
    }

    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data,
      message: error.message,
      stack: error.stack,
      config: error.config ? {
        baseURL: error.config.baseURL,
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data
      } : null
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Remove auth header
      delete instance.defaults.headers.common['Authorization'];
      
      // Don't redirect on registration/login failures
      if (!error.config.url.includes('/auth/')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default instance; 