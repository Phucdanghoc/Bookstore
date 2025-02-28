const Comment = require('../models/Comment');
const getAllCommnetByBookId = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const comments = await Comment.find({ book: bookId }).populate('user', 'username').lean();
        res.json(comments);
    } catch (error) {
        console.error("Lỗi khi lấy bình luận:", error);
        res.status(500).json({ message: 'Lỗi server!' });
    }
};
const getCommentsByAuthor = async (req, res) => {
    try {
        const userId = req.user.id; 
        console.log(userId);
        
        const bookId = req.params.bookId;

        const comments = await Comment.find({ book: bookId }).populate('user', 'username').lean();
        const updatedComments = comments.map(comment => ({
            ...comment,
            isAuthor: comment.user._id == userId
        }));

        res.json(updatedComments);
    } catch (error) {
        console.error("Lỗi khi lấy bình luận:", error);
        res.status(500).json({ message: 'Lỗi server!' });
    }
};

const addComment = async (req, res) => {
    try {
        const { bookId, content } = req.body;
        const comment = new Comment({ book: bookId, user: req.user.id, content });
        await comment.save();
        res.json(comment);
    } catch (error) {
        console.error("Lỗi khi gửi bình luận:", error);
        res.status(500).json({ message: 'Lỗi server!' });
    }
};
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        await Comment.findByIdAndDelete(commentId);
        res.json({ message: 'Binh luan da bi xoa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!' });
    }
};  

module.exports = { getAllCommnetByBookId, addComment, deleteComment , getCommentsByAuthor};