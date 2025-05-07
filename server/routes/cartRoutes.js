const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getCart, addToCart, updateCart, removeFromCart } = require('../controllers/cartController');

router.use(protect);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/update', updateCart);
router.delete('/remove/:bookId', removeFromCart);

module.exports = router;
