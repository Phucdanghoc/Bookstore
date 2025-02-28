import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookData } from "../../interfaces/BookData";
import BookService from "../../services/BookServices";
import { Minus, Plus, Trash2Icon } from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import CommentService from "../../services/CommentServices";
import { toast } from "react-toastify";
import CartServices from "../../services/CartServices";

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
    const checkIsAuth = () => localStorage.getItem("token") ? true : false;

    const [comments, setComments] = useState<{ _id: string; user: any; content: string; created_at: string, isAuthor: boolean }[]>([]);
    const [newComment, setNewComment] = useState("");

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
                fetchComments();
            } catch (err) {
                console.error("Lỗi khi lấy thông tin sách:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);
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
    const handleAddToCart = async () => {
        if (!checkIsAuth()) {
            navigate("/auth");
            toast.success("Hãy đăng nhập để mua sách nhé");
        } else {
            try {
                if (book) {
                    const response = await CartServices.addToCart(book._id, quantity, book.price);
                    if (response.status == 400) {
                        toast.error("Số lượng sách trong giỏ hàng không đủ");
                    } else {
                        toast.success("Thêm vào giỏ hàng thành công");
                    }
                } else {
                    toast.error("Không thể thêm vào giỏ hàng. Sách không tồn tại.");
                }

            } catch (error) {
                toast.error("Số lượng sách không thành công");
                console.error("Lỗi khi thêm vào giỏ hàng:", error);
            }
        }
    };
    const fetchRelatedBooks = async (category: string) => {
        try {
            const response = await BookService.getBookByCategory(category);
            setRelatedBooks(response.books);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách sách cùng thể loại:", err);
        }
    };
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).replace(",", ""); // Xóa dấu phẩy giữa ngày và giờ
    };

    const fetchComments = async () => {
        try {

            const response = localStorage.getItem("token") ? await CommentService.getCommentsByAuthor(id!) : await CommentService.getCommentsByBookId(id!);
            setComments(response.data);
        } catch (err) {
            console.error("Lỗi khi lấy bình luận:", err);
        }
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        try {
            const response = await CommentService.addComment(id!, newComment);
            const comment = response.data;
            comment.isAuthor = true;
            comment.username = "Tôi";
            setComments([...comments, response.data]);
            setNewComment("");
        } catch (err) {
            console.error("Lỗi khi gửi bình luận:", err);
        }
    };
    const handleDeleteComment = async (commentId: string) => {
        try {
            const response = await CommentService.deleteComment(commentId);
            if (response.status === 200) {
                toast.success("Xóa bình luận thành công");
                setComments(comments.filter(comment => comment._id !== commentId));
            } else {
                toast.error("Xóa bình luận thất bại");
            }

        } catch (err) {
            console.error("Lỗi khi xóa bình luận:", err);
        }
    };

    if (loading) return <p className="text-center text-xl font-semibold">Đang tải...</p>;

    return (
        <div className="w-full mx-auto p-8 bg-gradient-to-r from-blue-500 to-green-300 shadow-xl rounded-lg h-full overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-[400px] h-[600px] rounded-lg overflow-hidden shadow-lg border border-blue-300">
                        <img src={`${API_URL}${selectedImage}`} alt={book?.title} className="w-full h-full object-cover" />
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
                    {(book?.discount ?? 0) > 0 && (
                        <>
                            <p className="text-2xl text-gray-500 font-semibold mt-2 line-through">Giá: {book?.price.toLocaleString()} VNĐ</p>
                            <p className="text-3xl text-blue-600 font-semibold mt-2">Giá khuyến mãi: {((book?.price ?? 0) - (book?.discount ?? 0)).toLocaleString()} VNĐ</p>
                        </>
                    )}
                    {book?.discount === 0 && (
                        <p className="text-3xl text-blue-600 font-semibold mt-2">Giá: {book?.price.toLocaleString()} VNĐ</p>
                    )}
                    <div className="mt-4 flex items-center gap-4 p-3">
                        <label className="text-lg font-medium text-gray-700">Số lượng:</label>
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                            <Minus size={20} />
                        </button>
                        <span className="text-2xl font-semibold text-blue-600">{quantity}</span>
                        <button className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            onClick={() => setQuantity((prev) => prev + 1)}>
                            <Plus size={20} />
                        </button>
                    </div>
                    <button onClick={handleAddToCart} className="bg-blue-600 text-white text-xl py-3 px-6 rounded-lg mt-6 hover:bg-blue-700 transition transform hover:scale-105 shadow-md">
                        🛒 Thêm vào giỏ hàng
                    </button>
                    <div className="mt-6 border-t border-gray-300 pt-4">
                        <h2 className="text-2xl font-semibold mb-4 text-blue-900">📘 Thông tin chi tiết</h2>
                        <table className="w-full border-collapse border border-gray-300 text-lg bg-white shadow-md rounded-lg overflow-hidden">
                            <tbody>
                                <tr className="border-b bg-blue-50">
                                    <td className="p-3 font-medium"> Thể loại</td>
                                    <td className="p-3 font-bold text-blue-600 ">{book?.category}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">📄 Số trang</td>
                                    <td className="p-3">{book?.pages}</td>
                                </tr>
                                <tr className="border-b bg-blue-50">
                                    <td className="p-3 font-medium">🏢 Nhà xuất bản</td>
                                    <td className="p-3">{book?.publisher}</td>
                                </tr>
                                <tr className="border-b bg-blue-50">
                                    <td className="p-3 font-medium">📅 Ngày xuất bản</td>
                                    <td className="p-3">{book?.publication_date ? new Date(book.publication_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Không có dữ liệu"}</td>
                                </tr>
                                <tr className="border-b bg-blue-50">
                                    <td className="p-3 font-medium">Số lượng</td>
                                    <td className="p-3 font-bold text-blue-600">{book?.stock}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            <div className="mt-6 border-t border-gray-300 bg-blue-200 rounded-lg pt-4">
                <h2 className="text-2xl font-semibold text-blue-900 p-3">📖 Mô tả</h2>
                <p className="text-lg text-gray-700 bg-white p-4">{book?.description}</p>
            </div>
            <div className="mt-10 bg-blue-100 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-blue-800 mb-4">💬 Bình luận</h2>
                <div className="grid grid-cols-10 gap-6">
                    <div className="col-span-6 h-[400px] overflow-y-auto no-scrollbar p-4 bg-gray-100 rounded-lg">
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg shadow-md mb-3 transition-transform hover:scale-102 flex justify-between items-center 
                                     ${comment.isAuthor
                                            ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"  
                                            : "bg-blue-200 hover:bg-blue-100 text-gray-800"
                                        }`}
                                >
                                    <div>
                                        <p className="font-semibold">{comment.user.username || "Tôi"}</p>
                                        <p>{comment.content}</p>
                                        <p className="text-sm opacity-80">{formatDate(comment.created_at)}</p>
                                    </div>

                                    {comment.isAuthor && (
                                        <Trash2Icon
                                            color="red"
                                            onClick={() => handleDeleteComment(comment._id)}
                                            className="ml-4 text-white hover:text-red-300 transition"
                                        >
                                        </Trash2Icon>
                                    )}
                                </div>


                            ))
                        ) : (
                            <p className="text-gray-700 text-center">Chưa có bình luận nào.</p>
                        )}
                    </div>

                    {/* Cột 2: Form bình luận (30%) */}
                    <div className="col-span-4">
                        {localStorage.getItem("token") ? (
                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <textarea
                                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Viết bình luận..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button
                                    className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg w-full hover:bg-blue-700 transition transform hover:scale-105"
                                    onClick={handleCommentSubmit}
                                >
                                    Gửi bình luận
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-700 text-center">
                                Hãy{" "}
                                <span
                                    onClick={() => navigate("/auth")}
                                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                                >
                                    đăng nhập
                                </span>{" "}
                                để bình luận.
                            </p>
                        )}
                    </div>
                </div>
            </div>


            {/* Sách cùng thể loại */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold text-white mb-4">📚 Sách cùng thể loại <span onClick={
                    () => navigate(`/client/books`)
                } className="text-2xl text-white-500 hover:text-blue-600 cursor-pointer">( Xem thêm )</span></h2>
                <div className="flex overflow-x-auto gap-4 p-4">
                    {relatedBooks.length > 0 && relatedBooks.map((relatedBook) => (
                        <div key={relatedBook._id} className="w-[200px] min-w-[200px] p-3 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition transform hover:scale-105"
                            onClick={() => navigate(`/client/books/${relatedBook._id}`)}>
                            <img src={`${API_URL}${relatedBook.images[0]}`} alt={relatedBook.title} className="w-full h-[250px] object-cover rounded-lg" />
                            <h3 className="text-lg font-semibold text-gray-800 mt-2">{relatedBook.title}</h3>
                            <p className="text-blue-600 font-medium">{relatedBook.price.toLocaleString()} VNĐ</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage;
