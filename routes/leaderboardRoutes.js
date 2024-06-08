const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/leaderboard', verifyToken, leaderboardController.getLeaderboard);
router.post('/save-result', verifyToken, leaderboardController.saveResult);

module.exports = router;
