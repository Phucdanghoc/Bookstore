const express = require('express');

const { getCart, addToCart, removeFromCart, updateCartItem , checkoutToken , getCheckout } = require('../controllers/CartController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();


router.get('/', authenticateToken, getCart);
router.post('/add', authenticateToken, addToCart);
router.get('/checkout', authenticateToken, getCheckout);
router.post('/checkout', authenticateToken, checkoutToken);
router.delete('/:id', authenticateToken, removeFromCart);
router.put('/:id', authenticateToken, updateCartItem);

module.exports = router;

