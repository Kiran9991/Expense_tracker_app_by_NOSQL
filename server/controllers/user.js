const User = require('../models/users');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function isStringInvalid(string) {
    if(string == undefined || string.length === 0) {
        return true;
    } else {
        return false;
    }
}

const signUp = async(req,res) => {
    try {

    const {name, email, password} = req.body;

    if(isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password)) {
        return res.status(400).json({err: "Bad parameters. Something is missing"})
    }

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
            return res.status(500).json(err);
        }
        const newUser = new User({
            name,
            email,
            password: hash
        });
        await newUser.save();
        console.log('New user is Created')
        res.status(201).json({ message: 'Successfully created new user' });
    });
    } catch(err) {
        console.log(err)
        res.status(500).json({err: `Something went wrong`});
    }
}

const generateAccessToken = (id,name, ispremiumuser) => {
    return jwt.sign({ userId: id, name: name, ispremiumuser}, 'secretKey')
}

const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({message: "EmailId and password is missing"})
        }

        const user = await User.findOne({ email });
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Something went wrong' });
                }
                if (result === true) {
                    const token = generateAccessToken(user._id, user.name, user.ispremiumuser);
                    console.log('User login Successfully')
                    res.status(200).json({ success: true, message: 'User logged in successfully', token });
                } else {
                    res.status(400).json({ success: false, message: 'Password is incorrect' });
                }
            });
        } else {
            res.status(404).json({ success: false, message: `User doesn't exist` });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({message: `Something went wrong`, success: false});
    }
}

module.exports = {
    signUp,
    login,
    generateAccessToken
}