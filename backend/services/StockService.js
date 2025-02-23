const Book = require("../models/Book");
const CartItem = require("../models/CartItem");
const Cart = require("../models/Cart");
const StockService = {
    removeCartItem: async (listCartItems, userId) => {
        try {
            await CartItem.deleteMany({ _id: { $in: listCartItems } });
            await Cart.updateOne({ user: userId }, { $pull: { cart_items: { $in: listCartItems } } });
        } catch (error) {
            console.error("Lỗi khi xóa cart item:", error);
        }
    },
    updateStock: async (listCartItems) => {
        try {
            for (const item of listCartItems) {
                const book = await Book.findById(item.book);
                book.stock -= item.quantity;
                await book.save();
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật stock:", error);
        }
    }
};
module.exports = StockService;  