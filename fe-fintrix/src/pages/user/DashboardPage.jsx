import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import "../../styles/dashboard.css";

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

// --- DATA DUMMY & CONFIG ---
const ringkasanKeuangan = {
  totalBalance: 24580,
  monthlyIncome: 8240,
  monthlyExpenses: 3680,
  savingsPercent: 68,
};

const daftarTransaksi = [
  { id: 1, nama: "Netflix Subscription", jumlah: 15.99, tipe: "expense", tanggal: "Mar 08, 2026", kategori: "Entertainment", ikon: "tv", status: "Completed" },
  { id: 2, nama: "Salary Payment", jumlah: 8240, tipe: "income", tanggal: "Mar 05, 2026", kategori: "Income", ikon: "trending", status: "Completed" },
  { id: 3, nama: "Grocery Store", jumlah: 127.5, tipe: "expense", tanggal: "Mar 04, 2026", kategori: "Food", ikon: "cart", status: "Completed" },
  { id: 4, nama: "Electric Bill", jumlah: 89, tipe: "expense", tanggal: "Mar 03, 2026", kategori: "Bills", ikon: "zap", status: "Pending" },
  { id: 5, nama: "Freelance Project", jumlah: 1200, tipe: "income", tanggal: "Mar 01, 2026", kategori: "Income", ikon: "trending", status: "Completed" },
];

const kategoriPengeluaran = [
  { nama: "Food", jumlah: 1200, warna: "#22c55e" },
  { nama: "Shopping", jumlah: 850, warna: "#0ea5e9" },
  { nama: "Transport", jumlah: 450, warna: "#f97316" },
  { nama: "Bills", jumlah: 680, warna: "#f43f5e" },
  { nama: "Entertainment", jumlah: 500, warna: "#a855f7" },
];

const targetTabungan = { namaTarget: "Emergency fund target", current: 6800, goal: 10000 };

const kartuRingkasan = [
  { label: "Total Balance", key: "totalBalance", icon: Wallet, iconBg: "bg-success-subtle", iconColor: "text-success", badge: "+12%", badgeColor: "text-success", prefix: "$" },
  { label: "Monthly Income", key: "monthlyIncome", icon: ArrowUpCircle, iconBg: "bg-primary-subtle", iconColor: "text-primary", badge: "+8%", badgeColor: "text-success", prefix: "$" },
  { label: "Monthly Expenses", key: "monthlyExpenses", icon: ArrowDownCircle, iconBg: "bg-danger-subtle", iconColor: "text-danger", badge: "-3%", badgeColor: "text-danger", prefix: "$", valueColor: "text-danger" },
  { label: "Savings Progress", key: "savingsPercent", icon: PiggyBank, iconBg: "bg-success-subtle", iconColor: "text-success", badge: "+5%", badgeColor: "text-success", suffix: "%" },
];

const ikonMap = { tv: Tv, trending: TrendingUp, cart: ShoppingCart, zap: Zap, coffee: Coffee, home: Home, car: Car, phone: Smartphone };

function getTransactionIcon(namaIkon) {
  const Icon = ikonMap[namaIkon] || Wallet;
  return <Icon size={18} />;
}

