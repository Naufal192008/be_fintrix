Tentu, ini draf **README** yang sudah diperbarui dengan informasi repositori yang spesifik, instruksi yang lebih lengkap, dan bahasa yang profesional namun tetap ramah. Kamu bisa langsung menyalin teks di bawah ini:

---

# Fintrix - Intelligent Financial Management 🚀

**Fintrix** adalah aplikasi manajemen keuangan *full-stack* yang dirancang untuk membantu pengguna mengelola saldo, pemasukan, pengeluaran, dan target tabungan secara cerdas. Aplikasi ini mengintegrasikan teknologi modern dengan sistem autentikasi aman menggunakan Google OAuth 2.0.

---

## 📂 Sumber Repositori (Source Code)
Project ini terdiri dari dua bagian utama yang dikembangkan secara terpisah:

1.  **Backend API**: [https://github.com/Naufal192008/be_fintrix.git](https://github.com/Naufal192008/be_fintrix.git)
    * *Teknologi:* Node.js, Express, MongoDB.
2.  **Frontend Interface**: [https://github.com/AishaSekar/fe-fintrix](https://github.com/AishaSekar/fe-fintrix)
    * *Teknologi:* React.js, Vite, Tailwind CSS, AOS (Animation).

---

## 🛠️ Persiapan (Prerequisites)
Sebelum menjalankan aplikasi, pastikan perangkat Anda sudah terpasang:
* **Node.js** (Versi 18 ke atas)
* **Git** (Untuk melakukan cloning repositori)
* **MongoDB Atlas** (Untuk database cloud)
* **Google Cloud Console** (Untuk Client ID Google Auth)

---

## 🚀 Panduan Instalasi & Cara Menjalankan

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di lingkungan lokal Anda:

### 1. Setup Backend (Terminal 1)
Buka terminal, buat folder utama, lalu clone repositori backend:
```bash
git clone https://github.com/Naufal192008/be_fintrix.git fintrix-backend
cd fintrix-backend
```
Instal semua library yang dibutuhkan:
```bash
npm install
```
Buat file baru bernama **`.env`** di dalam folder `fintrix-backend` dan isi dengan konfigurasi berikut:
```env
PORT=5050
MONGODB_URI=masukkan_url_mongodb_kamu
GOOGLE_CLIENT_ID=masukkan_client_id_google_kamu
GOOGLE_CLIENT_SECRET=masukkan_client_secret_google_kamu
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback
CLIENT_URL=http://localhost:5173
SESSION_SECRET=fintrix_secret_key_2026
```
Jalankan server backend:
```bash
node server.js
```
*Server akan berjalan di: **http://localhost:5050***

---

### 2. Setup Frontend (Terminal 2)
Buka terminal baru, pastikan Anda berada di luar folder backend, lalu clone repositori frontend:
```bash
git clone https://github.com/AishaSekar/fe-fintrix
cd fe-fintrix
```
Instal semua library (termasuk library animasi AOS dan pendukung lainnya):
```bash
npm install
```
Jalankan aplikasi frontend:
```bash
npm run dev
```
*Aplikasi akan berjalan di: **http://localhost:5173***

---

## 📝 Catatan Penting
* **Sinkronisasi:** Pastikan server backend sudah berjalan sebelum membuka frontend agar fitur login dan penarikan data berfungsi dengan normal.
* **Google Auth:** Pastikan URL Redirect di Google Console sudah sesuai dengan `GOOGLE_CALLBACK_URL` yang ada di file `.env`.
* **Troubleshooting:** Jika muncul error terkait modul, pastikan Anda sudah menjalankan `npm install` di masing-masing folder (frontend dan backend).

Terima kasih telah mencoba **Fintrix**. Jika ada kendala dalam proses instalasi, silakan hubungi tim pengembang.

--- 

### Pesan Tambahan (Bisa kamu sertakan saat mengirim):
> "Halo! Berikut adalah panduan lengkap untuk menjalankan project Fintrix. Saya sudah memisahkan bagian Backend dan Frontend agar lebih mudah dikelola. Mohon ikuti langkah-langkah di atas secara berurutan agar aplikasi berjalan lancar. Terima kasih!"
