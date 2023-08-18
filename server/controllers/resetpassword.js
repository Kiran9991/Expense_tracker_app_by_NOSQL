const bcrypt = require('bcrypt');

const User = require('../models/users');
const Forgotpassword = require('../models/forgotpassword');

const uuid = require('uuid');
const Sib = require('sib-api-v3-sdk');
const validator = require('validator');

require('dotenv').config();

const forgotpassword = async (req, res) => {
    try {

        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.API_KEY;
        const transEmailApi = new Sib.TransactionalEmailsApi();
        
        const { email } =  req.body;
        const user = await User.findOne({where : { email }});
        if(user){  
            const id = uuid.v4();
            user.createForgotpassword({ id , isActive: true })

            if (!validator.isEmail(email.toLowerCase())) {
                    return res.status(400).json({ error: 'Invalid email address' });
            }
             
            const sender = {email:'kiranagiwale3@gmail.com'};
            const receiver = [{ email }];

            const msg = {
                sender,
                to: receiver,
                subject: 'Password reset request for your account',
                textContent: 'We received a request to reset the password for your account. Please click on the link to reset the password',
                htmlContent: `<p>Hello,</p>
                <p>We received a request to reset the password for your account. Please follow the link below to reset your password:</p>
                <p><a href="http://localhost:3000/password/resetpassword/${id}">Reset Password</a></p><p>If you did not request this password reset, please ignore this email and contact us immediately.</p><p>Thank you,
                </p><p>Expense Tracker</p>`
            }
 
            const response = await transEmailApi.sendTransacEmail(msg)
            .then((response) => {
                return res.status(202).json({message: 'Link to reset password sent to your mail ', success: true});
            })
            .catch((error) => {
                console.log(error)
                throw new Error(error);
            })
        }else {
            throw new Error(`User doesn't exist`)
        }
    } catch(err){
        console.error(err)
        return res.json({ message: err, success: false });
    }
}

const resetpassword = (req, res) => {
    const id =  req.params.id;
    Forgotpassword.findOne({ where : { id }}).then(forgotpasswordrequest => {
        if(forgotpasswordrequest){
            forgotpasswordrequest.update({ isActive: false});
            res.status(200).send(`<html>

                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
                                )
            res.end()
        }
    })
}

const updatepassword = (req, res) => {

    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where : { id: resetpasswordid }}).then(resetpasswordrequest => {
            User.findOne({where: { id : resetpasswordrequest.userId}}).then(user => {
                if(user) {
                    //encrypt the password
                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err, hash) {
                            // Store hash in password DB.
                            if(err){
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash }).then(() => {
                                res.status(201).json({message: 'Successfuly update the new password'})
                            })
                        });
                    });
            } else{
                return res.status(404).json({ error: 'No user Exists', success: false})
            }
            })
        })
    } catch(error){
        return res.status(403).json({ error, success: false } )
    }
}

module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
}