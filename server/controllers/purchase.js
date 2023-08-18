const Razorpay = require('razorpay');
const Order = require('../models/orders');
const userController = require('./user');
require('dotenv').config()

const purchasepremium = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const amount = 2500;

        const orderPromise = new Promise((resolve, reject) => {
            rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });

        const order = await orderPromise;
        const user = req.user;
        const createdOrder = await Order.create({
            orderid: order.id,
            status: 'PENDING',
            userId: user._id
        });

        return res.status(201).json({ order: createdOrder, key_id: rzp.key_id });
    } catch (error) {
        console.log(error);
        res.status(403).json({ message: 'Something went wrong', error: error });
    }
};

const updateTransactionStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { payment_id, order_id } = req.body;

        const order = await Order.findOne({ orderid: order_id });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.paymentid = payment_id;
        order.status = 'SUCCESSFULL';
        await order.save();

        req.user.ispremiumuser = true;
        await req.user.save();

        const token = userController.generateAccessToken(userId, undefined, true);

        return res.status(202).json({
            success: true,
            message: 'Transaction Successful',
            token: token
        });
    } catch (error) {
        console.log(error);
        res.status(403).json({ error: error, message: 'Something went wrong' });
    }
};


module.exports = {
    purchasepremium,
    updateTransactionStatus
}