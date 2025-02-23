const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, required: true },
});
module.exports = mongoose.model('CartItem', CartItemSchema);
