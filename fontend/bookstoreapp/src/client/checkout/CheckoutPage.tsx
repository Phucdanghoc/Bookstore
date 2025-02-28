import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CartItem } from "../../interfaces/CartData";
import CartServices from "../../services/CartServices";
import VoucherData from "../../interfaces/VoucherData";
import { ShoppingCart } from "lucide-react";
import { CheckoutData } from "../../interfaces/OrderData";
import OrderServices from "../../services/OrderServices";

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [voucher, setVoucher] = useState<VoucherData | null>(null);
    const [expired, setExpired] = useState(false);
    const [orderInfo, setOrderInfo] = useState<CheckoutData>({
        _id: "",
        userId: "",
        listCartItems: "",
        totalPrice: 0,
        voucherId: "",
        shippingAddress: "",
        contactNumber: "",
        paymentMethod: "cod",
        noteOrder: "",
    });

    const [user, setUser] = useState({
        fullname: "",
        email: "",
        address: "",
        phone: "",
    });

    const API_URL = "http://localhost:3000";

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                const cartResponse = await CartServices.getCheckOut(token);

                if (cartResponse.status === 400) {
                    setExpired(true);
                    return;
                }

                setCartItems(cartResponse.data.items);
                if (cartResponse.data.voucher) {
                    setVoucher(cartResponse.data.voucher[0] || null);
                }

                setOrderInfo((prev) => ({
                    ...prev,
                    listCartItems: JSON.stringify(cartResponse.data.items.map((item: { _id: any; }) => item._id)),
                    totalPrice: cartResponse.data.totalPrice,
                    voucherId: cartResponse.data.voucher.length > 0 ? cartResponse.data.voucher[0]._id : "",
                }));
                setUser((prev) => ({
                    ...prev,
                    fullname: cartResponse.data.user.fullname,
                    email: cartResponse.data.user.email,
                    address: cartResponse.data.user.address,
                    phone: cartResponse.data.user.phone,
                }));
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
                setExpired(true);
            }
        };

        fetchData();
    }, [token]);

    const handleConfirmOrder = async () => {
        try {
            const response = await OrderServices.createOrder({
                ...orderInfo,
                customerName: user.fullname,
                contactNumber: user.phone,
                tokenCheckout: token || "",
                shippingAddress: user.address,
                noteOrder: "",
            });
            if (response.status == 201) {
                if (response.data.VNPUrl) {
                    location.href = response.data.VNPUrl;
                }else {
                    navigate("/client/payment-result?order_id=" + response.data.order._id);
                }
            }
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
        }
    };

    if (expired) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">⚠️ Quá hạn thanh toán</h2>
                    <p className="text-gray-700 mb-4">Phiên giao dịch đã hết hạn, vui lòng quay lại giỏ hàng.</p>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        onClick={() => navigate("/client/cart")}
                    >
                        Quay lại giỏ hàng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full flex flex-col h-[800px]">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><ShoppingCart size={30} color="aqua" /> Giỏ hàng</h2>
                <div className="flex-1 overflow-y-auto h-[500px] pr-2 m-2">
                    {cartItems.map((item) => (
                        <div key={item._id} className="bg-gray-200  p-2 rounded-lg shadow-md border  border-blue-300 flex items-center hover:shadow-lg hover:bg-blue-100 transition duration-300 ease-in-out mb-2">
                            <img src={`${API_URL}${item.book.images[0]}`} alt={item.book.title} className="w-20 h-30 object-cover rounded" />
                            <div className="flex-1 ml-4">
                                <h3 className="font-medium text-xl">{item.book.title}</h3>
                                <p>Số lượng: {item.quantity}</p>
                                <p>Giá: <span className={voucher ? "line-through text-gray-500" : ""}>{item.book.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-800 font-bold text-2xl">
                                    {(item.quantity * item.book.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                {voucher && (
                    <div className="bg-green-100 hover:bg-green-200 hover:scale-102 p-4 rounded-lg shadow-md mt-4">
                        <h3 className="text-lg font-semibold text-green-800">🎟 Voucher: {voucher.code}</h3>
                        <p className="text-red-700 mt-2 font-bold">Giảm giá: {voucher.discount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
                        <h3 className="text-2xl font-semibold mt-4">Tổng tiền :
                            <span className="font-semibold text-gray-500 line-through">  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(orderInfo.totalPrice)} </span>
                            <span className="font-bold text-blue-800"> {(orderInfo.totalPrice - voucher.discount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                        </h3>
                    </div>
                )}
                {!voucher && (
                    <h3 className="text-2xl font-semibold mt-4">Tổng tiền: <span className="font-bold text-blue-800">{orderInfo.totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span></h3>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg w-full">
                <h2 className="text-2xl font-semibold mb-4">📦 Thông tin đặt hàng</h2>
                <label className="block">
                    <span>Họ và tên:</span>
                    <input type="text" className="w-full mt-1 p-3 border rounded" value={user.fullname} onChange={(e) => setUser({ ...user, fullname: e.target.value })} />
                </label>
                <label className="block mt-2">
                    <span>Số điện thoại:</span>
                    <input type="text" className="w-full mt-1 p-3 border rounded" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
                </label>
                <label className="block mt-2">
                    <span>Địa chỉ giao hàng:</span>
                    <input type="text" className="w-full mt-1 p-3 border rounded" value={user.address} onChange={(e) => setUser({ ...user, address: e.target.value })} />
                </label>
                <label className="block mt-2">
                    <span>Ghi chú:</span>
                    <textarea className="w-full mt-1 p-3 border rounded" onChange={(e) => setOrderInfo({ ...orderInfo, noteOrder: e.target.value })} />
                </label>


                <label className="block mt-4">
                    <span>Phương thức thanh toán:</span>
                    <select className="w-full p-3 border rounded" value={orderInfo.paymentMethod} onChange={(e) => setOrderInfo({ ...orderInfo, paymentMethod: e.target.value })}>
                        <option value="cod">Thanh toán khi nhận hàng</option>
                        <option value="vnpay">VNPAY</option>
                    </select>
                </label>
                <button onClick={handleConfirmOrder} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg">Xác nhận đặt hàng</button>
            </div>
        </div>
    );
};

export default CheckoutPage;
