import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { transactionAPI, analyticsAPI } from "../../services/api.js";
import axios from "axios"; // Tambahkan axios untuk nembak route baru
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner
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

// Daftarin plugin Chart.js
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

// Data target tabungan (Sementara statis sampai modul Goal di BE selesai)
const targetTabungan = {
  namaTarget: "Emergency fund target",
  current: 6800,
  goal: 10000,
};

// Palette warna dinamis untuk kategori pengeluaran
const COLOR_PALETTE = ["#22c55e", "#0ea5e9", "#f97316", "#f43f5e", "#a855f7", "#eab308"];

function DashboardPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // States untuk menyimpan data dari API
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [kategoriPengeluaran, setKategoriPengeluaran] = useState([]);

  // Konfigurasi Axios Base URL (Sesuaikan dengan port BE kamu)
  const apiURL = "http://localhost:5050/api";

  // Ambil data dari API secara serentak
  useEffect(() => {
    const fetchAllData = async () => {
      setStatsLoading(true);
      try {
        const [summaryRes, txRes, catRes] = await Promise.all([
          axios.get(`${apiURL}/analytics/summary`, { withCredentials: true }),
          axios.get(`${apiURL}/transactions`, { withCredentials: true }),
          axios.get(`${apiURL}/analytics/category`, { withCredentials: true })
        ]);

        // 1. Set Data Summary (Cards)
        const s = summaryRes.data?.data;
        if (s) {
          setStats({
            totalBalance: s.balance,
            income: s.totalIncome,
            expenses: s.totalExpense,
            savingsGoal: 68, // Hardcode progress sementara untuk animasi SVG
          });
        }

        // 2. Set Data Transaksi (Ambil 7 terbaru)
        const txList = txRes.data?.data || [];
        setRecentTransactions(txList.slice(0, 7));

        // 3. Set Data Kategori (Pie Chart)
        const categoriesData = catRes.data?.data || [];
        const formattedCategories = categoriesData.map((item, index) => ({
          nama: item.category,
          jumlah: item.total,
          warna: COLOR_PALETTE[index % COLOR_PALETTE.length]
        }));
        setKategoriPengeluaran(formattedCategories);

      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const kartuRingkasan = [
    { label: "Total Balance", key: "totalBalance", icon: Wallet, iconBg: "bg-success-subtle", iconColor: "text-success", badge: "Live", badgeColor: "text-success", prefix: "$" },
    { label: "Monthly Income", key: "income", icon: ArrowUpCircle, iconBg: "bg-primary-subtle", iconColor: "text-primary", badge: "Live", badgeColor: "text-success", prefix: "$" },
    { label: "Monthly Expenses", key: "expenses", icon: ArrowDownCircle, iconBg: "bg-danger-subtle", iconColor: "text-danger", badge: "Live", badgeColor: "text-danger", prefix: "$", valueColor: "text-danger" },
    { label: "Savings Progress", key: "savingsGoal", icon: PiggyBank, iconBg: "bg-success-subtle", iconColor: "text-success", badge: "Target", badgeColor: "text-success", suffix: "%" },
  ];

  const persen = Math.round((targetTabungan.current / targetTabungan.goal) * 100);

  // -- Config chart: Income vs Expenses (Line Chart) --
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Current"],
    datasets: [
      {
        label: "Income",
        // Bulan Jan-May pakai dummy, Current bulan ngambil dari API
        data: [7500, 7800, 7600, 8200, 8100, stats.income],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.08)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: "Expenses",
        data: [4200, 3900, 4500, 3800, 4100, stats.expenses],
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
      legend: { display: true, position: "bottom", labels: { boxWidth: 12, usePointStyle: true, padding: 20 } },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => `$${v.toLocaleString()}` },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
    },
  };

  // -- Config chart: Spending Categories (Doughnut Chart) --
  const donutChartData = {
    labels: kategoriPengeluaran.map((k) => k.nama),
    datasets: [
      {
        data: kategoriPengeluaran.map((k) => k.jumlah),
        backgroundColor: kategoriPengeluaran.map((k) => k.warna),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: { legend: { display: false } },
  };

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (persen / 100) * circumference;

  if (statsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 w-100">
        <Spinner animation="grow" variant="success" />
      </div>
    );
  }

  return (
    <div className="d-flex">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="dashboard-main p-3 p-md-4">
          <Container fluid>
            
            <Row className="g-3 g-md-4 mb-3">
              {kartuRingkasan.map((kartu, index) => {
                const IconComp = kartu.icon;
                const value = stats[kartu.key];
                return (
                  <Col lg={3} sm={6} xs={6} key={kartu.key}>
                    <Card className={`summary-card shadow-sm border-0 card-hover card-hover-green anim-fade-up anim-d${index}`}>
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="summary-label">{kartu.label}</div>
                            <div className={`summary-value ${kartu.valueColor || ""}`}>
                              {kartu.prefix || ""}
                              {value.toLocaleString("en-US")}
                              {kartu.suffix || ""}
                            </div>
                          </div>
                          <div className={`summary-icon ${kartu.iconBg} ${kartu.iconColor}`}>
                            <IconComp size={20} />
                          </div>
                        </div>
                        <span className={`summary-pill ${kartu.badgeColor}`}>{kartu.badge}</span>
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
                        <h5 className="mb-1 fw-semibold">Income vs Expenses</h5>
                        <small className="text-muted">Last 6 months overview</small>
                      </div>
                    </div>
                    <div className="dashboard-chart-wrap" style={{ height: 280 }}>
                      <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="shadow-sm border-0 h-100 dashboard-card card-hover anim-fade-right anim-d5">
                  <Card.Body>
                    <h5 className="mb-1 fw-semibold">Spending Categories</h5>
                    <small className="text-muted">This month breakdown</small>
                    <div className="d-flex flex-column align-items-center mt-3">
                      
                      {kategoriPengeluaran.length > 0 ? (
                        <>
                          <div className="dashboard-donut-wrap" style={{ width: 180, height: 180 }}>
                            <Doughnut data={donutChartData} options={donutChartOptions} />
                          </div>
                          <div className="mt-3 w-100 px-2">
                            {kategoriPengeluaran.map((kat) => (
                              <div key={kat.nama} className="d-flex justify-content-between align-items-center small mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <span className="category-dot" style={{ background: kat.warna }} />
                                  <span className="text-dark fw-medium">{kat.nama}</span>
                                </div>
                                <span className="fw-bold">${kat.jumlah.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-muted small mt-5 text-center">
                          Belum ada pengeluaran bulan ini.<br/>Yuk, catat transaksimu!
                        </div>
                      )}
                      
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-3 g-md-4 mt-1">
              <Col lg={8}>
                <Card className="shadow-sm border-0 mb-4 dashboard-card card-hover anim-fade-up anim-d5">
                  <Card.Body>
                    <div className="mb-3">
                      <h5 className="mb-1 fw-semibold">Recent Transactions</h5>
                      <small className="text-muted">Your latest financial activity</small>
                    </div>
                    
                    {recentTransactions.length === 0 ? (
                      <div className="text-center text-muted py-4 small">
                        No transactions yet. <a href="/transactions" className="fw-bold text-success">Add your first transaction →</a>
                      </div>
                    ) : (
                      <Table hover responsive className="mb-0 align-middle">
                        <thead>
                          <tr>
                            <th className="text-uppercase small fw-semibold text-muted">Date</th>
                            <th className="text-uppercase small fw-semibold text-muted">Transaction</th>
                            <th className="text-uppercase small fw-semibold text-muted d-none d-md-table-cell">Category</th>
                            <th className="text-end text-uppercase small fw-semibold text-muted">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTransactions.map((trx) => (
                            <tr key={trx._id} className="transaction-row">
                              <td className="py-3 small text-muted">
                                {new Date(trx.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                              </td>
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <span className={`transaction-icon ${trx.type === "income" ? "bg-success bg-opacity-10 text-success" : "bg-danger bg-opacity-10 text-danger"}`}>
                                    {trx.type === "income" ? <TrendingUp size={18} /> : <Wallet size={18} />}
                                  </span>
                                  <span className="fw-medium">{trx.title || trx.category}</span>
                                </div>
                              </td>
                              <td className="py-3 text-muted d-none d-md-table-cell">{trx.category}</td>
                              <td className={`py-3 text-end fw-semibold ${trx.type === "income" ? "text-success" : "text-danger"}`}>
                                {trx.type === "income" ? "+" : "-"}${trx.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      <h5 className="mb-1 fw-semibold">Saving Goals</h5>
                      <small className="text-muted">{targetTabungan.namaTarget}</small>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-3 saving-goals-inner">
                      <div>
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="text-muted me-4">Current</span>
                          <span className="fw-semibold text-success">${targetTabungan.current.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between small">
                          <span className="text-muted me-4">Goal</span>
                          <span className="fw-semibold">${targetTabungan.goal.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="circular-progress">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                          <circle cx="60" cy="60" r={radius} fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeOffset} className="progress-circle" />
                          <text x="60" y="55" textAnchor="middle" className="progress-text fw-bold" fill="#1e293b" style={{fontSize: '1.2rem'}}>{persen}%</text>
                          <text x="60" y="75" textAnchor="middle" className="progress-subtext small text-muted">Completed</text>
                        </svg>
                      </div>
                    </div>

                    <button 
                      className="btn w-100 fw-bold d-flex align-items-center justify-content-center" 
                      style={{ backgroundColor: "#22c55e", color: "white", padding: "10px" }}
                      onClick={() => alert("Yeay! Fitur tabungan segera tersambung.")}
                    >
                      <Plus size={18} className="me-2" /> Add to Savings
                    </button>
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

export default DashboardPage;