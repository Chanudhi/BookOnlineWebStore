import React from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';

function Orders() {
  const { orders } = useOrders();

  if (!orders || orders.length === 0) {
    return (
      <div className="orders-container empty-orders">
        <h2>No Orders Yet</h2>
        <p>Start shopping to create your first order!</p>
        <Link to="/" className="btn btn-primary">
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <span className="order-date">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                </span>
                <span className="order-id">
                  Order #{order._id ? order._id.toString().slice(-6) : ''}
                </span>
                <span className={`order-status status-completed`}>
                  Completed
                </span>
              </div>
              <div className="order-total">
                Total: ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="order-items">
              {order.items && order.items.map(item => (
                <div key={item.bookId} className="order-item">
                  <span className="item-title">{item.title}</span>
                  <span className="item-quantity">× {item.quantity}</span>
                  <span className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <div className="shipping-info">
                <strong>Shipping Address:</strong>
                <p>
                  {order.customer ? (
                    <>
                      {order.customer.firstName} {order.customer.lastName}<br />
                      {order.customer.shippingAddress}
                    </>
                  ) : ''}
                </p>
              </div>
              <div className="payment-info">
                <strong>Payment Method:</strong>
                <p>
                  {order.paymentMethod || ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders; 