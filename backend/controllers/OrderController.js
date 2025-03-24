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

        if (!payload || payload.userId !== userId) {
            return res.status(400).json({ message: "Token không hợp lệ." });
        }

        const { cartItems, voucherCode } = payload;
        const selectedItems = await CartItem.find({ _id: { $in: cartItems } }).populate("book").exec();
        if (!selectedItems.length) {
            return res.status(404).json({ message: "Không có sản phẩm nào được chọn." });
        }

        let voucher = voucherCode ? await Voucher.findOne({ _id: voucherCode }) : null;
        const total = selectedItems.reduce((acc, item) => acc + item.quantity * item.book.price, 0);
        const orderItems = selectedItems.map(item => ({
            book: item.book._id,
            quantity: item.quantity,
            price: item.quantity * item.book.price,
        }));

        const savedOrderItems = await OrderItem.insertMany(orderItems);
        await CartItem.deleteMany({ _id: { $in: cartItems } });

        const newOrder = new Order({
            user: userId,
            order_items: savedOrderItems.map(item => item._id),
            total,
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            customerName,
            noteOrder,
            contact_number: contactNumber,
            discount: voucher ? voucher.discount : 0,
            status: "pending",
            payment_status: "unpaid",
        });

        const savedOrder = await newOrder.save();
        await StockService.updateStock(selectedItems);
        await StockService.removeCartItem(cartItems, userId);

        if (paymentMethod === "vnpay") {
            const paymentUrl = await PaymentService.generatePaymentUrl({
                amount: savedOrder.total - savedOrder.discount,
                orderInfo: `${savedOrder._id}`,
                bankCode: "NCB",
            }, req);
            return res.status(201).json({ message: "Đặt hàng thành công", VNPUrl: paymentUrl });
        }else{
            savedOrder.status = "shipping";
            savedOrder.payment_status = "cod";
            await savedOrder.save();
            res.status(201).json({ message: "Đặt hàng thành công", order: savedOrder });
        }
        await savedOrder.save();
        res.status(400).json({ message: "Thanh toán bị gián đoạn", order: savedOrder });
       
    } catch (error) {
        console.error("Lỗi khi đặt hàng:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

const vnPayReturn = async (req, res) => {
    try {
        const { vnp_SecureHash, vnp_ResponseCode } = req.query;
        const vpnReturn = await PaymentService.verifyReturnUrl(req.query);
        if (!vpnReturn) {
            return res.status(400).json({ message: "Yêu cầu không hợp lệ" });
        }

        const order = await Order.findById(vpnReturn.vnp_OrderInfo);
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        if (vnp_ResponseCode === "00") {
            order.status = "shipping";
            order.payment_status = "paid";
            order.payment_date = new Date();
            order.payment_code = vpnReturn.vnp_BankTranNo;
            await order.save();
            res.redirect(`http://localhost:5173/client/payment-result?order_id=${order._id}&status=success`);
        } else {
            order.status = "pending";
            order.payment_status = "unpaid";
            await order.save();
            res.redirect(`http://localhost:5173/client/payment-result?order_id=${order._id}&status=failed&error=${vnp_ResponseCode}`);
        }
    } catch (error) {
        console.error("Lỗi khi xử lý thanh toán:", error);
        const order = await Order.findById(req.query.vnp_OrderInfo);
        if (order) {
            order.status = "pending";
            order.payment_status = "unpaid";
            await order.save();
        }
        res.redirect(`http://localhost:5173/client/payment-result?order_id=${req.query.vnp_OrderInfo}&status=error&error=system`);
    }
};
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

     
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        if (order.payment_status === "paid") {
            return res.status(400).json({ message: "Đơn hàng đã được thanh toán" });
        }
        if (order.status === "cancelled") {
            return res.status(400).json({ message: "Đơn hàng đã bị hủy" });
        }
        if (order.status === "delivered") {
            return res.status(400).json({ message: "Đơn hàng đã được giao, không thể thanh toán lại" });
        }
        if (order.payment_method === "vnpay") {
            const paymentUrl = await PaymentService.generatePaymentUrl({
                amount: order.total - (order.discount || 0), 
                orderInfo: `#${order._id}`,
                bankCode: "NCB",
            }, req);
            return res.status(200).json({ 
                message: "Tạo URL thanh toán lại thành công", 
                VNPUrl: paymentUrl 
            });
        } else if (order.payment_method === "cod") {
            return res.status(400).json({ 
                message: "Đơn hàng này sử dụng phương thức COD, không thể thanh toán lại bằng VNPay" 
            });
        } else {
            return res.status(400).json({ 
                message: "Phương thức thanh toán không được hỗ trợ để thanh toán lại" 
            });
        }
    } catch (error) {
        console.error("Lỗi khi xử lý thanh toán lại:", error);
        res.status(500).json({ 
            message: "Lỗi máy chủ khi xử lý thanh toán lại", 
            error: error.message 
        });
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
