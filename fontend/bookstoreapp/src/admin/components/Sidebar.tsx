import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="flex h-screen relative">
            <div className={`${isOpen ? "w-64" : "w-0"} bg-gray-800 text-white h-screen overflow-hidden transition-all duration-300`}>
                <div className={`p-4 ${isOpen ? "block" : "hidden"}`}>
                    <h2 className="text-xl font-bold">Admin Panel</h2>
                    <nav className="mt-4">
                        <ul>
                            <li><Link to="/admin" className="block py-2 hover:bg-gray-700">📊 Dashboard</Link></li>
                            <li><Link to="/admin/books" className="block py-2 hover:bg-gray-700">📚 Quản lý sách</Link></li>
                            <li><Link to="/admin/vouchers" className="block py-2 hover:bg-gray-700">🎟️ Quản lý voucher</Link></li>
                            <li><Link to="/admin/orders" className="block py-2 hover:bg-gray-700">📦 Đơn hàng</Link></li>
                            <li><Link to="/admin/users" className="block py-2 hover:bg-gray-700">👤 Người dùng</Link></li>
                            <li><Link to="/admin/statistics" className="block py-2 hover:bg-gray-700">📊 Thống kê</Link></li>
                        </ul>
                    </nav>
                </div>
            </div>
            <button
                className="absolute top-1/2 -translate-y-1/2 left-[100%] p-2 ml-1 bg-gray-800 text-white rounded-full focus:outline-none w-10 h-10 flex items-center justify-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </button>
        </div>
    );
}
