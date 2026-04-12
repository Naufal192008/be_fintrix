import React, { useState, useEffect } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert } from "react-bootstrap";
import { Plus, Utensils, Car, LayoutList, Package, AlertTriangle, MoreVertical } from "lucide-react";
import { budgetAPI } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { BUDGET_CATEGORIES } from "../../constants/categories.js";
import "../../styles/BudgetPage.css";
import "../../styles/animations.css";

const ICON_MAP  = { "Food & Dining": Utensils, "Transportation": Car, "Healthcare": LayoutList };
const COLOR_MAP = {
  "Food & Dining":    { color: "#f5a623", bg: "#fff4e5" },
  "Transportation":   { color: "#339af0", bg: "#e7f5ff" },
  "Healthcare":       { color: "#339af0", bg: "#e7f5ff" },
  "Entertainment":    { color: "#845ef7", bg: "#f3e8ff" },
  "Shopping":         { color: "#339af0", bg: "#f0f4ff" },
  "Bills & Utilities":{ color: "#f03e3e", bg: "#fff5f5" },
};

const budgetTemplates = [
  { id: "diy-1", label: "Custom DIY Budget", desc: "Create a personalized budget from scratch tailored to your needs", icon: "✏️", iconBg: "#e6fcf5" },
  { id: "diy-2", label: "Custom DIY Budget", desc: "Create a personalized budget from scratch tailored to your needs", icon: "📋", iconBg: "#e7f5ff" },
];

