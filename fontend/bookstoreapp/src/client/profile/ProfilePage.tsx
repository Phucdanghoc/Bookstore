import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import OrderServices from "../../services/OrderServices";
import { OrderData } from "../../interfaces/OrderData";
import { useNavigate, useParams } from "react-router-dom";
import UserServices from "../../services/UserServices";
import { toast } from "react-toastify";
import UserData from "../../interfaces/UserData";

const ProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<UserData | undefined>();
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State để lưu lỗi
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await UserServices.getProfile();
                setUser(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };

        const fetchOrders = async () => {
            try {
                const response = await OrderServices.getOrders();
                setOrders(response.data.orders);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đơn hàng:", error);
            }
        };

        fetchUserInfo();
        fetchOrders();
    }, [userId]);

    // Hàm validate các field
    const validateField = (name: string, value: string | undefined) => {
        const newErrors: { [key: string]: string } = { ...errors };

        switch (name) {
            case "fullname":
                if (!value) {
                    newErrors[name] = "Họ tên không được để trống";
                } else if (!/^[a-zA-Z\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+$/.test(value)) {
                    newErrors[name] = "Họ tên chỉ được chứa chữ cái và khoảng trắng";
                } else {
                    delete newErrors[name];
                }
                break;

            case "phone":
                if (value && !/^[0-9]{10}$/.test(value)) {
                    newErrors[name] = "Số điện thoại phải là 10 chữ số";
                } else {
                    delete newErrors[name];
                }
                break;

            case "address":
                if (value && value.trim().length < 5) {
                    newErrors[name] = "Địa chỉ phải có ít nhất 5 ký tự";
                } else {
                    delete newErrors[name];
                }
                break;

            case "birthday":
                if (value && new Date(value) > new Date()) {
                    newErrors[name] = "Ngày sinh không được trong tương lai";
                } else {
                    delete newErrors[name];
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prev: any) => prev ? { ...prev, [name]: value } : prev);
        validateField(name, value); // Validate ngay khi thay đổi
    };

    const handleUpdateUser = async () => {
        if (!user) return;

        // Validate tất cả các field trước khi submit
        validateField("fullname", user.fullname);
        validateField("phone", user.phone);
        validateField("address", user.address);
        validateField("birthday", user.birthday);

        // Nếu có lỗi, không cho submit
        if (Object.keys(errors).length > 0) {
            toast.error("Vui lòng sửa các lỗi trước khi cập nhật");
            return;
        }

        try {
            await UserServices.updateProfile(user);
            setUser(user);
            toast.success("Cập nhật thông tin thành công");
        } catch (error) {
            toast.error("Cập nhật thông tin thất bại");
            console.error("Lỗi khi cập nhật thông tin người dùng:", error);
        }
    };

    if (!user) {
        return <div className="text-center p-6 text-blue-600 text-lg">Đang tải...</div>;
    }

    return (
        <div className="max-w mx-auto h-full p-6 bg-white rounded-lg shadow-lg mt-4 border border-gray-300 grid grid-cols-10 gap-6">
            <div className="col-span-3 bg-blue-50 p-5 rounded-lg border border-blue-400">
                <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
                    Thông tin người dùng
                </h2>
                <div className="mt-4 space-y-3 text-lg">
                    {/* Họ tên */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Họ tên</label>
                        <div className="flex items-center gap-2">
                            <User className="text-blue-600 w-6 h-6" />
                            <input
                                type="text"
                                name="fullname"
                                className="border border-gray-300 p-2 rounded-md w-full"
                                value={user.fullname || ""}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Email</label>
                        <div className="flex items-center gap-2">
                            <Mail className="text-blue-600 w-6 h-6" />
                            <input
                                type="email"
                                className="border border-gray-300 p-2 rounded-md w-full bg-gray-100 cursor-not-allowed"
                                value={user.email || ""}
                                disabled={true}
                            />
                        </div>
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Số điện thoại</label>
                        <div className="flex items-center gap-2">
                            <Phone className="text-blue-600 w-6 h-6" />
                            <input
                                type="text"
                                name="phone"
                                className="border border-gray-300 p-2 rounded-md w-full"
                                value={user.phone || ""}
                                placeholder="Chưa cập nhật"
                                onChange={handleChange}
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    {/* Địa chỉ */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Địa chỉ</label>
                        <div className="flex items-center gap-2">
                            <MapPin className="text-blue-600 w-6 h-6" />
                            <input
                                type="text"
                                name="address"
                                className="border border-gray-300 p-2 rounded-md w-full"
                                value={user.address || ""}
                                placeholder="Chưa cập nhật"
                                onChange={handleChange}
                            />
                        </div>
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    {/* Ngày sinh */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Ngày sinh</label>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-blue-600 w-6 h-6" />
                            <input
                                type="date"
                                name="birthday"
                                min="1900-01-01"
                                max={new Date().toISOString().split("T")[0]}
                                className="border border-gray-300 p-2 rounded-md w-full"
                                value={user.birthday ? new Date(user.birthday).toISOString().split("T")[0] : ""}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.birthday && <p className="text-red-500 text-sm mt-1">{errors.birthday}</p>}
                    </div>
                </div>

                <button
                    onClick={handleUpdateUser}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Cập nhật
                </button>
            </div>
            <div className="col-span-7">
                <div className="flex bg-blue-100 p-2 rounded-lg">
                    <button
                        className={`px-4 py-2 rounded-lg text-lg font-medium transition ${activeTab === "pending" ? "bg-blue-500 text-white" : "text-gray-600"}`}
                        onClick={() => setActiveTab("pending")}
                    >
                        🕒 Chờ thanh toán
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-lg font-medium transition ${activeTab === "paid" ? "bg-blue-500 text-white" : "text-gray-600"}`}
                        onClick={() => setActiveTab("paid")}
                    >
                        ✅ Đã thanh toán
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-lg font-medium transition ${activeTab === "shipping" ? "bg-blue-500 text-white" : "text-gray-600"}`}
                        onClick={() => setActiveTab("shipping")}
                    >
                        📦 Đang giao
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-lg font-medium transition ${activeTab === "shipped" ? "bg-blue-500 text-white" : "text-gray-600"}`}
                        onClick={() => setActiveTab("shipped")}
                    >
                        🚚 Đã giao
                    </button>
                </div>

                <div className="mt-4">
                    {activeTab === "pending" && renderOrderList(orders.filter(order => order.status === "pending"), navigate)}
                    {activeTab === "paid" && renderOrderList(orders.filter(order => order.payment_status === "paid"), navigate)}
                    {activeTab === "shipping" && renderOrderList(orders.filter(order => order.status === "shipping"), navigate)}
                    {activeTab === "shipped" && renderOrderList(orders.filter(order => order.status === "delivered"), navigate)}
                </div>
            </div>
        </div>
    );
};

const renderOrderList = (orders: OrderData[], navigate: any) => {
    if (orders.length === 0) {
        return <p className="text-gray-500 text-lg text-center">Không có đơn hàng nào.</p>;
    }

    return (
        <div className="space-y-4 h-full max-h-150 overflow-y-auto">
            {orders.map((order, index) => (
                <div key={index} className="bg-white p-4 shadow-md rounded-lg border">
                    <p
                        className="text-lg font-bold cursor-pointer hover:text-blue-600 transition"
                        title="Xem chi tiết đơn hàng"
                        onClick={() => navigate(`/client/orders/${order._id}`)}
                    >
                        🛒 Mã đơn: #{order._id}
                    </p>
                    <p className="text-gray-600 mt-2">
                        📅 Ngày đặt hàng: {new Date(order.order_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </p>
                    <p className="text-blue-600 font-semibold mt-2">
                        💰 Tổng tiền:{" "}
                        {order.discount ? (
                            <>
                                <span className="line-through text-gray-500">
                                    {order.total.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                </span>{" "}
                                ➝{" "}
                                <span className="text-red-600 font-bold">
                                    {(order.total - order.discount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                </span>
                            </>
                        ) : (
                            order.total.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                        )}
                    </p>
                    <p className={`mt-2 text-gray-600 font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                        {order.payment_status === 'paid' ? "✅ Đã thanh toán" : ButtonPayment(order)}
                    </p>
                </div>
            ))}
        </div>
    );
};

const ButtonPayment = (order: OrderData) => {
    if (order.status == "shipping") return "Thanh toán khi giao hàng";
    return (
        <div className="flex items-center justify-between w-full mt-4">
            <p className="text-gray-600 text-lg">❌ Chưa thanh toán</p>
            <div className="flex gap-4">
                <button onClick={
                    () => {
                        OrderServices.repaymentOrder(order._id).then((res) => {
                            if (res.status == 200) {
                                if (res.data.VNPUrl) {
                                    location.href = res.data.VNPUrl;
                                }else {
                                    toast.error(res.data.message);
                                }
                            }else {
                                toast.error(res.data.message);
                            }
                        })
                    }
                } className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Tiếp tục thanh toán
                </button>
                <button onClick={() => {
                    OrderServices.canceleOrder(order._id).then((res) => {
                        if (res.status == 200) {
                            toast.success("Đã hủy đơn hàng");
                        }else {
                            toast.error(res.data.message);
                        }
                    })
                 }} className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition">
                    Hủy đơn hàng
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;