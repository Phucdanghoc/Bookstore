const express = require('express');
const {
    createVoucher,
    getVouchers,
    updateVoucher,
    deleteVoucher,
    validateVoucher,
    getVouchersByCode,
    searchVouchers,
} = require('../controllers/VoucherController');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.post('/', authenticateToken, createVoucher);
router.get('/code/:code', getVouchersByCode);
router.get('/',
    // authenticateToken,
    getVouchers);
router.get('/search', authenticateToken, searchVouchers);
router.put('/:id', authenticateToken, updateVoucher);
router.delete('/:id', authenticateToken, deleteVoucher);
router.post('/validate', authenticateToken, validateVoucher);
module.exports = router;
