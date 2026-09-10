const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/summary', analyticsController.getSummary);

module.exports = router;
