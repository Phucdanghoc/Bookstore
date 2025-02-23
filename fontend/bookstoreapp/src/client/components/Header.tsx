import { ShoppingCart, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    }

    return (
        <header className="bg-blue-600 text-white py-4 shadow-md z-10">
            <div className="container mx-auto flex justify-between items-center px-4">
                <Link to="/client/home" className="text-2xl font-bold">BookStore</Link>

                {/* Navigation Links */}
                <nav>
                    <ul className="flex space-x-6">
                        <li><Link to="/client/home" className="hover:underline">Trang chủ</Link></li>
                        <li><Link to="/client/books" className="hover:underline">Sách</Link></li>
                        <li><Link to="/about" className="hover:underline">Giới thiệu</Link></li>
                        <li><Link to="/contact" className="hover:underline">Liên hệ</Link></li>
                    </ul>
                </nav>

                <div className="flex items-center space-x-4 relative">
                    {/* Cart Icon */}
                    <Link to="/client/cart" className="flex items-center space-x-2">
                        <ShoppingCart size={24} />
                    </Link>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            <User size={24} />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg z-50">
                                <Link
                                    to="/client/profile"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    Hồ sơ
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-gray-100"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </header>
    );
}
