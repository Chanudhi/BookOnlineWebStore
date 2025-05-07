import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

// Helper function to get stored auth data
const getStoredAuthData = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  return {
    token,
    user: storedUser ? JSON.parse(storedUser) : null
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = useCallback(async () => {
    try {
      const { token } = getStoredAuthData();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get('/auth/verify');
      
      if (!response.data || !response.data.success || !response.data.user) {
        throw new Error('Invalid response format from server');
      }
      
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const { token, user: storedUser } = getStoredAuthData();

      // Set user from storage immediately if present
      if (storedUser) {
        setUser(storedUser);
      }

      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          await verifyToken();
        } catch (error) {
          console.error('Failed to verify token:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [verifyToken]);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post('/auth/login', {
        email: email.trim(),
        password
      });

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      const { token, user: userData } = response.data;

      // Store auth data based on remember me preference
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(userData));

      // Set default authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to login. Please try again.');
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      const { token, user: newUser } = response.data;

      // Store in session storage by default for new registrations
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to register. Please try again.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 