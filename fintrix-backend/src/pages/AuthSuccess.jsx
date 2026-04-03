import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const refreshTokenParam = params.get('refreshToken');

    if (token && refreshTokenParam) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshTokenParam);
      refreshToken(); // This will update the auth state
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [location, navigate, refreshToken]);

  return (
    <div className="auth-success">
      <div className="spinner"></div>
      <p>Completing authentication...</p>
    </div>
  );
}

export default AuthSuccess;