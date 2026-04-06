import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext();

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
      // Token invalid / expired → clear auth
      _clearAuth();
    } finally {
      setLoading(false);
    }
  }, [_clearAuth]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ── Auth ──────────────────────────────────────────────────────────────────

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
      // Setelah register langsung login (backend sudah return token)
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
    } catch {
      // Tetap lanjut logout walau request gagal
    } finally {
      _clearAuth();
    }
  };

  const googleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  // Dipanggil dari AuthSuccess.jsx setelah redirect Google OAuth
  const handleGoogleCallback = async (token, refreshToken) => {
    try {
      localStorage.setItem("fintrix_token", token);
      if (refreshToken) localStorage.setItem("fintrix_refresh_token", refreshToken);
      // Fetch profil setelah token tersimpan
      const response = await api.get("/users/profile");
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (err) {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};