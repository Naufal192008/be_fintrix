import React, { useState, useEffect, useMemo } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Form, Button, Table, InputGroup, Modal, Spinner, Alert } from "react-bootstrap";
import { Plus, Wallet, TrendingUp, TrendingDown, Receipt, Calendar, Search, Filter, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { transactionAPI } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { CATEGORIES_INCOME, CATEGORIES_EXPENSE, ALL_CATEGORIES } from "../../constants/categories.js";
import "../../styles/dashboard.css";
import "../../styles/trasaction.css";
import "../../styles/animations.css";

const StatusBadge = ({ status }) => (
  <span className={`tp-badge-base ${status === "Completed" ? "tp-badge-completed" : "tp-badge-pending"}`}>{status}</span>
);

// eslint-disable-next-line no-unused-vars
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "";

function TransactionsPage() {
  const { user, formatCurrency, t, convertMoney, getCurrencySymbol } = useAuth();

  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [transactions, setTransactions]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [searchTerm, setSearchTerm]         = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterType, setFilterType]         = useState("All Types");
  const [showModal, setShowModal]           = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [formData, setFormData]             = useState({
    date: "", category: "", note: "", amount: "", type: "income", status: "Completed",
  });

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionAPI.getAll();
      setTransactions(res.data?.data || []);
    } catch (err) { console.error(err);
      setError("Gagal memuat transaksi. Pastikan kamu sudah login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const filteredTransactions = useMemo(() => transactions.filter((t) => {
    const matchSearch   = t.category?.toLowerCase().includes(searchTerm.toLowerCase())
                       || t.description?.toLowerCase().includes(searchTerm.toLowerCase())
                       || t.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType     = filterType === "All Types"
                       || (filterType === "Income"  && t.type === "income")
                       || (filterType === "Expense" && t.type === "expense");
    const matchCategory = filterCategory === "All Categories" || t.category === filterCategory;
    return matchSearch && matchType && matchCategory;
  }), [transactions, searchTerm, filterType, filterCategory]);

  const { totalBalance, monthlyIncome, monthlyExpenses } = useMemo(() => {
    let income = 0, expenses = 0;
    transactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expenses += t.amount;
    });
    return { totalBalance: income - expenses, monthlyIncome: income, monthlyExpenses: expenses };
  }, [transactions]);

  const handleCreate = () => {
    setFormData({ date: "", category: "", note: "", amount: "", type: "income", status: "Completed" });
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const rate = convertMoney(1, user?.currency || 'USD');
      await transactionAPI.add({
        title: formData.category,
        amount: (parseFloat(formData.amount) || 0) / rate,
        type: formData.type,
        category: formData.category,
        date: formData.date || undefined,
        description: formData.note,
      });
      setShowModal(false);
      await fetchTransactions(); 
    } catch (err) { console.error(err);
      alert(err.response?.data?.message || "Gagal menyimpan transaksi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus transaksi ini?")) return;
    try {
      await transactionAPI.delete(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) { console.error(err);
      alert("Gagal menghapus transaksi.");
    }
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const metricCards = [
    { label: t("Total Balance", "Total Saldo"),      value: formatCurrency(totalBalance),    iconCls: "tp-card-icon-blue",   valCls: "tp-card-value-dark",  Icon: Wallet,       trend: <div className="d-flex align-items-center tp-trend-green"><ArrowUpRight size={16} /></div>, animD: "anim-d1", extraCls: "card-hover-green" },
    { label: t("Monthly Income", "Pendapatan Bulanan"),     value: formatCurrency(monthlyIncome),   iconCls: "tp-card-icon-green",  valCls: "tp-card-value-green", Icon: TrendingUp,   trend: <div className="d-flex align-items-center tp-trend-green"><ArrowUpRight size={16} /></div>, animD: "anim-d2", extraCls: "card-hover-green" },
    { label: t("Monthly Expenses", "Pengeluaran Bulanan"),   value: formatCurrency(monthlyExpenses), iconCls: "tp-card-icon-red",    valCls: "tp-card-value-red",   Icon: TrendingDown, trend: <div className="d-flex align-items-center tp-trend-red"><ArrowDownRight size={16} /></div>, animD: "anim-d3", extraCls: "" },
    { label: t("Total Transactions", "Total Transaksi"), value: String(transactions.length),  iconCls: "tp-card-icon-purple", valCls: "tp-card-value-dark",  Icon: Receipt,      trend: null, animD: "anim-d4", extraCls: "" },
  ];

  return (
    <div className="d-flex transactions-page-wrapper">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="dashboard-main p-4 p-md-5">
          <Container fluid className="px-0">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 tp-page-header anim-fade-up anim-d0">
              <div>
                <h2 className="mb-1 fw-bold tp-title">{t("Transactions", "Transaksi")}</h2>
                <p className="text-muted mb-0 tp-subtitle">{t("Track and manage your income and expenses", "Kelola riwayat pemasukan dan pengeluaran Anda")}</p>
              </div>
              <Button onClick={handleCreate} className="d-flex justify-content-center align-items-center gap-2 rounded-2 px-4 py-2 border-0 shadow-sm tp-btn-add">
                <Plus size={18} /> {t("Add Transaction", "Tambah Transaksi")}
              </Button>
            </div>

            {/* Error */}
            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            {/* Metric Cards */}
            <Row className="mb-4 g-3">
              {metricCards.map((m, i) => (
                <Col key={i} xs={6} md={6} xl={3} className="tp-metric-col">
                  <Card className={`border-0 shadow-sm rounded-4 h-100 p-2 card-hover ${m.extraCls} anim-fade-up ${m.animD}`}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className={`p-2 rounded-3 ${m.iconCls}`}><m.Icon size={20} /></div>
                        {m.trend}
                      </div>
                      <div className="text-muted mb-1 tp-card-label">{m.label}</div>
                      <h3 className={`mb-0 fw-bold ${m.valCls}`}>{m.value}</h3>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <Card className="border-0 shadow-sm rounded-4 mb-4 card-hover anim-fade-up anim-d4">
              <Card.Body className="p-3 p-lg-4">
                <Row className="g-3 align-items-end">
                  <Col xs={6} sm={6} xl={2} lg={4} md={6}>
                    <Form.Group>
                      <Form.Label className="small text-dark fw-bold mb-2">{t("Category", "Kategori")}</Form.Label>
                      <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="shadow-none text-muted rounded-3 tp-filter-select">
                        <option value="All Categories">{t("All Categories", "Semua Kategori")}</option>
                        {ALL_CATEGORIES.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={6} sm={6} xl={2} lg={4} md={6}>
                    <Form.Group>
                      <Form.Label className="small text-dark fw-bold mb-2">{t("Type", "Tipe")}</Form.Label>
                      <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="shadow-none text-muted rounded-3 tp-filter-select">
                        <option value="All Types">{t("All Types", "Semua Tipe")}</option>
                        <option value="Income">{t("Income", "Pemasukan")}</option>
                        <option value="Expense">{t("Expense", "Pengeluaran")}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} xl={3} lg={8} md={6}>
                    <Form.Group>
                      <Form.Label className="small text-dark fw-bold mb-2">{t("Search", "Cari")}</Form.Label>
                      <InputGroup className="rounded-3 tp-filter-input-group">
                        <InputGroup.Text className="bg-white border-0 text-muted ps-3 pe-2"><Search size={18} /></InputGroup.Text>
                        <Form.Control type="text" placeholder={t("Search category or note", "Cari kategori atau catatan")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-0 ps-0 shadow-none text-muted tp-filter-input" />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} xl={2} lg={4} md={12} className="d-flex align-items-end mt-1 mt-xl-0">
                    <Button variant="dark" className="w-100 d-flex justify-content-center align-items-center gap-2 rounded-2 border-0 tp-btn-filter" onClick={fetchTransactions}>
                      <Filter size={16} /> <span className="tp-btn-filter-text">Refresh</span>
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Transactions Table */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 card-hover anim-fade-up anim-d5">
              <Card.Body className="p-0">
                <div className="p-4 border-bottom">
                  <h5 className="fw-bold mb-0 tp-title">{t("Transactions History", "Riwayat Transaksi")}</h5>
                </div>
                <div className="p-3 p-md-4 pt-2">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="success" />
                      <p className="mt-3 text-muted">Loading transactions...</p>
                    </div>
                  ) : (
                    <Table responsive className="align-middle mb-0 text-nowrap tp-table">
                      <thead>
                        <tr>
                          {[
                            t("DATE", "TANGGAL"),
                            t("CATEGORY", "KATEGORI"),
                            t("NOTE", "CATATAN"),
                            t("AMOUNT", "JUMLAH"),
                            t("STATUS", "STATUS"),
                            t("ACTIONS", "AKSI")
                          ].map((h, i) => (
                            <th key={i} className={`text-muted fw-semibold pb-3 border-bottom text-uppercase tp-table-th${h === "ACTIONS" || h === "AKSI" ? " text-center" : ""}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="border-top-0">
                        {filteredTransactions.length === 0 ? (
                          <tr><td colSpan="6" className="text-center py-4 text-muted">No transactions found</td></tr>
                        ) : filteredTransactions.map((t) => (
                          <tr key={t._id}>
                            <td className="py-3 text-muted tp-table-td-date">{new Date(t.date).toLocaleDateString(user?.language === 'id' ? 'id-ID' : 'en-US', { month: "short", day: "2-digit", year: "numeric" })}</td>
                            <td className="py-3 fw-bold tp-table-td-category">{t.category}</td>
                            <td className="py-3 text-muted tp-table-td-note">{t.description || t.title || "-"}</td>
                            <td className={`py-3 fw-bold ${t.type === "income" ? "tp-table-td-amount-income" : "tp-table-td-amount-expense"}`}>
                              <span style={{ marginRight: '2px' }}>{t.type === "income" ? "+" : "-"}</span>{formatCurrency(Math.abs(t.amount))}
                            </td>
                            <td className="py-3"><StatusBadge status="Completed" /></td>
                            <td className="py-3 text-center">
                              <div className="d-flex gap-3 justify-content-center">
                                <button className="btn btn-link p-0 text-danger tp-action-btn-delete" onClick={() => handleDelete(t._id)}><Trash2 size={18} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Card.Body>
            </Card>

          </Container>
        </main>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" backdrop="static" dialogClassName="tp-transaction-modal">
        <Modal.Header closeButton className="tp-modal-header border-0">
          <div>
            <Modal.Title className="fw-bold tp-modal-title">{t("Add Transaction", "Tambah Transaksi")}</Modal.Title>
            <p className="tp-modal-subtitle mb-0">{t("Record a new income or expense", "Catat pemasukan atau pengeluaran baru")}</p>
          </div>
        </Modal.Header>
        <Form onSubmit={handleModalSubmit}>
          <Modal.Body className="tp-modal-body">
            <div className="tp-modal-section">
              <Form.Label className="tp-label">{t("Transaction Type", "Tipe Transaksi")}</Form.Label>
              <div className="tp-type-switcher">
                <button type="button" className={`tp-type-option ${formData.type === "income" ? "income-active" : ""}`} onClick={() => setFormData((p) => ({ ...p, type: "income" }))}>{t("Income", "Pemasukan")}</button>
                <button type="button" className={`tp-type-option ${formData.type === "expense" ? "expense-active" : ""}`} onClick={() => setFormData((p) => ({ ...p, type: "expense" }))}>{t("Expense", "Pengeluaran")}</button>
              </div>
            </div>
            <Row className="g-4">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="tp-label">{t("Category", "Kategori")}</Form.Label>
                  <Form.Select name="category" value={formData.category} onChange={handleModalChange} required className="tp-input">
                    <option value="">{t("Select a category", "Pilih kategori")}</option>
                    {(formData.type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="tp-label">{t("Date", "Tanggal")}</Form.Label>
                  <div className="tp-date-wrap">
                    <Calendar size={18} className="tp-field-icon" />
                    <Form.Control type="date" name="date" value={formData.date} onChange={handleModalChange} className="tp-input tp-input-date" />
                  </div>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="tp-label">{t("Amount", "Jumlah")}</Form.Label>
                  <InputGroup className="tp-amount-group">
                    <InputGroup.Text className="tp-amount-prefix">{getCurrencySymbol()}</InputGroup.Text>
                    <Form.Control type="number" step="0.01" min="0" name="amount" value={formData.amount} onChange={handleModalChange} required placeholder="0.00" className="tp-amount-input" />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="tp-label">{t("Note", "Catatan")}</Form.Label>
                  <Form.Control as="textarea" rows={3} name="note" value={formData.note} onChange={handleModalChange} placeholder={t("Add a note about this transaction...", "Tambah catatan tentang transaksi ini...")} className="tp-input tp-textarea" />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="tp-modal-footer border-0">
            <Button type="button" variant="light" onClick={() => setShowModal(false)} className="tp-btn-cancel">{t("Cancel", "Batal")}</Button>
            <Button type="submit" className="tp-btn-save" disabled={submitting}>
              {submitting ? <><Spinner size="sm" className="me-2" />{t("Saving...", "Menyimpan...")}</> : t("Save Transaction", "Simpan Transaksi")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default TransactionsPage;
