const { spawn } = require('child_process');
const path = require('path');

// @desc    Get AI Financial Advice
// @route   POST /api/ai/advice
exports.getAIAdvice = async (req, res) => {
  try {
    // Data dummy untuk testing, nanti ganti dengan data asli dari MongoDB
    const inputData = {
      balance: req.body.balance || 5000000,
      income: req.body.income || 10000000,
      expenses: req.body.expenses || 7500000,
      goals: req.body.goals || [{ title: "Beli Motor", target: 20000000, current: 2000000 }]
    };

    // Jalankan file Python
    const pythonScriptPath = path.join(__dirname, '../ai/financial_brain.py');
    const pythonProcess = spawn('python', [pythonScriptPath, JSON.stringify(inputData)]);

    let result = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ message: 'AI gagal merespon.' });
      }
      try {
        const aiOutput = JSON.parse(result);
        res.status(200).json({
          success: true,
          ai_response: aiOutput
        });
      } catch (e) {
        res.status(500).json({ message: 'Format data AI salah.' });
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};