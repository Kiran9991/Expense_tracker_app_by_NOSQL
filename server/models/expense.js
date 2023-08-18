const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount: Number,
    description: String,
    category: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
