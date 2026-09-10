const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', savingsController.getSavings);
router.post('/', savingsController.createSaving);
router.put('/:id', savingsController.updateSaving);
router.delete('/:id', savingsController.deleteSaving);

module.exports = router;
