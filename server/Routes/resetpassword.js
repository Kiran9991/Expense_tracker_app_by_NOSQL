const express = require('express');

const resetpasswordController = require('../controllers/resetpassword');

const router = express.Router();

router.get('/update/:reset-password-id', resetpasswordController.updatepassword)

router.get('/reset-password/:id', resetpasswordController.resetpassword)

router.use('/forgot', resetpasswordController.forgotpassword)

module.exports = router;