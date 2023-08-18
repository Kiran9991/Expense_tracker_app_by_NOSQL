const express = require('express');

const expenseController = require('../controllers/expense');

const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.post('/add', userAuthentication.authenticate, expenseController.addExpense);

router.get('/expenses', userAuthentication.authenticate,expenseController.getExpenses);

router.delete('/:id', userAuthentication.authenticate, expenseController.deleteExpense);

module.exports = router;