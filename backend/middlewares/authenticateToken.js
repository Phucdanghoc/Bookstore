const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY); 
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.', error: error.message });
    }
};

module.exports = authenticateToken;
