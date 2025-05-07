import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear both storage types
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Books API calls
export const getBooks = async (params = {}) => {
  try {
    console.log('Fetching books with params:', params);
    const response = await api.get('/books', { 
      params: {
        ...params,
        startIndex: params.startIndex || 0,
        maxResults: params.maxResults || 10
      }
    });
    console.log('Books API response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch books');
    }
    
    return {
      books: response.data.data,
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const searchBooks = async (query, params = {}) => {
  try {
    console.log('Searching books with query:', query, 'and params:', params);
    const response = await api.get('/books/search', { 
      params: { 
        query,
        ...params 
      }
    });
    console.log('Search API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

export const getBookById = async (id) => {
  try {
    console.log('Fetching book details for ID:', id);
    const response = await api.get(`/books/${id}`);
    console.log('Book details API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

// Cart API calls
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (bookData) => {
  // bookData: { bookId, title, price }
  const response = await api.post('/cart', bookData);
  return response.data;
};

export const updateCartItem = async (bookId, quantity) => {
  const response = await api.put('/cart/update', { bookId, quantity });
  return response.data;
};

export const removeFromCart = async (bookId) => {
  const response = await api.delete(`/cart/remove/${bookId}`);
  return response.data;
};

// Order API calls
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getUserOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// Create the API object before exporting
const apiService = {
  login,
  register,
  getBooks,
  getBookById,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  createOrder,
  getUserOrders
};

export default apiService; 