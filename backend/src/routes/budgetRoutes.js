const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', budgetController.getBudgets);
router.post('/', budgetController.createOrUpdateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
