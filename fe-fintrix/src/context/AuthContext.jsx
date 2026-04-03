import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
const STORAGE_KEY = "fintrix_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      // Cek ke backend port 5050
      const res = await axios.get("http://localhost:5050/api/auth/login/success", {
        withCredentials: true,
      });

      if (res.data.success) {
        const userData = {
          id: res.data.user.id,
          name: res.data.user.displayName,
          email: res.data.user.emails[0].value,
          avatar: res.data.user.photos[0].value,
          authType: "google"
        };
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      }
    } catch (err) {
      // Jika Google gagal, cek localStorage (Manual Login)
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (email, password) => {
    const userData = { id: Date.now(), name: email.split('@')[0], email, authType: "manual" };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await axios.get("http://localhost:5050/api/auth/logout", { withCredentials: true });
    } catch (e) {}
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, login, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);