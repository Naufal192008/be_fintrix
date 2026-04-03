import React, { useState } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  BarChart, Bar,
  PieChart, Pie, Cell
} from "recharts";
import { ArrowUpRight, Utensils, Tv, Car } from "lucide-react";

import "../../styles/dashboard.css";
import "../../styles/analityc.css";

const trendData = [
  { name: "Jul", income: 8400, expense: 3200 },
  { name: "Aug", income: 8200, expense: 3800 },
  { name: "Sep", income: 8500, expense: 3600 },
  { name: "Oct", income: 8800, expense: 3900 },
  { name: "Nov", income: 8300, expense: 3600 },
  { name: "Dec", income: 8100, expense: 3700 },
  { name: "Jan", income: 8400, expense: 3100 },
  { name: "Feb", income: 8800, expense: 4000 },
  { name: "Mar", income: 9100, expense: 4200 },
];

const categoryData = [
  { name: "Food & Dining", value: 1200, color: "#22c55e", percent: "34%" },
  { name: "Transportation", value: 850, color: "#3b82f6", percent: "20%" },
  { name: "Bills & Utilities", value: 450, color: "#f59e0b", percent: "22%" },
  { name: "Shopping", value: 680, color: "#ef4444", percent: "8%" },
  { name: "Entertainment", value: 500, color: "#8b5cf6", percent: "16%" },
];

