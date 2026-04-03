import { useState } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Form, Button, Table, Badge } from "react-bootstrap";
import "../../styles/dashboard.css";

const mockInvestments = [
  { id: 1, type: "Saham", name: "IDX Bluechip", value: 7500, pnl: 520, allocation: 45 },
  { id: 2, type: "Reksa dana", name: "Balanced Fund", value: 3200, pnl: 180, allocation: 25 },
  { id: 3, type: "Emas", name: "Gold Savings", value: 2600, pnl: -40, allocation: 18 },
  { id: 4, type: "Crypto", name: "BTC Spot", value: 1300, pnl: 210, allocation: 12 },
];

function InvestmentPage() {
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
                    <h5 className="mb-3">Add investment</h5>
                    <Form>
                      <Form.Group className="mb-2">
                        <Form.Label>Type</Form.Label>
                        <Form.Select>
                          <option>Saham</option>
                          <option>Crypto</option>
                          <option>Reksa dana</option>
                          <option>Emas</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control placeholder="e.g. S&P 500 ETF" />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Value</Form.Label>
                        <Form.Control type="number" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control as="textarea" rows={2} />
                      </Form.Group>
                      <Button variant="success" className="w-100">
                        Save
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={8}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <h5 className="mb-3">Portfolio summary</h5>
                    <Table hover responsive className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Name</th>
                          <th className="text-end">Value</th>
                          <th className="text-end">P/L</th>
                          <th className="text-end">% Allocation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockInvestments.map((inv) => (
                          <tr key={inv.id}>
                            <td>{inv.type}</td>
                            <td>{inv.name}</td>
                            <td className="text-end">
                              ${inv.value.toLocaleString()}
                            </td>
                            <td
                              className={`text-end ${inv.pnl >= 0 ? "text-success" : "text-danger"
                                }`}
                            >
                              {inv.pnl >= 0 ? "+" : "-"}$
                              {Math.abs(inv.pnl).toLocaleString()}
                            </td>
                            <td className="text-end">
                              <Badge bg="success-subtle" text="dark">
                                {inv.allocation}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
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

export default InvestmentPage;

