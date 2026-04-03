# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# Fe-Fintrix - Aplikasi Manajemen Keuangan


## 🏗️ Arsitektur Aplikasi

### Backend (Naufal)
- **Teknologi**: Node.js, Express, MongoDB Atlas
- **Autentikasi**: JWT, bcrypt
- **Database**: MongoDB Cloud
- **API**: 11 RESTful endpoints

### Frontend (Aisha)
- **Teknologi**: React, Vite, Bootstrap
- **State Management**: React Hooks
- **UI**: Responsive design

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (atau MongoDB local)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/AishaSekar/fe-fintrix.git
cd fe-fintrix
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env dengan MongoDB URI Anda
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd ..
npm install
npm run dev
```

### 4. Akses Aplikasi
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

## 📊 API Documentation

### Auth Endpoints
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Profile user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Ganti password |

### Transaction Endpoints
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/transactions` | List transaksi |
| POST | `/api/transactions` | Tambah transaksi |
| GET | `/api/transactions/:id` | Detail transaksi |
| PUT | `/api/transactions/:id` | Update transaksi |
| DELETE | `/api/transactions/:id` | Hapus transaksi |
| GET | `/api/transactions/summary` | Laporan keuangan |

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String,
  password: String (hashed),
  monthlyBudget: Number,
  currency: String,
  createdAt: Date
}
```

### Transactions Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId,
  type: String,
  category: String,
  amount: Number,
  description: String,
  date: Date,
  paymentMethod: String
}
```

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fintrix
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📸 Screenshot
[Tempel screenshot aplikasi di sini]

## 📞 Kontributor
- **Naufal Murtadho** - Backend Developer
- **Aisha Sekar** - Frontend Developer

## 📝 Lisensi
MIT License
