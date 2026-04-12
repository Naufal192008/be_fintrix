import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { transactionAPI, analyticsAPI, goalAPI } from "../../services/api.js";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Modal,
  Form,
  Button,
} from "react-bootstrap";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank,
  Tv,
  TrendingUp,
  ShoppingCart,
  Zap,
  Coffee,
  Home,
  Car,
  Smartphone,
  Plus,
  Target,
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "../../styles/dashboard.css";
import "../../styles/animations.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const DEFAULT_STATS = {
  totalBalance: 0,
  income: 0,
  expenses: 0,
  savingsGoal: 0,
};

const kategoriPengeluaran = [
  { nama: "Food", jumlah: 1200, warna: "#22c55e" },
  { nama: "Shopping", jumlah: 850, warna: "#0ea5e9" },
  { nama: "Transport", jumlah: 450, warna: "#f97316" },
  { nama: "Bills", jumlah: 680, warna: "#f43f5e" },
  { nama: "Entertainment", jumlah: 500, warna: "#a855f7" },
];

const kartuRingkasan = [
  {
    label: "Total Balance",
    labelId: "Total Saldo",
    key: "totalBalance",
    icon: Wallet,
    iconBg: "bg-primary-subtle",
    iconColor: "text-primary",
    badge: "+2.5%",
    badgeColor: "text-primary",
    isCurrency: true,
  },
  {
    label: "Monthly Income",
    labelId: "Pendapatan Bulanan",
    key: "monthlyIncome",
    icon: ArrowUpCircle,
    iconBg: "bg-success-subtle",
    iconColor: "text-success",
    badge: "+12%",
    badgeColor: "text-success",
    isCurrency: true,
  },
  {
    label: "Monthly Expenses",
    labelId: "Pengeluaran Bulanan",
    key: "monthlyExpenses",
    icon: ArrowDownCircle,
    iconBg: "bg-danger-subtle",
    iconColor: "text-danger",
    badge: "-3%",
    badgeColor: "text-danger",
    valueColor: "text-danger",
    isCurrency: true,
  },
  {
    label: "Savings Progress",
    labelId: "Progres Tabungan",
    key: "savingsPercent",
    icon: PiggyBank,
    iconBg: "bg-success-subtle",
    iconColor: "text-success",
    badge: "+5%",
    badgeColor: "text-success",
    suffix: "%",
  },
];

const ikonMap = {
  tv: Tv,
  trending: TrendingUp,
  cart: ShoppingCart,
  zap: Zap,
  coffee: Coffee,
  home: Home,
  car: Car,
  phone: Smartphone,
};

// eslint-disable-next-line no-unused-vars
function getTransactionIcon(namaIkon) {
  const Icon = ikonMap[namaIkon] || Wallet;
  return <Icon size={18} />;
}

