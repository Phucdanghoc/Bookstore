import axios from "axios";

const API_URL = "http://localhost:3000/api/books";
const TOKEN = localStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

class BookService {
  static async getAllBooks(page = 1, limit = 10) {
    const response = await axiosInstance.get("/", {
      params: { page, limit },
    });
    return response.data;
  }

  static async getBookById(id: string) {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  }

  static async searchBooks(query: string, page = 1, limit = 10) {
    const response = await axiosInstance.get(`/search?title=${query}`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async uploadImages(bookId: string, images: File[]) {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });
    const response = await axiosInstance.post(`/${bookId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  static async createBook(bookData: any) {
    const response = await axiosInstance.post("/", bookData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  static async updateBook(id: string, bookData: any) {
    const response = await axiosInstance.put(`/${id}`, bookData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  static async deleteBook(id: string) {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  }

  static async minStock() {
    const response = await axiosInstance.get("/min-stock?limit=5");
    return response.data;
  }
  static async getBookByCategory(category: string, page = 1, limit = 10) {
    const response = await axiosInstance.get(`/category?category=${category}`, 
    {
      params: { page, limit },
    });
    return response.data;
  }
}

export default BookService;
