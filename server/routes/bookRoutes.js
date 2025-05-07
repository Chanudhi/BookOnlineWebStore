const router = require('express').Router();
const { getBooks, getBookById, searchBooks } = require('../controllers/bookController');

// Get all books
router.get('/', getBooks);

// Search books
router.get('/search', searchBooks);

// Get book by ID
router.get('/:id', getBookById);

module.exports = router;
