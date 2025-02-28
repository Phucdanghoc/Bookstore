import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserServices from "../../../services/UserServices";
import UserData from "../../../interfaces/UserData";
import { Link } from "react-router-dom";
import { OrderData } from "../../../interfaces/OrderData";
import { ArrowLeft, PackageCheck, PackageX, Loader, Truck } from "lucide-react";

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const response = await UserServices.getDetailUser(id as string);
            setUser(response.data.user);
            setOrders(response.data.orders);
            setTotalOrders(response.data.totalOrders);
            setTotalSpent(response.data.totalSpent);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
    };

    const getStatusTag = (status: string) => {
        let text = "";
        let colorClass = "";
        let Icon = PackageCheck;

        switch (status) {
            case "pending":
                text = "Chờ xác nhận";
                colorClass = "bg-yellow-100 text-yellow-700";
                Icon = Loader;
                break;
            case "processing":
                text = "Đang xử lý";
                colorClass = "bg-blue-100 text-blue-700";
                Icon = Truck;
                break;
            case "delivered":
                text = "Hoàn thành";
                colorClass = "bg-green-100 text-green-700";
                Icon = PackageCheck;
                break;
            case "cancelled":
                text = "Đã hủy";
                colorClass = "bg-red-100 text-red-700";
                Icon = PackageX;
                break;
            default:
                text = "Không xác định";
                colorClass = "bg-gray-100 text-gray-700";
                break;
        }

        return (
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
                <Icon size={16} /> {text}
            </span>
        );
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-gray-100">
            {/* Nút quay lại */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-4 text-blue-600 hover:underline"
            >
                <ArrowLeft size={20} /> Quay lại
            </button>

            {user ? (
                <>
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">  Chi tiết Người Dùng</h2>

                    {/* Card thông tin người dùng */}
                    <div className="bg-white p-6 shadow-lg rounded-xl border border-blue-600">
                        <h3 className="text-xl font-semibold text-gray-700">Thông tin người dùng</h3>
                        <div className="grid grid-cols-2 gap-4 text-xl mt-4">
                            <p ><strong>Tên:</strong><span className="font-semibold"> {user.fullname}</span></p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Điện thoại:</strong> {user.phone}</p>
                            <p><strong>Địa chỉ:</strong> {user.address}</p>
                            <p><strong>Vai trò:</strong> {user.role === "admin" ? "Quản trị viên" : "Khách"}</p>
                            <p><strong>Ngày đăng ký:</strong>  {new Intl.DateTimeFormat("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            }).format(new Date(user.register_date))}</p>
                        </div>
                    </div>

                    {/* Danh sách đơn hàng */}
                    <h3 className="text-2xl font-bold mt-8 text-gray-800">📦 Danh sách đơn hàng</h3>

                    <div className="mt-4 max-h-96 overflow-y-auto space-y-4">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <div key={order._id} className="bg-white p-4 shadow-md rounded-lg border hover:shadow-xl hover:scale-102 transition m-4">
                                    <div className="flex justify-between items-center">
                                        <Link to={`/admin/orders/${order._id}`} className="text-blue-600 font-semibold hover:underline">
                                            Mã đơn hàng: #{order._id}
                                        </Link>
                                        <div className="text-green-600 font-semibold flex items-center gap-2">
                                            {order.discount > 0 ? (
                                                <>
                                                    <span className="text-gray-500 line-through">
                                                        {order.total.toLocaleString()} VNĐ
                                                    </span>
                                                    <span className="text-red-600">
                                                        {(order.total - order.discount).toLocaleString()} VNĐ
                                                    </span>
                                                </>
                                            ) : (
                                                <span>{order.total.toLocaleString()} VNĐ</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-2 text-gray-700">
                                        <div>{getStatusTag(order.status)}</div>
                                        <div>
                                            {new Intl.DateTimeFormat("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            }).format(new Date(order.order_date))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                Không có đơn hàng nào.
                            </div>
                        )}
                    </div>

                    {/* Tổng đơn hàng và tổng tiền */}
                    <div className="mt-6 flex justify-between bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-102 transition hover:bg-blue-200">
                        <p className="text-lg font-semibold">📦 Tổng đơn hàng: {totalOrders}</p>
                        <p className="text-xl font-semibold text-blue-600">💰 Tổng chi tiêu: {totalSpent.toLocaleString()} VNĐ</p>
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-600">Đang tải...</div>
            )}
        </div>
    );
};

export default UserDetailPage;
