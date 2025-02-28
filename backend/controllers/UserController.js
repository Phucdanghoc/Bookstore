const User = require('../models/User');
const bcrypt = require('bcrypt');

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
};
const getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, fullname, phone, birthday, address } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                username, 
                fullname, 
                phone, 
                birthday, 
                address
             },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.user.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete account', error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        if (req.user && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Access denied. Only admins can add books.' });
            return;
        }
        const { page = 1, limit = 10, search = '' } = req.query;
        const users = await User.find({ username: { $regex: search, $options: 'i' }, role: { $ne: 'admin' } }).skip((page - 1) * limit).limit(Number(limit));
        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);
        res.status(200).json({
            users,
            totalPages,
            currentPage: Number(page),
            totalUsers,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};


module.exports = {
    changePassword,
    getProfile,
    getUsers,
    updateProfile,
    deleteAccount,
};
