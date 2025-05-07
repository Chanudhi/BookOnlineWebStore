import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { getCartItemCount } = useCart();
  const { user, logout } = useAuth();
  const cartCount = getCartItemCount();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          BookStore
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          {user && (
            <Link to="/orders" className="nav-link">Orders</Link>
          )}
          {user && user.isAdmin && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="nav-link profile-trigger">
                <div className="avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span>{user.username}</span>
              </Link>
              <button onClick={logout} className="nav-link nav-button" style={{border: 'none', background: 'none'}}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link nav-button">Register</Link>
            </>
          )}
          <div className="cart-badge">
            <Link to="/cart" className="nav-link">Cart</Link>
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 