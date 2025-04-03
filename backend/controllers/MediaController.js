const Book = require('../models/Book');

const uploadImageBook = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        
        book.images = [...book.images, ...imagePaths];
        await book.save();

        return res.status(200).json({ 
            message: 'Images uploaded successfully', 
            images: book.images 
        });
    } catch (error) {
        console.error('Error uploading images:', error); 
        return res.status(500).json({ 
            message: 'Failed to upload images', 
            error: error.message 
        });
    }
};

module.exports = { uploadImageBook };