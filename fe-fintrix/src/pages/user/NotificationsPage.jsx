import { useState } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Form, ListGroup, Badge } from "react-bootstrap";
import "../../styles/dashboard.css";

const mockNotifications = [
  { id: 1, title: "Budget makan hampir habis", type: "warning", time: "2h ago" },
  { id: 2, title: "Transaksi besar terdeteksi: $1,200", type: "alert", time: "1d ago" },
  { id: 3, title: "Reminder: catat pengeluaran harian", type: "reminder", time: "3d ago" },
];

function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="d-flex">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

        <main className="dashboard-main p-4">
          <Container fluid>
            <Row className="g-4">
              <Col lg={4}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h5 className="mb-3">Notification settings</h5>
                    <Form>
                      <Form.Check
                        type="switch"
                        id="budget-alert"
                        label="Budget almost reached"
                        className="mb-2"
                        defaultChecked
                      />
                      <Form.Check
                        type="switch"
                        id="big-tx-alert"
                        label="Large transactions"
                        className="mb-2"
                        defaultChecked
                      />
                      <Form.Check
                        type="switch"
                        id="bill-reminder"
                        label="Bill reminders"
                        className="mb-2"
                        defaultChecked
                      />
                      <Form.Check
                        type="switch"
                        id="investment-reminder"
                        label="Investment reminders"
                        className="mb-2"
                      />
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={8}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h5 className="mb-3">Notification history</h5>
                    <ListGroup variant="flush">
                      {mockNotifications.map((n) => (
                        <ListGroup.Item key={n.id} className="d-flex justify-content-between">
                          <div>
                            <div>{n.title}</div>
                            <small className="text-muted">{n.time}</small>
                          </div>
                          <Badge bg="success-subtle" text="dark">
                            {n.type}
                          </Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
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

export default NotificationsPage;

