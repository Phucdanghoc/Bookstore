const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
    code: { type: String, required: true },
    discount: { type: Number, required: true }, // Giảm giá theo VND
    min_order_value: { type: Number, required: true }, // Số tiền tối thiểu để áp dụng
    expired_date: { type: Date, required: true },
    status: { type: String, default: 'active' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voucher', VoucherSchema);
