import axios from "axios";

// ============================================================
// BASE INSTANCE - REST API (Port 5050, JWT-based)
// ============================================================
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Interceptor: Auto-attach JWT token dari localStorage ─────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fintrix_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor: Auto-refresh token jika 401 ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("fintrix_refresh_token");
        if (refreshToken) {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          localStorage.setItem("fintrix_token", data.token);
          localStorage.setItem("fintrix_refresh_token", data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh gagal → clear auth & redirect ke login
        localStorage.removeItem("fintrix_token");
        localStorage.removeItem("fintrix_refresh_token");
        localStorage.removeItem("fintrix_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTH APIs
// ============================================================
export const authAPI = {
  /** Register user baru */
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),

  /** Login manual */
  login: (email, password, rememberMe = false) =>
    api.post("/auth/login", { email, password, rememberMe }),

  /** Logout */
  logout: () => api.post("/auth/logout"),

  /** Refresh token */
  refreshToken: (refreshToken) =>
    api.post("/auth/refresh-token", { refreshToken }),

  /** Forgot password */
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),

  /** Reset password */
  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }),

  /** Google OAuth URL */
  googleLoginUrl: () => `${BASE_URL}/auth/google`,
};

// ============================================================
// USER / PROFILE APIs
// ============================================================
export const userAPI = {
  /** Ambil profil user yang sedang login */
  getProfile: () => api.get("/users/profile"),

  /** Update nama, email, avatar, atau password */
  updateProfile: (data) => api.put("/users/profile", data),

  /** Hapus akun */
  deleteAccount: () => api.delete("/users/profile"),

  /** Ambil statistik keuangan user */
  getStats: () => api.get("/users/stats"),

  /** Aktifkan 2FA */
  enableTwoFactor: () => api.post("/users/enable-2fa"),

  /** Nonaktifkan 2FA */
  disableTwoFactor: () => api.post("/users/disable-2fa"),
};

// ============================================================
// TRANSACTION APIs
// ============================================================
export const transactionAPI = {
  /** Ambil semua transaksi milik user */
  getAll: () => api.get("/transactions"),

  /** Tambah transaksi baru */
  add: (data) => api.post("/transactions", data),

  /** Hapus transaksi berdasarkan ID */
  delete: (id) => api.delete(`/transactions/${id}`),
};

// ============================================================
// ANALYTICS APIs
// ============================================================
export const analyticsAPI = {
  /** Ringkasan total income, expense, balance */
  getSummary: () => api.get("/analytics/summary"),

  /** Pengeluaran per kategori (untuk chart) */
  getSpendingByCategory: () => api.get("/analytics/category"),

  /** Perbandingan pengeluaran bulan ini vs bulan lalu */
  getMonthlyComparison: () => api.get("/analytics/monthly-comparison"),

  /** Kategori pengeluaran tertinggi bulan ini */
  getHighestCategory: () => api.get("/analytics/highest-category"),
};


// ============================================================
// BUDGET APIs
// ============================================================
export const budgetAPI = {
  /** Ambil semua budget */
  getAll: () => api.get("/budgets"),

  /** Tambah/Update budget */
  save: (data) => api.post("/budgets", data),

  /** Hapus budget */
  delete: (id) => api.delete(`/budgets/${id}`),
};

// ============================================================
// INVESTMENT APIs
// ============================================================
export const investmentAPI = {
  /** Ambil semua investasi */
  getAll: () => api.get("/investments"),

  /** Tambah investasi baru */
  add: (data) => api.post("/investments", data),

  /** Update investasi */
  update: (id, data) => api.put(`/investments/${id}`, data),

  /** Hapus investasi */
  delete: (id) => api.delete(`/investments/${id}`),
};

// ============================================================
// NOTIFICATION APIs
// ============================================================
export const notificationAPI = {
  /** Ambil semua notifikasi */
  getAll: () => api.get("/notifications"),

  /** Tandai sebagai sudah dibaca */
  markRead: (id) => api.put(`/notifications/${id}/read`),

  /** Tandai semua sudah dibaca */
  markAllRead: () => api.put("/notifications/read-all"),
};

// ============================================================
// AI / FINANCIAL BRAIN APIs
// ============================================================
export const aiAPI = {
  /** Dapatkan insights dari AI */
  getInsights: (data) => api.post("/ai/insights", data),
};
