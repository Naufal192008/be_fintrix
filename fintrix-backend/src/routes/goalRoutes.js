const express = require('express');
const router = express.Router();
const { addGoal, getGoals, updateGoalProgress } = require('../controllers/goalController');

router.post('/', addGoal);
router.get('/', getGoals);
router.put('/:id', updateGoalProgress);

module.exports = router;