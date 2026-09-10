const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/verify-family', authController.verifyFamily);
router.get('/users', authController.getUsers);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
