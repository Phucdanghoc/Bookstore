const express = require('express');
const { getOrders,
    getOrderById,
    addOrder,
    changeStatus,
    repayVNPAY,
    cancelOrder,
    checkPayment,
    getOrdersAdmin,
    vnPayReturn } = require('../controllers/OrderController');

const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();
const PaymentService = require('../services/PaymentService');
router.get('/test', async (req, res) => {
    const paymentUrl = await PaymentService.generatePaymentUrl({
        amount: 100000,
        orderInfo: '123',
        bankCode: 'NCB',
    }, req);
    res.status(201).json({ message: "Đặt hàng thành công", VNPUrl: paymentUrl });
});

router.get('/', authenticateToken, getOrders);
router.post('/saveOrder', authenticateToken, addOrder);
router.get('/allorders', authenticateToken, getOrdersAdmin);
router.get('/checkpayment', authenticateToken, checkPayment);
router.put('/change-status/:id', authenticateToken, changeStatus);
router.put('/repayment/:id', authenticateToken, repayVNPAY);
router.get('/vnpay-return', vnPayReturn);
router.post('/cancel', authenticateToken, cancelOrder);
router.get('/:id', authenticateToken, getOrderById);




module.exports = router;