import { useState } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Form, Button, ProgressBar } from "react-bootstrap";
import "../../styles/dashboard.css";

const sampleBudgets = [
  { id: 1, category: "Makan", target: 300, used: 180 },
  { id: 2, category: "Transport", target: 150, used: 90 },
  { id: 3, category: "Tagihan", target: 400, used: 260 },
  { id: 4, category: "Hiburan", target: 200, used: 120 },
  { id: 5, category: "Tabungan", target: 500, used: 340 },
];

function BudgetPage() {
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
                    <h5 className="mb-3">Create budget</h5>
                    <Form>
                      <Form.Group className="mb-2">
                        <Form.Label>Template</Form.Label>
                        <Form.Select>
                          <option>Custom</option>
                          <option>50/30/20 Rule</option>
                          <option>Basic Monthly</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Category</Form.Label>
                        <Form.Control placeholder="e.g. Makan" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Target amount</Form.Label>
                        <Form.Control type="number" placeholder="0" />
                      </Form.Group>
                      <Button variant="success" className="w-100">
                        Save budget
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={8}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h5 className="mb-3">Budget overview</h5>
                    {sampleBudgets.map((b) => {
                      const percent = Math.round((b.used / b.target) * 100);
                      const variant =
                        percent >= 90 ? "danger" : percent >= 70 ? "warning" : "success";
                      return (
                        <div key={b.id} className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>{b.category}</span>
                            <span className="small text-muted">
                              Rp{b.used.toLocaleString()} / Rp{b.target.toLocaleString()}
                            </span>
                          </div>
                          <ProgressBar
                            now={percent}
                            variant={variant}
                            label={`${percent}%`}
                            className="small"
                          />
                        </div>
                      );
                    })}
                    <p className="mt-3 small text-muted mb-0">
                      Fintrix akan memberi notifikasi otomatis ketika budget hampir habis.
                    </p>
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

export default BudgetPage;

