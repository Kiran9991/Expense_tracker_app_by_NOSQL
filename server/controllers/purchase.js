const Razorpay = require('razorpay');
const Order = require('../models/orders');
const userController = require('./userController');
const sequelize = require('../util/database');
require('dotenv').config()

const purchasepremium = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
        const amount = 2500;

        await rzp.orders.create({amount, currency: "INR"}, async (err, order) => {
            if(err) {
                throw new Error(JSON.stringify(err));
            }
            await req.user.createOrder({ orderid: order.id, status: 'PENDING'}, { transaction: t })
            await t.commit();
            return res.status(201).json({ order, key_id : rzp.key_id});
        })
    } catch(err){
        await t.rollback();
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err})
    }
}

 const updateTransactionStatus = async (req, res ) => {
    try {
        const userId = req.user.id;
        const { payment_id, order_id} = req.body;
        const order  = await Order.findOne({where : {orderid : order_id}})
        const promise1 =  order.update({ paymentid: payment_id, status: 'SUCCESSFULL'})
        const promise2 =  req.user.update({ ispremiumuser: true })
       
        Promise.all([promise1, promise2])
        return res.status(202).json({sucess: true, message: "Transaction Successful",token: userController.generateAccessToken(userId,undefined , true) })       
    } catch (err) {
        console.log(err);
        res.status(403).json({ errpr: err, message: 'Something went wrong' })
    }
}

module.exports = {
    purchasepremium,
    updateTransactionStatus
}