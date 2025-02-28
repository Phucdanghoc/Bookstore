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
    const changeStatus = async (orderId: string, newStatus: string) => {
        try {
            const response = await OrderServices.updateStatus(orderId, newStatus);
            if (response.status == 200) {
                toast.success(response.data.message);
                fetchOrders()

            } else {
                toast.error(response.data.message)

            }
        }
        catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        }
    }
    const cancelledOrder = async (orderId: string) => {
        try {
            const response = await OrderServices.canceleOrder(orderId);
            if (response.status == 200) {
                toast.success(`Đã hủy đơn hàng ${orderId} thành công`);
                fetchOrders()

            } else {
                toast.error(`Hủy đơn hàng ${orderId} thất bại`)
            }
        }
        catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        }
    }

    const formatStatus = (status: string) => {
        let text = "";
        let colorClass = "";

        switch (status) {
            case "pending":
                text = "Chờ xác nhận";
                colorClass = "bg-yellow-100 text-yellow-700";
                break;
            case "processing":
                text = "Đang xử lý";
                colorClass = "bg-blue-100 text-blue-700";
                break;
            case "shipping":
                text = "Đang giao";
                colorClass = "bg-purple-100 text-purple-700";
                break;
            case "delivered":
                text = "Hoàn thành";
                colorClass = "bg-green-100 text-green-700";
                break;
            case "cancelled":
                text = "Đã hủy";
                colorClass = "bg-red-100 text-red-700";
                break;
            default:
                text = "Không xác định";
                colorClass = "bg-gray-100 text-gray-700";
        }

        return (
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
                {text}
            </span>
        );
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
                            <tr key={order._id} className="bg-white border-b" >
                                <td className="px-6 py-4 font-semibold"
                                >
                                    <button onClick={() => window.open(`/admin/orders/${order._id}`, "_blank")}
                                    >
                                        #{order._id}
                                    </button>
                                </td>
                                <td className="px-6 py-4">{order.customerName}</td>
                                <td className="px-6 py-4 text-blue-600 font-semibold">
                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total - order.discount)}
                                </td>
                                <td className={`px-6 py-4 font-bold ${order.status === "Completed" ? "text-green-600" : "text-red-600"}`}>
                                    {formatStatus(order.status)}
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    {order.status == 'delivered' && (
                                        <button className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1">
                                            <Eye size={16} />
                                            Xem đơn hàng
                                        </button>
                                    )}
                                    {order.status == "shipping" && (
                                        <button onClick={
                                            () => {
                                                changeStatus(order._id, "delivered")
                                            }
                                        } className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1">
                                            <Edit size={16} /> Thanh toán
                                        </button>
                                    )}
                                    
                                    {order.status == "pending" && (
                                        <button onClick={
                                            () => {
                                                cancelledOrder(order._id)
                                            }
                                        } className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 flex items-center gap-1">
                                            <Edit size={16} /> Hủy đơn
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
