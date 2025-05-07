const Order = require('../models/Order');
const Cart  = require('../models/Cart');

exports.createOrder = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const { shippingAddress, paymentInfo, items, firstName, lastName, email } = req.body;
    if (!shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      userId: req.user._id,
      items,
      shippingAddress,
      paymentInfo,
      totalPrice,
      isPaid: true,
      paidAt: Date.now()
    });

    // clear cart
    await Cart.findOneAndDelete({ userId: req.user._id });

    // Respond in the structure the frontend expects
    res.status(201).json({
      _id: order._id,
      customer: {
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        shippingAddress: order.shippingAddress
      },
      items: order.items,
      totalAmount: order.totalPrice,
      paymentMethod: order.paymentInfo?.method || '',
      paymentDetails: order.paymentInfo || {},
      createdAt: order.createdAt,
      paidAt: order.paidAt
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};
