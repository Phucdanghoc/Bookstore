const express = require('express');
const router = express.Router();

const { getTotalRevenue,
    getOrderStatusStats,
    getTotalBooksSold,
    getRevenueByDate } = require('../controllers/StatiticsController');
const authenticateToken = require('../middlewares/authenticateToken');


router.get('/total-revenue', authenticateToken, getTotalRevenue);
router.get('/order-status-stats', authenticateToken, getOrderStatusStats);
router.get('/total-products-sold', authenticateToken, getTotalBooksSold);
router.get('/revenue-by-date', authenticateToken, getRevenueByDate);

module.exports = router;

