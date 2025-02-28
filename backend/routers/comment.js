const router = require('express').Router();
const { getCommentsByAuthor, addComment, deleteComment, getAllCommnetByBookId } = require('../controllers/CommentController');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/byAuthor/:bookId', authenticateToken, getCommentsByAuthor);
router.post('/', authenticateToken, addComment);
router.get('/:bookId', getAllCommnetByBookId);
router.delete('/:id', authenticateToken, deleteComment);

module.exports = router;    