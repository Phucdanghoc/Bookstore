const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  pages: { type: Number, required: true },
  images: { type: [String], required: true }, 
  publisher: { type: String, required: true }, 
  publication_date: { type: Date, required: true },
});

module.exports = mongoose.model('Book', BookSchema);
