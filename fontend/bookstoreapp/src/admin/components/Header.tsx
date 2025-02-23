import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Header() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    }
    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">📚 Admin Dashboard</h1>
            <div className="relative">
                <button
                    className="bg-gray-800 text-white p-2 rounded-full focus:outline-none"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                    <User size={24} />
                </button>
                {isProfileOpen && (
                    <div className="absolute border right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                        <ul>
                            <li className="px-4 py-2 border-b hover:bg-gray-100 cursor-pointer">Profile</li>
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500 flex items-center gap-2" onClick={handleLogout}>
                                <LogOut size={20} color="red"  /> Đăng xuất
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
}
