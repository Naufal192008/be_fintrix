const express = require('express');
const router = express.Router();
const {
  getSummary,
  getSpendingByCategory,
  getMonthlyComparison,
  getHighestCategory,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary',             protect, getSummary);
router.get('/category',            protect, getSpendingByCategory);
router.get('/monthly-comparison',  protect, getMonthlyComparison);
router.get('/highest-category',    protect, getHighestCategory);

module.exports = router;