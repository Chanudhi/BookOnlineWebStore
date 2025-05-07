const Cart = require('../models/Cart');

// Utility to normalize bookId
const normalizeBookId = (id) => id && id.startsWith('/') ? id.slice(1) : id;

exports.getCart = async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  res.json(cart ? cart.items : []);
};

exports.addToCart = async (req, res, next) => {
  let { bookId, title, price, imageUrl } = req.body;
  console.log('addToCart called:', { user: req.user, bookId, title, price, imageUrl });
  
  if (!bookId || !title || price === undefined || price === null) {
    console.log('Missing required fields:', { bookId, title, price });
    return res.status(400).json({ message: 'Missing required fields' });
  }

  bookId = normalizeBookId(bookId);

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

  const existingItem = cart.items.find(i => normalizeBookId(i.bookId) === bookId);
  if (existingItem) {
    existingItem.quantity += 1;
    existingItem.price = price;
    if (imageUrl) existingItem.imageUrl = imageUrl;
  } else {
    cart.items.push({
      bookId,
      title,
      price,
      imageUrl,
      quantity: 1
    });
  }
  
  await cart.save();
  console.log('Cart after add:', JSON.stringify(cart, null, 2));
  res.json(cart.items);
};

exports.updateCart = async (req, res, next) => {
  let { bookId, quantity } = req.body;
  if (!bookId || quantity === undefined || quantity === null) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  bookId = normalizeBookId(bookId);
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  console.log('Cart items before update:', cart.items.map(i => i.bookId));
  const existingItem = cart.items.find(i => normalizeBookId(i.bookId) === bookId);
  if (!existingItem) {
    console.log('Item not found for update. Looking for:', bookId);
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(i => normalizeBookId(i.bookId) !== bookId);
  } else {
    existingItem.quantity = quantity;
  }

  await cart.save();
  res.json(cart.items);
};

exports.removeFromCart = async (req, res, next) => {
  try {
    let { bookId } = req.params;
    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required' });
    }
    bookId = normalizeBookId(bookId);
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      console.log('Cart not found for user:', req.user._id);
      return res.status(404).json({ message: 'Cart not found' });
    }
    // Extra debug: print both raw and normalized bookIds
    console.log('Cart items before removal:', cart.items.map(i => ({ raw: i.bookId, normalized: normalizeBookId(i.bookId) })));
    const beforeCount = cart.items.length;
    cart.items = cart.items.filter(i => normalizeBookId(i.bookId) !== bookId);
    const afterCount = cart.items.length;
    console.log('Trying to remove bookId:', bookId, 'Removed:', beforeCount - afterCount);
    await cart.save();
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
  }
};
