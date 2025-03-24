const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');
const getBooks = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const books = await Book.find()
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const totalBooks = await Book.countDocuments();
        const totalPages = Math.ceil(totalBooks / limit);
        res.status(200).json({
            books,
            currentPage: Number(page),
            totalPages,
            totalBooks,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch books', error: error.message });
    }
};
const getBooksByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        const { page = 1, limit = 10 } = req.query;

        if (!category) {
            return res.status(400).json({ message: 'Category query parameter is required' });
        }
        const books = await Book.find({ category }).skip((page - 1) * limit).limit(Number(limit));
        const totalBooks = await Book.countDocuments({ category });
        const totalPages = Math.ceil(totalBooks / limit);
        res.status(200).json({
            books,
            currentPage: Number(page),
            totalPages,
            totalBooks,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get books by category', error: error.message });
    }
};




const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch the book', error: error.message });
    }
};
const addBook = async (req, res) => {
    if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Only admins can add books.' });
    }

    try {
        const { title, author, price, category, stock, pages, publisher, publication_date , description , discount} = req.body;
        let imageUrls = [];
        console.log(req.body);

        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        }

        const newBook = new Book({
            title,
            author,
            price,
            category,
            stock,
            pages,
            description,
            discount,
            publisher,
            publication_date,
            images: imageUrls,  
        });

        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add book', error: error.message });
    }
};

const searchBooksByRange = async (req, res) => {
    try {
        const { min, max } = req.query;
        const { page = 1, limit = 10 } = req.query;


        const minPrice = parseFloat(min) || 0;
        const maxPrice = parseFloat(max) || Infinity;

        const books = await Book.find({
            price: { $gte: minPrice, $lte: maxPrice },
        }).skip((page - 1) * limit).limit(Number(limit));
        const totalBooks = await Book.countDocuments({
            price: { $gte: minPrice, $lte: maxPrice },
        });
        const totalPages = Math.ceil(totalBooks / limit);


        res.status(200).json({
            books,
            currentPage: Number(page),
            totalPages,
            totalBooks,
        });
    } catch (error) {
        console.error("Lỗi khi tìm kiếm sách theo khoảng giá:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};


const updateBook = async (req, res) => {
    if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Only admins can edit books.' });
    }

    const { id } = req.params;
    try {
        const existingBook = await Book.findById(id);
        if (!existingBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        let imageUrls = req.body.images || [];

        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files.map(file => `/uploads/${file.filename}`);
            imageUrls = [...imageUrls, ...uploadedImages];
        }
        const imagesToDelete = existingBook.images.filter(image => !imageUrls.includes(image));
        imagesToDelete.forEach(image => {
            const imagePath = path.join(__dirname, '..', image);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(`🚨 Error deleting image ${image}:`, err);
                } else {
                    console.log(`🗑️ Deleted unused image: ${image}`);
                }
            });
        });
        req.body.images = imageUrls;
        console.log(req.body);
        
        const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update book', error: error.message });
    }
};


const deleteBook = async (req, res) => {
    const { id } = req.params;
    if (req.user && req.user.role != 'admin') {
        res.status(403).json({ message: 'Access denied. Only admins can delete books.' });
        return;
    }
    try {
        const deletedBook = await Book.findByIdAndDelete(id);
        if (!deletedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({ message: 'Book deleted successfully', book: deletedBook });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete book', error: error.message });
    }
};
const searchBooksByTitle = async (req, res) => {
    try {
        const { title } = req.query;
        const { page = 1, limit = 10 } = req.query;
        if (!title) {
            return res.status(400).json({ message: 'Title query parameter is required' });
        }
        const books = await Book.find({ title: new RegExp(title, 'i') }).skip((page - 1) * limit).limit(Number(limit));
        const totalBooks = await Book.countDocuments({ title: new RegExp(title, 'i') });
        const totalPages = Math.ceil(totalBooks / limit);

        res.status(200).json({
            books,
            currentPage: Number(page),
            totalPages,
            totalBooks,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to search books by title', error: error.message });
    }
};
const searchBooksByOldest = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ publication_date: 1 })
            .skip(skip)
            .limit(limit);

        const totalBooks = await Book.countDocuments();
        const totalPages = Math.ceil(totalBooks / limit);

        res.status(200).json({ success: true, books, totalPages, currentPage: page });
    } catch (error) {
        console.error("Lỗi khi tìm sách theo ngày xuất bản:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
const searchBooksByNewest = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ publication_date: -1 }) // Sắp xếp từ mới nhất đến cũ nhất
            .skip(skip)
            .limit(limit);

        const totalBooks = await Book.countDocuments();
        const totalPages = Math.ceil(totalBooks / limit);

        res.status(200).json({ success: true, books, totalPages, currentPage: page });
    } catch (error) {
        console.error("Lỗi khi tìm sách theo ngày xuất bản:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
const filterBooks = async (req, res) => {
    try {
        const { isNew, maxPrice, page = 1, limit = 10 } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const maxPriceNum = maxPrice ? Number(maxPrice) : undefined;
        const filterConditions = {};
        if (maxPriceNum !== undefined) {
            filterConditions.price = { $lte: maxPriceNum };
        }
        const sortOptions = {};
        if (isNew === "true") {
            sortOptions.publication_date = -1; 
        } else if (isNew === "false") {
            sortOptions.publication_date = 1; 
        }

        const books = await Book.find(filterConditions)
            .sort(sortOptions)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
        const totalBooks = await Book.countDocuments(filterConditions);
        const totalPages = Math.ceil(totalBooks / limitNum);
        res.status(200).json({
            books,
            currentPage: pageNum,
            totalPages,
            totalBooks,
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Failed to filter books", 
            error: error.message 
        });
    }
};

const getTopCategories = async (req, res) => {
    try {
        const top = parseInt(req.query.top, 10);

        if (isNaN(top) || top <= 0) {
            return res.status(400).json({ message: "Invalid 'top' value. It must be a positive integer." });
        }

        const topCategories = await Book.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }, // Nhóm theo category & đếm số lượng sách
            { $sort: { count: -1 } }, // Sắp xếp theo số lượng giảm dần
            { $limit: top } // Giới hạn số lượng kết quả
        ]);

        if (!topCategories.length) {
            return res.status(404).json({ message: "No categories found." });
        }

        res.status(200).json({ message: "Top categories retrieved successfully", data: topCategories });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch top categories", error: error.message });
    }
};
const getBooksMinStock = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const books = await Book.find({ stock: { $lt: 10 , $gt: 0 } })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const totalBooks = await Book.countDocuments({ stock: { $lt: 10 , $gt: 0 } });
        const totalPages = Math.ceil(totalBooks / limit);
        res.status(200).json({
            books,
            currentPage: Number(page),
            totalPages,
            totalBooks,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch books', error: error.message });
    }
};


module.exports = {
    getBooks,
    getBookById,
    getBooksByCategory,
    addBook,
    getTopCategories,
    updateBook,
    filterBooks,
    deleteBook,
    searchBooksByTitle,
    getBooksMinStock,
    searchBooksByRange,
    searchBooksByOldest,
    searchBooksByNewest,
};
