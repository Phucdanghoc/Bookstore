const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order_items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }],
    total: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'shipping', 'delivered', 'cancelled'], 
        default: 'pending' 
    },
    order_date: { type: Date, default: Date.now },
    payment_date: { type: Date },
    customerName: { type: String, required: true },
    payment_status: { 
        type: String, 
        enum: ['unpaid', 'paid', 'refunded', 'failed'], 
        default: 'unpaid' 
    },
    payment_method: { type: String , required: true , enum: ['cod', 'banking', 'vnpay'] },
    noteOrder: { type: String },
    payment_code: { type: String  },
    shipping_address: { type: String, required: true },
    contact_number: { type: String, required: true },
    discount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Order', OrderSchema);
