import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch orders from backend when user changes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch user orders from backend
        const data = await apiService.getUserOrders();
        setOrders(data.orders || []); // always use the 'orders' property
      } catch (err) {
        setError('Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) fetchOrders();
  }, [user, authLoading]);

  const addOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await apiService.createOrder(orderData);
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      return newOrder;
    } catch (error) {
      setError('Failed to create order');
      throw new Error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const getOrders = () => orders;

  const getOrderById = (orderId) => orders.find(order => order._id === orderId || order.id === orderId);

  const value = {
    orders,
    loading,
    error,
    addOrder,
    getOrders,
    getOrderById
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}; 