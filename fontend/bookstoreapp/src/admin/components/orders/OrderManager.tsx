import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, Edit } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderServices from "../../../services/OrderServices";
import { OrderData } from "../../../interfaces/OrderData";

const OrderManager = () => {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    useEffect(() => {
        fetchOrders();
    }, [currentPage, searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            const response = await OrderServices.getAllOrders(statusFilter, currentPage, LIMIT);
            setOrders(response.data.orders);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", error);
        }
    };
    const formatStatus = (status: string) => {
        switch (status) {
            case "pending":
                return "Chờ xác nhận";
            case "processing":
                return "Đang xử lý";
            case "shipping":
                return "Đang giao";
            case "delivered":
                return "Hoàn thành";
            case "cancelled":
                return "Đã hủy";
            default:
                return "";
        }
    };


    return (
        <div className="p-6 flex flex-col h-screen">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">📦 Quản lý Đơn Hàng</h2>
            </div>
            <div className="flex items-center gap-2 mb-4">
                <Search size={20} className="text-gray-500" />
                <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    className="border p-2 rounded-md w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="border p-2 rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Tất cả</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipped">Đã giao</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 border-b text-left">Mã đơn</th>
                            <th className="px-6 py-3 border-b text-left">Khách hàng</th>
                            <th className="px-6 py-3 border-b text-left">Tổng tiền</th>
                            <th className="px-6 py-3 border-b text-left">Trạng thái</th>

                            <th className="px-6 py-3 border-b text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className="bg-white border-b">
                                <td className="px-6 py-4 font-semibold">#{order._id}</td>
                                <td className="px-6 py-4">{order.customerName}</td>
                                <td className="px-6 py-4 text-blue-600 font-semibold">
                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total)}
                                </td>
                                <td className={`px-6 py-4 font-bold ${order.status === "Completed" ? "text-green-600" : "text-red-600"}`}>
                                    {formatStatus(order.status)}
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1">
                                        <Eye size={16} /> Xem
                                    </button>
                                    {order.status != "pending" && (
                                        <button className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 flex items-center gap-1">
                                            <Edit size={16} /> Thanh toán
                                        </button>
                                    )}
                                    {order.status == "pending" && (
                                        <button className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 flex items-center gap-1">
                                            <Edit size={16} /> Hủy
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center mt-4 items-center gap-2">
                <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    <ChevronLeft size={24} />
                </button>
                <span className="text-lg font-semibold">{currentPage} / {totalPages}</span>
                <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default OrderManager;
