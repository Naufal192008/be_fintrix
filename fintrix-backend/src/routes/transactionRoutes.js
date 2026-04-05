const express = require('express');
const router = express.Router();
const { addTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');

router.post('/', addTransaction);
router.get('/', getTransactions);
router.delete('/:id', deleteTransaction);

module.exports = router;