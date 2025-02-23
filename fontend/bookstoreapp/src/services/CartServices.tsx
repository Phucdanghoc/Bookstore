import axios from "axios";
import { Checkout } from "../interfaces/CartData";

const API_URL = "http://localhost:3000/api/carts"; // Thay thế bằng URL backend của bạn

const CartServices = {
    getCart: async (page = 1, limit = 10) => {
        try {
            const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy giỏ hàng:", error);
            throw error;
        }
    },

    addToCart: async (bookId: string, quantity: number, price: number) => {
        const response = await axios.post(
            `${API_URL}/add`,
            { book: bookId, quantity, price },
            {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }
        );
        return response;
    },

    updateCartItem: async (itemId: string, quantity: number) => {
        try {
            const response = await axios.put(
                `${API_URL}/${itemId}`,
                { quantity },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }
            );
            return response;
        } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            throw error;
        }
    },
    removeFromCart: async (itemId: string) => {
        try {
            const response = await axios.delete(`${API_URL}/${itemId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            return response.status;
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
            throw error;
        }
    },

    // Xóa toàn bộ giỏ hàng
    clearCart: async () => {
        try {
            const response = await axios.delete(`${API_URL}/clear`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            return response.status;
        } catch (error) {
            console.error("Lỗi khi xóa giỏ hàng:", error);
            throw error;
        }
    },
    checkOut: async (cartItems: string[],
        voucherCode: string) => {
        try {
            const response = await axios.post(`${API_URL}/checkout`, {
                cartItems,
                voucherCode
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            return response;
        } catch (error) {
            console.error("Lỗi khi thực hiện thanh toán:", error);
            throw error;
        }
    },
    getCheckOut: async (token: string) => {
        try {
            const response = await axios.get(`${API_URL}/checkout`, {
                params: { token },  
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            return response;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin thanh toán:", error);
            throw error;
        }
    },
    
    
};

export default CartServices;
