const mongoose = require("mongoose");
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
// const Voucher = require('./models/Voucher'); // Đường dẫn đến model Voucher
// const vouchers = require('./vouchers.json'); // Đường dẫn đến file vouchers.json
// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('Could not connect to MongoDB...', err));

// async function seedVouchers() {
//     try {
//         await Voucher.insertMany(vouchers);
//         console.log("✅ 10 vouchers đã được thêm thành công!");
//         mongoose.connection.close();
//     } catch (error) {
//         console.error("❌ Lỗi khi thêm vouchers:", error);
//     }
// }

// seedVouchers();
const { faker } = require('@faker-js/faker');
const Order = require("./models/Order");
const OrderItem = require("./models/OrderItem");
const Book = require("./models/Book");
const User = require("./models/User");

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const generateRandomDate = (daysAgo) => {
    const today = new Date();
    today.setDate(today.getDate() - daysAgo);
    return today;
};

const seedOrders = async () => {
    try {
        console.log("Đang xóa đơn hàng cũ...");
        await Order.deleteMany({});
        await OrderItem.deleteMany({});

        console.log("Đang lấy dữ liệu người dùng và sách...");
        const users = await User.find();
        const books = await Book.find();
        
        if (users.length === 0 || books.length === 0) {
            console.log("Không có dữ liệu người dùng hoặc sách, hãy kiểm tra lại database!");
            return;
        }

        let orders = [];
        for (let i = 0; i < 40; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const selectedBooks = [];
            let totalPrice = 0;

            // Chọn ngẫu nhiên 10 sách
            for (let j = 0; j < 10; j++) {
                const book = books[Math.floor(Math.random() * books.length)];
                const quantity = faker.number.int({ min: 1, max: 3 });
                totalPrice += book.price * quantity;
                selectedBooks.push({ book: book._id, quantity, price: book.price * quantity });
            }

            // Lưu Order Items
            const orderItems = await OrderItem.insertMany(selectedBooks);
            const orderItemIds = orderItems.map((item) => item._id);

            // Ngẫu nhiên 50% VNPay, 50% COD
            const paymentMethod = Math.random() > 0.5 ? "banking" : "cod";

            // Giảm giá (random 0 - 20%)
            const discount = Math.random() > 0.3 ? faker.number.int({ min: 10000, max: totalPrice * 0.2 }) : 0;

            // Tạo đơn hàng mới
            const newOrder = new Order({
                user: user._id,
                order_items: orderItemIds,
                total: totalPrice,
                payment_method: paymentMethod,
                shipping_address: faker.location.streetAddress(),
                customerName: user.fullname || faker.person.fullName(),
                noteOrder: faker.lorem.sentence(),
                contact_number: user.phone || faker.phone.number(),
                discount: discount,
                order_date: generateRandomDate(Math.floor(i / 4)), // 10 ngày gần nhất
                status: paymentMethod === "banking" ? "shipping" : "shipping",
                payment_status: paymentMethod === "banking" ? "paid" : "unpaid",
            });

            orders.push(newOrder);
        }

        await Order.insertMany(orders);
        console.log("✅ Seed dữ liệu đơn hàng thành công!");
    } catch (error) {
        console.error("❌ Lỗi khi seed dữ liệu:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedOrders();
