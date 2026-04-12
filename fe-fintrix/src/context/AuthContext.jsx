import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext();

const EXCHANGE_RATES = {
  USD: 1,
  IDR: 15850,
  EUR: 0.94,
  JPY: 153,
  GBP: 0.79,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Global Theme Logic
  useEffect(() => {
    if (!user) {
      document.body.className = 'light-theme';
      return;
    }

    const applyTheme = (theme) => {
      let activeTheme = theme;
      if (theme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.body.className = activeTheme === 'dark' ? 'dark-theme' : 'light-theme';
    };

    applyTheme(user.theme || 'system');

    // Listen for system theme changes if set to system
    if (user.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        document.body.className = e.matches ? 'dark-theme' : 'light-theme';
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.theme]);

  // Internal helper: clear semua auth state
  const _clearAuth = useCallback(() => {
    localStorage.removeItem("fintrix_token");
    localStorage.removeItem("fintrix_refresh_token");
    localStorage.removeItem("fintrix_user");
    setUser(null);
  }, []);

  // Cek status auth saat app pertama load
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("fintrix_token");
      if (!token) {
        setLoading(false);
        return;
      }
      // Ambil profil user menggunakan token yang tersimpan
      const response = await api.get("/users/profile");
      setUser(response.data);
    } catch (err) {
      console.error(err);
      // Token invalid / expired → clear auth
      _clearAuth();
    } finally {
      setLoading(false);
    }
  }, [_clearAuth]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);


  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/auth/login", { email, password });
      const { token, refreshToken, ...userData } = response.data;
      localStorage.setItem("fintrix_token", token);
      if (refreshToken) localStorage.setItem("fintrix_refresh_token", refreshToken);
      // Simpan data user
      setUser(userData);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login gagal. Coba lagi.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post("/auth/register", userData);
      // Setelah register langsung login
      const { token, refreshToken, ...user } = response.data;
      if (token) {
        localStorage.setItem("fintrix_token", token);
        if (refreshToken) localStorage.setItem("fintrix_refresh_token", refreshToken);
        setUser(user);
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Registrasi gagal.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      _clearAuth();
    }
  };

  const googleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleGoogleCallback = async (token, refreshToken) => {
    try {
      localStorage.setItem("fintrix_token", token);
      if (refreshToken) localStorage.setItem("fintrix_refresh_token", refreshToken);
      const response = await api.get("/users/profile");
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (err) {
      console.error(err);
      _clearAuth();
      return { success: false, error: "Gagal memuat profil." };
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      await api.post("/auth/forgot-password", { email });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal mengirim email reset.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      await api.post(`/auth/reset-password/${token}`, { password });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal reset password.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // ── User Profile ──────────────────────────────────────────────────────────

  const getProfile = async () => {
    try {
      const response = await api.get("/users/profile");
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal mengambil profil.";
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await api.put("/users/profile", profileData);
      setUser((prev) => ({ ...prev, ...response.data }));
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal update profil.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/users/profile");
      _clearAuth();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal hapus akun.";
      return { success: false, error: msg };
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const getUserStats = async () => {
    try {
      const response = await api.get("/users/stats");
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal mengambil statistik.";
      return { success: false, error: msg };
    }
  };

  // ── 2FA ───────────────────────────────────────────────────────────────────

  const enableTwoFactor = async () => {
    try {
      const response = await api.post("/users/enable-2fa");
      setUser((prev) => ({ ...prev, twoFactorEnabled: true }));
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal aktifkan 2FA.";
      return { success: false, error: msg };
    }
  };

  const disableTwoFactor = async () => {
    try {
      const response = await api.post("/users/disable-2fa");
      setUser((prev) => ({ ...prev, twoFactorEnabled: false }));
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal nonaktifkan 2FA.";
      return { success: false, error: msg };
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  
  const convertMoney = useCallback((amount, targetCurrency) => {
    const rate = EXCHANGE_RATES[targetCurrency] || 1;
    return amount * rate;
  }, []);

  const formatCurrency = useCallback((amount, options = {}) => {
    const curr = user?.currency || 'USD';
    const lang = user?.language === 'id' ? 'id-ID' : 'en-US';
    const convertedAmount = convertMoney(amount, curr);
    
    try {
      return new Intl.NumberFormat(lang, {
        style: 'currency',
        currency: curr,
        minimumFractionDigits: (curr === 'IDR' || curr === 'JPY') ? 0 : 2,
        maximumFractionDigits: (curr === 'IDR' || curr === 'JPY') ? 0 : 2,
        ...options
      }).format(convertedAmount);
    } catch {
      return `${curr} ${convertedAmount.toLocaleString()}`;
    }
  }, [user?.currency, user?.language, convertMoney]);

  const t = useCallback((en, id) => {
    return user?.language === 'id' ? id : en;
  }, [user?.language]);

  const getCurrencySymbol = useCallback(() => {
    const curr = user?.currency || 'USD';
    const symbols = { IDR: 'Rp', USD: '$', EUR: '€', JPY: '¥', GBP: '£' };
    return symbols[curr] || curr;
  }, [user?.currency]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    // Auth
    login,
    register,
    logout,
    googleLogin,
    handleGoogleCallback,
    forgotPassword,
    resetPassword,
    // Profile
    getProfile,
    updateProfile,
    deleteAccount,
    // Stats
    getUserStats,
    // 2FA
    enableTwoFactor,
    disableTwoFactor,
    // Global Utils
    convertMoney,
    formatCurrency,
    getCurrencySymbol,
    t
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};