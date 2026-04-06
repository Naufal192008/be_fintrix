import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BarChart2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwVisible, setPwVisible] = useState(false);
  const [confirmPwVisible, setConfirmPwVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const result = await register({ name, email, password });

    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Registration failed. Please try again.');
      return;
    }

    // Redirect ke halaman login setelah register berhasil sesuai alur
    navigate('/login');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-sidebar">
        <div className="dot green dot-1" />
        <div className="dot green dot-2" />
        <div className="dot blue dot-3" />
        <div className="dot blue dot-4" />
3
        <h1>Start Your Financial Journey</h1>
        <p className="sidebar-desc">
          Join thousands of users building smarter financial habits.
        </p>

        <ul className="feature-list">
          <li>
            <div className="feature-icon">
              <BarChart2 size={20} />
            </div>
            <span>Real-time expense tracking</span>
          </li>
          <li>
            <div className="feature-icon">
              <Sparkles size={20} />
            </div>
            <span>AI-powered financial insights</span>
          </li>
          <li>
            <div className="feature-icon">
              <ShieldCheck size={20} />
            </div>
            <span>Bank-level security</span>
          </li>
        </ul>
      </div>

      <div className="auth-main">
        <div className="form-box">
          <div className="brand">
            <h2>FINTRIX</h2>
            <div className="brand-line" />
          </div>

          <div className="form-header">
            <h3>Create Your Account</h3>
            <p>Start your smarter financial journey</p>
          </div>

          {error && <p className="form-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full Name</label>
              <div className="input-box">
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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

            <div className="field">
              <label>Confirm Password</label>
              <div className="input-box">
                <input
                  type={confirmPwVisible ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setConfirmPwVisible(!confirmPwVisible)}
                  aria-label={confirmPwVisible ? 'Hide password' : 'Show password'}
                >
                  {confirmPwVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="agree-terms">
              <input type="checkbox" required />
              <span>
                I agree to the{' '}
                <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </span>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
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
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;