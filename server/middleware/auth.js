const User = require('../models/users');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authorization token missing' });
        }
        
        const decodedToken = jwt.verify(token, 'secretKey');
        const userId = decodedToken.userId;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

module.exports = {
    authenticate
};
