const CartItem = require('../models/CartItem');
const Voucher = require('../models/Voucher');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const PaymentService = require('../services/PaymentService');
const { updateStock, removeCartItem } = require('./CartController');
const Book = require('../models/Book');
const TokenService = require('../utils/jwt');
const StockService = require('../services/StockService');
const User = require('../models/User');
const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '' } = req.query;
        const query = { user: req.user.id };
        if (status) query.status = status;
        const orders = await Order.find(query)
            .populate({
                path: 'order_items',
                populate: { path: 'book', model: 'Book' },
            })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);
        res.status(200).json({
            orders,
            totalPages,
            currentPage: Number(page),
            totalOrders,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};
const getOrdersAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '' } = req.query;
        const query = {};
        if (status) query.status = status;
        const orders = await Order.find(query)
            .populate({
                path: 'order_items',
                populate: { path: 'book', model: 'Book' },
            })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);
        res.status(200).json({
            orders,
            totalPages,
            currentPage: Number(page),
            totalOrders,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
}
const getOrdersCurrentDay = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); 

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); 
        const match = { order_date: { $gte: startOfDay, $lte: endOfDay } };

        console.log(match); 

        const orders = await Order.find(match)
            .populate({
                path: 'order_items',
                populate: { path: 'book', model: 'Book' },
            })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const totalOrders = await Order.countDocuments(match);
        const totalPages = Math.ceil(totalOrders / limit);

        res.status(200).json({
            orders,
            totalPages,
            currentPage: Number(page),
            totalOrders,
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};


const getOrderById = async (req, res) => {
    try {
        console.log(req.params.id);
        const orderId = req.params.id;

        if (!orderId) {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        const order = await Order.findById(orderId).populate(
            {
                path: 'order_items',
                populate: { path: 'book', model: 'Book' },
            }
        ).exec();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Failed to fetch the order", error: error.message });
    }
};

const addOrder = async (req, res) => {
    try {
        const { tokenCheckout, contactNumber, shippingAddress, paymentMethod, customerName, noteOrder } = req.body;
        const payload = TokenService.verifyToken(tokenCheckout);
        const userId = req.user.id;
        console.log(payload);

        if (!payload || payload.userId !== userId) {
            return res.status(400).json({ message: "Token không hợp lệ." });
        }

        const { cartItems, voucherCode } = payload;
        const selectedItems = await CartItem.find({ _id: { $in: cartItems } }).populate("book").exec();
        if (!selectedItems.length) {
            return res.status(404).json({ message: "Không có sản phẩm nào được chọn." });
        }
        console.log("Cart items", selectedItems);
        console.log("Voucher ID", voucherCode);

        const voucher = await Voucher.findById(voucherCode);
        const total = selectedItems.reduce((acc, item) => acc + item.quantity * item.book.price, 0);
        const orderItems = selectedItems.map(item => {
            return new OrderItem({
                book: item.book._id,
                quantity: item.quantity,
                price: item.quantity * item.book.price,
            });
        });
        await OrderItem.insertMany(orderItems);
        for (const item of selectedItems) {
            await CartItem.findByIdAndDelete(item._id);
        }
        console.log("Voucher", voucher);
        
        const newOrder = new Order({
            user: userId,
            order_items: orderItems.map(item => item._id),
            total,
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            customerName: customerName,
            noteOrder: noteOrder,
            contact_number: contactNumber,
            discount: voucher ? voucher.discount : 0,
        });
        const savedOrder = await newOrder.save();
        await StockService.updateStock(selectedItems);
        await StockService.removeCartItem(cartItems, userId);
        if (paymentMethod == 'vnpay') {
            const paymentUrl = await PaymentService.generatePaymentUrl({
                amount: savedOrder.total - savedOrder.discount,
                orderInfo: `${savedOrder._id}`,
                bankCode: 'NCB',
            }, req);
            return res.status(201).json({ message: "Đặt hàng thành công", VNPUrl: paymentUrl });
        }
        savedOrder.status = 'shipping';
        savedOrder.payment_status = 'cod';
        await savedOrder.save();
        res.status(201).json({ message: "Đặt hàng thành công", order: savedOrder });
    } catch (error) {
        console.error("Lỗi khi đặt hàng:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}

const vnPayReturn = async (req, res) => {
    try {
        const { vnp_SecureHash } = req.query;
        console.log("vnp_SecureHash", vnp_SecureHash);
        const vpnReturn = await PaymentService.verifyReturnUrl(req.query);
        if (!vpnReturn) {
            return res.status(400).json({ message: "Invalid request" });
        } else {
            const order = await Order.findById(vpnReturn.vnp_OrderInfo);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            order.status = 'shipping';
            order.payment_status = 'paid';
            order.payment_date = new Date();
            order.payment_code = vpnReturn.vnp_BankTranNo;
            await order.save();
            res.redirect(`http://localhost:5173/client/payment-result?order_id=${order._id}`);
        }
    } catch (error) {
        console.error("Lỗi khi xử lý thanh toán:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        console.log(req.body);
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại" });
        }
        if (order.status === 'paid') {
            return res.status(400).json({ message: "Không thể hủy đơn hàng đã thanh toán" });
        }
        order.status = 'cancelled';
        order.payment_status = 'refunded';
        await reFillStock(order.order_items);
        await order.save();
        res.status(200).json({ message: "Đơn hàng đã bị hủy", order });
    } catch (error) {
        console.error("Lỗi khi hủy đơn hàng:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}
const reFillStock = async (orderItems) => {
    try {
        const orderItemsData = await OrderItem.find({ _id: { $in: orderItems } });
        for (const item of orderItemsData) {
            const book = await Book.findById(item.book);
            if (book) {
                book.stock += item.quantity;
                await book.save();
            } else {
                console.warn(`Book with ID ${item.book} not found.`);
            }
        }
        console.log('Stock has been updated successfully.');
    } catch (error) {
        console.error('Error in reFillStock:', error);
    }
};


const changeStatus = async (req, res) => {
    try {
        const { status, orderId } = req.body;
        let payment_status = '';
        if (status == "delivered") {
            payment_status = 'paid';
        }
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status, payment_status }, { new: true, runValidators: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update order', error: error.message });
    }
};
const repayVNPAY = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        if (payment_status !== 'paid') {
            return res.status(400).json({ message: 'Invalid payment status' });
        }
        const order = await Order
            .findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.payment_status === 'paid') {
            return res.status(400).json({ message: 'Order has been paid' });
        }
        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Order has been cancelled' });
        }
        if (order.payment_method == 'vnpay') {
            const paymentUrl = await PaymentService.generatePaymentUrl({
                amount: order.total - order.discount,
                orderInfo: `Thanh toán đơn hàng #${order._id}`,
                bankCode: 'NCB',
            }, req);
            res.status(201).json({ message: "Đặt hàng thành công", VNPUrl: paymentUrl }); 
        }
        res.status(200).json({
            message: `Đơn hàng ${order._id} sẽ được thanh toán khi nhận hàng`,
            order: order
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update order', error: error.message });
    }
};
const checkPayment = async (req, res) => {
    try {
        const { orderId } = req.query;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.payment_status === 'paid' && order.payment_status === 'cod') {
            return res.status(200).json({ message: 'Order has been paid', status: order.payment_status });
        } else {
            return res.status(200).json({ message: 'Order has not been paid', status: order.payment_status });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch the order', error: error.message });
    }
};
const getOrdersByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select("-password"); // Không lấy password

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }
        const orders = await Order.find({ user: userId }).populate("order_items");
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((acc, order) => acc + order.total - order.discount, 0);

        res.json({
            user,
            orders,
            totalOrders,
            totalSpent,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!" });
    }
};



module.exports = { getOrdersAdmin, getOrders, getOrderById, addOrder, changeStatus, repayVNPAY, vnPayReturn, cancelOrder, checkPayment , getOrdersByUser , getOrdersCurrentDay};
