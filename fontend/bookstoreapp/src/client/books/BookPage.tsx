import { useState, useEffect, useRef } from "react";
import BookCard from "../components/BookCard";
import { BookData, CategoriesData } from "../../interfaces/BookData";
import axios from "axios";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import BookService from "../../services/BookServices";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { toast } from "react-toastify";

const URL_API = "http://localhost:3000/api/books";
const API_URL = "http://localhost:3000";
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
    const [sortBy, setSortBy] = useState("");
    const [priceRange, setPriceRange] = useState(1000000);
    const [suggestions, setSuggestions] = useState<BookData[]>([]); // State cho gợi ý
    const [showSuggestions, setShowSuggestions] = useState(false); // Hiển thị dropdown
    const searchRef = useRef<HTMLDivElement>(null);

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
        axios.get(`${URL_API}/top-categories?top=8`)
            .then(response => {
                setCategories([{ _id: "Tất cả", count: response.data.totalBooks }, ...response.data.data]);
            })
            .catch(error => console.error("Lỗi lấy categories:", error));
    }, []);

    // Lấy gợi ý khi search term thay đổi
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.trim() === "") {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }
            try {
                const response = await BookService.searchBooks(searchTerm, 1, 5); // Lấy 5 gợi ý
                setSuggestions(response.books);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Lỗi khi lấy gợi ý:", error);
            }
        };
        fetchSuggestions();
    }, [searchTerm]);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = () => {
        const searchByTitle = async () => {
            try {
                const response = await BookService.searchBooks(searchTerm, currentPage, 10);
                setBooks(response.books);
                setTotalPages(response.totalPages);
                setShowSuggestions(false); // Ẩn gợi ý sau khi tìm kiếm
            } catch (error) {
                console.error("Lỗi khi tìm kiếm sách:", error);
            }
        };
        searchByTitle();
    };

    const handleSelectSuggestion = (book: BookData) => {
        setSearchTerm(book.title);
        setShowSuggestions(false);
        handleSearch();
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
        } else {
            toast.error("Đã hết hàng");
        }
    };

    const applyFilters = () => {
        try {
            const filterBooks = async () => {
                const response = await BookService.filterBooks(sortBy === "newest", priceRange, currentPage, 8);
                setBooks(response.books);
                setTotalPages(response.totalPages);
            };
            filterBooks();
        } catch (error) {
            console.error("Lỗi khi tìm kiếm sách theo giá:", error);
        }
    };

    return (
        <div className="container mx-auto p-2">
            <div className="flex gap-4">
                <div className="w-2/12 p-4 bg-gray-100 rounded-lg flex flex-col h-full mt-[100px]">
                    <h3 className="text-lg font-semibold mb-4">Lọc theo</h3>
                    <button
                        onClick={applyFilters}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all ease-in-out duration-300 mb-4"
                    >
                        Áp dụng
                    </button>
                    <div className="mb-4">
                        <h4 className="font-semibold">Khoảng giá</h4>
                        <input
                            type="range"
                            min="0"
                            max="1000000"
                            value={priceRange}
                            onChange={(e) => setPriceRange(+e.target.value)}
                            className="w-full mt-2"
                        />
                        <p className="text-sm text-gray-600">
                            Giá tối đa: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(priceRange)}
                        </p>
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
                    <div className="mb-4 flex-grow">
                        <h4 className="font-semibold mb-2">Danh mục</h4>
                        <ul className="space-y-2">
                            {categories.map(category => (
                                <li key={category._id}>
                                    <button
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300 ${selectedCategory === category._id ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-blue-50"}`}
                                        onClick={() => setSelectedCategory(category._id)}
                                    >
                                        {category._id} ({category.count})
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="w-10/12 p-2">
                    <div className="flex flex-col items-center gap-4 mb-6" ref={searchRef}>
                        <div className="flex gap-4 w-full max-w-2xl relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sách..."
                                className="flex-grow border p-3 bg-gray-100 rounded-lg transition-all ease-in-out duration-300 hover:border-blue-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-all ease-in-out duration-300"
                            >
                                <Search size={20} />
                            </button>

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 w-full max-w-2xl bg-white border rounded-lg shadow-lg mt-2 z-10 max-h-96 overflow-y-auto">
                                    {suggestions.map((book) => (
                                        <div
                                            key={book._id}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                            onClick={() => handleSelectSuggestion(book)}
                                        >
                                            <img
                                                src={`${API_URL}${book.images[0]}` || "https://via.placeholder.com/50"}
                                                alt={book.title}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <span className="text-sm font-medium truncate">{book.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 overflow-y-auto p-4">
                        {books.map(book => (
                            <BookCard book={book} key={book._id} addToCart={alertAddtoCart} />
                        ))}
                    </div>

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