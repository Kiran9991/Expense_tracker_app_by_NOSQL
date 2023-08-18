const Expense = require('../models/expense');
const User = require('../models/users');
const FileDownloaded = require('../models/filesdownloaded');
const S3Services = require('../services/S3services');

const addExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body;

        if (amount === undefined || amount.length === 0) {
            return res.status(400).json({ success: false, message: 'Parameters missing' });
        }

        const expense = await Expense.create({ amount, description, category, userId: req.user.id });
        const totalExpense = Number(req.user.totalExpenses) + Number(amount);
        await User.updateOne({ _id: req.user.id }, { totalExpenses: totalExpense });

        res.status(200).json({ newExpenseDetail: expense });
    } catch (err) {
        console.log('posting data is not working', err);
        res.status(500).json(err);
    }
};

const getExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const expenses = await Expense.find({ userId: req.user.id });
        const user = await User.findById(req.user.id);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const nextPage = endIndex < expenses.length ? page + 1 : null;
        const prevPage = startIndex > 0 ? page - 1 : null;

        res.status(200).json({
            allExpensesDetails: expenses.slice(startIndex, endIndex),
            currentPage: page,
            nextPage: nextPage,
            prevPage: prevPage,
            limit,
            balance: user.balance
        });
    } catch (error) {
        console.log('Get expenses is failing', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteExpense = async (req, res) => {
    try {
        if (!req.params.id) {
            console.log('ID is missing');
            return res.status(400).json({ err: 'ID is missing' });
        }
        const expenseId = req.params.id;
        const expense = await Expense.findOneAndDelete({ _id: expenseId, userId: req.user.id });
        if (!expense) {
            return res.status(404).json({ message: `Expense doesn't belong to the user` });
        }

        const updatedTotalExpenses = req.user.totalExpenses - expense.amount;
        await User.updateOne({ _id: req.user.id }, { totalExpenses: updatedTotalExpenses });

        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};

const downloadExpense = async (req, res) => {
    try {
        const expenses = await UserServices.getExpenses(req);
        const stringifiedExpenses = JSON.stringify(expenses);
        const userId = req.user.id;

        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
        await FileDownloaded.create({ userId: req.user.id, urls: fileURL });

        res.status(200).json({ fileURL, filename, success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ fileURL: '', success: false, err: err.message });
    }
};

const listOfFilesDownloaded = async (req, res) => {
    try {
        if (req.user.ispremiumuser) {
            const filesDownloaded = await FileDownloaded.find();
            const urls = filesDownloaded.map(download => download.urls);

            res.status(200).json(urls);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addExpense,
    getExpenses,
    deleteExpense,
    downloadExpense,
    listOfFilesDownloaded
};
