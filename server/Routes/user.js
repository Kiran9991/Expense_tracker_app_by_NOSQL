const express = require('express');

const userController = require('../controllers/user');

const expenseController = require('../controllers/expense');

const authenticatemiddleware = require('../middleware/auth')

const router = express.Router();

router.post('/signup', userController.signUp);

router.post('/login', userController.login);

router.get('/download', authenticatemiddleware.authenticate, expenseController.downloadExpense);

router.get('/downloaded-Files', authenticatemiddleware.authenticate, expenseController.listOfFilesDownloaded);

module.exports = router;