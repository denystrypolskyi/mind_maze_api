const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/user-info', verifyToken, userController.getUserInfo);
router.put('/user-info', verifyToken, userController.updateUserInfo);
router.get('/user-avatar', verifyToken, userController.getUserAvatar);
router.put('/user-avatar', verifyToken, upload.single('avatar'), userController.updateUserAvatar);

module.exports = router;
