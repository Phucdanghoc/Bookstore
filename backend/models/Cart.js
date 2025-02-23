const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cart_items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
    created_at: { type: Date, default: Date.now },
    
});

module.exports = mongoose.model('Cart', CartSchema);