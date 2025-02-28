import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCart, CreditCard, MapPin, User, Phone, FileText, Notebook } from "lucide-react";
import { OrderData } from "../../../interfaces/OrderData";
import OrderServices from "../../../services/OrderServices";

const OrderDetailPage = () => {
    const { orderId } = useParams<string>();
    const [order, setOrder] = useState<OrderData | null>(null);
    const URL_API = "http://localhost:3000";
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                if (!orderId) return;
                const response = await OrderServices.getOrderById(orderId.toString());
                setOrder(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    if (!order) {
        return <div className="text-center p-6 text-blue-600 text-xl font-semibold">Đang tải...</div>;
    }
    const formatStatusOrder = (status: string) => {
        let text = "";
        let colorClass = "";
    
        switch (status) {
            case "unpaid":
                text = "Chưa thanh toán";
                colorClass = "bg-yellow-100 text-yellow-700";
                break;
            case "paid":
                text = "Đã thanh toán";
                colorClass = "bg-blue-100 text-blue-700";
                break;
            case "refunded":
                text = "Đã hoàn tiền";
                colorClass = "bg-red-100 text-red-700";
                break;
            default:
                text = "Chưa cập nhật";
                colorClass = "bg-gray-100 text-gray-700";
        }
    
        return (
            <span className={`px-2 py-1 text-sm font-semibold rounded-full ${colorClass}`}>
                {text}
            </span>
        );
    };
    

    return (
        <div className="max-w-6xl  mx-auto p-8 bg-white rounded-xl shadow-lg mt-4 border border-blue-300">
            {/* Tiêu đề */}
            <h2 className="text-4xl font-bold mb-8 text-blue-700 flex items-center gap-3">
                <ShoppingCart className="w-10 h-10" /> Chi tiết đơn hàng
            </h2>

            {/* Thông tin khách hàng */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-300  mb-6 hover:border-blue-400 hover:border-2">
                <p className="text-lg text-gray-700 flex items-center gap-3 p-2">
                    <User className="text-blue-600 w-6 h-6" /> <strong>Khách hàng:</strong> {order.customerName}
                </p>
                <p className="text-lg text-gray-700 flex items-center gap-3 p-2">
                    <Phone className="text-blue-600 w-6 h-6" /> <strong>Liên hệ:</strong> {order.contact_number}
                </p>
                <p className="text-lg text-gray-700 flex items-center gap-3 p-2">
                    <MapPin className="text-blue-600 w-6 h-6" /> <strong>Địa chỉ:</strong> {order.shipping_address}
                </p>
                {order.noteOrder && (
                    <>
                        <p className="text-lg text-gray-700 flex items-center gap-3 p-2"><Notebook className="text-blue-600 w-6 h-6" /> <strong>Ghi chú:</strong> {order.noteOrder}</p>
                    </>
                )}
            </div>

            {/* Thông tin thanh toán */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-300 mb-6  hover:border-blue-400 hover:border-2">
                <p className="text-lg text-gray-700 flex items-center gap-3 p-2">
                    <CreditCard className="text-blue-600 w-6 h-6" />
                    <strong>Phương thức thanh toán:</strong>
                    {order.payment_method === 'banking' ? (
                        <span className="flex items-center gap-3 ps-3 text-blue-600 font-semibold">
                            <img src="/images/logoVNPAY.png" alt="banking" className="w-10 h-10 object-cover" />
                            VNPAY
                        </span>
                    ) : (
                        formatStatusOrder(order.payment_method  || "Chưa cập nhật")
                    )}
                </p>

                <p className="text-lg text-gray-700 flex items-center gap-3 p-2">
                    <FileText className="text-blue-600 w-6 h-6" /> <strong>Mã thanh toán:</strong> {order.payment_code || "Chưa có"}
                </p>
                <p className={`text-lg flex items-center gap-3 ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'} p-2`}>
                    <strong>Trạng thái thanh toán:</strong> {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </p>
                <p className="text-lg text-gray-700 flex items-center gap-3 p-2">
                    <strong>Trạng thái đơn hàng:</strong> {

                        order.status ? (
                            <span className={`px-2 py-1 font-semibold rounded-lg ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : order.status === 'shipping' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                                {order.status === 'pending' ? 'Đang chờ xử lý' : order.status === 'shipping' ? 'Đang giao hàng' : 'Đã giao hàng'}
                            </span>
                        ) : 'Chưa cập nhật'


                    }
                </p>
            </div>

            {/* Danh sách sách */}
            <div className="bg-blue-50 p-5 rounded-xl  mb-6">
                <h3 className="text-2xl font-semibold text-blue-700 mb-4">Danh sách sản phẩm</h3>

                {/* Container có scroll nếu danh sách dài */}
                <div className="max-h-96 overflow-y-auto space-y-4">
                    {order.order_items.map((item, index) => (
                        <div 
                        key={index} className="flex items-center m-2 p-4 bg-white shadow-md rounded-lg border border-blue-300 hover:border-blue-400 hover:shadow-lg hover:scale-101 transition duration-300 ease-in-out">
                            <img src={`${URL_API}${item.book.images[0]}`} alt={item.book.title} className="w-30 h-40 object-cover rounded-md border" />
                            <div className="ml-4 flex-1">
                                <p className="text-2xl font-medium">{item.book.title}</p>
                                <p className="text-lg text-gray-600">Tác giả: {item.book.author}</p>
                                <p className="text-xl text-blue-600 font-medium" >{item.quantity} x {item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tổng tiền */}
            <div className="mt-6 text-center bg-blue-100 p-5 rounded-xl border border-blue-300">
                <p className="text-2xl font-semibold">
                    {
                        order.discount ? (
                            <span className="text-red-600 line-through">{order.total.toLocaleString("vi-VN", { style: "currency", currency: "VND" })} </span>
                        ) : null
                    }
                    Tổng tiền: <span className="text-blue-800">{(order.total - order.discount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                </p>

            </div>
        </div>
    );
};

export default OrderDetailPage;