function BudgetPage() {
  const { user, formatCurrency, t, convertMoney, getCurrencySymbol } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [budgets, setBudgets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [menuOpen, setMenuOpen]       = useState(null);
  const [form, setForm]               = useState({
    name: BUDGET_CATEGORIES[0],
    budget: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await budgetAPI.getAll();
      const mapped = (res.data?.data || []).map((b) => ({
        id:         b._id,
        name:       b.category,
        budget:     b.limitAmount,
        spent:      b.spent      ?? 0,        
        remaining:  b.remaining  ?? b.limitAmount,
        percent:    b.percent    ?? 0,
        icon:       ICON_MAP[b.category]  || Package,
        iconColor:  COLOR_MAP[b.category]?.color || "#845ef7",
        iconBg:     COLOR_MAP[b.category]?.bg    || "#f3e8ff",
      }));
      setBudgets(mapped);
    } catch (err) { console.error(err);
      setError("Gagal memuat budget. Pastikan kamu sudah login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  // eslint-disable-next-line no-unused-vars
  const remainingMonth = budgets.reduce((acc, b) => acc + (b.budget - b.spent), 0);
  const alerts = budgets
    .map((b) => ({ ...b, pct: Math.round((b.spent / b.budget) * 100) }))
    .filter((b) => b.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  const handleAdd = async () => {
    if (!form.budget) return;
    setSubmitting(true);
    try {
      const rate = convertMoney(1, user?.currency || 'USD');
      await budgetAPI.save({
        category: form.name,
        limitAmount: Number(form.budget) / rate,
        month: Number(form.month),
        year: Number(form.year),
      });
      setShowModal(false);
      setForm({ name: BUDGET_CATEGORIES[0], budget: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      await fetchBudgets();
    } catch (err) { console.error(err);
      alert(err.response?.data?.message || "Gagal menyimpan budget.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuDelete = async (id) => {
    if (!window.confirm("Hapus budget ini?")) return;
    try {
      await budgetAPI.delete(id);
      await fetchBudgets(); 
    } catch (err) { console.error(err);
      alert("Gagal menghapus budget.");
    }
    setMenuOpen(null);
  };

  return (
    <div className="d-flex budget-page">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-layout budget-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="dashboard-main p-4 p-md-5">
          <Container fluid className="px-0 px-md-3">

            <div className="budget-header mb-4 anim-fade-up anim-d0">
              <h2 className="fw-bold m-0">{t("Budget", "Anggaran")}</h2>
              <p className="text-muted mb-0">{t("Plan and manage your monthly spending limits", "Rencanakan dan pantau batas pengeluaran bulanan Anda")}</p>
            </div>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            {/* Top Row */}
            <Row className="g-4 mb-4">
              <Col xs={12} md={8}>
                <Card className="shadow-sm budget-card h-100 card-hover anim-fade-up anim-d1">
                  <Card.Body className="p-4">
                    <div className="d-flex budget-create-header justify-content-between align-items-start mb-1">
                      <div>
                        <h5 className="fw-bold text-dark mb-1">{t("Create New Budget", "Buat Anggaran Baru")}</h5>
                        <p className="text-muted small mb-0">{t("Set up a custom budget or use a template", "Atur anggaran kustom atau gunakan template")}</p>
                      </div>
                      <Button className="budget-btn-create d-flex align-items-center px-4 py-2" onClick={() => setShowModal(true)}>
                        <Plus size={17} className="me-1" /> {t("Create Budget", "Buat Anggaran")}
                      </Button>
                    </div>
                    <Row className="g-3 mt-2">
                      {budgetTemplates.map((t) => (
                        <Col xs={12} sm={6} key={t.id}>
                          <div className="p-3 border budget-template-card" onClick={() => setShowModal(true)}>
                            <div className="budget-template-icon" style={{ backgroundColor: t.iconBg }}>{t.icon}</div>
                            <div className="fw-bold text-dark small mb-1">{t.label}</div>
                            <div className="text-muted" style={{ fontSize: 12 }}>{t.desc}</div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} md={4}>
                <Card className="shadow-sm budget-card h-100 card-hover anim-fade-right anim-d2">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold text-dark mb-1">{t("Budget Alerts", "Peringatan Anggaran")}</h5>
                    <p className="text-muted small mb-3">{t("Categories approaching limit", "Kategori yang mendekati batas")}</p>
                    <div className="d-flex flex-column gap-2 mb-4">
                      {alerts.length === 0 && <div className="text-muted small">{t("All budgets are on track 🎉", "Semua anggaran aman 🎉")}</div>}
                      {alerts.map((a, i) => (
                        <div key={i} className="p-3 budget-alert-item d-flex align-items-start gap-2">
                          <AlertTriangle size={18} className="mt-1 flex-shrink-0" style={{ color: "#f5a623" }} />
                          <div>
                            <div className="fw-bold small budget-alert-title">{a.pct}% {t("Used", "Terpakai")}</div>
                            <div className="text-muted" style={{ fontSize: 12 }}>{t(`You have used ${a.pct}% of your ${a.name} budget`, `Anda telah menggunakan ${a.pct}% dari anggaran ${a.name}`)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-muted">{t("Total Budget Set", "Total Anggaran")}</span>
                      <span className="fw-bold budget-remaining-value">{formatCurrency(budgets.reduce((s, b) => s + b.budget, 0))}</span>
                    </div>
                    <div className="budget-remaining-bar-track">
                      <div className="budget-remaining-bar-fill" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Budget Cards Grid */}
            <Card className="shadow-sm budget-card card-hover anim-fade-up anim-d3">
              <Card.Body className="p-4">
                <h5 className="fw-bold text-dark mb-1">{t("Your Budgets", "Anggaran Anda")}</h5>
                <p className="text-muted small mb-4">{t("Track your spending across different categories", "Pantau pengeluaran Anda di berbagai kategori")}</p>

                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="success" />
                    <p className="mt-3 text-muted small">Loading budgets...</p>
                  </div>
                ) : budgets.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <p>{t("No budgets yet. Create your first budget!", "Belum ada anggaran. Buat anggaran pertama Anda!")}</p>
                  </div>
                ) : (
                  <Row className="g-3">
                    {budgets.map((b) => {
                    const pct       = b.percent;
                    const remaining = b.remaining ?? (b.budget - b.spent);
                    const barColor  = pct >= 90 ? "#ff6b6b" : pct >= 70 ? "#f5a623" : "#20c997";
                    const cardClass = pct >= 80 ? "budget-item-card--warning" : "budget-item-card--normal";

                      return (
                        <Col key={b.id} xs={12} md={6}>
                          <div className={`p-4 border budget-item-card ${cardClass}`}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <div className="budget-item-icon" style={{ backgroundColor: b.iconBg, color: b.iconColor }}>
                                  <b.icon size={20} />
                                </div>
                                <div>
                                  <div className="fw-bold text-dark">{b.name}</div>
                                  <div className="text-muted small">Budget: {formatCurrency(b.budget)}</div>
                                </div>
                              </div>
                              <div className="position-relative">
                                <button className="btn btn-sm btn-light p-1" onClick={() => setMenuOpen(menuOpen === b.id ? null : b.id)}>
                                  <MoreVertical size={16} />
                                </button>
                                {menuOpen === b.id && (
                                  <div className="position-absolute end-0 bg-white shadow budget-context-menu py-1">
                                    <button className="btn btn-sm w-100 text-start text-danger px-3" onClick={() => handleMenuDelete(b.id)}>{t("Delete", "Hapus")}</button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="budget-item-stats">
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted small">{t("Spent", "Terpakai")}</span>
                                <span className="fw-bold text-dark">{formatCurrency(b.spent)}</span>
                              </div>
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted small">{t("Remaining", "Sisa")}</span>
                                <span className="fw-bold budget-item-remaining">{formatCurrency(remaining)}</span>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">{t("Progress", "Progres")}</span>
                                <span className="fw-bold small" style={{ color: barColor }}>{pct}%</span>
                              </div>
                            </div>
                            <div className="budget-progress-track">
                              <div className="budget-progress-fill" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </Card.Body>
            </Card>

          </Container>
        </main>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{t("Create New Budget", "Buat Anggaran Baru")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">

          {/* Info banner */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
            <div className="d-flex align-items-start gap-2">
              <span style={{ fontSize: 18 }}>💡</span>
              <div style={{ fontSize: "0.82rem", color: "#166534", lineHeight: 1.6 }}>
                <strong>{t("How is Spent calculated?", "Bagaimana Terpakai dihitung?")}</strong><br />
                {t(
                  "The Spent value is automatically taken from the expense transactions you record in the Transactions page.",
                  "Nilai Terpakai diambil otomatis dari transaksi pengeluaran yang kamu catat di halaman Transaksi."
                )}<br />
                {t(
                  "Make sure the category and transaction month match this budget.",
                  "Pastikan kategori dan bulan transaksi sama dengan anggaran ini."
                )}
              </div>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">{t("Category", "Kategori")}</Form.Label>
            <Form.Select className="budget-modal-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}>
              {BUDGET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">{t("Budget Limit", "Batas Anggaran")} ({getCurrencySymbol()})</Form.Label>
            <Form.Control type="number" placeholder="e.g. 500" className="budget-modal-input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          </Form.Group>
          <Row className="g-3 mb-4">
            <Col xs={6}>
              <Form.Label className="small fw-bold">{t("Month", "Bulan")}</Form.Label>
              <Form.Select className="budget-modal-input" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString(user?.language === 'id' ? 'id-ID' : 'en-US', { month: "long" })}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6}>
              <Form.Label className="small fw-bold">{t("Year", "Tahun")}</Form.Label>
              <Form.Control type="number" className="budget-modal-input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </Col>
          </Row>
          <Button className="budget-modal-btn w-100 fw-bold py-2" onClick={handleAdd} disabled={submitting}>
            {submitting ? <><Spinner size="sm" className="me-2" />{t("Saving...", "Menyimpan...")}</> : t("Save Budget", "Simpan Anggaran")}
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default BudgetPage;
