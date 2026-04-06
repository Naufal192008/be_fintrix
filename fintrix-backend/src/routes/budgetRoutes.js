const express = require('express');
const router = express.Router();
const { createBudget, getBudgets, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',    protect, getBudgets);
router.post('/',   protect, createBudget);
router.delete('/:id', protect, deleteBudget);

module.exports = router;