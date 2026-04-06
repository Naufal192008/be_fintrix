import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { transactionAPI, analyticsAPI } from "../../services/api.js";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
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

// Daftarin plugin Chart.js yang dipakai di halaman ini
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

// Data pengeluaran per kategori (buat chart donut)
const kategoriPengeluaran = [
  { nama: "Food", jumlah: 1200, warna: "#22c55e" },
  { nama: "Shopping", jumlah: 850, warna: "#0ea5e9" },
  { nama: "Transport", jumlah: 450, warna: "#f97316" },
  { nama: "Bills", jumlah: 680, warna: "#f43f5e" },
  { nama: "Entertainment", jumlah: 500, warna: "#a855f7" },
];

// Data target tabungan
const targetTabungan = {
  namaTarget: "Emergency fund target",
  current: 6800,
  goal: 10000,
};

// ==========================================
// Konfigurasi 4 kartu ringkasan di atas
// Tiap kartu punya: label, key data, icon, warna
// ==========================================
const kartuRingkasan = [
  {
    label: "Total Balance",
    key: "totalBalance",
    icon: Wallet,
    iconBg: "bg-success-subtle",
    iconColor: "text-success",
    badge: "+12%",
    badgeColor: "text-success",
    prefix: "$",
  },
  {
    label: "Monthly Income",
    key: "monthlyIncome",
    icon: ArrowUpCircle,
    iconBg: "bg-primary-subtle",
    iconColor: "text-primary",
    badge: "+8%",
    badgeColor: "text-success",
    prefix: "$",
  },
  {
    label: "Monthly Expenses",
    key: "monthlyExpenses",
    icon: ArrowDownCircle,
    iconBg: "bg-danger-subtle",
    iconColor: "text-danger",
    badge: "-3%",
    badgeColor: "text-danger",
    prefix: "$",
    valueColor: "text-danger",
  },
  {
    label: "Savings Progress",
    key: "savingsPercent",
    icon: PiggyBank,
    iconBg: "bg-success-subtle",
    iconColor: "text-success",
    badge: "+5%",
    badgeColor: "text-success",
    suffix: "%",
  },
];

// ==========================================
// FUNGSI PEMBANTU
// ==========================================

// Mapping ikon transaksi — ambil komponen icon sesuai nama ikon
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

// Fungsi untuk render ikon transaksi
function getTransactionIcon(namaIkon) {
  const Icon = ikonMap[namaIkon] || Wallet;
  return <Icon size={18} />;
}

