import { useNavigate, useLocation } from "react-router-dom";
import { Navbar, Container, Form, InputGroup, Nav, Dropdown } from "react-bootstrap";
import { Search, Bell, Settings, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/topnavbar.css";

function TopNavbarComponent({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Cek alamat yang sedang aktif
  const isNotifications = currentPath === "/notifications";
  const isSettings = currentPath === "/settings";

  // Ambil huruf pertama nama user buat avatar
  const initial = (user?.name || "G").charAt(0).toUpperCase();
  const photoUrl = user?.profilePicture || user?.avatar || user?.picture || user?.photo || user?.photoUrl || user?.image || user?.profileImageUrl;

  // Fungsi logout: hapus sesi lalu redirect ke halaman login
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Navbar className="top-navbar bg-white border-bottom py-3">
      <Container fluid className="px-4 pe-md-5 d-flex align-items-center">

        {/* Tombol hamburger untuk buka sidebar (hanya muncul di mobile) */}
        <button className="hamburger-btn d-lg-none" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>

        {/* Search bar - disembunyikan di mobile (d-none d-md-flex) */}
        <div className="search-wrapper d-none d-md-flex align-items-center flex-grow-1">
          <Form style={{ width: "350px" }}>
            <InputGroup className="search-group border-0 rounded-pill" style={{ backgroundColor: "#f1f5f9" }}>
              <InputGroup.Text className="bg-transparent border-0 pe-1">
                <Search size={18} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="transactions, accounts..."
                className="bg-transparent border-0 shadow-none ps-2"
              />
            </InputGroup>
          </Form>
        </div>

        {/* Bagian kanan: ikon notifikasi, pesan, dan profil dropdown */}
        <Nav className="ms-auto d-flex flex-row align-items-center flex-shrink-0">

          {/* Ikon search di mobile (hanya tampil di layar kecil) */}
          <div className="icon-wrapper icon-muted d-md-none" style={{ cursor: 'pointer' }}>
            <Search size={20} className="text-muted" />
          </div>

          {/* Ikon lonceng (notifikasi) + titik hijau */}
          <div 
            className={`icon-wrapper ${isNotifications ? 'icon-success' : 'icon-muted'} position-relative ms-2 ms-md-3`} 
            onClick={() => navigate("/notifications")}
            title="Notifications"
            style={{ cursor: 'pointer' }}
          >
            <Bell size={20} className={isNotifications ? "text-success" : "text-secondary"} />
            <span className="notification-dot" />
          </div>

          {/* Ikon settings */}
          <div 
            className={`icon-wrapper ${isSettings ? 'icon-success' : 'icon-muted'} mx-2`} 
            onClick={() => navigate("/settings")}
            title="Settings"
            style={{ cursor: 'pointer' }}
          >
            <Settings size={20} className={isSettings ? "text-success" : "text-secondary"} />
          </div>

          {/* Dropdown profil user */}
          <Dropdown align="end" className="profile-dropdown ms-2">
            <Dropdown.Toggle as="div" className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="avatar-small" style={{ borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="avatar-small">{initial}</div>
              )}
              <ChevronDown size={16} className="text-muted ms-2 d-none d-sm-block" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow border-0 mt-3">
              <Dropdown.Item onClick={() => navigate("/settings")}>My Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger" onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

        </Nav>
      </Container>
    </Navbar>
  );
}

export default TopNavbarComponent;