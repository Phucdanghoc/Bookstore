import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OrderServices from "../../services/OrderServices";

const PaymentPage = () => {
    const [searchParams] = useSearchParams();
    const order_id = searchParams.get("order_id");
    const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");
    const navigate = useNavigate();

    useEffect(() => {
        if (!order_id) {
            // navigate("/cart");
            return;
        }

        const fetchData = async () => {
            try {
                console.log("order_id", order_id);

                const response = await OrderServices.checkPayment(order_id);
                if (response.status === 200) {
                    setPaymentStatus(response.data.status === "paid" ? "paid" : "failed");
                } else {
                    setPaymentStatus("failed");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setPaymentStatus("failed");
            }
        };

        fetchData();
    }, [order_id, navigate]);

    return (
        <div className="flex h-full w-full items-center justify-center h-screen bg-blue-100">
            <div
                className={`p-6 rounded-lg shadow-lg text-center w-96 
                ${paymentStatus == "paid" ? "bg-green-100 border border-green-500 text-green-700" : "bg-red-100 border border-red-500 text-red-700"}`}
            >
                {paymentStatus == "paid" ? (
                    <>
                        <h1 className="text-2xl font-bold">Thanh toán thành công 🎉</h1>
                        <p className="mt-2">Cảm ơn bạn đã mua hàng!</p>
                        <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            onClick={() => navigate("/client/orders/" + order_id)}
                        >
                            Chi tiết đơn hàng
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold">Thanh toán thất bại ❌</h1>
                        <p className="mt-2">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
                        <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            onClick={() => navigate("/")}
                        >
                            Trở về trang chủ
                        </button>
                    </>
                )}


            </div>
        </div>
    );
};

export default PaymentPage;
