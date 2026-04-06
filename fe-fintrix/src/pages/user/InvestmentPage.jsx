import React, { useState, useEffect, useMemo } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Button, Table, Modal, Form, Spinner, Alert } from "react-bootstrap";
import { TrendingUp, TrendingDown, DollarSign, LayoutGrid, BarChart2, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { investmentAPI } from "../../services/api.js";
import "../../styles/InvestmentPage.css";
import "../../styles/animations.css";

// Warna per tipe aset
const TYPE_COLORS = {
  "Crypto":      { color: "#339af0", bg: "#e7f5ff" },
  "Stock":       { color: "#20c997", bg: "#e6fcf5" },
  "Gold":        { color: "#ff6b6b", bg: "#ffe8e6" },
  "Mutual Fund": { color: "#f5a623", bg: "#fff4e5" },
};
const CHART_COLORS = ["#20c997","#339af0","#f5a623","#ff6b6b","#845ef7","#06b6d4"];

/* Custom tooltip untuk growth chart */
const GrowthTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", padding: "10px 18px" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 15, color: "#20c997", fontWeight: 700 }}>${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function InvestmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [portfolio, setPortfolio]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [expanded, setExpanded]       = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [form, setForm]               = useState({ name: "", type: "Crypto", invested: "", current: "" });

  // ── Fetch dari API ──────────────────────────────────────────────────────────
  const fetchInvestments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await investmentAPI.getAll();
      setPortfolio(res.data?.data || []);
    } catch (err) {
      setError("Gagal memuat data investasi. Pastikan kamu sudah login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvestments(); }, []);

  // ── Summary metrics dari data portfolio ─────────────────────────────────────
  const { totalInvested, totalCurrent, totalProfit } = useMemo(() => {
    let invested = 0, current = 0;
    portfolio.forEach((inv) => {
      invested += inv.initialAmount;
      current  += inv.currentAmount;
    });
    return { totalInvested: invested, totalCurrent: current, totalProfit: current - invested };
  }, [portfolio]);

  const profitPct = totalInvested > 0
    ? ((totalProfit / totalInvested) * 100).toFixed(2)
    : "0.00";

  // ── Best & Worst performer ──────────────────────────────────────────────────
  const best  = portfolio.length > 0 ? [...portfolio].sort((a, b) => b.returnRate - a.returnRate)[0] : null;
  const worst = portfolio.length > 0 ? [...portfolio].sort((a, b) => a.returnRate - b.returnRate)[0] : null;

  // ── Allocation pie chart data ── (grouping by assetType) ───────────────────
  const allocationData = useMemo(() => {
    const byType = {};
    portfolio.forEach((inv) => {
      byType[inv.assetType] = (byType[inv.assetType] || 0) + inv.currentAmount;
    });
    return Object.entries(byType).map(([label, value], i) => ({
      label,
      value,
      percent: totalCurrent > 0 ? ((value / totalCurrent) * 100).toFixed(1) : "0",
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [portfolio, totalCurrent]);

  const pieData = allocationData.map((d) => ({ name: d.label, value: Number(d.percent), color: d.color }));

  // ── Growth stub chart (pakai data portfolio sebagai checkpoint) ─────────────
  const growthData = useMemo(() => {
    if (portfolio.length === 0) return [];
    const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
    const base = totalInvested;
    const final = totalCurrent;
    return months.map((month, i) => ({
      month,
      val: Math.round(base + ((final - base) * (i / (months.length - 1)))),
    }));
  }, [totalInvested, totalCurrent]);

  // ── Summary metric cards ────────────────────────────────────────────────────
  const metrics = [
    { label: "Total Investment Value", value: `$${totalCurrent.toLocaleString()}`,  change: `+${profitPct}%`, up: true,  icon: DollarSign, cls: "investment-metric-icon--green"  },
    { label: "Total Profit / Loss",   value: `$${Math.abs(totalProfit).toLocaleString()}`, change: `${totalProfit >= 0 ? "+" : "-"}${Math.abs(parseFloat(profitPct))}%`, up: totalProfit >= 0, icon: TrendingUp,  cls: "investment-metric-icon--green", valCls: totalProfit >= 0 ? "investment-metric-value--profit" : "investment-metric-value--loss" },
    { label: "Return Rate",            value: `${totalProfit >= 0 ? "+" : ""}${profitPct}%`, change: null, icon: BarChart2,  cls: "investment-metric-icon--purple" },
    { label: "Number of Assets",       value: String(portfolio.length), change: null, icon: LayoutGrid, cls: "investment-metric-icon--violet" },
  ];

  // ── Add investment ──────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!form.name || !form.invested || !form.current) return;
    setSubmitting(true);
    try {
      await investmentAPI.add({
        assetName: form.name,
        assetType: form.type,
        initialAmount: Number(form.invested),
        currentAmount: Number(form.current),
      });
      setShowModal(false);
      setForm({ name: "", type: "Crypto", invested: "", current: "" });
      await fetchInvestments();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan investasi.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete investment ───────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus investasi ini?")) return;
    try {
      await investmentAPI.delete(id);
      setPortfolio((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      alert("Gagal menghapus investasi.");
    }
  };

  return (
    <div className="d-flex investment-page">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-layout investment-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="dashboard-main p-4 p-md-5">
          <Container fluid className="px-0 px-md-3">

            {/* Header */}
            <div className="investment-header d-flex flex-column flex-md-row justify-content-between align-items-md-center investment-header-row mb-4 gap-3 anim-fade-up anim-d0">
              <div>
                <h2 className="fw-bold m-0">Investment</h2>
                <p className="text-muted mb-0">Track and manage your investment portfolio</p>
              </div>
              <Button className="investment-btn-add d-flex align-items-center" onClick={() => setShowModal(true)}>
                <Plus size={18} className="me-1" /> Add Investment
              </Button>
            </div>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            {/* Metrics */}
            <Row className="g-3 mb-4">
              {metrics.map((m, i) => (
                <Col key={i} xs={6} md={3}>
                  <Card className={`shadow-sm investment-card h-100 card-hover card-hover-green anim-fade-up anim-d${i + 1}`}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className={`investment-metric-icon ${m.cls}`}><m.icon size={18} /></div>
                        {m.change && (
                          <span className={`small fw-bold ${m.up ? "investment-metric-change--up" : "investment-metric-change--down"}`}>
                            {m.up ? "↑" : "↓"} {m.change}
                          </span>
                        )}
                      </div>
                      <p className="text-muted small mb-1">{m.label}</p>
                      <h4 className={`fw-bold mb-0 ${m.valCls || "investment-metric-value--dark"}`}>{m.value}</h4>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Growth Chart + Donut */}
            <Row className="g-3 mb-4">
              <Col xs={12} md={8}>
                <Card className="shadow-sm investment-card h-100 card-hover anim-fade-up anim-d5">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold text-dark mb-1">Investment Growth</h5>
                    <p className="text-muted small mb-3">Portfolio value projection based on your data</p>
                    <div style={{ width: "100%", height: 220 }}>
                      {growthData.length > 0 ? (
                        <ResponsiveContainer>
                          <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor="#20c997" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#20c997" stopOpacity={0}    />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={42} />
                            <Tooltip content={<GrowthTooltip />} />
                            <Area type="monotone" dataKey="val" stroke="#20c997" strokeWidth={2.5} fill="url(#investGrad)"
                              dot={{ r: 4, fill: "#20c997", stroke: "#fff", strokeWidth: 2 }}
                              activeDot={{ r: 6, fill: "#20c997", stroke: "#fff", strokeWidth: 2 }}
                              isAnimationActive animationDuration={1200} animationEasing="ease-out"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                          Add investments to see growth chart
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Allocation Donut */}
              <Col xs={12} md={4}>
                <Card className="shadow-sm investment-card h-100 card-hover anim-fade-right anim-d5">
                  <Card.Body className="p-4 d-flex flex-column align-items-center">
                    <h5 className="fw-bold text-dark mb-3 w-100">Asset Allocation</h5>
                    {allocationData.length > 0 ? (
                      <>
                        <div style={{ width: 180, height: 180 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={84}
                                paddingAngle={2} dataKey="value" stroke="none"
                                isAnimationActive animationBegin={200} animationDuration={1000} animationEasing="ease-out"
                              >
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                              </Pie>
                              <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="w-100 mt-3">
                          {allocationData.map((d, i) => (
                            <div key={i} className={`d-flex justify-content-between align-items-center mb-2 anim-fade-up anim-d${i + 5}`}>
                              <div className="d-flex align-items-center gap-2">
                                <div className="investment-alloc-dot" style={{ backgroundColor: d.color }} />
                                <span className="small text-muted">{d.label}</span>
                              </div>
                              <div className="text-end">
                                <div className="small fw-bold text-dark">{d.percent}%</div>
                                <div className="small text-muted">${d.value.toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-muted small text-center py-5">No data yet</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Best / Worst */}
            {best && worst && (
              <Row className="g-3 mb-4">
                <Col xs={12} md={6}>
                  <Card className="investment-best-card shadow-sm border-0 card-hover card-hover-green anim-fade-up anim-d6">
                    <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                      <div>
                        <p className="small text-muted mb-1">Best Performing Asset</p>
                        <h5 className="fw-bold text-dark mb-1">{best.assetName}</h5>
                        <h3 className="fw-bold mb-0 investment-best-value">+{best.returnRate}% <span style={{ fontSize: 18 }}>↗</span></h3>
                      </div>
                      <div className="investment-performer-icon investment-performer-icon--best"><TrendingUp size={24} /></div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card className="investment-worst-card shadow-sm border-0 card-hover anim-fade-up anim-d7">
                    <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                      <div>
                        <p className="small text-muted mb-1">Worst Performing Asset</p>
                        <h5 className="fw-bold text-dark mb-1">{worst.assetName}</h5>
                        <h3 className="fw-bold mb-0 investment-worst-value">{worst.returnRate}% <span style={{ fontSize: 18 }}>↘</span></h3>
                      </div>
                      <div className="investment-performer-icon investment-performer-icon--worst"><TrendingDown size={24} /></div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Investment List */}
            <Card className="shadow-sm investment-list-card border-0 card-hover anim-fade-up anim-d7">
              <Card.Body className="p-4">
                <h5 className="fw-bold text-dark mb-1">Investment List</h5>
                <p className="text-muted small mb-4">Your current investment portfolio</p>

                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-3 text-muted small">Loading portfolio...</p>
                  </div>
                ) : portfolio.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <p>No investments yet. Add your first investment!</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover borderless className="investment-table align-middle mb-0">
                      <thead>
                        <tr>
                          {["Asset Name","Type","Invested","Current Value","Profit/Loss","Actions"].map((h, i) => (
                            <th key={i} className="text-secondary fw-bold text-uppercase py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.map((inv) => (
                          <React.Fragment key={inv._id}>
                            <tr>
                              <td className="py-3">
                                <div className="d-flex align-items-center gap-3">
                                  <div className="investment-asset-avatar"
                                    style={{
                                      backgroundColor: TYPE_COLORS[inv.assetType]?.bg || "#f1f5f9",
                                      color: TYPE_COLORS[inv.assetType]?.color || "#64748b",
                                    }}
                                  >
                                    {inv.assetName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="fw-bold text-dark">{inv.assetName}</span>
                                </div>
                              </td>
                              <td className="text-secondary small py-3">{inv.assetType}</td>
                              <td className="fw-bold text-dark py-3">${inv.initialAmount.toLocaleString()}</td>
                              <td className="fw-bold text-dark py-3">${inv.currentAmount.toLocaleString()}</td>
                              <td className="py-3">
                                <div className={`fw-bold ${inv.profitLoss >= 0 ? "investment-profit-positive" : "investment-profit-negative"}`}>
                                  {inv.profitLoss >= 0 ? "+" : ""}${inv.profitLoss.toLocaleString()}
                                </div>
                                <div className={`small ${inv.profitLoss >= 0 ? "investment-profit-positive" : "investment-profit-negative"}`}>
                                  {inv.returnRate >= 0 ? "+" : ""}{inv.returnRate}%
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="d-flex gap-2">
                                  <button className="btn btn-sm btn-light" onClick={() => setExpanded(expanded === inv._id ? null : inv._id)}>
                                    {expanded === inv._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                  <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(inv._id)}>
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expanded === inv._id && (
                              <tr className="investment-expand-row">
                                <td colSpan={6} className="px-4 py-3">
                                  <div className="d-flex gap-5 flex-wrap">
                                    <div><span className="text-muted small">Asset Type</span><div className="fw-bold">{inv.assetType}</div></div>
                                    <div><span className="text-muted small">Invested</span><div className="fw-bold">${inv.initialAmount.toLocaleString()}</div></div>
                                    <div><span className="text-muted small">Current Value</span><div className="fw-bold">${inv.currentAmount.toLocaleString()}</div></div>
                                    <div>
                                      <span className="text-muted small">Profit / Loss</span>
                                      <div className={`fw-bold ${inv.profitLoss >= 0 ? "investment-profit-positive" : "investment-profit-negative"}`}>
                                        {inv.profitLoss >= 0 ? "+" : ""}${inv.profitLoss.toLocaleString()} ({inv.returnRate}%)
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
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

      {/* Modal Add Investment */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add Investment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Asset Name</Form.Label>
            <Form.Control className="investment-modal-input" placeholder="e.g. Apple Inc." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Asset Type</Form.Label>
            <Form.Select className="investment-modal-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Crypto</option><option>Stock</option><option>Gold</option><option>Mutual Fund</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Amount Invested ($)</Form.Label>
            <Form.Control className="investment-modal-input" type="number" placeholder="0" value={form.invested} onChange={(e) => setForm({ ...form, invested: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold">Current Value ($)</Form.Label>
            <Form.Control className="investment-modal-input" type="number" placeholder="0" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
          </Form.Group>
          <Button className="investment-modal-btn w-100 fw-bold py-2" onClick={handleAdd} disabled={submitting}>
            {submitting ? <><Spinner size="sm" className="me-2" />Saving...</> : "Add to Portfolio"}
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default InvestmentPage;
