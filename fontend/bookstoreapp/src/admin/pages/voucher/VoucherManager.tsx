import { useState, useEffect } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, Edit, Trash } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VoucherServices from "../../../services/VoucherServices";
import VoucherData from "../../../interfaces/VoucherData";
import VoucherModal from "../../components/voucher/AddEditVoucher";
import ModalAccept from "../../../components/ModalAccept";

const VoucherManager = () => {
    const [vouchers, setVouchers] = useState<VoucherData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherData | null>(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    
    const LIMIT = 10;

    useEffect(() => {
        searchVouchers();
    }, [currentPage, searchTerm, statusFilter]);
    const searchVouchers = async () => {
        try {
            const response = await VoucherServices.searchVouchers(searchTerm, 1, LIMIT , statusFilter);
            setVouchers(response.data.vouchers);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm voucher:", error);
        }
    }
    const fetchVouchers = async () => {
        try {
            const response = await VoucherServices.getAllVouchers(currentPage, LIMIT, searchTerm);
            setVouchers(response.data.vouchers);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách voucher:", error);
        }
    };

    const toggleVoucherStatus = async (voucher: VoucherData) => {
        try {
            const updatedStatus = voucher.status === "Active" ? "Inactive" : "Active";
            await VoucherServices.updateVoucher(voucher._id, { ...voucher, status: updatedStatus });
            toast.success(`Voucher ${voucher.code} đã chuyển thành ${updatedStatus}`);
            fetchVouchers();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái voucher:", error);
            toast.error("Có lỗi xảy ra khi cập nhật trạng thái.");
        }
    };

    const handleAddVoucher = () => {
        setSelectedVoucher(null);
        setIsModalOpen(true);
    };

    const handleEditVoucher = (voucher: VoucherData) => {
        setSelectedVoucher(voucher);
        setIsModalOpen(true);
    };

    const confirmDelete = async (voucher: VoucherData) => {
        try {
            const request = await VoucherServices.deleteVoucher(voucher._id);
            if (request.status == 200) {
                toast.success(`Đã xóa voucher ${voucher.code}`);
                fetchVouchers();
            } else {
                toast.error("Có lỗi xảy ra khi xóa voucher.");
            }
            setShowAlert(false);
        } catch (error) {
            console.error("Lỗi khi xóa voucher:", error);
            toast.error("Có lỗi xảy ra khi xóa voucher.");
        }
    };


    const handleModalSubmit = async (voucherData: VoucherData) => {
        await fetchVouchers();
        setIsModalOpen(false);
    };

    return (
        <div className="p-6 flex flex-col h-screen">
            <ToastContainer />
            <VoucherModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedVoucher}
            />
            <ModalAccept
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                title="Xác nhận xóa voucher"
                onConfirm={() => confirmDelete(selectedVoucher!)}
                confirmText="Xác nhận xóa"
            >
                <p>Bạn có chắc chắn muốn xóa sách <strong>{selectedVoucher?.code}</strong> không?</p>
            </ModalAccept>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">🎟️ Quản lý Voucher</h2>
                <button onClick={handleAddVoucher} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={20} /> Thêm Voucher
                </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 flex-1">
                    <Search size={20} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm voucher..."
                        className="border p-2 rounded-md w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="border p-2 rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Tất cả</option>
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Vô hiệu hóa</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 border-b text-left">Mã</th>
                            <th className="px-6 py-3 border-b text-left">Giảm giá</th>
                            <th className="px-6 py-3 border-b text-left">Giá trị tối thiểu</th>
                            <th className="px-6 py-3 border-b text-left">Trạng thái</th>
                            <th className="px-6 py-3 border-b text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map((voucher) => (
                            <tr key={voucher._id} className="bg-white border-b">
                                <td className="px-6 py-4 font-semibold">{voucher.code}</td>
                                <td className="px-6 py-4 font-semibold text-xl text-blue-600">
                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(voucher.discount)}
                                </td>
                                <td className="px-6 py-4 font-semibold">
                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(voucher.min_order_value)}
                                </td>
                                <td className={`px-6 py-4 font-bold ${voucher.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                                    <p>{voucher.status == "Active" ? "Kích hoạt" : "Vô hiệu hóa"}</p>
                                </td>

                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleEditVoucher(voucher)} className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 flex items-center gap-1">
                                        <Edit size={16} /> Sửa
                                    </button>
                                    <button onClick={() => {
                                        setSelectedVoucher(voucher);
                                        setShowAlert(true);
                                    }} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 flex items-center gap-1">
                                        <Trash size={16} /> Xóa
                                    </button>
                                    <button
                                        className={`px-3 py-1 rounded-md ${voucher.status === "Active" ? "bg-gray-500 hover:bg-gray-600" : "bg-green-500 hover:bg-green-600"} text-white`}
                                        onClick={() => toggleVoucherStatus(voucher)}
                                    >
                                        {voucher.status === "Active" ? "Vô hiệu hóa" : "Kích hoạt"}
                                    </button>
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

export default VoucherManager;
