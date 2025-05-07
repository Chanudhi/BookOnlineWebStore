import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import jsPDF from 'jspdf';

function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Redirect if cart is empty
  if (cart.length === 0 && !orderConfirmed) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <h2>Your cart is empty</h2>
          <p>Add some books to your cart before checking out.</p>
          <Link to="/" className="btn btn-primary">
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.paymentMethod === 'credit_card') {
      if (!formData.cardNumber.match(/^\d{16}$/)) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }
      if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!formData.cvv.match(/^\d{3,4}$/)) {
        setError('Please enter a valid CVV');
        return false;
      }
    }
    if (!formData.zipCode.match(/^\d{5}(-\d{4})?$/)) {
      setError('Please enter a valid ZIP code');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const order = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        items: cart.map(item => ({
          bookId: item._id,
          title: item.title,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        paymentInfo: formData.paymentMethod === 'credit_card' ? {
          method: 'Credit Card',
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          last4: formData.cardNumber.slice(-4)
        } : { method: formData.paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery' },
        totalPrice: getCartTotal(),
        isPaid: true,
        paidAt: new Date()
      };
      const savedOrder = await addOrder(order);
      setOrderData(savedOrder);
      setOrderConfirmed(true);
      clearCart();
    } catch (error) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!orderData) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Book Store Invoice', 14, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderData._id || 'N/A'}`, 14, 30);
    doc.text(`Shipping: ${orderData.shippingAddress}`, 14, 38);
    doc.text(`Payment Method: ${orderData.paymentInfo?.method || 'N/A'}`, 14, 46);
    doc.text('Items:', 14, 56);
    let y = 64;
    orderData.items.forEach(item => {
      doc.text(`${item.title} x${item.quantity} - $${item.price !== null && item.price !== undefined ? item.price.toFixed(2) : 'N/A'}`, 16, y);
      y += 8;
    });
    doc.text(`Total: $${orderData.totalPrice !== null && orderData.totalPrice !== undefined ? orderData.totalPrice.toFixed(2) : (orderData.totalAmount !== null && orderData.totalAmount !== undefined ? orderData.totalAmount.toFixed(2) : 'N/A')}` , 14, y + 4);
    doc.save(`invoice_${orderData._id || 'order'}.pdf`);
  };

  if (orderConfirmed && orderData) {
    return (
      <div className="checkout-container">
        <h2>Order Confirmed!</h2>
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="cart-items">
            {orderData.items.map(item => (
              <div key={item.bookId} className="summary-item">
                <span>{item.title} × {item.quantity}</span>
                <span>${item.price !== null && item.price !== undefined ? (item.price * item.quantity).toFixed(2) : 'N/A'}</span>
              </div>
            ))}
          </div>
          <div className="total">
            <strong>Total:</strong>
            <strong>${orderData.totalPrice !== null && orderData.totalPrice !== undefined ? orderData.totalPrice.toFixed(2) : (orderData.totalAmount !== null && orderData.totalAmount !== undefined ? orderData.totalAmount.toFixed(2) : 'N/A')}</strong>
          </div>
          <div className="order-details">
            <p><strong>Shipping:</strong> {orderData.shippingAddress}</p>
            <p><strong>Payment Method:</strong> {orderData.paymentInfo?.method || 'N/A'}</p>
          </div>
          <button className="btn btn-primary" onClick={handleDownloadInvoice}>
            Download Invoice (PDF)
          </button>
          <Link to="/orders" className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="cart-items">
          {cart.map(item => (
            <div key={item._id} className="summary-item">
              <span>{item.title} × {item.quantity}</span>
              <span>${item.price !== null && item.price !== undefined ? (item.price * item.quantity).toFixed(2) : 'N/A'}</span>
            </div>
          ))}
        </div>
        <div className="total">
          <strong>Total:</strong>
          <strong>${getCartTotal() !== null && getCartTotal() !== undefined ? getCartTotal().toFixed(2) : 'N/A'}</strong>
        </div>
      </div>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Shipping Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="form-section">
          <h3>Payment Method</h3>
          <div className="form-group payment-method-group">
            <label className="payment-method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={formData.paymentMethod === 'credit_card'}
                onChange={handleChange}
              />
              <span>Credit Card</span>
            </label>
            <label className="payment-method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={formData.paymentMethod === 'paypal'}
                onChange={handleChange}
              />
              <span>PayPal</span>
            </label>
            <label className="payment-method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={formData.paymentMethod === 'cod'}
                onChange={handleChange}
              />
              <span>Cash on Delivery</span>
            </label>
          </div>
          {formData.paymentMethod === 'credit_card' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date (MM/YY)</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}
        </div>
        <div className="checkout-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout; 