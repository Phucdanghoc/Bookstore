const express = require('express');
const {
    changePassword,
    getProfile,
    updateProfile,
    deleteAccount,
    getUsers,
} = require('../controllers/UserController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.put('/change-password', authenticateToken, changePassword);
router.get('/profile', authenticateToken, getProfile);
router.get('/', authenticateToken, getUsers);
router.put('/update-profile', authenticateToken, updateProfile);
router.delete('/delete-account', authenticateToken, deleteAccount);
module.exports = router;    
