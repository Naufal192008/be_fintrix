import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import "../styles/auth.css";
import { useAuth } from "../context/AuthContext.jsx";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await forgotPassword(email);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Failed to send reset email. Please try again.");
      return;
    }

    setSent(true);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-sidebar">
        <h1>Reset Your Password</h1>
        <p className="sidebar-desc">
          We'll send you a link to reset your password securely.
        </p>
      </div>

      <div className="auth-main">
        <button className="btn-back" onClick={() => navigate("/login")}>
          ← Back to Login
        </button>

        <div className="form-box">
          <div className="brand">
            <h2>FINTRIX</h2>
            <div className="brand-line" />
          </div>

          {!sent ? (
            <>
              <div className="form-header">
                <h3>Forgot Password?</h3>
                <p>Enter your email and we'll send you a reset link</p>
              </div>

              {error && <p className="form-error">{error}</p>}

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Email Address</label>
                  <div className="input-box">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <CheckCircle size={56} color="#22c55e" style={{ marginBottom: "1rem" }} />
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Email Sent!</h3>
              <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                We've sent a password reset link to <strong>{email}</strong>.
                Check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="btn-submit" style={{ display: "inline-block", textDecoration: "none" }}>
                Back to Login
              </Link>
            </div>
          )}

          <p className="switch-page">
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
