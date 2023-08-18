const express = require('express');

const router = express.Router();

const authenticatemiddleware = require('../middleware/auth')

const premiumController = require('../controllers/premiumFeatures');

router.get('/leaderboard', authenticatemiddleware.authenticate, premiumController.userLeaderBoard);

module.exports = router;