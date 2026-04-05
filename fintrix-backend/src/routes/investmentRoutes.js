const express = require('express');
const router = express.Router();
const { addInvestment, getInvestments } = require('../controllers/investmentController');

router.post('/', addInvestment);
router.get('/', getInvestments);

module.exports = router;