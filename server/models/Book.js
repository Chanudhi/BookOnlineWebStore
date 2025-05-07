const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['fiction', 'non-fiction', 'science', 'history', 'biography']
  },
  imageUrl: {
    type: String,
    required: true
  },
  publisher: {
    type: String,
    required: true
  },
  publishedDate: {
    type: Date,
    required: true
  },
  pages: {
    type: Number,
    required: true,
    min: 1
  },
  inStock: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Create indexes for better search performance
bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ inStock: 1 });
bookSchema.index({ createdAt: -1 });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book; 