function DashboardPage() {
  const { user, formatCurrency, t, convertMoney, getCurrencySymbol } = useAuth();

  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [stats, setStats]                   = useState(DEFAULT_STATS);
  // eslint-disable-next-line no-unused-vars
  const [statsLoading, setStatsLoading]     = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const [goals, setGoals] = useState([]);
  const [showAddSavingModal, setShowAddSavingModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [isSubmittingSaving, setIsSubmittingSaving] = useState(false);

  const [spendingCategories, setSpendingCategories] = useState(kategoriPengeluaran);
  const [chartHistory, setChartHistory] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    income: [0, 0, 0, 0, 0, 0],
    expenses: [0, 0, 0, 0, 0, 0]
  });

  const fetchAllData = async () => {
    setStatsLoading(true);
    try {
      const [summaryRes, txRes, goalRes, categoryRes] = await Promise.all([
        analyticsAPI.getSummary(),
        transactionAPI.getAll(),
        goalAPI.getAll(),
        analyticsAPI.getSpendingByCategory()
      ]);
      const goalsList = goalRes.data?.data || [];
      setGoals(goalsList);
      
      const activeGoal = goalsList.length > 0 ? goalsList[0] : null;
      if (activeGoal && !selectedGoalId) {
        setSelectedGoalId(activeGoal._id);
      } else if (!activeGoal && !selectedGoalId) {
        setSelectedGoalId("fallback_target");
      }

      const s = summaryRes.data?.data;
      if (s) {
        setStats({
          totalBalance: s.balance,
          income: s.totalIncome,
          expenses: s.totalExpense,
          savingsGoal: activeGoal ? Math.min(100, Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)) : 0,
        });
      }
      
      const txList = txRes.data?.data || [];
      setRecentTransactions(txList.slice(0, 7));

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const labels = [];
      const incomeData = [0, 0, 0, 0, 0, 0];
      const expensesData = [0, 0, 0, 0, 0, 0];

      for (let i = 5; i >= 0; i--) {
        let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(monthNames[d.getMonth()]);
      }
      
      txList.forEach(tx => {
        const txDate = new Date(tx.date);
        const diffMonths = (now.getFullYear() - txDate.getFullYear()) * 12 + (now.getMonth() - txDate.getMonth());
        if (diffMonths >= 0 && diffMonths <= 5) {
          const index = 5 - diffMonths;
          if (tx.type === 'income') incomeData[index] += tx.amount;
          if (tx.type === 'expense') expensesData[index] += tx.amount;
        }
      });
      setChartHistory({ labels, income: incomeData, expenses: expensesData });

      const catData = categoryRes.data?.data || [];
      const colors = ["#22c55e", "#0ea5e9", "#f97316", "#f43f5e", "#a855f7", "#eab308", "#64748b"];
      const formattedCat = catData.map((c, i) => ({
        nama: c.category,
        jumlah: c.total,
        warna: colors[i % colors.length]
      }));
      if (formattedCat.length > 0) {
        setSpendingCategories(formattedCat);
      } else {
        setSpendingCategories(kategoriPengeluaran);
      }
    } catch (error) { console.error(error); } finally {
      setStatsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAllData(); }, []);

  const handleAddSaving = async (e) => {
    e.preventDefault();
    if (!addAmount) return;
    setIsSubmittingSaving(true);
    try {
      let targetId = selectedGoalId;

      const presetGoals = {
        'preset_car': { title: "New Car", target: 20000 },
        'preset_vacation': { title: "Bali Vacation", target: 5000 },
        'preset_house': { title: "House Downpayment", target: 50000 },
        'preset_gadget': { title: "New Laptop/Phone", target: 2000 }
      };

      if (!targetId || presetGoals[targetId]) {
        const preset = presetGoals[targetId] || presetGoals['preset_car'];
        const createRes = await goalAPI.add({
          title: preset.title,
          targetAmount: preset.target,
          currentAmount: 0
        });
        targetId = createRes.data?.data?._id;
      }

      if (targetId) {
        const rate = convertMoney(1, user?.currency || 'USD');
        const amountInUSD = Number(addAmount) / rate;
        await goalAPI.updateProgress(targetId, amountInUSD);
      }

      setShowAddSavingModal(false);
      setAddAmount("");
      fetchAllData();
    } catch (err) { console.error(err);
      console.error("Gagal menambahkan saving:", err);
    } finally {
      setIsSubmittingSaving(false);
    }
  };

  const handleResetGoal = async () => {
    if (!window.confirm(t("Are you sure you want to reset this target to $0?", "Apakah Anda yakin ingin mengatur ulang target ini ke Rp0?"))) return;
    try {
      if (viewGoal && viewGoal._id) {
        await goalAPI.resetProgress(viewGoal._id);
        fetchAllData();
      }
    } catch (err) { console.error(err);
      console.error("Gagal me-reset saving:", err);
    }
  };

  const ringkasanKeuangan = {
    totalBalance:    stats.totalBalance   ?? 0,
    monthlyIncome:   stats.income         ?? 0,
    monthlyExpenses: stats.expenses       ?? 0,
    savingsPercent:  stats.savingsGoal    ?? 0,
  };

  const presetGoals = {
    'preset_car': { title: "New Car", currentAmount: 0, targetAmount: 20000 },
    'preset_vacation': { title: "Bali Vacation", currentAmount: 0, targetAmount: 5000 },
    'preset_house': { title: "House Downpayment", currentAmount: 0, targetAmount: 50000 },
    'preset_gadget': { title: "New Laptop/Phone", currentAmount: 0, targetAmount: 2000 },
  };

  const viewGoal = goals.find(g => g._id === selectedGoalId) || presetGoals[selectedGoalId] || goals[0] || presetGoals['preset_car'];
  const targetTabungan = {
    namaTarget: viewGoal.title,
    current: viewGoal.currentAmount || 0,
    goal: viewGoal.targetAmount || 20000,
  };

  const persen = Math.min(100, Math.round(
    (targetTabungan.current / targetTabungan.goal) * 100
  ) || 0);

  const rate = convertMoney(1, user?.currency || 'USD');
  const addAmountInUSD = Number(addAmount || 0) / rate;
  const newSavingAmount = targetTabungan.current + addAmountInUSD;

  const lineChartData = {
    labels: chartHistory.labels,
    datasets: [
      {
        label: t("Income", "Pemasukan"),
        data: chartHistory.income,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.08)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: t("Expenses", "Pengeluaran"),
        data: chartHistory.expenses,
        borderColor: "#f43f5e",
        backgroundColor: "rgba(244, 63, 94, 0.08)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { boxWidth: 12, usePointStyle: true, padding: 20 },
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => formatCurrency(v, { notation: 'compact' }) },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
    },
  };

  const donutChartData = {
    labels: spendingCategories.map((k) => k.nama),
    datasets: [
      {
        data: spendingCategories.map((k) => k.jumlah),
        backgroundColor: spendingCategories.map((k) => k.warna),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
    },
  };

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (persen / 100) * circumference;

  return (
    <div className="d-flex">
      <SidebarComponent
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        
        <TopNavbarComponent
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="dashboard-main p-3 p-md-4">
          <Container fluid>

            <Row className="g-3 g-md-4 mb-3">
              {kartuRingkasan.map((kartu, index) => {
                const IconComp = kartu.icon;
                const value = ringkasanKeuangan[kartu.key];
                return (
                  <Col lg={3} sm={6} xs={6} key={kartu.key}>
                    <Card
                      className={`summary-card shadow-sm border-0 card-hover card-hover-green anim-fade-up anim-d${index}`}
                    >
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="summary-label">{t(kartu.label, kartu.labelId)}</div>
                            <div className={`summary-value ${kartu.valueColor || ""}`}>
                              {kartu.isCurrency ? formatCurrency(value) : `${value}${kartu.suffix || ""}`}
                            </div>
                          </div>
                          
                          <div className={`summary-icon ${kartu.iconBg} ${kartu.iconColor}`}>
                            <IconComp size={20} />
                          </div>
                        </div>
                        {/* Badge persentase perubahan */}
                        <span className={`summary-pill ${kartu.badgeColor}`}>
                          {kartu.badge}
                        </span>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            <Row className="g-3 g-md-4">
              
              <Col lg={8}>
                <Card className="shadow-sm border-0 h-100 dashboard-card card-hover anim-fade-up anim-d4">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-1 fw-semibold">{t("Income vs Expenses", "Pemasukan vs Pengeluaran")}</h5>
                        <small className="text-muted">
                          {t("Last 6 months overview", "Ikhtisar 6 bulan terakhir")}
                        </small>
                      </div>
                    </div>
                    <div className="dashboard-chart-wrap" style={{ height: 280 }}>
                      <Line
                        data={lineChartData}
                        options={lineChartOptions}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="shadow-sm border-0 h-100 dashboard-card card-hover anim-fade-right anim-d5">
                  <Card.Body>
                    <h5 className="mb-1 fw-semibold">{t("Spending Categories", "Kategori Pengeluaran")}</h5>
                    <small className="text-muted">{t("This month breakdown", "Rincian bulan ini")}</small>
                    <div className="d-flex flex-column align-items-center mt-3">
                      <div className="dashboard-donut-wrap" style={{ width: 180, height: 180 }}>
                        <Doughnut
                          data={donutChartData}
                          options={donutChartOptions}
                        />
                      </div>
                      
                      <div className="mt-3 w-100 px-2">
                        {spendingCategories.map((kat) => (
                          <div
                            key={kat.nama}
                            className="d-flex justify-content-between align-items-center small mb-2"
                          >
                            <div className="d-flex align-items-center gap-2">
                              
                              <span
                                className="category-dot"
                                style={{ background: kat.warna }}
                              />
                              <span className="text-dark">{t(kat.nama, kat.namaId || kat.nama)}</span>
                            </div>
                            <span className="fw-medium">
                              {formatCurrency(kat.jumlah)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-3 g-md-4 mt-1">
              
              <Col lg={8}>
                <Card className="shadow-sm border-0 mb-4 dashboard-card card-hover anim-fade-up anim-d5">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-1 fw-semibold">{t("Recent Transactions", "Transaksi Terbaru")}</h5>
                        <small className="text-muted">
                          {t("Your latest financial activity", "Aktivitas keuangan terakhir Anda")}
                        </small>
                      </div>
                    </div>
                    {recentTransactions.length === 0 ? (
                      <div className="text-center text-muted py-4 small">
                        {t("No transactions yet.", "Belum ada transaksi.")} <a href="/transactions">{t("Add your first transaction →", "Tambah transaksi pertama Anda →")}</a>
                      </div>
                    ) : (
                    <Table hover responsive className="mb-0 align-middle">
                      <thead>
                        <tr>
                          <th className="text-uppercase small fw-semibold text-muted">{t("Date", "Tanggal")}</th>
                          <th className="text-uppercase small fw-semibold text-muted">{t("Transaction", "Transaksi")}</th>
                          <th className="text-uppercase small fw-semibold text-muted d-none d-md-table-cell">{t("Category", "Kategori")}</th>
                          <th className="text-end text-uppercase small fw-semibold text-muted">{t("Amount", "Jumlah")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map((trx) => (
                          <tr key={trx._id} className="transaction-row">
                            <td className="py-3 small text-muted">
                              {new Date(trx.date).toLocaleDateString(user?.language === 'id' ? 'id-ID' : 'en-US', { month: "short", day: "2-digit", year: "numeric" })}
                            </td>
                            <td className="py-3">
                              <div className="d-flex align-items-center">
                                <span className={`transaction-icon ${
                                  trx.type === "income"
                                    ? "bg-success bg-opacity-10 text-success"
                                    : "bg-secondary bg-opacity-10 text-secondary"
                                }`}>
                                  {trx.type === "income" ? <TrendingUp size={18} /> : <Wallet size={18} />}
                                </span>
                                <span className="fw-medium">{trx.title || trx.category}</span>
                              </div>
                            </td>
                            <td className="py-3 text-muted d-none d-md-table-cell">{trx.category}</td>
                            <td className={`py-3 text-end fw-semibold ${
                              trx.type === "income" ? "text-success" : "text-danger"
                            }`}>
                              <span style={{ marginRight: '2px' }}>{trx.type === "income" ? "+" : "-"}</span>{Math.abs(trx.amount) > 0 ? formatCurrency(Math.abs(trx.amount)) : formatCurrency(0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="shadow-sm border-0 h-100 dashboard-card card-hover anim-fade-right anim-d6">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div className="mb-3">
                      <h5 className="mb-1 fw-semibold">{t("Saving Goals", "Target Tabungan")}</h5>
                      <small className="text-muted">
                        {targetTabungan.namaTarget}
                      </small>
                    </div>

                    {/* Circular progress SVG */}
                    <div className="d-flex align-items-center justify-content-between mb-3 saving-goals-inner">
                      <div>
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="text-muted me-4">{t("Current", "Terkumpul")}</span>
                          <span className="fw-semibold text-success">
                            {formatCurrency(targetTabungan.current)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between small">
                          <span className="text-muted me-4">{t("Goal", "Target")}</span>
                          <span className="fw-semibold">
                            {formatCurrency(targetTabungan.goal)}
                          </span>
                        </div>
                      </div>

                      <div className="circular-progress">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="10"
                          />
                          
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            className="progress-circle"
                          />
                          
                          <text
                            x="60"
                            y="55"
                            textAnchor="middle"
                            className="progress-text"
                          >
                            {persen}%
                          </text>
                          <text
                            x="60"
                            y="72"
                            textAnchor="middle"
                            className="progress-subtext"
                          >
                            {t("Completed", "Selesai")}
                          </text>
                        </svg>
                      </div>
                    </div>

                    {persen >= 100 ? (
                      <button className="btn-add-savings border-0 text-white" style={{ backgroundColor: '#ef4444' }} onClick={handleResetGoal}>
                        {t("Reset Goal to $0", "Reset Target ke 0")}
                      </button>
                    ) : (
                      <button className="btn-add-savings" onClick={() => setShowAddSavingModal(true)}>
                        <Plus size={18} className="me-2" />
                        {t("Add to Savings", "Tambah Tabungan")}
                      </button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

          </Container>
        </main>
      </div>

      {/* Add Saving Modal */}
      <Modal show={showAddSavingModal} onHide={() => setShowAddSavingModal(false)} centered className="border-0 shadow-lg">
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <div>
            <Modal.Title className="fw-bold fs-4 text-dark headline" style={{ color: '#0f172a' }}>{t("Add Saving", "Tambah Tabungan")}</Modal.Title>
            <p className="text-muted mb-0 mt-1" style={{ fontSize: '15px' }}>{t("Contribute to your saving goal", "Berkontribusi pada target tabungan Anda")}</p>
          </div>
        </Modal.Header>
        <Modal.Body className="pt-4 pb-4 px-4">
          <Form onSubmit={handleAddSaving}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-muted mb-2" style={{ fontSize: '14px' }}>{t("Saving Goal", "Target Tabungan")} <span className="text-danger">*</span></Form.Label>
              <div className="position-relative">
                <Target size={18} className="position-absolute text-muted" style={{ top: "12px", left: "14px" }} />
                <Form.Select 
                  className="ps-5 py-2 rounded-3 border-light-subtle shadow-sm bg-body-tertiary shadow-none"
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  required
                  style={{ minHeight: '44px' }}
                >
                  {goals.map(g => (
                    <option key={g._id} value={g._id}>{g.title} ({formatCurrency(g.targetAmount)})</option>
                  ))}
                  <option disabled>─ {t("Create New Goal", "Buat Target Baru")} ─</option>
                  <option value="preset_car">{t("New Car", "Mobil Baru")} ({formatCurrency(20000)})</option>
                  <option value="preset_vacation">{t("Bali Vacation", "Liburan ke Bali")} ({formatCurrency(5000)})</option>
                  <option value="preset_house">{t("House Downpayment", "DP Rumah")} ({formatCurrency(50000)})</option>
                  <option value="preset_gadget">{t("New Laptop/Phone", "Laptop/HP Baru")} ({formatCurrency(2000)})</option>
                </Form.Select>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-muted mb-2" style={{ fontSize: '14px' }}>{t("Current Amount", "Jumlah Saat Ini")}</Form.Label>
              <div className="position-relative">
                <TrendingUp size={18} className="position-absolute text-success" style={{ top: "12px", left: "14px" }} />
                <Form.Control
                  type="text"
                  readOnly
                  className="ps-5 py-2 rounded-3 border-light-subtle shadow-sm bg-body-tertiary text-dark shadow-none"
                  value={`${formatCurrency(targetTabungan.current)} / ${formatCurrency(targetTabungan.goal)}`}
                  style={{ fontWeight: "600", minHeight: '44px' }}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold text-muted mb-2" style={{ fontSize: '14px' }}>{t("Add Amount", "Tambah Jumlah")} <span className="text-danger">*</span></Form.Label>
              <div className="position-relative">
                <span className="position-absolute text-muted" style={{ top: "10px", left: "16px", fontSize: "16px" }}>{getCurrencySymbol()}</span>
                <Form.Control
                  type="number"
                  className="ps-5 py-2 rounded-3 border-light-subtle shadow-sm shadow-none focus-ring"
                  placeholder="500"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  min="1"
                  required
                  style={{ minHeight: '44px' }}
                />
              </div>
            </Form.Group>
            
            <div className="mb-4 text-muted" style={{ fontSize: '15px' }}>
              {t("New amount will be", "Jumlah baru akan menjadi")} <span className="text-success fw-bold">{formatCurrency(newSavingAmount)}</span>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4 pt-2">
              <Button variant="light" className="px-4 py-2 rounded-pill bg-white border border-light-subtle shadow-sm fw-semibold text-dark" onClick={() => setShowAddSavingModal(false)} style={{ fontSize: '15px' }}>
                {t("Cancel", "Batal")}
              </Button>
              <Button type="submit" variant="success" className="px-4 py-2 rounded-pill shadow-sm fw-semibold" disabled={isSubmittingSaving} style={{ fontSize: '15px' }}>
                {isSubmittingSaving ? t("Saving...", "Menyimpan...") : t("Add Saving", "Tambah Tabungan")}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

    </div>
  );
}

export default DashboardPage;