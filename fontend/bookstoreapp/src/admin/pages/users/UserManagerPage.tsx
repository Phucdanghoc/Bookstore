import { useState, useEffect } from "react";
import { Search, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "react-toastify";
import UserServices from "../../../services/UserServices";
import UserData from "../../../interfaces/UserData";
const UserManager = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm]);

    const fetchUsers = async () => {
        try {
            const response = await UserServices.getAllUsers(searchTerm, currentPage, LIMIT);
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
        }
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            try {
                // await UserServices.deleteAccount(userId);
                toast.success("Xóa người dùng thành công!");
                fetchUsers();
            } catch (error) {
                toast.error("Lỗi khi xóa người dùng!");
            }
        }
    };

    return (
        <div className="p-6 flex flex-col h-screen">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">👤 Quản lý Người Dùng</h2>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <Search size={20} className="text-gray-500" />
                <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    className="border p-2 rounded-md w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 border-b text-left">ID</th>
                            <th className="px-6 py-3 border-b text-left">Tên người dùng</th>
                            <th className="px-6 py-3 border-b text-left">Email</th>
                            <th className="px-6 py-3 border-b text-left">Vai trò</th>
                            <th className="px-6 py-3 border-b text-left">Ngày đăng ký</th>
                            <th className="px-6 py-3 border-b text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="bg-white border-b">
                                <td className="px-6 py-4">{user._id}</td>
                                <td className="px-6 py-4">{user.fullname}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-sm font-semibold 
                                        ${user.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                                        {user.role === "admin" ? "Admin" : "Client"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(user.register_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button 
                                        onClick={() => window.location.href = `/admin/users/${user._id}`}
                                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1">
                                        <Eye size={16} /> Chi tiết
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 flex items-center gap-1"
                                    >
                                        <Trash2 size={16} /> Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-4 items-center gap-2">
                <button
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    {"<"}
                </button>
                <span className="text-lg font-semibold">{currentPage} / {totalPages}</span>
                <button
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    {">"}
                </button>
            </div>
        </div>
    );
};

export default UserManager;
