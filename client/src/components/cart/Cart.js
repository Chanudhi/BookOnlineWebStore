import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, loading } = useCart();

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-spinner"></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-container empty-cart">
        <h2>Your Cart is Empty</h2>
        <p>Add some books to your cart to get started!</p>
        <Link to="/" className="btn btn-primary">
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.bookId || item._id} className="cart-item">
            <div className="item-image">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x150?text=No+Image';
                }}
              />
            </div>
            <div className="item-info">
              <h3>{item.title}</h3>
              <p className="author">by {item.author}</p>
              <p className="price">
                Price: ${item.price ? item.price.toFixed(2) : '0.00'}
              </p>
              <p className="subtotal">
                Subtotal: ${item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="item-actions">
              <div className="quantity-controls">
                <button
                  className="btn btn-secondary"
                  onClick={() => updateQuantity(item.bookId || item._id, Math.max(0, (item.quantity || 1) - 1))}
                  disabled={loading}
                >
                  -
                </button>
                <span className="quantity">{item.quantity || 1}</span>
                <button
                  className="btn btn-secondary"
                  onClick={() => updateQuantity(item.bookId || item._id, (item.quantity || 1) + 1)}
                  disabled={loading}
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => removeFromCart(item.bookId || item._id)}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <div className="total">
          <span>Total:</span>
          <span>${getCartTotal().toFixed(2)}</span>
        </div>
        <div className="cart-actions">
          <Link to="/" className="btn btn-secondary">
            Continue Shopping
          </Link>
          <Link 
            to="/checkout" 
            className="btn btn-primary"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart; 