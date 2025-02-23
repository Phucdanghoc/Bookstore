const mongoose = require("mongoose");
const Book = require("./models/Book");
const books = require("./books.json");
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/Bookstore';

// mongoose
//     .connect(mongoURI)
//     .then(() => console.log('Connected to MongoDB'))
//     .catch((err) => console.error('MongoDB connection failed:', err.message));

// Book.insertMany(books)
//     .then(() => {
//         console.log("Đã chèn dữ liệu sách vào MongoDB");
//     })
//     .catch((err) => console.error(err));
// const mongoose = require('mongoose');
// const fs = require('fs');
const Voucher = require('./models/Voucher'); // Đường dẫn đến model Voucher
const vouchers = require('./vouchers.json'); // Đường dẫn đến file vouchers.json
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

async function seedVouchers() {
    try {
        await Voucher.insertMany(vouchers);
        console.log("✅ 10 vouchers đã được thêm thành công!");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Lỗi khi thêm vouchers:", error);
    }
}

seedVouchers();
