const User = require('../models/users');
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        // console.log(token);
        const user = jwt.verify(token, 'secretKey');
        console.log('userID >>>>',user.userId);
        User.findByPk(user.userId).then(user => {
            // console.log(JSON.stringify(user));
            req.user = user;
            next();
        }).catch(err => { throw new Error(err)})
    } catch(err) {
        console.log(err);
        return res.status(401).json({success: false})
    }
}

module.exports = {
    authenticate
}