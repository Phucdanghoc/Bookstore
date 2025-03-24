import axios from "axios";
import { CreateOrderData } from "../interfaces/OrderData";
const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
const OrderServices = {
    async createOrder(order: CreateOrderData) {
        return await axios.post(`${API_URL}/orders/saveOrder`, order);
    },
    async getAllOrders(status: string, page: number = 1, limit: number = 10) {
        return await axios.get(`${API_URL}/orders/allorders`, {
            params: { status: status, page, limit },
        });
    },

    async updateStatus(orderId: string, status: string) {
        return await axios.put(`${API_URL}/orders/change-status`, { orderId, status });
    },
    async deleteOrder(orderId: string) {
        return await axios.delete(`${API_URL}/orders/${orderId}`);
    },
    async canceleOrder(orderId: string) {
        return await axios.put(`${API_URL}/orders/cancel-order`, { orderId });
    },

    async getOrders() {
        return await axios.get(`${API_URL}/orders`, {
            params : { page: 1, limit: 100 },
        });
    },
    async getOrderById(orderId: string) {
        return await axios.get(`${API_URL}/orders/${orderId}`);
    },
    async checkPayment(orderId: string) {
        return await axios.get(`${API_URL}/orders/checkpayment?orderId=${orderId}`);
    },
    orderCurrentDay: async (limit: number, page: number) => {
        const response = await axios.get(`${API_URL}/orders/currentday`, {
            params: { limit, page },
        });
        return response.data;
    },
    async repaymentOrder(orderId: string) {
        return await axios.put(`${API_URL}/orders/repayment/${orderId}`);
    },
};

export default OrderServices;