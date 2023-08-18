const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../util/database');

function isStringInvalid(string) {
    if(string == undefined || string.length === 0) {
        return true;
    } else {
        return false;
    }
}

const signUp = async(req,res) => {
    const t = await sequelize.transaction();
    try {

    const {name, email, password} = req.body;

    if(isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password)) {
        return res.status(400).json({err: "Bad parameters. Something is missing"})
    }

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async(err, hash) => {
        console.log(err);
        await User.create({ name, email, password: hash},{transaction: t})
        await t.commit();
        res.status(201).json({message: 'Successfully created new user'});
    })
    } catch(err) {
        await t.rollback();
        res.status(500).json(err);
    }
}

const generateAccessToken = (id,name, ispremiumuser) => {
    return jwt.sign({ userId: id, name: name, ispremiumuser}, 'secretKey')
}

const login = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {email, password} = req.body;
        if(isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({message: "EmailId and password is missing"})
        }

        const user = await User.findAll({ where: { email }},{transaction: t})
            if(user.length > 0) {
                bcrypt.compare(password, user[0].password, (err, result) => {
                    if(err) {
                        throw new Error(`Something went wrong`);
                    }
                    if(result === true) {
                        res.status(200).json({success: true, message: 'User logged in successfully', token: generateAccessToken(user[0].id, user[0].name, user[0].ispremiumuser)})
                    } else {
                        return res.status(400).json({success: false, message: 'Password is incorrect'})
                    }
                })
            } else {
                await t.commit();
                return res.status(404).json({success: false, message: `User Doesn't exist`})
            }
    } catch (err) {
        await t.rollback();
        res.status(500).json({message: err, success: false});
    }
}

module.exports = {
    signUp,
    login,
    generateAccessToken
}