// Fungsi format angka jadi format dolar (contoh: 8240 -> "8,240.00")
function formatUang(angka) {
  return angka.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ==========================================
// KOMPONEN UTAMA: DashboardPage
// ==========================================
function DashboardPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [stats, setStats]                   = useState(DEFAULT_STATS);
  const [statsLoading, setStatsLoading]     = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Ambil data dari API saat komponen mount
  useEffect(() => {
    const fetchAll = async () => {
      setStatsLoading(true);
      try {
        const [summaryRes, txRes] = await Promise.all([
          analyticsAPI.getSummary(),
          transactionAPI.getAll(),
        ]);
        const s = summaryRes.data?.data;
        if (s) {
          setStats({
            totalBalance: s.balance,
            income: s.totalIncome,
            expenses: s.totalExpense,
            savingsGoal: 0,
          });
        }
        // Ambil 7 transaksi terbaru
        const txList = txRes.data?.data || [];
        setRecentTransactions(txList.slice(0, 7));
      } catch {
        // gagal fetch — pakai default state
      } finally {
        setStatsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Mapping data API ke format ringkasanKeuangan
  const ringkasanKeuangan = {
    totalBalance:    stats.totalBalance   ?? 0,
    monthlyIncome:   stats.income         ?? 0,
    monthlyExpenses: stats.expenses       ?? 0,
    savingsPercent:  stats.savingsGoal    ?? 0,
  };

  // Hitung persentase tabungan (dari target lokal)
  const persen = Math.round(
    (targetTabungan.current / targetTabungan.goal) * 100
  );

  // -- Config chart: Income vs Expenses (Line Chart) --
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Income",
        data: [7500, 7800, 7600, 8200, 8100, ringkasanKeuangan.monthlyIncome],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.08)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: "Expenses",
        data: [4200, 3900, 4500, 3800, 4100, ringkasanKeuangan.monthlyExpenses],
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
    plugins: {
      legend: { display: false },
    },
  };

  // SVG lingkaran progress untuk Saving Goals
  // Rumus: circumference = 2 * PI * radius
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (persen / 100) * circumference;

  return (
    <div className="d-flex">
      {/* Sidebar: terima props isOpen dan onClose */}
      <SidebarComponent
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        {/* Top navbar: terima props onToggleSidebar */}
        <TopNavbarComponent
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="dashboard-main p-3 p-md-4">
          <Container fluid>

            {/* ====================================
                BARIS 1: 4 Kartu Ringkasan Keuangan
                ==================================== */}
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
                            <div className="summary-label">{kartu.label}</div>
                            <div className={`summary-value ${kartu.valueColor || ""}`}>
                              {kartu.prefix || ""}
                              {kartu.suffix
                                ? value
                                : value.toLocaleString("en-US")}
                              {kartu.suffix || ""}
                            </div>
                          </div>
                          {/* Ikon di sudut kanan atas */}
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

            {/* ====================================
                BARIS 2: Chart Income vs Expenses + Donut
                ==================================== */}
            <Row className="g-3 g-md-4">
              {/* Chart garis: Income vs Expenses */}
              <Col lg={8}>
                <Card className="shadow-sm border-0 h-100 dashboard-card card-hover anim-fade-up anim-d4">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-1 fw-semibold">Income vs Expenses</h5>
                        <small className="text-muted">
                          Last 6 months overview
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

              {/* Chart donut: Spending Categories */}
              <Col lg={4}>
                <Card className="shadow-sm border-0 h-100 dashboard-card card-hover anim-fade-right anim-d5">
                  <Card.Body>
                    <h5 className="mb-1 fw-semibold">Spending Categories</h5>
                    <small className="text-muted">This month breakdown</small>
                    <div className="d-flex flex-column align-items-center mt-3">
                      <div className="dashboard-donut-wrap" style={{ width: 180, height: 180 }}>
                        <Doughnut
                          data={donutChartData}
                          options={donutChartOptions}
                        />
                      </div>
                      {/* Legend manual - daftar kategori + jumlah */}
                      <div className="mt-3 w-100 px-2">
                        {kategoriPengeluaran.map((kat) => (
                          <div
                            key={kat.nama}
                            className="d-flex justify-content-between align-items-center small mb-2"
                          >
                            <div className="d-flex align-items-center gap-2">
                              {/* Titik warna kategori */}
                              <span
                                className="category-dot"
                                style={{ background: kat.warna }}
                              />
                              <span className="text-dark">{kat.nama}</span>
                            </div>
                            <span className="fw-medium">
                              ${kat.jumlah.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* ====================================
                BARIS 3: Tabel Transaksi + Saving Goals
                ==================================== */}
            <Row className="g-3 g-md-4 mt-1">
              {/* Tabel transaksi terbaru dari API */}
              <Col lg={8}>
                <Card className="shadow-sm border-0 mb-4 dashboard-card card-hover anim-fade-up anim-d5">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-1 fw-semibold">Recent Transactions</h5>
                        <small className="text-muted">
                          Your latest financial activity
                        </small>
                      </div>
                    </div>
                    {recentTransactions.length === 0 ? (
                      <div className="text-center text-muted py-4 small">
                        No transactions yet. <a href="/transactions">Add your first transaction →</a>
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
                              {trx.type === "income" ? "+" : "-"}${formatUang(trx.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Kartu Saving Goals */}
              <Col lg={4}>
                <Card className="shadow-sm border-0 h-100 dashboard-card card-hover anim-fade-right anim-d6">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div className="mb-3">
                      <h5 className="mb-1 fw-semibold">Saving Goals</h5>
                      <small className="text-muted">
                        {targetTabungan.namaTarget}
                      </small>
                    </div>

                    {/* Circular progress SVG */}
                    <div className="d-flex align-items-center justify-content-between mb-3 saving-goals-inner">
                      <div>
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="text-muted me-4">Current</span>
                          <span className="fw-semibold text-success">
                            ${targetTabungan.current.toLocaleString()}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between small">
                          <span className="text-muted me-4">Goal</span>
                          <span className="fw-semibold">
                            ${targetTabungan.goal.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* SVG circular progress bar */}
                      <div className="circular-progress">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          {/* Lingkaran background (abu-abu) */}
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="10"
                          />
                          {/* Lingkaran progress (hijau) */}
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
                          {/* Teks persentase di tengah */}
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
                            Completed
                          </text>
                        </svg>
                      </div>
                    </div>

                    {/* Tombol tambah tabungan */}
                    <button className="btn-add-savings">
                      <Plus size={18} className="me-2" />
                      Add to Savings
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