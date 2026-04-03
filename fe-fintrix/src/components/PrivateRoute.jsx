import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // INI BAGIAN PALING PENTING: Tunggu sampai pengecekan auth Google selesai
  if (loading) {
    // Kamu bisa ganti ini dengan spinner atau tampilan kosong sementara
    return <div className="text-center mt-5">Memeriksa Akses...</div>;
  }

  // Kalau sudah loading dan user ada, tampilkan halaman. Kalau tidak ada, tendang ke login.
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;