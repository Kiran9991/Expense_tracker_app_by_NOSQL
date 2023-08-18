const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount: Number,
    description: String,
    category: String
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
