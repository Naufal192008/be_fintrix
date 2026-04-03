import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BarChart2, Sparkles, ShieldCheck } from 'lucide-react';
import '../styles/auth.css';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwVisible, setPwVisible] = useState(false);
  const [confirmPwVisible, setConfirmPwVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Memanggil route backend yang sudah kita set prompt: "select_account"
    window.location.href = 'http://localhost:5050/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // ... logika register manual kamu ...
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-sidebar">
        <h1>Start Your Financial Journey</h1>
        <p className="sidebar-desc">Join thousands of users building smarter financial habits.</p>
        <ul className="feature-list">
          <li><div className="feature-icon"><BarChart2 size={20} /></div><span>Real-time tracking</span></li>
          <li><div className="feature-icon"><Sparkles size={20} /></div><span>AI-powered insights</span></li>
          <li><div className="feature-icon"><ShieldCheck size={20} /></div><span>Bank-level security</span></li>
        </ul>
      </div>

      <div className="auth-main">
        <div className="form-box">
          <div className="brand"><h2>FINTRIX</h2><div className="brand-line" /></div>
          <div className="form-header">
            <h3>Create Your Account</h3>
            <p>Start your smarter financial journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full Name</label>
              <input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Password</label>
              <div className="input-box">
                <input type={pwVisible ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setPwVisible(!pwVisible)}>{pwVisible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>Create Account</button>
          </form>

          <div className="separator"><span>Or continue with</span></div>

          <button type="button" className="btn-google" onClick={handleGoogleLogin}>
            <img src="/images/google logo.png" alt="Google" width={18} height={18} />
            Continue with Google
          </button>

          <p className="switch-page">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;