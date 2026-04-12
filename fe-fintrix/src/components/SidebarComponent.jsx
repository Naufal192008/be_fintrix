import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Wallet,
  TrendingUp,
  FileText,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import logoIcon from "../assets/Logo.png";
import "../styles/sidebar.css";

function SidebarComponent({ isOpen, onClose }) {
  const { user, t } = useAuth();
  const displayName = user?.name || "Guest";
  const displayEmail = user?.email || "guest@example.com";
  const initial = (displayName || "G").charAt(0).toUpperCase();
  const photoUrl = user?.profilePicture || user?.avatar || user?.picture || user?.photo || user?.photoUrl || user?.image || user?.profileImageUrl;

  const menuItems = [
    { path: "/dashboard", label: t("Dashboard", "Dasbor"), icon: LayoutDashboard },
    { path: "/transactions", label: t("Transaction", "Transaksi"), icon: Receipt },
    { path: "/analytics", label: t("Analytics", "Analitik"), icon: BarChart3 },
    { path: "/budget", label: t("Budget", "Anggaran"), icon: Wallet },
    { path: "/investment", label: t("Investment", "Investasi"), icon: TrendingUp },
    { path: "/reports", label: t("Reports", "Laporan"), icon: FileText },
  ];

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Main Sidebar */}
      <div className={`sidebar-wrapper ${isOpen ? "open" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-brand">
          <div className="brand-header py-4 d-flex justify-content-center">
            <img 
              src={logoIcon} 
              alt="Logo" 
              style={{ width: '140px', height: 'auto', objectFit: 'contain' }} 
            />
            {/* Close button for mobile views */}
            <button className="sidebar-close-btn" onClick={onClose}>
              <X size={22} />
            </button>
          </div>
          <hr />
        </div>

        {/* Navigation Items */}
        <div className="sidebar-nav">
          <Nav className="flex-column">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={onClose}
                >
                  <IconComponent size={18} className="me-3" />
                  {item.label}
                </NavLink>
              );
            })}
          </Nav>
        </div>

        {/* User Profile Footer */}
        <div className="sidebar-profile">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="profile-avatar" style={{ borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="profile-avatar">{initial}</div>
          )}
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
