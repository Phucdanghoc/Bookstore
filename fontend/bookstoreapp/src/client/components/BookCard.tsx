import { BookData } from "../../interfaces/BookData";
import { LucideShoppingBag, ShoppingCart, ShoppingCartIcon } from "lucide-react"; // Import icon giỏ hàng
import CartServices from "../../services/CartServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
interface BookCardProps {
    book: BookData;
    addToCart: (isSuccess: boolean) => void;
}

export default function BookCard({ book, addToCart }: BookCardProps) {
    const API_URL = "http://localhost:3000";
    const navigate = useNavigate();
    const handleDetail = () => {
        console.log("Xem chi tiết sách:", book.title);
        navigate(`/client/books/${book._id}`);
    };
    const checkIsAuth = () => localStorage.getItem("token") ? true : false;

    const handleAddToCart = async () => {
        if (!checkIsAuth()) {
            navigate("/auth");
            toast.success("Hãy đăng nhập để mua sách nhé");
        } else {
            try {
                const response = await CartServices.addToCart(book._id, 1, book.price);
                if (response.status == 400) {
                    addToCart(false);
                } else {
                    addToCart(true);
                }
            } catch (error) {
                addToCart(false);
                console.error("Lỗi khi thêm vào giỏ hàng:", error);
            }
        }
    };

    return (
        <div className="p-4 border-2 border-blue-500 rounded-xl shadow-lg bg-white flex flex-col w-[250px] hover:scale-105 transition-transform"
        >
            <div className="w-full h-[200px] overflow-hidden rounded-lg">
                <img
                    src={book.images ? `${API_URL}${book.images[0]}` : "https://via.placeholder.com/150"}
                    alt={book.title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex flex-col flex-grow mt-3 px-2">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-gray-500">Tác giả: {book.author}</p>
                <p className="text-blue-500 font-bold mt-2">
                    {book.discount > 0 &&
                       ( <>
                            <span className="line-through text-gray-500 mr-1">{book.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                            <span className="text-red-500">{(book.price - book.discount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                        </>) || book.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                    }
                </p>
            </div>

            <div className="mt-auto flex gap-2">
                <button
                    onClick={handleDetail}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    Xem chi tiết
                </button>

                <button
                    onClick={handleAddToCart}
                    disabled={book.stock <= 0}
                    className={`p-2 rounded-lg transition flex items-center justify-center gap-2 ${book.stock > 0
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                >
                    {book.stock > 0 ? (
                        <>
                            <ShoppingCartIcon size={20} />
                        </>
                    ) : (
                        <span>Hết hàng</span>
                    )}
                </button>
            </div>
        </div>
    );
}
