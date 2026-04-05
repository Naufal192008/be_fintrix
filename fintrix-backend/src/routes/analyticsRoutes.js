const express = require('express');
const router = express.Router();
const { getSummary, getSpendingByCategory } = require('../controllers/analyticsController');

router.get('/summary', getSummary);
router.get('/category', getSpendingByCategory);

module.exports = router;