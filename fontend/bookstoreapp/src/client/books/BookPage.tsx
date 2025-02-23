import { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import { BookData, CategoriesData } from "../../interfaces/BookData";
import axios from "axios";
import { Cat, ChevronLeft, ChevronRight, Search } from "lucide-react";
import BookService from "../../services/BookServices";
import Alert from "../../components/Alert";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { toast } from "react-toastify";

const URL_API = "http://localhost:3000/api/books";

export default function BooksPage() {
    useDocumentTitle("Danh sách sách");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [books, setBooks] = useState<BookData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState<CategoriesData[]>([{
        _id: "Tất cả",
        count: 0,
    }]);
    const [alert, setAlert] = useState<{ type: "success" | "danger"; message: string } | null>(null);
    const [sortBy, setSortBy] = useState("A-Z");
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
    useEffect(() => {
        const searchByCategory = async () => {
            try {
                const response = await BookService.getBookByCategory(selectedCategory, currentPage, 8);
                setBooks(response.books);
                setTotalPages(response.totalPages);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm sách theo danh mục:", error);
            }
        };
        if (selectedCategory === "Tất cả") {
            axios.get(`${URL_API}?page=${currentPage}&limit=8`)
                .then(response => {
                    setBooks(response.data.books);
                    setTotalPages(response.data.totalPages);
                })
                .catch(error => console.error(error));
            return;
        }
        searchByCategory();
    }, [selectedCategory, currentPage]);
    useEffect(() => {
        axios.get(`${URL_API}?page=${currentPage}&limit=8`)
            .then(response => {
                setBooks(response.data.books);
                setTotalPages(response.data.totalPages);
            })
            .catch(error => console.error(error));
    }, [currentPage]);

    useEffect(() => {
        axios.get(`${URL_API}/top-categories?top=8`)
            .then(response => {
                setCategories([{ _id: "Tất cả", count: response.data.totalBooks }, ...response.data.data]);
            })
            .catch(error => console.error("Lỗi lấy categories:", error));
    }, []);


    const handleSearch = () => {
        const searchByTitle = async () => {
            try {
                const response = await BookService.searchBooks(searchTerm, currentPage, 10);
                setBooks(response.books);
                setTotalPages(response.totalPages);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm sách:", error);
            }
        };
        searchByTitle();
    };



    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const alertAddtoCart = (result = true) => {
        if (result) {
            toast.success("Thêm vào giỏ hàng thành công");
        }else{
            toast.error("Đã hết hàng");
        }
    };

    return (
        <div className="container mx-auto p-2">

            <div className="flex gap-4">
                <div className="w-2/12 p-4 bg-gray-100 rounded-lg flex flex-col justify-center h-full mt-[100px]">
                    <h3 className="text-lg font-semibold mb-4">Lọc theo</h3>

                    {/* Khoảng giá */}
                    <div className="mb-4 flex-grow">
                        <h4 className="font-semibold">Khoảng giá</h4>
                        <input
                            type="number"
                            value={priceRange.min}
                            min="0"
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: +e.target.value }))}
                            className="w-full p-2 mb-2 border rounded"
                            placeholder="Min giá"
                        />
                        <input
                            type="number"
                            min="0"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: +e.target.value }))}
                            className="w-full p-2 border rounded"
                            placeholder="Max giá"
                        />

                        {/* Input Range */}
                        <input
                            type="range"
                            min="0"
                            max="1000000"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: +e.target.value }))}
                            className="w-full mt-2"
                        />
                        <p className="text-sm text-gray-600">Giá tối đa: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(priceRange.max)}</p>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-semibold">Lọc theo ngày xuất bản</h4>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="newest"
                                checked={sortBy === "newest"}
                                onChange={() => setSortBy(sortBy === "newest" ? "" : "newest")}
                                className="w-4 h-4"
                            />
                            <label htmlFor="newest">Mới nhất</label>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="oldest"
                                checked={sortBy === "oldest"}
                                onChange={() => setSortBy(sortBy === "oldest" ? "" : "oldest")}
                                className="w-4 h-4"
                            />
                            <label htmlFor="oldest">Cũ nhất</label>
                        </div>
                    </div>

                    {/* Nút áp dụng */}
                    <button
                        onClick={() => setCurrentPage(1)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all ease-in-out duration-300"
                    >
                        Áp dụng
                    </button>
                </div>



                {/* Book List Column */}
                <div className="w-10/12 p-2">
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="flex gap-4 w-full max-w-2xl">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sách..."
                                className="flex-grow border p-3 bg-gray-100 rounded-lg transition-all ease-in-out duration-300 hover:border-blue-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-all ease-in-out duration-300"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 justify-center mx-auto">
                        {categories.map(category => (
                            <button
                                key={category._id}
                                className={`px-4 py-2 rounded-full border transition-all ease-in-out duration-300 ${selectedCategory === category._id ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-blue-50"}`}
                                onClick={() => setSelectedCategory(category._id)}
                            >
                                {category._id}
                            </button>
                        ))}
                    </div>


                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 overflow-y-auto p-4">
                        {books.map(book => (
                            <BookCard book={book} key={book._id} addToCart={alertAddtoCart} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center mt-6 gap-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border transition-all ease-in-out duration-300 ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                        >
                            <ChevronLeft color={currentPage === 1 ? "gray" : "white"} />
                        </button>

                        <span className="text-lg font-semibold text-white">Trang {currentPage} / {totalPages}</span>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border transition-all ease-in-out duration-300 ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                        >
                            <ChevronRight color={currentPage === totalPages ? "gray" : "white"} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
