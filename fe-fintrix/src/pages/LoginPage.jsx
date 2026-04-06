import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "../styles/auth.css";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error || "Login failed. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-sidebar">
        <h1>Manage Your Money With Confidence</h1>
        <p className="sidebar-desc">
          Secure, intelligent financial management for modern users.
        </p>
      </div>

      <div className="auth-main">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Back to Home
        </button>

        <div className="form-box">
          <div className="brand">
            <h2>FINTRIX</h2>
            <div className="brand-line" />
          </div>

          <div className="form-header">
            <h3>Welcome Back 👋</h3>
            <p>Sign in to continue managing your finances</p>
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

            <div className="field">
              <label>Password</label>
              <div className="input-box">
                <input
                  type={pwVisible ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setPwVisible(!pwVisible)}
                  aria-label={pwVisible ? 'Hide password' : 'Show password'}
                >
                  {pwVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="separator">
            <span>Or continue with</span>
          </div>

          <button type="button" className="btn-google" onClick={googleLogin}>
            <img src="/images/google logo.png" alt="Google" width={18} height={18} />
            Continue with Google
          </button>

          <p className="switch-page">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;