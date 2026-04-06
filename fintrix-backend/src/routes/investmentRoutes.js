const express = require('express');
const router = express.Router();
const { addInvestment, getInvestments, deleteInvestment } = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getInvestments);
router.post('/', protect, addInvestment);
router.delete('/:id', protect, deleteInvestment);

module.exports = router;