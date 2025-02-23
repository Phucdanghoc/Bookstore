import { useState, useEffect } from "react";
import { BookData } from "../../interfaces/BookData";
import { Link, useNavigate } from "react-router-dom";
import VoucherData from "../../interfaces/VoucherData";
import BookService from "../../services/BookServices";
import VoucherServices from "../../services/VoucherServices";
import useDocumentTitle from "../../hooks/useDocumentTitle";



export default function HomePage() {
    const [books, setBooks] = useState<BookData[]>([]);
    const [vouchers, setVouchers] = useState<VoucherData[]>([]);
    const [currentBookIndex, setCurrentBookIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const navigate = useNavigate();
    useDocumentTitle("Trang chủ");
    useEffect(() => {
        fetchBookMinStock()
        fetchVoucher();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentBookIndex(prevIndex => (prevIndex + 1) % books.length);
                setFade(true);
            }, 1000);
        }, 5000);

        return () => clearInterval(interval);
    }, [books.length]);
    const fetchBookMinStock = async () => {
        try {
            const response = await BookService.minStock();
            setBooks(response.books);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sách:", error);
        }
    };

    const fetchVoucher = async () => {
        try {
            const response = await VoucherServices.getAllVouchers(
                1,
                5
            );
            setVouchers(response.data.vouchers);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách voucher:", error);
        }
    };




    if (books.length === 0) return <p>Loading...</p>;

    const currentBook = books[currentBookIndex];

    return (
        <div className="relative w-full h-screen flex flex-col mb-2">
            <div className="flex w-full">
                <div className="w-6/10 bg-blue-500 p-8 flex items-center justify-center">
                    <div className={`flex items-center gap-8 transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}
                        onClick={() => navigate(`/client/books/${currentBook._id}`)}
                    >
                        <div className="w-[250px] h-[400px] flex justify-center">
                            <img
                                src={currentBook.images[0] || "https://cdn0.fahasa.com/media/catalog/product/1/4/1450-4141-9057.jpg"}
                                alt={currentBook.title}
                                className="w-full h-full object-cover rounded-lg shadow-lg"
                            />
                        </div>

                        <div className="text-white space-y-2">
                            <h2 className="text-4xl font-extrabold uppercase tracking-wide">{currentBook.title}</h2>
                            <p className="text-xl text-gray-100 font-medium">Tác giả: <span className="font-semibold">{currentBook.author}</span></p>
                            <p className="text-3xl text-yellow-300 font-bold">{currentBook.price.toLocaleString()} VND</p>
                            <p className="text-2xl text-white-400 font-semibold">
                                Chỉ còn lại: <span className="text-white">{currentBook.stock} cuốn</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-4/10 bg-gray-100 p-8 flex flex-col justify-center items-center text-center shadow-lg">
                    <h2 className="text-3xl font-bold text-blue-500">Chào mừng đến với BookStore!</h2>
                    <p className="text-gray-700 mt-4 text-lg">
                        Sách không chỉ là kho tàng tri thức vô tận mà còn là cánh cửa mở ra những chân trời mới.
                        Mỗi trang sách là một hành trình, nơi bạn có thể khám phá thế giới, mở rộng tư duy và
                        nuôi dưỡng trí tuệ của mình.
                    </p>
                    <p className="text-gray-700 mt-4 text-lg">
                        Chúng tôi cung cấp hàng ngàn đầu sách đa dạng, từ văn học đến khoa học.
                        Cập nhật sách mới liên tục với giá ưu đãi!
                    </p>
                    <button
                        className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition"
                        onClick={() => {
                            window.scrollTo({
                                top: window.scrollY + window.innerHeight / 2,
                                behavior: "smooth",
                            });
                        }}
                    >
                        Khám phá ngay
                    </button>

                </div>
            </div>
            <div className="mt-8 p-3">
                <h2 className="text-3xl font-bold text-white">Sách Nổi Bật</h2>
                <div className="grid grid-cols-5 gap-6 mt-6 bg-blue-400 p-4">
                    {books.map((book) => (
                        <div key={book._id} className="bg-white shadow-lg rounded-lg p-4 hover:scale-105 transition-transform" onClick={() => navigate(`/client/books/${book._id}`)}>
                            <img
                                src={book.images[0] || "https://cdn0.fahasa.com/media/catalog/product/1/4/1450-4141-9057.jpg"}
                                alt={book.title}
                                className="w-full h-[250px] object-cover rounded-lg"
                            />
                            <h3 className="mt-4 text-xl font-bold">{book.title}</h3>
                            <p className="text-gray-600">Tác giả: {book.author}</p>
                            <p className="text-blue-500 font-semibold">{book.price.toLocaleString()} VND</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-center mb-8">
                <button
                    className="px-6 py-3 border-3 border-blue-500 p-4 text-white bg-blue-500 font-semibold rounded-lg shadow-lg hover:bg-blue-600 hover:text-white transition"
                    onClick={() => navigate("/client/books")}
                >
                    Xem thêm
                </button>
            </div>
            <div className="bg-blue-200 p-8">
                <h2 className="text-3xl font-bold text-red-500 pb-4">Voucher Hôm Nay</h2>
                <div className="flex flex-wrap justify-center gap-6 mt-6">
                    {vouchers.map((voucher) => (
                        <div
                            key={voucher._id}
                            className="relative bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-xl shadow-xl flex flex-col items-center w-[280px] hover:scale-105 transition-transform border-2 border-yellow-300"
                        >
                            {/* Icon quà tặng 🎁 */}
                            <div className="absolute -top-6 bg-yellow-400 text-white px-4 py-2 rounded-full shadow-md text-lg font-bold">
                                🎁 {voucher.code}
                            </div>

                            <p className="text-2xl font-bold text-yellow-200 mt-8">
                                {voucher.discount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                            </p>
                            <p className="text-gray-200 mt-2 font-medium">
                                HSD: {new Date(voucher.expired_date).toLocaleDateString("vi-VN")}
                            </p>

                            {/* Nút sử dụng */}
                            <button className="mt-4 bg-yellow-400 text-blue-900 font-semibold px-6 py-2 rounded-full shadow-md hover:bg-yellow-500 transition">
                                <Link to={`/client/cart`}>
                                    Sử dụng Voucher
                                </Link>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
