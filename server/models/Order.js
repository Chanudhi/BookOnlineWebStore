const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:           Array,
  shippingAddress: String,
  paymentInfo:     Object,
  totalPrice:      Number,
  isPaid:          { type: Boolean, default: false },
  paidAt:          Date
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
