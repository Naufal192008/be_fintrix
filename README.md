Markdown
# Fintrix - Intelligent Financial Management 🚀

Fintrix adalah aplikasi manajemen keuangan full-stack yang dirancang untuk membantu pengguna mengelola saldo, pemasukan, pengeluaran, dan target tabungan secara cerdas. Aplikasi ini mengintegrasikan teknologi MERN Stack dengan sistem autentikasi aman Google OAuth 2.0.

---

## 📂 Struktur Project
Aplikasi ini terdiri dari dua bagian utama yang saling terintegrasi:
1.  **`fintrix-backend`**: Server API yang dibangun dengan Node.js, Express, dan MongoDB untuk mengelola data dan autentikasi.
2.  **`fe-fintrix`**: Interface pengguna (Frontend) yang dibangun dengan React.js dan Vite untuk pengalaman user yang responsif.

---

## 🛠️ Persiapan (Prerequisites)
Sebelum menjalankan aplikasi, pastikan kamu sudah menginstal:
* [Node.js](https://nodejs.org/) (Versi 18 ke atas)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Untuk database cloud)
* [Google Cloud Console](https://console.cloud.google.com/) (Untuk mendapatkan Client ID Google Auth)

---

## 🚀 Cara Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini secara berurutan:

### 1. Setup Backend (Terminal 1)
Buka terminal, masuk ke folder backend:
```bash
cd fintrix-backend
Instal semua library yang dibutuhkan:

Bash
npm install
Buat file baru bernama .env di dalam folder fintrix-backend. Isi dengan konfigurasi berikut (Data kredensial akan dikirim secara pribadi melalui WhatsApp):

Cuplikan kode
PORT=5050
MONGODB_URI=masukkan_url_mongodb_kamu
GOOGLE_CLIENT_ID=masukkan_client_id_google_kamu
GOOGLE_CLIENT_SECRET=masukkan_client_secret_google_kamu
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback
CLIENT_URL=http://localhost:5173
SESSION_SECRET=fintrix_secret_key_2026
Jalankan server backend:

Bash
node server.js
Server akan berjalan di http://localhost:5050

2. Setup Frontend (Terminal 2)
Buka terminal baru, masuk ke folder frontend:

Bash
cd fe-fintrix
Instal semua library:

Bash
npm install
Jalankan aplikasi frontend:

Bash
npm run dev
Aplikasi akan berjalan di http://localhost:5173
