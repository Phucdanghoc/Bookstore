const Book = require('../models/Book');
const uploadImageBook = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        book.images.push(...imagePaths);
        await book.save();

        res.status(200).json({ 
            message: 'Images uploaded successfully', 
            images: book.images 
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to upload images', error: error.message });
    }
};


module.exports =  { uploadImageBook };
