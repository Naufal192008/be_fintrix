import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Wallet,
  TrendingUp,
  FileText,
  Bell,
  Settings,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/sidebar.css";

// Daftar menu navigasi sidebar
// Tiap item punya: path (url tujuan), label (nama menu), icon (komponen lucide)
const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/transactions", label: "Transaction", icon: Receipt },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/budget", label: "Budget", icon: Wallet },
  { path: "/investment", label: "Investment", icon: TrendingUp },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/settings", label: "Settings", icon: Settings },
];

function SidebarComponent({ isOpen, onClose }) {
  // Ambil data user dari context (nama, email, inisial)
  const { user } = useAuth();
  const displayName = user?.name || "Guest";
  const displayEmail = user?.email || "guest@example.com";
  const initial = (displayName || "G").charAt(0).toUpperCase();

  return (
    <>
      {/* Overlay gelap di belakang sidebar (hanya muncul di mobile) */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Sidebar utama */}
      <div className={`sidebar-wrapper ${isOpen ? "open" : ""}`}>
        {/* Header sidebar: logo + tombol close (mobile only) */}
        <div className="sidebar-brand">
          <div className="brand-header">
            <h2 className="brand-text">FINTRIX</h2>
            {/* Tombol X untuk tutup sidebar di mobile */}
            <button className="sidebar-close-btn" onClick={onClose}>
              <X size={22} />
            </button>
          </div>
          <hr />
        </div>

        {/* Daftar menu navigasi */}
        <div className="sidebar-nav">
          <Nav className="flex-column">
            {menuItems.map((item) => {
              // Ambil komponen icon dari item
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={onClose} // Tutup sidebar setelah klik menu (mobile)
                >
                  <IconComponent size={18} className="me-3" />
                  {item.label}
                </NavLink>
              );
            })}
          </Nav>
        </div>

        {/* Profil user di bagian bawah sidebar */}
        <div className="sidebar-profile">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-info">
            <p className="profile-name">{displayName}</p>
            <p className="profile-email">{displayEmail}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SidebarComponent;
