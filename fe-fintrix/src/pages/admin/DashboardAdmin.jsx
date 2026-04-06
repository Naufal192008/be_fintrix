import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Spinner } from "react-bootstrap";
import { Users, ShieldCheck, UserX, TrendingUp } from "lucide-react";
import axios from "axios";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { useAuth } from "../../context/AuthContext";
import "../../styles/dashboard.css";
import "../../styles/animations.css";

function DashboardAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/users");
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const totalUsers    = users.length;
  const verifiedUsers = users.filter((u) => u.isVerified).length;
  const googleUsers   = users.filter((u) => u.provider === "google").length;
  const twoFaUsers    = users.filter((u) => u.twoFactorEnabled).length;

  const statCards = [
    { label: "Total Users",      value: totalUsers,    Icon: Users,       color: "#0ea5e9", bg: "#e0f2fe" },
    { label: "Verified Emails",  value: verifiedUsers, Icon: ShieldCheck,  color: "#22c55e", bg: "#dcfce7" },
    { label: "Google Sign-In",   value: googleUsers,   Icon: TrendingUp,   color: "#a855f7", bg: "#f3e8ff" },
    { label: "2FA Enabled",      value: twoFaUsers,    Icon: ShieldCheck,  color: "#f59e0b", bg: "#fef3c7" },
  ];

  return (
    <div className="d-flex">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen((p) => !p)} />
        <main className="dashboard-main p-4">
          <Container fluid>

            {/* Header */}
            <div className="mb-4 anim-fade-up anim-d0">
              <h2 className="fw-bold">Admin Dashboard</h2>
              <p className="text-muted mb-0">Manage and monitor all registered users</p>
            </div>

            {/* Stat Cards */}
            <Row className="g-3 mb-4">
              {statCards.map((card, i) => (
                <Col xs={6} md={3} key={i}>
                  <Card className={`shadow-sm border-0 card-hover anim-fade-up anim-d${i + 1}`}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="text-muted small">{card.label}</div>
                          <h3 className="fw-bold mb-0 mt-1">{loading ? "—" : card.value}</h3>
                        </div>
                        <div style={{ background: card.bg, borderRadius: 10, padding: "8px" }}>
                          <card.Icon size={20} color={card.color} />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Users Table */}
            <Card className="shadow-sm border-0 card-hover anim-fade-up anim-d5">
              <Card.Body className="p-0">
                <div className="p-4 border-bottom">
                  <h5 className="fw-bold mb-0">All Users</h5>
                </div>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center p-5">
                    <Spinner animation="border" variant="success" />
                  </div>
                ) : error ? (
                  <div className="p-4 text-danger">{error}</div>
                ) : (
                  <div className="p-3">
                    <Table hover responsive className="align-middle mb-0">
                      <thead>
                        <tr>
                          {["Name", "Email", "Provider", "Verified", "2FA", "Joined"].map((h) => (
                            <th key={h} className="text-muted text-uppercase small fw-semibold py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-4 text-muted">No users found</td></tr>
                        ) : users.map((u) => (
                          <tr key={u._id}>
                            <td className="py-3 fw-semibold">{u.name}</td>
                            <td className="py-3 text-muted">{u.email}</td>
                            <td className="py-3">
                              <Badge bg={u.provider === "google" ? "danger" : "primary"} style={{ fontSize: "0.72rem" }}>
                                {u.provider}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge bg={u.isVerified ? "success" : "warning"} style={{ fontSize: "0.72rem" }}>
                                {u.isVerified ? "Yes" : "No"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Badge bg={u.twoFactorEnabled ? "success" : "secondary"} style={{ fontSize: "0.72rem" }}>
                                {u.twoFactorEnabled ? "On" : "Off"}
                              </Badge>
                            </td>
                            <td className="py-3 text-muted small">
                              {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

          </Container>
        </main>
      </div>
    </div>
  );
}

export default DashboardAdmin;
