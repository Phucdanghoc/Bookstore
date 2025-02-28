const Book = require('../models/Book');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const Voucher = require('../models/Voucher');
const TokenService = require('../utils/jwt');

const getCart = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const cart = await Cart.findOne({ user: req.user.id }).populate({
            path: 'cart_items',
            populate: { path: 'book', model: 'Book' },
        })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const totalItems = await CartItem.countDocuments({ user: req.user.id });
        const totalPages = Math.ceil(totalItems / limit);
        res.status(200).json({
            cart,
            totalPages,
            currentPage: Number(page),
            totalItems,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
    }
};

const addToCart = async (req, res) => {
    try {
        const { book } = req.body;

        let cart = await Cart.findOne({ user: req.user.id }).populate("cart_items");
        if (!cart) {
            cart = new Cart({ user: req.user.id, cart_items: [] });
        }
        let cartItem = cart.cart_items.find(item => item.book.toString() === book);
        console.log(cartItem);
        if (cartItem) {
            cartItem.quantity += 1;
            const book = await Book.findById(cartItem.book);
            if (cartItem.quantity >= book.stock) {
                return res.status(400).json({ message: "Xin lỗi nhé, sách đã hết hàng" });
            } else {
                await cartItem.save();
            }
        } else {
            cartItem = new CartItem({ book, quantity: 1 });
            const savedCartItem = await cartItem.save();
            cart.cart_items.push(savedCartItem._id);
        }

        await cart.save();
        res.status(200).json({ message: "Item added to cart", cart });
    } catch (error) {
        res.status(500).json({ message: "Failed to add item to cart", error: error.message });
    }
};


const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity: newQuantity } = req.body;
        console.log(id, newQuantity);
        const cartItem = await CartItem.findById(id).populate("book");
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        if (newQuantity > cartItem.book.stock) {
            return res.status(400).json({ message: "Xin lỗi nhé, sách không đủ số lượng" });
        }

        cartItem.quantity = newQuantity;
        cartItem.price = (newQuantity * cartItem.price) / cartItem.quantity;
        await cartItem.save();
        res.status(200).json({ message: "Cart item updated successfully", cartItem });
    } catch (error) {
        res.status(500).json({ message: "Failed to update cart item", error: error.message });
    }
};


const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        cart.cart_items = cart.cart_items.filter((item) => item.toString() !== id);
        await cart.save();
        await OrderItem.findByIdAndDelete(id);

        res.status(200).json({ message: 'Item removed from cart', cart });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        await OrderItem.deleteMany({ _id: { $in: cart.cart_items } });
        cart.cart_items = [];
        await cart.save();

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to clear cart', error: error.message });
    }
};

const checkoutToken = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cartItems, voucherCode } = req.body;
        console.log(userId, cartItems, voucherCode);

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ." });
        }
        const payload = { userId, cartItems, voucherCode };
        const token = TokenService.generateToken(payload, 30 * 60);
        res.status(200).json({
            message: "Tạo checkout token thành công",
            token,
        });
    } catch (error) {
        console.error("Lỗi khi tạo checkout token:", error);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};
const getCheckout = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.query;

        const payload = TokenService.verifyToken(token);
        
        if (!payload || payload.userId !== userId) {
            return res.status(400).json({ message: "Token không hợp lệ." });
        }
        const { cartItems, voucherCode } = payload;
        console.log(cartItems, voucherCode);
        
        let voucher = null;
        if (voucherCode) {
            voucher = await Voucher
                .find({ _id: voucherCode, status: "Active", expired_date: { $gte: new Date() } })
                .exec();
            if (!voucher) {
                return res.status(404).json({ message: "Voucher không hợp lệ." });
            }
        }
        const selectedItems = await CartItem.find({ _id: { $in: cartItems } })
            .populate("book")
            .exec();
        if (!selectedItems.length) {
            return res.status(404).json({ message: "Không có sản phẩm nào được chọn." });
        }
        const user = await User
            .findById(userId)
            .select("fullname email phone address")
            .exec();
        const total = selectedItems.reduce((acc, item) => acc + item.quantity * item.book.price, 0);
        console.log(voucher);
        
        res.status(200).json({ items: selectedItems, totalPrice: total, voucher: voucher, user: user });
    }
    catch (error) {
        console.error("Lỗi khi lấy danh sách checkout:", error);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};


module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkoutToken,
    getCheckout,
};
