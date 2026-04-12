const { spawn } = require('child_process');
const path = require('path');

// @desc    Get AI Financial Advice
// @route   POST /api/ai/advice
exports.getAIAdvice = async (req, res) => {
  try {
    const { balance = 0, income = 0, expenses = 0, topCategory = 'Lainnya', language = 'en' } = req.body;
    
    const isID = language === 'id';
    
    // Algoritma simulasi AI / Heuristik sederhana
    const insights = [];
    
    // 1. Rasio Pengeluaran terhadap Pendapatan
    const expenseRatio = income > 0 ? (expenses / income) : 1;
    if (expenseRatio > 0.8) {
      insights.push({
        type: "warning",
        icon: "warning",
        text: isID 
          ? `Pengeluaran Anda menghabiskan ${(expenseRatio * 100).toFixed(0)}% dari pendapatan. Pertimbangkan untuk menguranginya hingga mencapai rasio 50/30/20.`
          : `Your expenses consume ${(expenseRatio * 100).toFixed(0)}% of your income. Consider cutting down to reach a 50/30/20 budget.`
      });
    } else if (expenseRatio < 0.5 && income > 0) {
      insights.push({
        type: "good",
        icon: "good",
        text: isID
          ? `Kerja bagus! Rasio pengeluaran Anda sehat di angka ${(expenseRatio * 100).toFixed(0)}%. Anda menabung sebagian besar pendapatan Anda.`
          : `Great job! Your expense ratio is healthy at ${(expenseRatio * 100).toFixed(0)}%. You are saving a large portion of your income.`
      });
    }

    // 2. Kategori pengeluaran terbesar
    if (topCategory !== 'Lainnya') {
      insights.push({
        type: "suggestion",
        icon: "suggestion",
        text: isID
          ? `Anda menghabiskan paling banyak untuk ${topCategory}. Meninjau kategori ini mungkin memberikan penghematan terbaik.`
          : `You are spending the most on ${topCategory}. Reviewing this category might yield the best savings.`
      });
    }

    // 3. Saran tabungan / surplus
    const surplus = income - expenses;
    if (surplus > 0) {
      insights.push({
        type: "good",
        icon: "good",
        text: isID
          ? `Anda memiliki surplus sebesar {SURPLUS}. Pertimbangkan untuk memindahkannya ke investasi atau target tabungan khusus.`
          : `You have a surplus of {SURPLUS}. Consider moving this into an investment or a dedicated savings goal.`,
        value: surplus
      });
    } else if (surplus < 0) {
      insights.push({
        type: "warning",
        icon: "warning",
        text: isID
          ? `Anda menghabiskan {SURPLUS} lebih banyak dari pendapatan. Akumulasi hutang ini harus segera diatasi.`
          : `You are spending {SURPLUS} more than you earn. This debt accumulation must be addressed.`,
        value: Math.abs(surplus)
      });
    }

    // Pastikan AI mengembalikan minimal 3 array
    if (insights.length < 3) {
      insights.push({ 
        type: "suggestion", 
        icon: "suggestion", 
        text: isID
          ? "Konsistensi adalah kunci. Pertimbangkan untuk membiasakan diri mencatat setiap pengeluaran kecil setiap hari."
          : "Consistency is key. Consider adopting a daily habit of logging every small expense." 
      });
    }
    
    // Batasi maksimum 3 insights
    const finalInsights = insights.slice(0, 3);

    res.status(200).json({
      success: true,
      ai_response: finalInsights
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};