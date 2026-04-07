const express = require('express');
const router = express.Router();
const { getGoals, addProgress } = require('../controllers/goalController');
const { isLoggedIn } = require('../middleware/authMiddleware');

router.get('/', isLoggedIn, getGoals);
router.put('/:id/add', isLoggedIn, addProgress);

module.exports = router;