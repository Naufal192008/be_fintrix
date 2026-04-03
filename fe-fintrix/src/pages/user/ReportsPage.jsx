import { useState } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Form, Button, Table } from "react-bootstrap";
import "../../styles/dashboard.css";

function ReportsPage() {
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
                    <h5 className="mb-3">Generate report</h5>
                    <Form>
                      <Form.Group className="mb-2">
                        <Form.Label>Type</Form.Label>
                        <Form.Select>
                          <option>Monthly</option>
                          <option>Yearly</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Period</Form.Label>
                        <Form.Control type="month" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Format</Form.Label>
                        <Form.Select>
                          <option>PDF</option>
                          <option>Excel</option>
                        </Form.Select>
                      </Form.Group>
                      <Button variant="success" className="w-100">
                        Export
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={8}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h5 className="mb-3">Summary</h5>
                    <Table borderless size="sm" className="mb-0">
                      <tbody>
                        <tr>
                          <td>Total income</td>
                          <td className="text-end fw-semibold text-success">
                            $8,240
                          </td>
                        </tr>
                        <tr>
                          <td>Total expenses</td>
                          <td className="text-end fw-semibold text-danger">
                            $3,680
                          </td>
                        </tr>
                        <tr>
                          <td>Savings</td>
                          <td className="text-end fw-semibold">$4,560</td>
                        </tr>
                      </tbody>
                    </Table>
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

export default ReportsPage;

