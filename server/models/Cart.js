// const mongoose = require('mongoose');

// const cartSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   items: [
//     {
//       bookId: String,
//       title: String,
//       price: Number,
//       quantity: { type: Number, default: 1 },
//     }
//   ],
// }, { timestamps: true });

// module.exports = mongoose.model('Cart', cartSchema);
// // This code defines a Mongoose schema for a shopping cart in a Node.js application.
// // The schema includes a userId to associate the cart with a specific user,
// // an array of items in the cart, each with a bookId, title, price, and quantity.
// // The cart schema is then exported as a Mongoose model named 'Cart'.

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      bookId:   String,
      title:    String,
      price:    Number,
      imageUrl: String,
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
