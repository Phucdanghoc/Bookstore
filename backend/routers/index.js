const express = require('express');
const bookRoutes = require('./book.js');
const authRoutes = require('./auth.js');
const userRoutes = require('./user.js');
const voucherRoutes = require('./voucher.js');
const cartRoutes = require('./cart.js');
const orderRoutes = require('./order.js');
const commentRoutes = require('./comment.js');
const statisticsRoutes = require('./statitics.js');
const router = express.Router();

router.use('/books', bookRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/comments', commentRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/carts', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/statistics', statisticsRoutes);

router.get('/', (req, res) => {
    res.send('API is running...');
});




module.exports = router;
