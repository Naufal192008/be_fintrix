import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";

function AuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Memproses login Google...");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const processGoogleAuth = async () => {
      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refreshToken");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        // 1. Simpan token ke localStorage
        localStorage.setItem("fintrix_token", token);
        if (refreshToken) {
          localStorage.setItem("fintrix_refresh_token", refreshToken);
        }

        setStatus("Mengambil profil akun...");

        // 2. Fetch profil user menggunakan token yang baru disimpan
        const { data } = await userAPI.getProfile();

        // 3. Set user ke AuthContext
        const userData = {
          id: data._id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          isVerified: data.isVerified,
          provider: data.provider || "google",
          authType: "google",
        };
        setUser(userData);
        localStorage.setItem("fintrix_user", JSON.stringify(userData));

        setStatus("Berhasil! Mengarahkan ke dashboard...");

        // 4. Redirect ke dashboard
        setTimeout(() => navigate("/dashboard"), 800);
      } catch (err) {
        console.error("Auth success error:", err);
        // Bersihkan token yang mungkin invalid
        localStorage.removeItem("fintrix_token");
        localStorage.removeItem("fintrix_refresh_token");
        setError("Gagal memverifikasi akun Google. Silakan coba lagi.");
        setTimeout(() => navigate("/login"), 2500);
      }
    };

    processGoogleAuth();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "2.5rem 3rem",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "1.25rem",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          maxWidth: 400,
        }}
      >
        {/* Google Icon */}
        <svg
          width="52"
          height="52"
          viewBox="0 0 48 48"
          style={{ marginBottom: "1.5rem" }}
        >
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>

        {error ? (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>❌</div>
            <h2 style={{ color: "#f87171", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Login Gagal
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{error}</p>
          </>
        ) : (
          <>
            {/* Spinner */}
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid rgba(255,255,255,0.1)",
                borderTop: "3px solid #22c55e",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1.25rem",
              }}
            />
            <h2
              style={{
                color: "#f1f5f9",
                fontSize: "1.15rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Login dengan Google
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{status}</p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AuthSuccessPage;
