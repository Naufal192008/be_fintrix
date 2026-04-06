import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Form, Button, Modal, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  User, Mail, Lock, Eye, EyeOff, LogOut, Trash2, Shield,
  DollarSign, Globe, Sun, Moon, Monitor, Camera, CheckCircle, AlertCircle
} from "lucide-react";
import "../../styles/SettingsPage.css";
import "../../styles/animations.css";

// Toast notifikasi kecil
function Toast({ message, type, onClose }) {
  return (
    <div
      style={{
        position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
        background: type === "success" ? "#22c55e" : "#f43f5e",
        color: "#fff", borderRadius: "12px", padding: "0.8rem 1.4rem",
        display: "flex", alignItems: "center", gap: "0.6rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)", fontSize: "0.9rem", fontWeight: 600,
        animation: "fadeInUp 0.3s ease"
      }}
    >
      {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {message}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", marginLeft: "0.5rem", cursor: "pointer", fontSize: "1rem" }}>×</button>
    </div>
  );
}

function SettingsPage() {
  const { user, logout, updateProfile, deleteAccount, enableTwoFactor, disableTwoFactor } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [theme, setTheme]                 = useState("light");

  // Form state
  const [name, setName]         = useState(user?.name || "");
  const [email, setEmail]       = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");

  // Loading state per aksi
  const [savingProfile, setSavingProfile]   = useState(false);
  const [togglingTwoFa, setTogglingTwoFa]   = useState(false);
  const [deletingAcc, setDeletingAcc]       = useState(false);

  // Toast
  const [toast, setToast] = useState(null); // { message, type }
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Delete confirm modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const initial  = (user?.name || "A").charAt(0).toUpperCase();
  const photoUrl = user?.profilePicture || user?.avatar || user?.picture || user?.photo || user?.photoUrl || user?.image || user?.profileImageUrl;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const payload = { name };
    if (email && email !== user?.email) payload.email = email;
    if (password) payload.password = password;

    const result = await updateProfile(payload);
    setSavingProfile(false);

    if (result.success) {
      setPassword("");
      showToast("Profile updated successfully!");
    } else {
      showToast(result.error || "Failed to update profile", "error");
    }
  };

  const handleToggle2FA = async () => {
    setTogglingTwoFa(true);
    const result = user?.twoFactorEnabled
      ? await disableTwoFactor()
      : await enableTwoFactor();
    setTogglingTwoFa(false);

    if (result.success) {
      showToast(`2FA ${user?.twoFactorEnabled ? "disabled" : "enabled"} successfully!`);
    } else {
      showToast(result.error || "Failed to toggle 2FA", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeletingAcc(true);
    const result = await deleteAccount();
    setDeletingAcc(false);
    if (result.success) {
      navigate("/login");
    } else {
      showToast(result.error || "Failed to delete account", "error");
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="d-flex settings-page">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout settings-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

        <main className="dashboard-main p-4 p-md-5">
          <Container fluid className="px-0 px-md-3">

            {/* Header */}
            <div className="settings-header mb-4 anim-fade-up anim-d0">
              <h2 className="fw-bold m-0">Settings</h2>
              <p className="text-muted">Manage your account and application preferences</p>
            </div>

            <Row className="g-4">
              {/* LEFT COLUMN */}
              <Col xs={12} lg={5} xl={4}>

                {/* Profile Card */}
                <Card className="shadow-sm settings-card mb-4 card-hover anim-fade-left anim-d1">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold text-dark mb-1">Profile Settings</h5>
                    <p className="text-muted small mb-4">Update your profile information</p>
                    <div className="d-flex align-items-center gap-3">
                      <div className="position-relative flex-shrink-0">
                        {photoUrl ? (
                          <img src={photoUrl} alt="Profile" className="settings-avatar" />
                        ) : (
                          <div className="settings-avatar-placeholder">{initial}</div>
                        )}
                        <div className="position-absolute settings-avatar-edit-btn">
                          <Camera size={14} />
                        </div>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">{user?.name || "User"}</h5>
                        <p className="text-muted small mb-2">{user?.email || ""}</p>
                        {user?.isVerified ? (
                          <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>
                            <CheckCircle size={13} className="me-1" />Email Verified
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 600 }}>
                            <AlertCircle size={13} className="me-1" />Email Not Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Security Card: 2FA */}
                <Card className="shadow-sm settings-card mb-4 card-hover anim-fade-left anim-d2">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold text-dark mb-1">Security</h5>
                    <p className="text-muted small mb-4">Two-factor authentication</p>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <p className="fw-semibold mb-0 small">Two-Factor Auth (2FA)</p>
                        <p className="text-muted" style={{ fontSize: "0.78rem" }}>
                          {user?.twoFactorEnabled ? "Currently enabled" : "Currently disabled"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleToggle2FA}
                        disabled={togglingTwoFa}
                        style={{
                          background: user?.twoFactorEnabled ? "#f43f5e" : "#22c55e",
                          border: "none", borderRadius: "8px", fontWeight: 600, minWidth: 90
                        }}
                      >
                        {togglingTwoFa
                          ? <Spinner size="sm" />
                          : user?.twoFactorEnabled ? "Disable" : "Enable"
                        }
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-sm settings-card mb-4 card-hover anim-fade-left anim-d3">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold text-dark mb-1">Quick Actions</h5>
                    <p className="text-muted small mb-4">Account management</p>
                    <Button
                      className="settings-btn-logout w-100 d-flex justify-content-center align-items-center fw-bold py-2 mb-3"
                      onClick={handleLogout}
                    >
                      <LogOut className="me-2" size={18} /> Logout
                    </Button>
                    <Button
                      className="settings-btn-delete w-100 d-flex justify-content-center align-items-center fw-bold py-2"
                      onClick={() => { setDeleteConfirmText(""); setShowDeleteModal(true); }}
                    >
                      <Trash2 className="me-2" size={18} /> Delete Account
                    </Button>
                  </Card.Body>
                </Card>

                {/* Data Secure Banner */}
                <Card className="shadow-sm settings-secure-banner card-hover-subtle anim-fade-left anim-d4">
                  <Card.Body className="p-4 d-flex align-items-start">
                    <Shield className="settings-secure-icon me-3 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h6 className="fw-bold mb-2 text-dark">Your data is secure</h6>
                      <p className="small mb-0 text-secondary" style={{ lineHeight: 1.5 }}>
                        All your financial data is encrypted and stored securely. We never share your information with third parties.
                      </p>
                    </div>
                  </Card.Body>
                </Card>

              </Col>

              {/* RIGHT COLUMN */}
              <Col xs={12} lg={7} xl={8}>

                {/* Account Settings Card */}
                <Card className="shadow-sm settings-card mb-4 card-hover anim-fade-right anim-d1">
                  <Card.Body className="p-4 p-md-5">
                    <h5 className="fw-bold text-dark mb-1">Account Settings</h5>
                    <p className="text-muted small mb-4">Manage your account credentials</p>
                    <Form onSubmit={handleSaveProfile}>
                      {/* Full Name */}
                      <Form.Group className="mb-3">
                        <Form.Label className="small text-muted fw-medium mb-1">Full Name</Form.Label>
                        <div className="input-group settings-input-group">
                          <span className="input-group-text pe-1 ps-3"><User size={18} /></span>
                          <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="settings-form-control ps-2 py-2"
                            placeholder="Your full name"
                          />
                        </div>
                      </Form.Group>

                      {/* Email */}
                      <Form.Group className="mb-3">
                        <Form.Label className="small text-muted fw-medium mb-1">Email Address</Form.Label>
                        <div className="input-group settings-input-group">
                          <span className="input-group-text pe-1 ps-3"><Mail size={18} /></span>
                          <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="settings-form-control ps-2 py-2"
                            placeholder="Your email address"
                          />
                        </div>
                        {user?.provider === "google" && (
                          <Form.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                            Connected via Google — email changes require re-verification.
                          </Form.Text>
                        )}
                      </Form.Group>

                      {/* New Password */}
                      <Form.Group className="mb-4">
                        <Form.Label className="small text-muted fw-medium mb-1">
                          New Password <span className="text-muted">(leave blank to keep current)</span>
                        </Form.Label>
                        <div className="d-flex flex-column flex-sm-row gap-2 settings-pw-row">
                          <div className="input-group settings-input-group flex-grow-1">
                            <span className="input-group-text pe-1 ps-3"><Lock size={18} /></span>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="settings-form-control ps-2 py-2"
                              placeholder="New password (min. 8 chars)"
                            />
                            <span
                              className="input-group-text settings-pw-toggle ps-1 pe-3"
                              onClick={() => setShowPassword(!showPassword)}
                              style={{ cursor: "pointer" }}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                          </div>
                        </div>
                      </Form.Group>

                      <Button
                        type="submit"
                        disabled={savingProfile}
                        className="settings-btn-save w-100 fw-bold py-2 rounded-3"
                      >
                        {savingProfile
                          ? <><Spinner size="sm" className="me-2" />Saving...</>
                          : "Save Changes"
                        }
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>

                {/* Preferences Card */}
                <Card className="shadow-sm settings-card card-hover anim-fade-right anim-d2">
                  <Card.Body className="p-4 p-md-5">
                    <h5 className="fw-bold text-dark mb-1">Preferences</h5>
                    <p className="text-muted small mb-4">Manage currency, language and theme</p>

                    {/* Currency */}
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold mb-1 text-dark">Currency</Form.Label>
                      <div className="position-relative">
                        <span className="settings-select-icon"><DollarSign size={16} /></span>
                        <Form.Select
                          className="settings-select ps-5 py-2"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                        >
                          <option value="USD">USD — US Dollar</option>
                          <option value="IDR">IDR — Rupiah</option>
                          <option value="EUR">EUR — Euro</option>
                          <option value="SGD">SGD — Singapore Dollar</option>
                        </Form.Select>
                      </div>
                    </Form.Group>

                    {/* Language */}
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold mb-1 text-dark">Language</Form.Label>
                      <div className="position-relative">
                        <span className="settings-select-icon"><Globe size={16} /></span>
                        <Form.Select
                          className="settings-select ps-5 py-2"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="id">Bahasa Indonesia</option>
                        </Form.Select>
                      </div>
                    </Form.Group>

                    {/* Theme */}
                    <Form.Group>
                      <Form.Label className="small fw-bold mb-2 text-dark">Theme</Form.Label>
                      <div className="settings-theme-switcher">
                        {[
                          { key: "light",  label: "Light",  Icon: Sun },
                          { key: "dark",   label: "Dark",   Icon: Moon },
                          { key: "system", label: "System", Icon: Monitor },
                        ].map(({ key, label, Icon }) => (
                          <button
                            key={key}
                            type="button"
                            className={`settings-theme-btn ${theme === key ? "settings-theme-btn--active" : "settings-theme-btn--inactive"}`}
                            onClick={() => setTheme(key)}
                          >
                            <Icon size={15} className="me-2 mb-1" /> {label}
                          </button>
                        ))}
                      </div>
                    </Form.Group>
                  </Card.Body>
                </Card>

              </Col>
            </Row>
          </Container>
        </main>
      </div>

      {/* ── Delete Account Modal ─────────────────────────────────────────── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger">Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            This action is <strong>irreversible</strong>. All your data will be permanently deleted.
            Type <strong>DELETE</strong> to confirm.
          </p>
          <Form.Control
            type="text"
            placeholder='Type "DELETE" to confirm'
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="mb-3"
          />
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={deleteConfirmText !== "DELETE" || deletingAcc}
          >
            {deletingAcc ? <><Spinner size="sm" className="me-2" />Deleting...</> : "Delete Permanently"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default SettingsPage;
