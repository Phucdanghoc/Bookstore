const express = require('express');
const { getBooks, getBookById, addBook, getBooksMinStock, updateBook, deleteBook, getBooksByCategory, searchBooksByTitle, getTopCategories, searchBooksByRange,
    searchBooksByOldest,
    filterBooks,
    searchBooksByNewest, } = require('../controllers/BookController');
const { uploadImageBook } = require('../controllers/MediaController');
const authenticateToken = require('../middlewares/authenticateToken');
const upload = require("../middlewares/upload");

const router = express.Router();

router.get('/', getBooks);
router.get('/category', getBooksByCategory);
router.get('/search', searchBooksByTitle);
router.get('/top-categories', getTopCategories);
router.get('/range', searchBooksByRange);
router.get('/oldest', searchBooksByOldest);
router.get('/filter', filterBooks);
router.get('/newest', searchBooksByNewest);
router.get('/min-stock', getBooksMinStock);
router.get('/:id', getBookById);
router.post('/', authenticateToken, addBook);
router.put('/:id', authenticateToken, updateBook);
router.delete('/:id', authenticateToken, deleteBook);
router.post('/:id/upload', authenticateToken, upload, uploadImageBook);
module.exports = router;
