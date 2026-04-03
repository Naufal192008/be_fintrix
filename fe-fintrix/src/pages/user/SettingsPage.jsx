import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/dashboard.css";

function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="d-flex">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

        <main className="dashboard-main p-4">
          <Container fluid>
            <Row className="g-4">
              <Col lg={6}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h5 className="mb-3">Profile</h5>
                    <Form>
                      <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control defaultValue={user?.name} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control defaultValue={user?.email} />
                      </Form.Group>
                      <Button variant="success" className="mt-2">
                        Save changes
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6}>
                <Card className="shadow-sm border-0 mb-3">
                  <Card.Body>
                    <h5 className="mb-3">App preferences</h5>
                    <Form>
                      <Form.Group className="mb-2">
                        <Form.Label>Currency</Form.Label>
                        <Form.Select defaultValue="IDR">
                          <option value="IDR">IDR - Rupiah</option>
                          <option value="USD">USD - Dollar</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Language</Form.Label>
                        <Form.Select defaultValue="id">
                          <option value="id">Bahasa Indonesia</option>
                          <option value="en">English</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Check
                        type="switch"
                        id="dark-mode"
                        label="Dark mode"
                        className="mt-2"
                      />
                    </Form>
                  </Card.Body>
                </Card>

                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h5 className="mb-3">Security</h5>
                    <Button
                      variant="outline-danger"
                      className="me-2"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                    <Button variant="outline-secondary">Delete account</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </main>
      </div>
    </div>
  );
}

export default SettingsPage;

