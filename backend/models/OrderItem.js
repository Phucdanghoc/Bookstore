const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, 
});


module.exports = mongoose.model('OrderItem', OrderItemSchema);
