import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Route yang hanya bisa diakses oleh admin
// Untuk sementara cek berdasarkan role field; jika belum ada, gunakan email whitelist
const ADMIN_EMAILS = ["admin@fintrix.com"]; // tambahkan email admin di sini

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isAdmin = user?.role === "admin" || ADMIN_EMAILS.includes(user?.email);
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminRoute;
