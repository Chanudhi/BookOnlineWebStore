const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, getUserOrders } = require('../controllers/orderController');

router.use(protect);
router.post('/', createOrder);
router.get('/', getUserOrders);

module.exports = router;