function formatUang(angka) {
  return angka.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- KOMPONEN UTAMA ---
function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 1. Logika Proteksi Halaman (Google Auth)
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get("http://localhost:5050/api/auth/login/success", {
          withCredentials: true, 
        });
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        navigate("/login");
      }
    };
    checkLogin();
  }, [navigate]);

  // 2. Konfigurasi Grafik
  const persen = Math.round((targetTabungan.current / targetTabungan.goal) * 100);
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      { label: "Income", data: [7500, 7800, 7600, 8200, 8100, 8240], borderColor: "#22c55e", backgroundColor: "rgba(34, 197, 94, 0.08)", tension: 0.4, fill: true },
      { label: "Expenses", data: [4200, 3900, 4500, 3800, 4100, 3680], borderColor: "#f43f5e", backgroundColor: "rgba(244, 63, 94, 0.08)", tension: 0.4, fill: true },
    ],
  };

  const donutChartData = {
    labels: kategoriPengeluaran.map((k) => k.nama),
    datasets: [{ data: kategoriPengeluaran.map((k) => k.jumlah), backgroundColor: kategoriPengeluaran.map((k) => k.warna), borderWidth: 0 }],
  };

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (persen / 100) * circumference;

  if (!user) return <div className="text-center mt-5">Loading Dashboard...</div>;

  return (
    <div className="d-flex">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="dashboard-main p-3 p-md-4">
          <Container fluid>
            {/* Header */}
            <div className="mb-4">
              <h3 className="fw-bold">Selamat Datang, {user.displayName || "User"}! 👋</h3>
              <p className="text-muted">Ini ringkasan keuangan Fintrix kamu hari ini.</p>
            </div>

            {/* BARIS 1: Summary Cards */}
            <Row className="g-3 g-md-4 mb-3">
              {kartuRingkasan.map((kartu, index) => {
                const IconComp = kartu.icon;
                const value = ringkasanKeuangan[kartu.key];
                return (
                  <Col lg={3} sm={6} xs={6} key={index}>
                    <Card className="summary-card shadow-sm border-0">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="summary-label">{kartu.label}</div>
                            <div className={`summary-value ${kartu.valueColor || ""}`}>
                              {kartu.prefix || ""}{value.toLocaleString()}{kartu.suffix || ""}
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

            {/* BARIS 2: Charts */}
            <Row className="g-3 g-md-4">
              <Col lg={8}>
                <Card className="shadow-sm border-0 h-100 dashboard-card">
                  <Card.Body>
                    <h5 className="fw-semibold">Income vs Expenses</h5>
                    <div style={{ height: 280 }}>
                      <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="shadow-sm border-0 h-100 dashboard-card">
                  <Card.Body>
                    <h5 className="fw-semibold">Spending Breakdown</h5>
                    <div className="d-flex flex-column align-items-center mt-3">
                      <div style={{ width: 180, height: 180 }}>
                        <Doughnut data={donutChartData} options={{ cutout: "70%" }} />
                      </div>
                      <div className="mt-3 w-100 px-2">
                        {kategoriPengeluaran.map((kat) => (
                          <div key={kat.nama} className="d-flex justify-content-between small mb-2">
                            <span><span className="category-dot" style={{ background: kat.warna }} /> {kat.nama}</span>
                            <span className="fw-medium">${kat.jumlah}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* BARIS 3: Transactions & Goals */}
            <Row className="g-3 g-md-4 mt-1">
              <Col lg={8}>
                <Card className="shadow-sm border-0 dashboard-card">
                  <Card.Body>
                    <h5 className="fw-semibold mb-3">Recent Transactions</h5>
                    <Table hover responsive className="align-middle">
                      <thead>
                        <tr>
                          <th className="small text-muted">DATE</th>
                          <th className="small text-muted">TRANSACTION</th>
                          <th className="text-end small text-muted">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daftarTransaksi.map((trx) => (
                          <tr key={trx.id}>
                            <td className="small text-muted">{trx.tanggal}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="transaction-icon bg-light me-2">{getTransactionIcon(trx.ikon)}</span>
                                <span className="fw-medium">{trx.nama}</span>
                              </div>
                            </td>
                            <td className={`text-end fw-semibold ${trx.tipe === "income" ? "text-success" : "text-danger"}`}>
                              {trx.tipe === "income" ? "+" : "-"}${formatUang(trx.jumlah)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="shadow-sm border-0 h-100 dashboard-card">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <h5 className="fw-semibold">Saving Goals</h5>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="circular-progress">
                        <svg width="120" height="120">
                          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                          <circle cx="60" cy="60" r={radius} fill="none" stroke="#22c55e" strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={strokeOffset} strokeLinecap="round" />
                          <text x="60" y="65" textAnchor="middle" className="progress-text" style={{ fontSize: '20px', fontWeight: 'bold' }}>{persen}%</text>
                        </svg>
                      </div>
                      <div className="text-end">
                        <div className="small text-muted">Target</div>
                        <div className="fw-bold text-success">${targetTabungan.goal.toLocaleString()}</div>
                      </div>
                    </div>
                    <button className="btn-add-savings mt-3">
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