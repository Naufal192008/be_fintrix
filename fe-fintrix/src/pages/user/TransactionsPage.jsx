import React, { useState, useMemo } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  InputGroup,
  Modal,
} from "react-bootstrap";
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  Calendar,
  Search,
  Filter,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/trasaction.css";

const initialTransactions = [
  {
    id: 1,
    date: "2026-03-10",
    category: "Salary",
    budget: "Monthly Income",
    note: "Main remote job salary",
    amount: 5240.0,
    amountType: "income",
    status: "Completed",
  },
  {
    id: 2,
    date: "2026-03-09",
    category: "Groceries",
    budget: "Food & Dining",
    note: "Weekly grocery shopping at Whole Foods",
    amount: 145.5,
    amountType: "expense",
    status: "Completed",
  },
  {
    id: 3,
    date: "2026-03-08",
    category: "Electricity",
    budget: "Bills & Utilities",
    note: "Monthly electric bill",
    amount: 89.0,
    amountType: "expense",
    status: "Completed",
  },
  {
    id: 4,
    date: "2026-03-08",
    category: "Entertainment",
    budget: "Entertainment",
    note: "Netflix & Spotify subscriptions",
    amount: 25.98,
    amountType: "expense",
    status: "Completed",
  },
  {
    id: 5,
    date: "2026-03-07",
    category: "Food & Dining",
    budget: "Food & Dining",
    note: "Dinner with friends",
    amount: 56.5,
    amountType: "expense",
    status: "Completed",
  },
  {
    id: 6,
    date: "2026-03-06",
    category: "Freelance",
    budget: "Side Income",
    note: "Web design project final payment",
    amount: 1200.0,
    amountType: "income",
    status: "Completed",
  },
  {
    id: 7,
    date: "2026-03-05",
    category: "Transportation",
    budget: "Transportation",
    note: "Gas for the car",
    amount: 45.0,
    amountType: "expense",
    status: "Completed",
  },
  {
    id: 8,
    date: "2026-03-04",
    category: "Shopping",
    budget: "Shopping",
    note: "New sneakers",
    amount: 180.0,
    amountType: "expense",
    status: "Completed",
  },
  {
    id: 9,
    date: "2026-03-02",
    category: "Investment",
    budget: "Investments",
    note: "Monthly ETF deposit",
    amount: 500.0,
    amountType: "expense",
    status: "Completed",
  },
  {
    id: 10,
    date: "2026-03-01",
    category: "Side Hustle",
    budget: "Side Income",
    note: "Photography weekend gig",
    amount: 350.0,
    amountType: "income",
    status: "Pending",
  },
];

