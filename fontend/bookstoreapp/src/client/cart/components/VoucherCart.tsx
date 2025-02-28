import { Ticket } from "lucide-react"; // Icon Voucher từ lucide-react
import { useEffect, useState } from "react";
import VoucherData from "../../../interfaces/VoucherData";
import VoucherServices from "../../../services/VoucherServices";
import { toast } from "react-toastify";

interface VoucherInCartProps {
    totalPrice: number;
    onVoucherApplied: (voucher: VoucherData | null) => void; // Cập nhật để truyền null khi hủy voucher
}

export default function VoucherInCart({ totalPrice, onVoucherApplied }: VoucherInCartProps) {
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherApplied, setVoucherApplied] = useState(false);
    const [vouchers, setVouchers] = useState<VoucherData[]>([]);
    const [appliedVoucher, setAppliedVoucher] = useState<VoucherData | null>(null);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                VoucherServices.getAllVouncersByStatus('Active').then((response) => {
                    console.log(response.data.vouchers);
                    setVouchers(response.data.vouchers);
                });
            } catch (error) {
                console.error(error);
            }
        };
        fetchVouchers();
    }, []);

    const applyVoucher = (voucher: VoucherData) => {
        if (totalPrice >= voucher.min_order_value) {
            setVoucherApplied(true);
            setAppliedVoucher(voucher);
            onVoucherApplied(voucher);
        } else {
            toast.error("Đơn của bạn chưa đủ để áp dụng Voucher này");
        }
    };

    const cancelVoucher = () => {
        setVoucherApplied(false);
        setAppliedVoucher(null);
        onVoucherApplied(null); // Gửi null khi hủy voucher
    };
    useEffect(() => {
        if (voucherCode) {
            checkVoucherCode();
        }
    }, [voucherCode]);

    const checkVoucherCode = async () => {
        try {
            const response = await VoucherServices.getVoucherByCode(voucherCode);
            if (response.data) {
                applyVoucher(response.data);
            } else {
                alert("Mã voucher không tồn tại");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center">
                <Ticket size={25} className="mr-2 text-blue-500" />
                <h2 className="text-xl font-semibold">Voucher</h2>
            </div>
            <div className="mt-4">
                <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã voucher"
                    className="border p-2 w-full rounded-md"
                />
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Áp dụng voucher
                </button>
            </div>

            <div className="mt-6 overflow-y-auto max-h-[300px]">
                {vouchers.length === 0 || vouchers.map((voucher) => (
                    <div key={voucher._id} className="flex justify-between items-center p-4 border-b">
                        <div>
                            <h3 className="font-semibold">{voucher.code}</h3>
                            <p className="text-sm text-gray-500">
                                Giảm giá: <span className="font-bold text-blue-500">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(voucher.discount)}</span>
                            </p>
                            <p className="text-sm text-gray-500">Giá trị tối thiểu:
                                <span className="font-bold text-red-500"> {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(voucher.min_order_value)}</span></p>
                            <p className="text-sm text-gray-500">
                                Hết hạn: {new Date(voucher.expired_date).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                        <button
                            onClick={() => applyVoucher(voucher)}
                            className={`text-white px-4 py-2 rounded-lg ${voucherApplied && appliedVoucher?._id === voucher._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500'}`}
                        >
                            {voucherApplied && appliedVoucher?._id === voucher._id ? "Đã áp dụng" : "Áp dụng"}
                        </button>
                    </div>
                ))}
            </div>


            {voucherApplied && appliedVoucher && (
                <div className="mt-4 p-4 border bg-gray-100 rounded-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">Voucher đã áp dụng:</h3>
                        <p>
                            {appliedVoucher.code} - Giảm giá:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            }).format(appliedVoucher.discount)}
                        </p>
                    </div>
                    <button
                        onClick={cancelVoucher}
                        className="text-xs bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                        Hủy áp dụng
                    </button>
                </div>
            )}


        </div>
    );
}
