import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';

// Components
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import BookDetails from './components/books/BookDetails';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import Orders from './components/orders/Orders';
import Profile from './components/profile/Profile';

// Context Providers
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Protected Route Components
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <div className="App">
              <Navbar />
              <main className="container">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/book/:id/*" element={<BookDetails />} />

                  {/* Protected Routes */}
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="/cart" element={
                    <PrivateRoute>
                      <Cart />
                    </PrivateRoute>
                  } />
                  <Route path="/checkout" element={
                    <PrivateRoute>
                      <Checkout />
                    </PrivateRoute>
                  } />
                  <Route path="/orders" element={
                    <PrivateRoute>
                      <Orders />
                    </PrivateRoute>
                  } />
                </Routes>
              </main>
            </div>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 