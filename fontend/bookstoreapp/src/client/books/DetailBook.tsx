import { use, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookData } from "../../interfaces/BookData";
import BookService from "../../services/BookServices";
import { Minus, Plus } from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const BookDetailPage = () => {
    useDocumentTitle("Chi tiết sách");
    const { id } = useParams<{ id: string }>();
    const [book, setBook] = useState<BookData>();
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const API_URL = "http://localhost:3000";
    const [fade, setFade] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [relatedBooks, setRelatedBooks] = useState<BookData[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        
        const fetchBook = async () => {
            try {
                if (!id) throw new Error("ID sách không hợp lệ.");
                const response = await BookService.getBookById(id);
                setBook(response);
                if (response.images.length > 0) {
                    setSelectedImage(response.images[0]);
                }
                fetchRelatedBooks(response.category);
            } catch (err) {
                console.error("Lỗi khi lấy thông tin sách:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);
    const fetchRelatedBooks = async (category: string) => {
        try {
            const response = await BookService.getBookByCategory(category,);
            setRelatedBooks(response.books);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách sách cùng thể loại:", err);
        }
    };
    useEffect(() => {
        if (!book?.images || book.images.length <= 1) return;
        const interval = setInterval(() => {
            setFade(true);
            setTimeout(() => {
                setSelectedImage((prev) => {
                    const currentIndex = book.images.indexOf(prev || "");
                    return book.images[(currentIndex + 1) % book.images.length];
                });
                setFade(false);
            }, 500);
        }, 4000);
        return () => clearInterval(interval);
    }, [book]);

    if (loading) return <p className="text-center text-xl font-semibold">Đang tải...</p>;

    return (
        <div className="w-full  mx-auto p-8 bg-gradient-to-r from-blue-500 to-gray-200 shadow-xl rounded-lg h-full overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hình ảnh */}
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-[400px] h-[600px] rounded-lg overflow-hidden shadow-lg border border-blue-300">
                        <img
                            src={`${API_URL}${selectedImage}`}
                            alt={book?.title}
                            className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${fade ? "opacity-0" : "opacity-100"}`}
                        />
                    </div>
                    {book && book.images.length > 1 && (
                        <div className="flex gap-2 mt-4">
                            {book.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={`${API_URL}${img}`}
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer transition-all hover:scale-110 hover:border-2 hover:border-blue-500 shadow-md ${selectedImage === img ? "border-2 border-blue-500" : "border"}`}
                                    onClick={() => {
                                        setFade(true);
                                        setTimeout(() => {
                                            setSelectedImage(img);
                                            setFade(false);
                                        }, 500);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-blue-900 drop-shadow-md">{book?.title}</h1>
                    <p className="text-2xl text-gray-700 mt-2 font-medium">Tác giả: {book?.author}</p>
                    <p className="text-3xl text-blue-600 font-semibold mt-2">Giá: {book?.price.toLocaleString()} VNĐ</p>
                    <div className="mt-4 flex items-center gap-4  p-3 ">
                        <label className="text-lg font-medium text-gray-700">Số lượng:</label>
                        <button
                            className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        >
                            <Minus size={20} />
                        </button>
                        <span className="text-2xl font-semibold text-blue-600">
                            {quantity}
                        </span>
                        <button
                            className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            onClick={() => setQuantity((prev) => prev + 1)}
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <button className="bg-blue-600 text-white text-xl py-3 px-6 rounded-lg mt-6 hover:bg-blue-700 transition transform hover:scale-105 shadow-md">🛒 Thêm vào giỏ hàng</button>

                    <div className="mt-6 border-t border-gray-300 pt-4">
                        <h2 className="text-2xl font-semibold mb-4 text-blue-900">📘 Thông tin chi tiết</h2>
                        <table className="w-full border-collapse border border-gray-300 text-lg bg-white shadow-md rounded-lg overflow-hidden">
                            <tbody>
                                <tr className="border-b bg-blue-50">
                                    <td className="p-3 font-medium"> Thể loại</td>
                                    <td className="p-3">{book?.category}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">📄 Số trang</td>
                                    <td className="p-3">{book?.pages}</td>
                                </tr>
                                <tr className="border-b bg-blue-50">
                                    <td className="p-3 font-medium">🏢 Nhà xuất bản</td>
                                    <td className="p-3">{book?.publisher}</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">📅 Ngày xuất bản</td>
                                    <td className="p-3">{book?.publication_date ? new Date(book.publication_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Không có dữ liệu"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="mt-10">
                <h2 className="text-2xl font-bold text-white mb-4">📚 Sách cùng thể loại</h2>
                <div className="flex overflow-x-auto gap-4 p-4">
                    {relatedBooks.length > 0 && relatedBooks.map((relatedBook) => (
                        <div
                            key={relatedBook._id}
                            className="w-[200px]  min-w-[200px]  p-3 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition transform hover:scale-105"
                            onClick={() => {
                                location.href = `/client/books/${relatedBook._id}`;
                            }}
                        >
                            <img
                                src={`${API_URL}${relatedBook.images[0]}`}
                                alt={relatedBook.title}
                                className="w-full h-[250px] object-cover rounded-lg"
                            />
                            <h3 className="text-lg font-semibold text-gray-800 mt-2">{relatedBook.title}</h3>
                            <p className="text-blue-600 font-medium">{relatedBook.price.toLocaleString()} VNĐ</p>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center mt-4">
                    <button
                        className="bg-white text-blue-800 font-bold text-lg px-5 py-2 rounded-lg hover:bg-blue-800 hover:text-white transition"
                        onClick={() => navigate(`/client/books`)}
                    >
                        Xem thêm
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BookDetailPage;
