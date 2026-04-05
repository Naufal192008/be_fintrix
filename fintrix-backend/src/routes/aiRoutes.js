const express = require('express');
const router = express.Router();
const { getAIAdvice } = require('../controllers/aiController');
// const { protect } = require('../middleware/authMiddleware'); // Pakai jika ingin dikunci login

router.post('/advice', getAIAdvice);

module.exports = router;