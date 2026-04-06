import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ADMIN_EMAILS = ["admin@fintrix.com"];

function AuthSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const processAuth = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refreshToken");

      if (!token) {
        setStatus("Authentication failed. Redirecting...");
        setTimeout(() => navigate("/login?error=auth_failed"), 1500);
        return;
      }

      try {
        setStatus("Loading your profile...");
        const result = await handleGoogleCallback(token, refreshToken);

        if (result.success) {
          const userEmail = result.user?.email || "";
          const isAdmin = ADMIN_EMAILS.includes(userEmail.toLowerCase());
          navigate(isAdmin ? "/admin/dashboard" : "/dashboard", { replace: true });
        } else {
          setStatus("Failed to load profile. Redirecting...");
          setTimeout(() => navigate("/login?error=profile_failed"), 1500);
        }
      } catch {
        setStatus("Something went wrong. Redirecting...");
        setTimeout(() => navigate("/login?error=unknown"), 1500);
      }
    };

    processAuth();
  }, [location, handleGoogleCallback, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        flexDirection: "column",
        gap: "1.5rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          border: "4px solid rgba(99,102,241,0.2)",
          borderTopColor: "#6366f1",
          animation: "spin 0.8s linear infinite",
        }}
      />

      <div style={{ textAlign: "center" }}>
        <h3 style={{ color: "#e2e8f0", margin: 0, fontSize: "1.25rem" }}>
          {status}
        </h3>
        <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "0.875rem" }}>
          Please wait a moment.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AuthSuccess;
