import sys
import json
import random
from datetime import datetime

def generate_financial_advice(data):
    try:
        # Mengambil data dari Node.js (Format JSON)
        user_data = json.loads(data)
        
        balance = user_data.get('balance', 0)
        expenses = user_data.get('expenses', 0)
        income = user_data.get('income', 0)
        saving_goals = user_data.get('goals', [])
        
        # LOGIKA PINTAR 1: Analisis Rasio Pengeluaran
        expense_ratio = (expenses / income) * 100 if income > 0 else 0
        
        # LOGIKA PINTAR 2: Prediksi Kebangkrutan (Real-live Alert)
        daily_avg = expenses / datetime.now().day
        projected_expense = daily_avg * 30
        
        advice = []
        
        # MEMBERIKAN SARAN BERDASARKAN DATA
        if expense_ratio > 70:
            advice.append("⚠️ Bahaya! Pengeluaranmu sudah 70% dari gaji. Stop jajan kopi/nongkrong dulu ya.")
        elif expense_ratio < 30 and balance > 0:
            advice.append("✅ Keuanganmu sehat! Kamu punya sisa dana lebih. Mau coba investasi di Emas?")
            
        if projected_expense > income:
            advice.append(f"📉 Peringatan: Jika pola belanjamu tetap begini, kamu bakal minus Rp{(projected_expense - income):,.0f} di akhir bulan.")

        # LOGIKA PINTAR 3: Cek Progres Tabungan
        for goal in saving_goals:
            progress = (goal['current'] / goal['target']) * 100
            if progress < 20:
                advice.append(f"🎯 Target '{goal['title']}' masih rendah. Coba alokasikan 5% uangmu ke sini hari ini.")

        # LIVE DATA MOCK (Bisa dikembangkan pakai API Berita/Emas asli)
        market_trends = ["Harga Emas sedang turun 1.2%, waktu yang baik untuk beli!", 
                         "Suku bunga bank naik, mending simpan di deposito.",
                         "Inflasi global naik, hati-hati dengan pengeluaran tersier."]
        
        final_response = {
            "status": "Smart",
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "primary_advice": advice[0] if advice else "Data belum cukup, teruslah mencatat transaksi!",
            "all_insights": advice,
            "market_info": random.choice(market_trends)
        }
        
        return json.dumps(final_response)

    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    # Menerima input dari Node.js via stdin
    if len(sys.argv) > 1:
        print(generate_financial_advice(sys.argv[1]))