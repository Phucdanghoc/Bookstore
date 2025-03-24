import { useEffect, useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { BookData } from "../../../interfaces/BookData";
import BookServices from "../../../services/BookServices";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookData: BookData) => void;
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
  "Self-help",
];

export default function AddBookModal({ isOpen, onClose, onSubmit }: AddBookModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [book, setBook] = useState<BookData>({
    _id: "",
    title: "",
    author: "",
    price: 0,
    category: "",
    stock: 0,
    description: "",
    pages: 0,
    images: [],
    publisher: "",
    publication_date: "",
    discount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBook((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" || name === "pages" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files)
        .slice(0, 5 - book.images.length)
        .map((file) => URL.createObjectURL(file));
      setBook((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
  };

  const removeImage = (index: number) => {
    setBook((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const bookData = {
        title: book.title,
        author: book.author,
        price: book.price,
        category: book.category,
        stock: book.stock,
        description: book.description,
        pages: book.pages,
        publisher: book.publisher,
        publication_date: book.publication_date,
        discount: book.discount,
      };

      const newBook = await BookServices.createBook(bookData);
      if (book.images.length > 0) {
        const imageFiles = await Promise.all(
          book.images.map(async (image) => {
            const res = await fetch(image);
            const blob = await res.blob();
            return new File([blob], `image-${Date.now()}.png`, { type: blob.type });
          })
        );
        const response = await BookServices.uploadImages(newBook._id, imageFiles);
        if (response.success) {
          console.log("📸 Images Uploaded");
        } else {
          console.error("🚨 Error:", response);
        }
      }
      onSubmit(newBook); // Gọi onSubmit để thông báo cho component cha
      onClose();
    } catch (error) {
      console.error("🚨 Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setBook({
        _id: "",
        title: "",
        author: "",
        price: 0,
        category: "",
        description: "",
        stock: 0,
        pages: 0,
        images: [],
        publisher: "",
        discount: 0,
        publication_date: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-8 relative">
        <div className="flex items-center justify-between border-b pb-4 mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold">📚 Thêm Sách Mới</h2>
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
                value={book.publication_date}
                onChange={handleChange}
                required
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="block text-sm font-medium">Mô tả</label>
            <textarea
              name="description"
              className="w-full p-3 border rounded-lg"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Hình ảnh</label>
            <div className="grid grid-cols-6 gap-2">
              {book.images.map((image, index) => (
                <div key={index} className="relative w-20 h-20 border rounded-lg overflow-hidden">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {book.images.length < 5 && (
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
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : "Thêm mới"}
          </button>
        </form>
      </div>
    </div>
  );
}