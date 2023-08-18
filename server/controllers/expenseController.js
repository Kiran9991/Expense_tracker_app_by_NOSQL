const Expense = require('../models/expense');
const User = require('../models/users');
const FileDownloaded = require('../models/filesdownloaded');
const sequelize = require('../util/database');
const UserServices = require('../services/userservices');
const S3Services = require('../services/S3services');


const addExpense = async(req, res) => {
    const t = await sequelize.transaction();
    try {
        const{amount, description, category} = req.body;

        if(amount == undefined || amount.length === 0) {
            return res.status(400).json({success: false, message: 'Parameters missing'})
        }

        const expense = await Expense.create({ amount, description, category, userId: req.user.id}, {transaction: t})
        const totalExpense = Number(req.user.totalExpenses) + Number(amount)
        await User.update({
            totalExpenses: totalExpense
        },{
            where: {id: req.user.id},
            transaction: t
        })
            await t.commit();
            res.status(200).json({newExpenseDetail: expense})
           
    } catch(err) {
        await t.rollback();
        console.log(`posting data is not working`);
        res.status(500).json(err);
    }
}

const getExpenses = async(req, res) => {
    const t = await sequelize.transaction();
    try {
        const page = req.query.page
        const limit = req.query.limit
        const expenses = await Expense.findAll({ where: {userId: req.user.id} },{transaction:t})
        const user = await User.findOne({ where: {id: req.user.id} },{transaction:t});
       
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const nextPage = endIndex < expenses.length ? page + 1 : null;
        const prevPage = startIndex > 0 ? page - 1 : null;
        await t.commit();
        res.status(200).json({
            allExpensesDetails: expenses,
            currentPage: page,
            nextPage: nextPage,
            prevPage: prevPage,
            limit,
            allExpensesDetails: expenses.slice(startIndex, endIndex),
            balance: user.balance
        });
    } catch(error) {
        await t.rollback();
        console.log('Get expenses is failing', JSON.stringify(error))
        res.status(500).json({error: error})
    }
}

const deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        if(!req.params.id === 'undefined') {
            console.log("ID is missing")
            return res.status(400).json({err: 'ID is missing'})
        }
        const expenseId = req.params.id;
        const expense = await Expense.findOne({
            where: {
                id:expenseId,
                userId: req.user.id
            }
        },{transaction:t})
        const totalExpenses = await Expense.sum('amount', {
            where: {userId: req.user.id}
        })
        const updatedTotalExpenses = totalExpenses - expense.amount
        const noOfRows = await Expense.destroy({where: {id: expenseId, userId: req.user.id}});
        await User.update({
            totalExpenses: updatedTotalExpenses
        },{
            where: {id: req.user.id},
        })
        if(noOfRows === 0) {
            return res.status(404).json({message: `Expense doesn't belongs to user`})
        }
        await t.commit();
        res.sendStatus(200);
    } catch(err) {
        await t.rollback();
        console.log(err)
        res.status(500).json(err);
    }
}

const downloadExpense = async(req, res) => {
    try {

    const expenses = await UserServices.getExpenses(req);
    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user.id;

    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
    await FileDownloaded.create({userId: req.user.id, urls: fileURL})
    res.status(200).json({ fileURL, filename, success: true})
    } catch(err) {
        console.log(err);
        res.status(500).json({fileURL: '', success: false, err: err})
    }
}

const listOfFilesDownloaded = async (req, res) => {
    try{
        if(req.user.ispremiumuser) {
            const filesDownloaded = await FileDownloaded.findAll()
            const urls = filesDownloaded.map(download => download.urls);
            console.log("all downloads====>>>",urls);

            res.status(200).json(urls);
        }
    }catch (err) {
        console.log(err);
    }
}

module.exports = {
    addExpense,
    getExpenses,
    deleteExpense,
    downloadExpense,
    listOfFilesDownloaded,
}