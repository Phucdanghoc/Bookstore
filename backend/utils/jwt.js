const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

const TokenService = {
    generateToken(payload, expiresIn = '10h') {
        return jwt.sign(payload, SECRET_KEY, { expiresIn });
    },
    verifyToken(token) {
        try {
            return jwt.verify(token, SECRET_KEY);
        }catch(error){
            return null;
        }
    },
}


module.exports = TokenService;