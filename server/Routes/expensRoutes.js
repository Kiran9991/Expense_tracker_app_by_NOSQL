const express = require('express');

const expenseController = require('../controllers/expenseController');

const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.post('/add-expense', userAuthentication.authenticate, expenseController.addExpense);

router.get('/get-expenses', userAuthentication.authenticate,expenseController.getExpenses);

router.delete('/delete-expense/:id', userAuthentication.authenticate, expenseController.deleteExpense);

module.exports = router;