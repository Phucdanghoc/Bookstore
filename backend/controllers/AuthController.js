const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TokenService = require('../utils/jwt');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            role: 'client',
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: {
            username: savedUser.username,
            role: savedUser.role,
        } });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const payload = {
            id: user._id,
            role: user.role
        };
        const token = TokenService.generateToken(payload, '24h');

        res.status(200).json({
            message: 'Login successful',
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

const logout = (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};

const verify = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.status(200).json({ message: 'Token is valid', user: {
            access : true,
            role: decoded.role
        } });
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token', error: error.message });
    }
};

module.exports = {
    register,
    login,
    logout,
    verify,
};
