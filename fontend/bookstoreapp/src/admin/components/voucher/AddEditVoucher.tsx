import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import VoucherServices from "../../../services/VoucherServices";
import VoucherData from "../../../interfaces/VoucherData";
import { toast } from "react-toastify";


interface VoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (voucherData: VoucherData) => void;
    initialData?: VoucherData | null;
}

export default function VoucherModal({ isOpen, onClose, onSubmit, initialData }: VoucherModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [voucher, setVoucher] = useState<VoucherData>({
        _id: "",
        code: "",
        discount: 0,
        status: "Active",
        min_order_value: 0,
        expired_date: "",
        created_at: "",
    });

    useEffect(() => {
        if (initialData) {
            setVoucher(initialData);
        } else {
            setVoucher({
                _id: "",
                code: "",
                discount: 0,
                status: "Active",
                min_order_value: 0,
                expired_date: "",
                created_at: "",
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setVoucher((prev) => ({
            ...prev,
            [name]: name === "discount" || name === "min_order_value" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (initialData) {
                const response = await VoucherServices.updateVoucher(initialData._id!, voucher);
                if (response.status === 200) {
                    toast.success("Cập nhật voucher thành công");
                } else {
                    toast.error("Cập nhật voucher thành công");
                }
            } else {
               const response = await VoucherServices.createVoucher(voucher);
                if (response.status === 201) {
                    toast.success("Thêm mới voucher thành công");
                } else {
                    toast.error("Thêm mới voucher thành công");
                }
            }
            if (onSubmit) {
                onSubmit(voucher);
            }
            onClose();
        } catch (error) {
            console.error("Lỗi khi thêm/cập nhật voucher:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const formattedDate = (publication_date: string) => {
        if (!publication_date) return "";
        return publication_date.split("T")[0];
    }
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold">{initialData ? "✏️ Chỉnh sửa Voucher" : "🎟️ Thêm Voucher"}</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-red-500 transition">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Mã Voucher</label>
                        <input type="text" name="code" className="w-full p-2 border rounded-lg" value={voucher.code} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Giảm giá (VND)</label>
                            <input type="number" name="discount" className="w-full p-2 border rounded-lg" value={voucher.discount} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Giá trị tối thiểu</label>
                            <input type="number" name="min_order_value" className="w-full p-2 border rounded-lg" value={voucher.min_order_value} onChange={handleChange} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Ngày hết hạn</label>
                        <input type="date" name="expired_date" className="w-full p-2 border rounded-lg" value={formattedDate(voucher.expired_date)} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Trạng thái</label>
                        <select name="status" className="w-full p-2 border rounded-lg" value={voucher.status} onChange={handleChange}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : initialData ? "Cập nhật" : "Thêm mới"}
                    </button>
                </form>
            </div>
        </div>
    );
}
