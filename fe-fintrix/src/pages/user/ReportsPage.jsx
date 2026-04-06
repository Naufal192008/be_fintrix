import React, { useState, useEffect, useMemo } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert } from "react-bootstrap";
import { Filter, FileText, TrendingUp, TrendingDown, Wallet, Utensils, Home, Car, ShoppingCart, Zap, Download, Package } from "lucide-react";
import { analyticsAPI, transactionAPI } from "../../services/api.js";
import "../../styles/ReportsPage.css";
import "../../styles/animations.css";

// Icon mapping per kategori
const CATEGORY_ICONS = {
  "Food & Dining":    { icon: Utensils,     color: "#20c997", bg: "#e6fcf5" },
  "Groceries":        { icon: ShoppingCart,  color: "#20c997", bg: "#e6fcf5" },
  "Housing":          { icon: Home,          color: "#339af0", bg: "#e7f5ff" },
  "Transportation":   { icon: Car,           color: "#f5a623", bg: "#fff4e5" },
  "Shopping":         { icon: ShoppingCart,  color: "#845ef7", bg: "#f3e8ff" },
  "Bills & Utilities":{ icon: Zap,           color: "#ff6b6b", bg: "#ffe8e6" },
  "Entertainment":    { icon: Package,       color: "#f03e3e", bg: "#fff5f5" },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "";
const formatMoney = (a) => "$" + Number(a).toLocaleString("en-US", { minimumFractionDigits: 2 });

function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary]         = useState(null);
  const [categories, setCategories]   = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [error, setError]             = useState(null);
  const [reportType, setReportType]   = useState("Monthly");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");

  // ── Fetch semua data ────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, categoryRes, txRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getSpendingByCategory(),
        transactionAPI.getAll(),
      ]);
      setSummary(summaryRes.data?.data || null);
      setCategories(categoryRes.data?.data || []);
      setTransactions(txRes.data?.data || []);
    } catch (err) {
      setError("Gagal memuat data laporan. Pastikan kamu sudah login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Filter transaksi berdasarkan pilihan ───────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      const fromOk = !dateFrom || txDate >= new Date(dateFrom);
      const toOk   = !dateTo   || txDate <= new Date(dateTo);
      const catOk  = filterCategory === "All Categories" || t.category === filterCategory;
      return fromOk && toOk && catOk;
    });
  }, [transactions, dateFrom, dateTo, filterCategory]);

  // ── Summary dari filtered transactions ─────────────────────────────────────
  const filteredSummary = useMemo(() => {
    let income = 0, expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  // ── Category breakdown (total semua — dari analytics API) ─────────────────
  const maxCatAmount = categories.length > 0 ? Math.max(...categories.map((c) => c.total)) : 1;

  const handleGenerate = async () => {
    setGenerating(true);
    await fetchData();
    setGenerating(false);
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const header = ["Date","Category","Type","Amount","Note"];
    const rows = filteredTransactions.map((t) => [
      formatDate(t.date),
      t.category,
      t.type,
      t.amount,
      t.description || t.title || "",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "fintrix-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Export PDF (browser print) ─────────────────────────────────────────────
  const handleExportPDF = () => window.print();

  const uniqueCategories = ["All Categories", ...new Set(transactions.map((t) => t.category))];

  return (
    <div className="d-flex reports-page">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout reports-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="dashboard-main p-4 p-md-5">
          <Container fluid className="px-0 px-md-3">

            {/* Header */}
            <div className="reports-header mb-4 anim-fade-up anim-d0">
              <h2 className="fw-bold m-0">Reports</h2>
              <p className="text-muted">View and export your financial reports</p>
            </div>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            {/* BLOCK 1: REPORT FILTERS */}
            <Card className="shadow-sm reports-card mb-4 card-hover anim-fade-up anim-d1">
              <Card.Body className="p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                  <h5 className="fw-bold mb-0 d-flex align-items-center text-dark">
                    <Filter size={20} className="reports-filter-icon me-2" /> Report Filters
                  </h5>
                  <Button className="reports-btn-generate fw-bold px-4 py-2 d-flex align-items-center" onClick={handleGenerate} disabled={generating}>
                    {generating ? <Spinner size="sm" className="me-2" /> : <FileText size={18} className="me-2" />}
                    Generate Report
                  </Button>
                </div>
                <Row className="g-3">
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-dark mb-1">Report Type</Form.Label>
                      <Form.Select className="reports-form-field py-2" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                        <option>Monthly</option><option>Yearly</option><option>Weekly</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-dark mb-1">Date From</Form.Label>
                      <Form.Control type="date" className="reports-form-field py-2" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-dark mb-1">Date To</Form.Label>
                      <Form.Control type="date" className="reports-form-field py-2" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-dark mb-1">Category Filter</Form.Label>
                      <Form.Select className="reports-form-field py-2" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        {uniqueCategories.map((c) => <option key={c}>{c}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* BLOCK 2: KEY METRICS */}
            {loading ? (
              <div className="text-center py-4 mb-4">
                <Spinner animation="border" variant="success" />
                <p className="mt-3 text-muted small">Loading report data...</p>
              </div>
            ) : (
              <>
                <Row className="g-3 mb-4">
                  <Col xs={12} sm={4}>
                    <Card className="shadow-sm reports-card h-100 card-hover card-hover-green anim-fade-up anim-d2">
                      <Card.Body className="p-4">
                        <div className="reports-metric-icon reports-metric-icon--income mb-3"><TrendingUp size={20} /></div>
                        <p className="small text-muted fw-semibold mb-1">Total Income</p>
                        <h3 className="fw-bold mb-0 reports-metric-value--income">
                          {formatMoney(dateFrom || dateTo ? filteredSummary.income : summary?.totalIncome || 0)}
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} sm={4}>
                    <Card className="shadow-sm reports-card h-100 card-hover anim-fade-up anim-d3">
                      <Card.Body className="p-4">
                        <div className="reports-metric-icon reports-metric-icon--expense mb-3"><TrendingDown size={20} /></div>
                        <p className="small text-muted fw-semibold mb-1">Total Expenses</p>
                        <h3 className="fw-bold mb-0 reports-metric-value--expense">
                          {formatMoney(dateFrom || dateTo ? filteredSummary.expense : summary?.totalExpense || 0)}
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} sm={4}>
                    <Card className="shadow-sm reports-card h-100 card-hover card-hover-green anim-fade-up anim-d4">
                      <Card.Body className="p-4">
                        <div className="reports-metric-icon reports-metric-icon--balance mb-3"><Wallet size={20} /></div>
                        <p className="small text-muted fw-semibold mb-1">Net Balance</p>
                        <h3 className={`fw-bold mb-0 ${(dateFrom || dateTo ? filteredSummary.balance : summary?.balance || 0) >= 0 ? "reports-metric-value--balance" : "reports-metric-value--expense"}`}>
                          {(dateFrom || dateTo ? filteredSummary.balance : summary?.balance || 0) >= 0 ? "+" : ""}
                          {formatMoney(Math.abs(dateFrom || dateTo ? filteredSummary.balance : summary?.balance || 0))}
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* BLOCK 3: CATEGORY REPORT */}
                {categories.length > 0 && (
                  <Card className="shadow-sm reports-card mb-4 card-hover anim-fade-up anim-d3">
                    <Card.Body className="p-4">
                      <h5 className="fw-bold text-dark mb-4">Category Report</h5>
                      <div className="d-flex reports-category-scroll gap-3 pb-2">
                        {categories.map((cat, i) => {
                          const meta = CATEGORY_ICONS[cat.category] || { icon: Package, color: "#64748b", bg: "#f1f5f9" };
                          const Icon = meta.icon;
                          const pct  = Math.round((cat.total / maxCatAmount) * 100);
                          return (
                            <div key={i} className="reports-category-col flex-shrink-0">
                              <Card className={`reports-category-card h-100 card-hover-subtle anim-scale-in anim-d${i + 1}`}>
                                <Card.Body className="p-4">
                                  <div className="reports-category-icon mb-4" style={{ backgroundColor: meta.bg, color: meta.color }}>
                                    <Icon size={22} />
                                  </div>
                                  <p className="small text-muted fw-bold mb-1">{cat.category}</p>
                                  <h4 className="fw-bold text-dark mb-4">{formatMoney(cat.total)}</h4>
                                  <div className="d-flex align-items-center">
                                    <div className="reports-progress-bar-track">
                                      <div className="reports-progress-bar-fill anim-progress-fill" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                                    </div>
                                    <span className="small text-muted fw-bold" style={{ fontSize: 11 }}>{pct}%</span>
                                  </div>
                                </Card.Body>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* BLOCK 4: TRANSACTION TABLE */}
                <Card className="shadow-sm reports-table-card mb-4 card-hover anim-fade-up anim-d4">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold text-dark mb-4">
                      Transaction Report
                      <span className="text-muted small fw-normal ms-2">({filteredTransactions.length} records)</span>
                    </h5>
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center text-muted py-4">No transactions found for selected filters.</div>
                    ) : (
                      <div className="table-responsive">
                        <Table hover borderless className="reports-table align-middle mb-0">
                          <thead>
                            <tr>
                              <th className="text-secondary fw-bold py-3 text-uppercase">Date</th>
                              <th className="text-secondary fw-bold py-3 text-uppercase">Category</th>
                              <th className="text-secondary fw-bold py-3 text-uppercase text-center">Income</th>
                              <th className="text-secondary fw-bold py-3 text-uppercase text-center">Expense</th>
                              <th className="text-secondary fw-bold py-3 text-uppercase">Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.map((t, i) => (
                              <tr key={t._id || i}>
                                <td className="text-secondary fw-bold py-3">{formatDate(t.date)}</td>
                                <td className="text-dark fw-bold py-3">{t.category}</td>
                                <td className="text-center fw-bold py-3">
                                  {t.type === "income"
                                    ? <span className="income-positive">+{formatMoney(t.amount)}</span>
                                    : <span className="income-dash">—</span>}
                                </td>
                                <td className="text-center fw-bold py-3">
                                  {t.type === "expense"
                                    ? <span className="expense-negative">-{formatMoney(t.amount)}</span>
                                    : <span className="expense-dash">—</span>}
                                </td>
                                <td className="text-secondary py-3">{t.description || t.title || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* BLOCK 5: EXPORT */}
                <Card className="shadow-sm reports-card card-hover anim-fade-up anim-d5">
                  <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center reports-export-row">
                    <div className="mb-3 mb-md-0">
                      <h5 className="fw-bold text-dark mb-1">Export Report</h5>
                      <p className="text-muted small mb-0">Download your financial report</p>
                    </div>
                    <div className="d-flex flex-wrap gap-3 reports-export-btn-group">
                      <Button className="reports-btn-pdf fw-bold px-4 py-2 d-flex align-items-center" onClick={handleExportPDF}>
                        <FileText size={18} className="me-2" /> Export as PDF
                      </Button>
                      <Button className="reports-btn-excel fw-bold px-4 py-2 d-flex align-items-center" onClick={handleExportCSV}>
                        <Download size={18} className="me-2" /> Export as CSV
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </>
            )}

          </Container>
        </main>
      </div>
    </div>
  );
}

export default ReportsPage;
