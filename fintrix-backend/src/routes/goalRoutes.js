const express = require('express');
const router = express.Router();
const { addGoal, getGoals, updateGoalProgress, deleteGoal, resetGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addGoal);
router.get('/', protect, getGoals);
router.put('/:id', protect, updateGoalProgress);
router.put('/:id/reset', protect, resetGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;