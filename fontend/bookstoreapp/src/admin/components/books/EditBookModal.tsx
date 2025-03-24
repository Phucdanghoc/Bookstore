import { useEffect, useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { BookData } from "../../../interfaces/BookData";
import BookServices from "../../../services/BookServices";

interface EditBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    book_id: string | undefined;
    onUpdate: (updatedBook: BookData) => void;
}

// Danh sách các thể loại mẫu
const categoryOptions = [
    "Fiction",
    "Non-fiction",
    "Science",
    "Fantasy",
    "Mystery",
    "Biography",
    "History",
    "Romance",
    "Thriller",
    "Self-help"
];

export default function EditBookModal({ isOpen, onClose, book_id, onUpdate }: EditBookModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [book, setBook] = useState<BookData>({
        _id: "",
        title: "",
        author: "",
        price: 0,
        category: "",
        description: "",
        discount: 0,
        stock: 0,
        pages: 0,
        images: [],
        publisher: "",
        publication_date: "",
    });
    const URL_API = "http://localhost:3000";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log(name, value);

        setBook((prev) => ({
            ...prev,
            [name]: name === "price" || name === "stock" || name === "pages" ? Number(value) : value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const selectedImages = Array.from(files).slice(0, 5 - book.images.length);
            setNewImages((prev) => [...prev, ...selectedImages]);
        }
    };

    const removeImage = (index: number) => {
        setBook((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        setNewImages([]);
    }, [book]);

    useEffect(() => {
        const fetchBook = async () => {
            const response = await BookServices.getBookById(book_id as string);
            setBook(response);
        };
        fetchBook();
    }, [book_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const updatedBook = await BookServices.updateBook(book._id, book);
            if (newImages.length > 0) {
                const imageFiles = await Promise.all(
                    newImages.map(async (file) => {
                        return new File([file], `image-${Date.now()}.png`, { type: file.type });
                    })
                );
                await BookServices.uploadImages(updatedBook._id, imageFiles);
            }
            onUpdate(updatedBook);
            onClose();
        } catch (error) {
            console.error("🚨 Error updating book:", error);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const formattedDate = (publication_date: string) => {
        if (!publication_date) return "";
        return publication_date.split("T")[0];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-8 relative">
                <div className="flex items-center justify-between border-b pb-4 mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-t-xl">
                    <h2 className="text-2xl font-bold">✏️ Chỉnh sửa Sách</h2>
                    <button onClick={onClose} className="text-white hover:text-red-300 transition">
                        <X size={28} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
                    <div>
                        <label className="block text-sm font-medium">Tiêu đề</label>
                        <input
                            type="text"
                            name="title"
                            className="w-full p-3 border rounded-lg"
                            value={book.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium">Tác giả</label>
                            <input
                                type="text"
                                name="author"
                                className="w-full p-3 border rounded-lg"
                                value={book.author}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Giá</label>
                            <input
                                type="number"
                                name="price"
                                className="w-full p-3 border rounded-lg"
                                value={book.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Giảm giá</label>
                            <input
                                type="number"
                                name="discount"
                                className="w-full p-3 border rounded-lg"
                                value={book.discount}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium">Nhà xuất bản</label>
                            <input
                                type="text"
                                name="publisher"
                                className="w-full p-3 border rounded-lg"
                                value={book.publisher}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Thể loại</label>
                            <select
                                name="category"
                                className="w-full p-3 border rounded-lg"
                                value={book.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Chọn thể loại
                                </option>
                                {categoryOptions.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium">Số lượng</label>
                            <input
                                type="number"
                                name="stock"
                                className="w-full p-3 border rounded-lg"
                                value={book.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Số trang</label>
                            <input
                                type="number"
                                name="pages"
                                className="w-full p-3 border rounded-lg"
                                value={book.pages}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Ngày xuất bản</label>
                            <input
                                type="date"
                                name="publication_date"
                                className="w-full p-3 border rounded-lg"
                                value={formattedDate(book.publication_date)}
                                onChange={handleChange}
                                required
                                placeholder="dd/MM/yyyy"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <label className="block text-sm font-medium">Mô tả</label>
                        <textarea
                            name="description"
                            className="w-full p-3 border rounded-lg"
                            value={book.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Hình ảnh</label>
                        <div className="grid grid-cols-6 gap-2">
                            {book.images &&
                                book.images.map((image, index) => (
                                    <div key={index} className="relative w-20 h-20 border rounded-lg overflow-hidden">
                                        <img src={`${URL_API}${image}`} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            {newImages.map((image, index) => (
                                <div key={`new-${index}`} className="relative w-20 h-20 border rounded-lg overflow-hidden">
                                    <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {book.images && book.images.length < 5 && (
                                <label className="w-20 h-20 border-2 border-dashed flex items-center justify-center cursor-pointer">
                                    <Plus size={24} className="text-gray-400" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} multiple />
                                </label>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : "Cập nhật"}
                    </button>
                </form>
            </div>
        </div>
    );
}