import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart from backend when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCart([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const items = await apiService.getCart();
        setCart(items);
      } catch (err) {
        setError('Failed to fetch cart');
        setCart([]);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) fetchCart();
  }, [user, authLoading]);

  // Utility to normalize bookId
  const normalizeBookId = (id) => id && id.startsWith('/') ? id.slice(1) : id;

  const addToCart = async (book) => {
    if (!book || !book._id) {
      setError('Invalid book data');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Send bookId, title, price, and imageUrl to backend
      const items = await apiService.addToCart({
        bookId: normalizeBookId(book._id),
        title: book.title,
        price: book.price,
        imageUrl: book.imageUrl
      });
      setCart(items);
    } catch (err) {
      setError('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (bookId) => {
    if (!bookId) {
      setError('Invalid book ID');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await apiService.removeFromCart(normalizeBookId(bookId));
      setCart(items);
    } catch (err) {
      setError('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    if (!bookId) {
      setError('Invalid book ID');
      return;
    }
    if (quantity < 1) {
      await removeFromCart(bookId);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await apiService.updateCartItem(normalizeBookId(bookId), quantity);
      setCart(items);
    } catch (err) {
      setError('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      setCart([]);
      localStorage.removeItem('bookstore_cart');
    } catch (err) {
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    try {
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
      return 0;
    }
  };

  const getCartItemCount = () => {
    try {
      return cart.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      return 0;
    }
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 