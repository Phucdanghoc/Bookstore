import { useState, useEffect } from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import AddBookModal from "../../components/books/AddBookModal";
import { BookData } from "../../../interfaces/BookData";
import EditBookModal from "../../components/books/EditBookModal";

import ModalAccept from "../../../components/ModalAccept";
import BookService from "../../../services/BookServices";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
export default function BookManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openEidt, setOpenEdit] = useState(false);
  const [books, setBooks] = useState<BookData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookData | null>(null);
  useDocumentTitle("Quản lý sách");
  const LIMIT = 10;
  const URL_API = "http://localhost:3000";

  useEffect(() => {
    fetchBooks();
  }, [currentPage]);
  const fetchBooks = async () => {
    try {
      const response = await BookService.getAllBooks(currentPage, LIMIT);
      setBooks(response.books);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sách:", error);
    }
  };
  useEffect(() => {
    const searchByTitle = async () => {
      try {
        const response = await BookService.searchBooks(searchTerm, currentPage, LIMIT);
        setBooks(response.books);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sách:", error);
      }
    };
    searchByTitle();
  }, [searchTerm, currentPage]);

  const refreshData = (bookData: BookData) => {
    fetchBooks();
    console.log(bookData);
  };

  const openEditModal = (book: BookData) => {
    setSelectedBook(book);
    setOpenEdit(true);
    console.log(book);
    console.log(openEidt);
  };

  const openDeleteModal = (book: BookData) => {
    setSelectedBook(book);
    setShowAlert(true);
  };

  const confirmDelete = () => {
    console.log("Xóa sách:", selectedBook);
    try {
      if (!selectedBook) return;
      BookService.deleteBook(selectedBook?._id);
    } catch (error) {
      console.error("Lỗi khi xóa sách:", error);
    }
    setShowAlert(false);
  };

  return (
    <div className="p-6 flex flex-col h-screen z-0">
      <ModalAccept
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Xác nhận xóa sách"
        onConfirm={confirmDelete}
        confirmText="Xác nhận xóa"
      >
        <p>Bạn có chắc chắn muốn xóa sách <strong>{selectedBook?.title}</strong> không?</p>
      </ModalAccept>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📚 Quản lý Sách</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} /> Thêm sách
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Search size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="Tìm kiếm sách..."
          className="border p-2 rounded-md w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto relative shadow-md sm:rounded-lg scrollbar-hide bg-gray-100 no-scrollbar">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-900 uppercase bg-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3">Hình ảnh</th>
              <th scope="col" className="px-6 py-3">Tiêu đề</th>
              <th scope="col" className="px-6 py-3">Tác giả</th>
              <th scope="col" className="px-6 py-3">Thể loại</th>
              <th scope="col" className="px-6 py-3">Giá gốc</th>
              <th scope="col" className="px-6 py-3">Giá giảm</th>
              <th scope="col" className="px-6 py-3">Kho</th>
              <th scope="col" className="px-6 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <img
                    className="w-24 h-36 object-cover rounded-md"
                    src={book.images.length > 0 ? `${URL_API}${book.images[0]}` : "https://via.placeholder.com/100x150"}
                    alt={book.title}
                  />
                </td>
                <th scope="row" className="px-6 py-4 font-bold text-lg text-gray-900 whitespace-nowrap">
                  {book.title}
                </th>
                <td className="px-6 py-4">{book.author}</td>
                <td className="px-6 py-4">{book.category}</td>
                <td className="px-6 py-3 font-bold">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(book.price)}
                </td>
                <td className="px-6 py-3">
                  {book.discount > 0 ? (
                    <>
                      <p className="text-red-500 ">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(book.discount)}
                      </p>
                    </>
                  ) : null}
                </td>
                <td className="px-6 py-3">{book.stock > 0 ? book.stock : <p className="text-red-600">Hết hàng</p>}</td>
                <td className="px-6 py-4">
                  <button onClick={() => openEditModal(book)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
                    Sửa
                  </button>
                  <button onClick={() => openDeleteModal(book)} className="bg-red-500 text-white px-4 py-2 rounded-lg ml-2 hover:bg-red-600 transition duration-200">
                    Xóa
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
          <ChevronLeft size={24} />
        </button>
        <span className="text-lg font-semibold">{currentPage} / {totalPages}</span>
        <button
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <AddBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={refreshData}
      />
      <EditBookModal
        isOpen={openEidt}
        onClose={() => {
          setOpenEdit(false);
          console.log(openEidt);

        }} // Đóng modal
        onUpdate={refreshData}
        book_id={selectedBook?._id || ""}
      />

    </div>
  );
}
