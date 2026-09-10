const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', incomeController.getIncome);
router.post('/', incomeController.createIncome);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
