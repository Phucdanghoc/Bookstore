import axios from "axios";
import { CreateOrderData } from "../interfaces/OrderData";
const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
const OrderServices = {
    async createOrder(order: CreateOrderData) {
        return await axios.post(`${API_URL}/orders/saveOrder`, order);
    },
    // async getOrders() {
    //     return await axios.get(`${API_URL}/order`);
    // },
    // async updateOrder(order: Order) {
    //     return await axios.put(`${API_URL}/order`, order);
    // },
    // async deleteOrder(orderId: number) {
    //     return await axios.delete(`${API_URL}/order/${orderId}`);
    // }
    async getAllOrders(status: string, page: number = 1, limit: number = 10) {
        return await axios.get(`${API_URL}/orders/allorders`, {
            params: { status: status, page, limit },
        });
    },
    async getOrders() {
        return await axios.get(`${API_URL}/orders`);
    },
    async getOrderById(orderId: string) {
        return await axios.get(`${API_URL}/orders/${orderId}`);
    },
    async checkPayment(orderId: string) {
        return await axios.get(`${API_URL}/orders/checkpayment?orderId=${orderId}`);
    }
};

export default OrderServices;