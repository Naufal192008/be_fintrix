import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import "../styles/auth.css";
import { useAuth } from "../context/AuthContext.jsx";

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [confirmPwVisible, setConfirmPwVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError("Password must contain at least one letter and one number.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Failed to reset password. The link may have expired.");
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate("/login"), 3000);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-sidebar">
        <h1>Create New Password</h1>
        <p className="sidebar-desc">
          Choose a strong password to keep your account secure.
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

          {!success ? (
            <>
              <div className="form-header">
                <h3>Reset Password</h3>
                <p>Enter your new password below</p>
              </div>

              {error && <p className="form-error">{error}</p>}

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>New Password</label>
                  <div className="input-box">
                    <input
                      type={pwVisible ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setPwVisible(!pwVisible)}
                      aria-label={pwVisible ? "Hide password" : "Show password"}
                    >
                      {pwVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label>Confirm Password</label>
                  <div className="input-box">
                    <input
                      type={confirmPwVisible ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setConfirmPwVisible(!confirmPwVisible)}
                      aria-label={confirmPwVisible ? "Hide password" : "Show password"}
                    >
                      {confirmPwVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <CheckCircle size={56} color="#22c55e" style={{ marginBottom: "1rem" }} />
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Password Reset!</h3>
              <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                Your password has been reset successfully.
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                Redirecting to login in 3 seconds...
              </p>
            </div>
          )}

          <p className="switch-page">
            Remembered your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