function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex bg-slate-50 min-vh-100">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="dashboard-main p-4 p-md-5">
          <Container fluid className="px-0">
            {/* Header Section */}
            <div className="mb-4">
              <h2 className="mb-1 fw-bold tp-title">Analytics</h2>
              <p className="text-muted mb-0 tp-subtitle">
                Analyze your financial habits and spending trends
              </p>
            </div>

            <Row className="g-4">
              {/* LEFT COLUMN */}
              <Col xl={8} lg={7} className="d-flex flex-column gap-4">
                {/* 1. Income vs Expense Trend (Area Chart) */}
                <Card className="border-0 shadow-sm rounded-4 an-card">
                  <Card.Body className="p-4 p-xl-4 pb-xl-3">
                    <h5 className="fw-bold an-card-title mb-1">Income vs Expense Trend</h5>
                    <p className="text-muted small mb-4">Last 6 months overview</p>

                    <div style={{ width: "100%", height: 260 }}>
                      <ResponsiveContainer>
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                          <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="d-flex justify-content-center gap-4 mt-2 text-muted small fw-medium">
                      <div className="d-flex align-items-center gap-2">
                        <span className="an-legend-dot bg-success"></span> Income
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="an-legend-dot bg-danger"></span> Expense
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* 2. Income vs Expense Trend (Bar Chart for Spending) */}
                <Card className="border-0 shadow-sm rounded-4 an-card">
                  <Card.Body className="p-4 p-xl-4 pb-xl-3">
                    <h5 className="fw-bold an-card-title mb-1">Income vs Expense Trend</h5>
                    <p className="text-muted small mb-4">Last 6 months overview</p>

                    <div style={{ width: "100%", height: 180 }}>
                      <ResponsiveContainer>
                        <BarChart data={trendData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                          <Bar dataKey="expense" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-3 d-flex justify-content-center">
                      <div className="an-trend-banner d-inline-flex align-items-center gap-2">
                        <ArrowUpRight size={16} className="text-success" />
                        <span className="text-success fw-bold small">Spending is trending upward</span>
                        <span className="text-muted small text-decoration-none">· Average increase of 4.2% per month</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* 3. Financial Insights */}
                <div className="mt-2">
                  <h5 className="fw-bold an-card-title mb-1">Financial Insights</h5>
                  <p className="text-muted small mb-3">Smart recommendation</p>
                  
                  <Row className="g-3">
                    <Col md={4}>
                      <div className="an-insight-box insight-warning d-flex align-items-start gap-3 h-100">
                        <div className="an-insight-icon text-warning">
                          <Utensils size={18} />
                        </div>
                        <p className="mb-0 small fw-medium text-dark">
                          Your food spending increased by 18% compared to last month
                        </p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="an-insight-box insight-good d-flex align-items-start gap-3 h-100">
                        <div className="an-insight-icon text-success">
                          <Tv size={18} />
                        </div>
                        <p className="mb-0 small fw-medium text-dark">
                          You spent less on entertainment this month. Great job!
                        </p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="an-insight-box insight-suggestion d-flex align-items-start gap-3 h-100">
                        <div className="an-insight-icon text-primary">
                          <Car size={18} />
                        </div>
                        <p className="mb-0 small fw-medium text-dark">
                          Transportation cost are steady. Consider carpooling to save more
                        </p>
                      </div>
                    </Col>
                  </Row>

                  <div className="d-flex align-items-center gap-5 mt-4 mb-2 ps-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="an-legend-dot bg-warning"></span> <span className="small fw-bold text-dark">Warning</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="an-legend-dot bg-success"></span> <span className="small fw-bold text-dark">Good</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="an-legend-dot bg-primary"></span> <span className="small fw-bold text-dark">Suggestion</span>
                    </div>
                  </div>
                </div>
              </Col>

              {/* RIGHT COLUMN */}
              <Col xl={4} lg={5} className="d-flex flex-column gap-4">
                
                {/* 4. Spending by Category (Pie Chart) */}
                <Card className="border-0 shadow-sm rounded-4 an-card">
                  <Card.Body className="p-4 p-xl-4 pb-4">
                    <h5 className="fw-bold an-card-title mb-1">Spending by Category</h5>
                    <p className="text-muted small mb-0">March 2026 breakdown</p>

                    <div className="d-flex justify-content-center align-items-center mt-3 mb-2" style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="px-2">
                      {categoryData.map((item, idx) => (
                        <div key={idx} className="d-flex align-items-center justify-content-between mb-2 pb-1 small">
                          <div className="d-flex align-items-center gap-2" style={{ flex: "1 1 auto", minWidth: 0 }}>
                            <span className="an-legend-dot flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                            <span className="text-muted fw-medium text-truncate">{item.name}</span>
                          </div>
                          <div className="fw-bold text-dark text-end ms-2" style={{ width: "60px" }}>
                            ${item.value}
                          </div>
                          <div className="text-muted text-end" style={{ width: "45px" }}>
                            {item.percent}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                {/* 5. Highest Spending Category */}
                <Card className="border-0 shadow-sm rounded-4 an-card">
                  <Card.Body className="p-4 p-xl-4">
                    <h5 className="fw-bold an-card-title mb-1">Highest Spending Category</h5>
                    <p className="text-muted small align-items-center mb-4">March 2026</p>

                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="an-icon-box bg-success bg-opacity-10 text-success">
                        <Utensils size={24} />
                      </div>
                      <div>
                        <p className="text-muted small mb-0">Category</p>
                        <h6 className="fw-bold mb-0">Food & Dining</h6>
                      </div>
                    </div>

                    <p className="text-muted small mb-1">Total Spent</p>
                    <h3 className="fw-bold text-danger mb-2">$1,420</h3>
                    
                    <div className="d-flex align-items-center gap-1 small mt-2">
                      <ArrowUpRight size={16} strokeWidth={3} className="text-danger" />
                      <span className="text-danger fw-bold">+8%</span>
                      <span className="text-muted ms-1">vs last month</span>
                    </div>
                  </Card.Body>
                </Card>

                {/* 6. Month Comparison */}
                <Card className="border-0 shadow-sm rounded-4 an-card">
                  <Card.Body className="p-4 p-xl-4">
                    <h5 className="fw-bold an-card-title mb-1">Month Comparison</h5>
                    <p className="text-muted small mb-4">Spending overview</p>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted small fw-medium">This Month</span>
                      <span className="fw-bold fs-5 text-dark">$4,200</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <span className="text-muted small fw-medium">Last Month</span>
                      <span className="fw-bold fs-5 text-muted">$3,950</span>
                    </div>

                    <hr className="text-muted opacity-25 my-4" />

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-dark small fw-bold">Change</span>
                      <div className="d-flex align-items-center gap-1">
                        <ArrowUpRight size={16} strokeWidth={3} className="text-danger" />
                        <span className="text-danger fw-bold fs-5">+6.3%</span>
                      </div>
                    </div>
                    <p className="text-muted small mb-0">
                      You spent $250 more this month
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

export default AnalyticsPage;