const StatusBadge = ({ status }) => {
  const isCompleted = status === "Completed";
  return (
    <span
      className={`tp-badge-base ${
        isCompleted ? "tp-badge-completed" : "tp-badge-pending"
      }`}
    >
      {status}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatMoney = (amount) => {
  return (
    "$" +
    amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

function TransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterType, setFilterType] = useState("All Types");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    category: "",
    budget: "",
    note: "",
    amount: "",
    amountType: "income",
    status: "Completed",
  });

  const uniqueCategories = [
    "All Categories",
    // Income Categories
    "Salary", "Freelance", "Investment", "Side Hustle",
    // Expense Categories
    "Groceries", "Food & Dining", "Shopping", "Transportation", 
    "Bills & Utilities", "Entertainment", "Healthcare", "Education",
    // Common
    "Others"
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.note.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType =
        filterType === "All Types" ||
        (filterType === "Income" && t.amountType === "income") ||
        (filterType === "Expense" && t.amountType === "expense");

      const matchCategory =
        filterCategory === "All Categories" || t.category === filterCategory;

      return matchSearch && matchType && matchCategory;
    });
  }, [transactions, searchTerm, filterType, filterCategory]);

  const { totalBalance, monthlyIncome, monthlyExpenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach((t) => {
      if (t.amountType === "income") {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    });

    return {
      totalBalance: income - expenses,
      monthlyIncome: income,
      monthlyExpenses: expenses,
    };
  }, [transactions]);

  const handleCreate = () => {
    setFormData({
      date: "",
      category: "",
      budget: "",
      note: "",
      amount: "",
      amountType: "income",
      status: "Completed",
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (t) => {
    setFormData({
      date: t.date,
      category: t.category,
      budget: t.budget,
      note: t.note,
      amount: t.amount,
      amountType: t.amountType,
      status: t.status,
    });
    setEditingId(t.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();

    const saveAmount = parseFloat(formData.amount) || 0;
    const saveTx = {
      ...formData,
      amount: saveAmount,
    };

    if (editingId) {
      setTransactions(
        transactions.map((t) =>
          t.id === editingId ? { ...saveTx, id: editingId } : t
        )
      );
    } else {
      const newId =
        transactions.length > 0
          ? Math.max(...transactions.map((t) => t.id)) + 1
          : 1;

      setTransactions([{ ...saveTx, id: newId }, ...transactions]);
    }

    setShowModal(false);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="d-flex transactions-page-wrapper">
      <SidebarComponent
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="dashboard-main p-4 p-md-5">
          <Container fluid className="px-0">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
              <div>
                <h2 className="mb-1 fw-bold tp-title">Transactions</h2>
                <p className="text-muted mb-0 tp-subtitle">
                  Track and manage your income and expenses
                </p>
              </div>

              <Button
                onClick={handleCreate}
                className="d-flex justify-content-center align-items-center gap-2 rounded-2 px-4 py-2 border-0 shadow-sm tp-btn-add"
              >
                <Plus size={18} /> Add Transaction
              </Button>
            </div>

            <Row className="mb-4 g-4">
              <Col md={6} xl={3}>
                <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="p-2 rounded-3 tp-card-icon-blue">
                        <Wallet size={20} />
                      </div>
                      <div className="d-flex align-items-center tp-trend-green">
                        <ArrowUpRight size={16} className="me-1" />
                      </div>
                    </div>
                    <div className="text-muted mb-1 tp-card-label">
                      Total Balance
                    </div>
                    <h3 className="mb-0 fw-bold tp-card-value-dark">
                      {formatMoney(totalBalance)}
                    </h3>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} xl={3}>
                <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="p-2 rounded-3 tp-card-icon-green">
                        <TrendingUp size={20} />
                      </div>
                      <div className="d-flex align-items-center tp-trend-green">
                        <ArrowUpRight size={16} className="me-1" />
                      </div>
                    </div>
                    <div className="text-muted mb-1 tp-card-label">
                      Monthly Income
                    </div>
                    <h3 className="mb-0 fw-bold tp-card-value-green">
                      {formatMoney(monthlyIncome)}
                    </h3>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} xl={3}>
                <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="p-2 rounded-3 tp-card-icon-red">
                        <TrendingDown size={20} />
                      </div>
                      <div className="d-flex align-items-center tp-trend-red">
                        <ArrowDownRight size={16} className="me-1" />
                      </div>
                    </div>
                    <div className="text-muted mb-1 tp-card-label">
                      Monthly Expenses
                    </div>
                    <h3 className="mb-0 fw-bold tp-card-value-red">
                      {formatMoney(monthlyExpenses)}
                    </h3>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} xl={3}>
                <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="p-2 rounded-3 tp-card-icon-purple">
                        <Receipt size={20} />
                      </div>
                    </div>
                    <div className="text-muted mb-1 tp-card-label">
                      Total Transactions
                    </div>
                    <h3 className="mb-0 fw-bold tp-card-value-dark">
                      {transactions.length}
                    </h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body className="p-3 p-xl-4 p-lg-4">
                <Row className="g-3 align-items-end">
                  <Col xl={3} lg={4} md={6}>
                    <Form.Group>
                      <Form.Label className="small text-dark fw-bold mb-2">
                        Date Range
                      </Form.Label>
                      <InputGroup className="rounded-3 tp-filter-input-group">
                        <InputGroup.Text className="bg-white border-0 text-muted ps-3 pe-2">
                          <Calendar size={18} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Select date range"
                          className="border-0 ps-0 shadow-none text-muted tp-filter-input"
                          readOnly
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col xl={2} lg={4} md={6}>
                    <Form.Group>
                      <Form.Label className="small text-dark fw-bold mb-2">
                        Category
                      </Form.Label>
                      <Form.Select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="shadow-none text-muted rounded-3 tp-filter-select"
                      >
                        {uniqueCategories.map((cat, idx) => (
                          <option key={idx} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xl={2} lg={4} md={6}>
                    <Form.Group>
                      <Form.Label className="small text-dark fw-bold mb-2">
                        Type
                      </Form.Label>
                      <Form.Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="shadow-none text-muted rounded-3 tp-filter-select"
                      >
                        <option value="All Types">All Types</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xl={3} lg={8} md={6}>
                    <Form.Group>
                      <Form.Label className="small text-dark fw-bold mb-2">
                        Search
                      </Form.Label>
                      <InputGroup className="rounded-3 tp-filter-input-group">
                        <InputGroup.Text className="bg-white border-0 text-muted ps-3 pe-2">
                          <Search size={18} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search Category or Note"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border-0 ps-0 shadow-none text-muted tp-filter-input"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col
                    xl={2}
                    lg={4}
                    md={12}
                    className="d-flex align-items-end mt-3 mt-xl-0"
                  >
                    <Button
                      variant="dark"
                      className="w-100 d-flex justify-content-center align-items-center gap-2 rounded-2 border-0 tp-btn-filter"
                    >
                      <Filter size={16} />{" "}
                      <span className="tp-btn-filter-text">Filter</span>
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body className="p-0">
                <div className="p-4 border-bottom">
                  <h5 className="fw-bold mb-0 tp-title">Transactions History</h5>
                </div>

                <div className="p-4 pt-2">
                  <Table responsive className="align-middle mb-0 text-nowrap tp-table">
                    <thead>
                      <tr>
                        <th className="text-muted fw-semibold pb-3 border-bottom text-uppercase tp-table-th">
                          DATE
                        </th>
                        <th className="text-muted fw-semibold pb-3 border-bottom text-uppercase tp-table-th">
                          CATEGORY
                        </th>
                        <th className="text-muted fw-semibold pb-3 border-bottom text-uppercase tp-table-th">
                          BUDGET
                        </th>
                        <th className="text-muted fw-semibold pb-3 border-bottom text-uppercase tp-table-th">
                          NOTE
                        </th>
                        <th className="text-muted fw-semibold pb-3 border-bottom text-uppercase tp-table-th">
                          AMOUNT
                        </th>
                        <th className="text-muted fw-semibold pb-3 border-bottom text-uppercase tp-table-th">
                          STATUS
                        </th>
                        <th className="text-muted fw-semibold pb-3 border-bottom text-uppercase text-center tp-table-th">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>

                    <tbody className="border-top-0">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4 text-muted">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((t) => (
                          <tr key={t.id}>
                            <td className="py-3 text-muted tp-table-td-date">
                              {formatDate(t.date)}
                            </td>
                            <td className="py-3 fw-bold tp-table-td-category">
                              {t.category}
                            </td>
                            <td className="py-3 text-muted tp-table-td-budget">
                              {t.budget}
                            </td>
                            <td className="py-3 text-muted tp-table-td-note">
                              {t.note}
                            </td>
                            <td
                              className={`py-3 fw-bold ${
                                t.amountType === "income"
                                  ? "tp-table-td-amount-income"
                                  : "tp-table-td-amount-expense"
                              }`}
                            >
                              {t.amountType === "income" ? "+" : "-"}
                              {formatMoney(t.amount)}
                            </td>
                            <td className="py-3">
                              <StatusBadge status={t.status} />
                            </td>
                            <td className="py-3 text-center">
                              <div className="d-flex gap-3 justify-content-center">
                                <button
                                  className="btn btn-link p-0 text-muted tp-action-btn-edit"
                                  aria-label="Edit"
                                  onClick={() => handleEdit(t)}
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  className="btn btn-link p-0 text-danger tp-action-btn-delete"
                                  aria-label="Delete"
                                  onClick={() => handleDelete(t.id)}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Container>
        </main>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        backdrop="static"
        dialogClassName="tp-transaction-modal"
      >
        <Modal.Header closeButton className="tp-modal-header border-0">
          <div>
            <Modal.Title className="fw-bold tp-modal-title">
              {editingId ? "Edit Transaction" : "Add Transaction"}
            </Modal.Title>
            <p className="tp-modal-subtitle mb-0">
              Create a new income or expense transaction
            </p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleModalSubmit}>
          <Modal.Body className="tp-modal-body">
            <div className="tp-modal-section">
              <Form.Label className="tp-label">Transaction Type</Form.Label>
              <div className="tp-type-switcher">
                <button
                  type="button"
                  className={`tp-type-option ${
                    formData.amountType === "income" ? "income-active" : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, amountType: "income" }))
                  }
                >
                  Income
                </button>

                <button
                  type="button"
                  className={`tp-type-option ${
                    formData.amountType === "expense" ? "expense-active" : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, amountType: "expense" }))
                  }
                >
                  Expense
                </button>
              </div>
            </div>

            <Row className="g-4">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="tp-label">Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleModalChange}
                    required
                    className="tp-input"
                  >
                    <option value="">Select a category</option>
                    {formData.amountType === "income" ? (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Investment">Investment</option>
                        <option value="Side Hustle">Side Hustle</option>
                        <option value="Others">Others</option>
                      </>
                    ) : (
                      <>
                        <option value="Groceries">Groceries</option>
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Bills & Utilities">Bills & Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Others">Others</option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="tp-label">Budget</Form.Label>
                  <Form.Select
                    name="budget"
                    value={formData.budget}
                    onChange={handleModalChange}
                    required
                    className="tp-input"
                  >
                    <option value="">Select a budget</option>
                    {formData.amountType === "income" ? (
                      <>
                        <option value="Monthly Income">Monthly Income</option>
                        <option value="Side Income">Side Income</option>
                        <option value="Investments">Investments</option>
                      </>
                    ) : (
                      <>
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Bills & Utilities">Bills & Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Personal Care">Personal Care</option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="tp-label">Date</Form.Label>
                  <div className="tp-date-wrap">
                    <Calendar size={18} className="tp-field-icon" />
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleModalChange}
                      required
                      className="tp-input tp-input-date"
                    />
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="tp-label">Amount</Form.Label>
                  <InputGroup className="tp-amount-group">
                    <InputGroup.Text className="tp-amount-prefix">
                      $
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="amount"
                      value={formData.amount}
                      onChange={handleModalChange}
                      required
                      placeholder="0.00"
                      className="tp-amount-input"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="tp-label">Transaction Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="note"
                    value={formData.note}
                    onChange={handleModalChange}
                    placeholder="Add note about this transaction..."
                    className="tp-input tp-textarea"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="tp-modal-footer border-0">
            <Button
              type="button"
              variant="light"
              onClick={() => setShowModal(false)}
              className="tp-btn-cancel"
            >
              Cancel
            </Button>

            <Button type="submit" className="tp-btn-save">
              Save Transaction
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default TransactionsPage;
