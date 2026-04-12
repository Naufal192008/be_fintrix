import React, { useState, useEffect } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  BarChart, Bar,
  PieChart, Pie, Cell
} from "recharts";
import {
  ArrowUpRight, Utensils, Tv, Car, TrendingUp, TrendingDown,
  ShoppingCart, Zap, Package
} from "lucide-react";
import { analyticsAPI, aiAPI } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

import "../../styles/dashboard.css";
import "../../styles/analityc.css";
import "../../styles/animations.css";

const CATEGORY_COLORS = [
  "#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899",
];

const CATEGORY_ICONS = {
  "Food & Dining":    { icon: Utensils,     color: "#20c997", bg: "#e6fcf5" },
  "Groceries":        { icon: ShoppingCart,  color: "#22c55e", bg: "#f0fdf4" },
  "Transportation":   { icon: Car,           color: "#3b82f6", bg: "#eff6ff" },
  "Bills & Utilities":{ icon: Zap,           color: "#f59e0b", bg: "#fffbeb" },
  "Shopping":         { icon: ShoppingCart,  color: "#8b5cf6", bg: "#f5f3ff" },
  "Entertainment":    { icon: Tv,            color: "#ef4444", bg: "#fef2f2" },
};

function getCategoryMeta(name) {
  return CATEGORY_ICONS[name] || { icon: Package, color: "#64748b", bg: "#f1f5f9" };
}

function AnalyticsPage() {
  const { user, formatCurrency, t } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary]         = useState(null);
  const [categories, setCategories]   = useState([]);
  const [highest, setHighest]         = useState(null);
  const [monthly, setMonthly]         = useState(null);
  const [insights, setInsights]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, categoryRes, highestRes, monthlyRes] = await Promise.all([
          analyticsAPI.getSummary(),
          analyticsAPI.getSpendingByCategory(),
          analyticsAPI.getHighestCategory(),
          analyticsAPI.getMonthlyComparison(),
        ]);

        setSummary(summaryRes.data?.data || null);
        setHighest(highestRes.data?.data || null);
        setMonthly(monthlyRes.data?.data || null);

        const rawCategories = categoryRes.data?.data || [];
        const total = rawCategories.reduce((s, c) => s + c.total, 0);
        const mapped = rawCategories.map((item, idx) => ({
          name: item.category,
          value: item.total,
          color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
          percent: total > 0 ? `${Math.round((item.total / total) * 100)}%` : "0%",
        }));
        setCategories(mapped);

        try {
          const aiRes = await aiAPI.getInsights({
            balance: summaryRes.data?.data?.balance || 0,
            income: summaryRes.data?.data?.totalIncome || 0,
            expenses: summaryRes.data?.data?.totalExpense || 0,
            topCategory: highestRes.data?.data?.category || 'Lainnya',
            language: user?.language || 'en'
          });

          const processedInsights = (aiRes.data?.ai_response || []).map(item => {
            if (item.text.includes("{SURPLUS}") && item.value !== undefined) {
              return { ...item, text: item.text.replace("{SURPLUS}", formatCurrency(item.value)) };
            }
            return item;
          });
          
          setInsights(processedInsights);
        } catch (aiErr) {
          console.error("AI Error:", aiErr);
        }

      } catch (err) { console.error(err);
        setError("Gagal memuat data analitik.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryBarData = summary
    ? [{ name: t("This Month", "Bulan Ini"), income: summary.totalIncome, expense: summary.totalExpense }]
    : [];

  if (loading) {
    return (
      <div className="d-flex">
        <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="dashboard-layout flex-grow-1 d-flex flex-column">
          <TopNavbarComponent onToggleSidebar={() => setSidebarOpen((p) => !p)} />
          <main className="dashboard-main p-4 p-md-5 d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
            <div className="text-center">
              <Spinner animation="border" variant="success" style={{ width: 48, height: 48 }} />
              <p className="mt-3 text-muted">Loading analytics...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex bg-slate-50 min-vh-100">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="dashboard-main p-4 p-md-5">
          <Container fluid className="px-0">

            <div className="mb-4 anim-fade-up anim-d0">
              <h2 className="mb-1 fw-bold tp-title">{t("Analytics", "Analitik")}</h2>
              <p className="text-muted mb-0 tp-subtitle">{t("Analyze your financial habits and spending trends", "Analisis kebiasaan finansial dan tren pengeluaran Anda")}</p>
            </div>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            {/* Summary Cards */}
            {summary && (
              <Row className="g-3 mb-4">
                {[
                  { label: t("Total Income", "Total Pemasukan"),  value: formatCurrency(summary.totalIncome),  color: "text-success", bg: "bg-success bg-opacity-10", Icon: TrendingUp  },
                  { label: t("Total Expense", "Total Pengeluaran"), value: formatCurrency(summary.totalExpense), color: "text-danger",  bg: "bg-danger bg-opacity-10",  Icon: TrendingDown },
                  { label: t("Net Balance", "Saldo Bersih"),   value: formatCurrency(summary.balance),      color: summary.balance >= 0 ? "text-success" : "text-danger", bg: "bg-primary bg-opacity-10", Icon: TrendingUp },
                ].map((card, i) => (
                  <Col key={i} xs={12} md={4}>
                    <Card className={`border-0 shadow-sm rounded-4 an-card card-hover anim-fade-up anim-d${i + 1}`}>
                      <Card.Body className="p-4 d-flex align-items-center gap-3">
                        <div className={`p-3 rounded-3 ${card.bg}`}>
                          <card.Icon size={22} className={card.color} />
                        </div>
                        <div>
                          <p className="text-muted small mb-1">{card.label}</p>
                          <h4 className={`fw-bold mb-0 ${card.color}`}>{card.value}</h4>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            <Row className="g-4">
              {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
              <Col xl={8} lg={7} className="d-flex flex-column gap-4">

                {/* 1. Income vs Expense Bar Chart */}
                <Card className="border-0 shadow-sm rounded-4 an-card card-hover anim-fade-up anim-d1">
                  <Card.Body className="p-4 p-xl-4 pb-xl-3">
                    <h5 className="fw-bold an-card-title mb-1">{t("Income vs Expense", "Pemasukan vs Pengeluaran")}</h5>
                    <p className="text-muted small mb-4">{t("Your financial overview from transactions", "Ikhtisar keuangan Anda dari transaksi")}</p>
                    <div style={{ width: "100%", height: 260 }}>
                      {summaryBarData.length > 0 ? (
                        <ResponsiveContainer>
                          <BarChart data={summaryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                                formatter={(value) => [formatCurrency(value), ""]} 
                              />
                            <Bar dataKey="income"  fill="#22c55e" radius={[6,6,0,0]} maxBarSize={80} name={t("Income", "Pemasukan")} />
                            <Bar dataKey="expense" fill="#ef4444" radius={[6,6,0,0]} maxBarSize={80} name={t("Expense", "Pengeluaran")} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                          No transaction data yet. Add transactions to see chart!
                        </div>
                      )}
                    </div>
                    <div className="d-flex justify-content-center gap-4 mt-2 text-muted small fw-medium">
                      <div className="d-flex align-items-center gap-2"><span className="an-legend-dot bg-success" /> {t("Income", "Pemasukan")}</div>
                      <div className="d-flex align-items-center gap-2"><span className="an-legend-dot bg-danger"  /> {t("Expense", "Pengeluaran")}</div>
                    </div>
                  </Card.Body>
                </Card>

                {/* 2. Monthly Expense Statistics */}
                {monthly && (
                  <Card className="border-0 shadow-sm rounded-4 an-card card-hover anim-fade-up anim-d2">
                    <Card.Body className="p-4 p-xl-4 pb-xl-3">
                      <h5 className="fw-bold an-card-title mb-1">{t("Monthly Expense Statistics", "Statistik Pengeluaran Bulanan")}</h5>
                      <p className="text-muted small mb-4">{t("This month vs last month comparison", "Perbandingan bulan ini vs bulan lalu")}</p>
                      <div style={{ width: "100%", height: 180 }}>
                        <ResponsiveContainer>
                          <BarChart
                            data={[
                              { name: t("Last Month", "Bulan Lalu"), val: monthly.lastMonth },
                              { name: t("This Month", "Bulan Ini"), val: monthly.thisMonth },
                            ]}
                            margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                            <Tooltip
                              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                              formatter={(v) => [formatCurrency(v), t("Expense", "Pengeluaran")]}
                            />
                            <Bar dataKey="val" fill="#22c55e" radius={[4,4,0,0]} maxBarSize={60} name={t("Expense", "Pengeluaran")} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 d-flex justify-content-center">
                        <div className="an-trend-banner d-inline-flex align-items-center gap-2">
                          {monthly.changePct >= 0 ? (
                            <>
                              <ArrowUpRight size={16} className="text-danger" />
                              <span className="text-danger fw-bold small">{t("Spending increased", "Pengeluaran naik")} {monthly.changePct}%</span>
                              <span className="text-muted small">· {t("vs last month", "vs bulan lalu")}</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight size={16} className="text-success" style={{ transform: "rotate(90deg)" }} />
                              <span className="text-success fw-bold small">{t("Spending decreased", "Pengeluaran turun")} {Math.abs(monthly.changePct)}%</span>
                              <span className="text-muted small">· {t("vs last month", "vs bulan lalu")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* 3. Financial Insights */}
                <div className="mt-2 anim-fade-up anim-d3">
                  <h5 className="fw-bold an-card-title mb-1">{t("Financial Insights", "Wawasan Keuangan")}</h5>
                  <p className="text-muted small mb-3">{t("Smart recommendations based on your data", "Rekomendasi cerdas berdasarkan data Anda")}</p>
                  <Row className="g-3">
                    {insights.length > 0 ? (
                      insights.map((item, i) => {
                        let Icon = Package;
                        let cls = "insight-suggestion";
                        let iconCls = "text-primary";
                        if (item.type === "warning") { Icon = TrendingDown; cls = "insight-warning"; iconCls = "text-warning"; }
                        else if (item.type === "good") { Icon = TrendingUp; cls = "insight-good"; iconCls = "text-success"; }
                        else { Icon = Zap; }

                        return (
                          <Col key={i} md={4}>
                            <div className={`an-insight-box ${cls} d-flex align-items-start gap-3 h-100 card-hover-subtle anim-scale-in anim-d${i + 3}`}>
                              <div className={`an-insight-icon ${iconCls}`}><Icon size={18} /></div>
                              <p className="mb-0 small fw-medium text-dark">{item.text}</p>
                            </div>
                          </Col>
                        );
                      })
                    ) : (
                      <div className="text-muted small px-3">{t("Analyzing your financial data...", "Menganalisis data keuangan Anda...")}</div>
                    )}
                  </Row>
                  <div className="d-flex align-items-center gap-5 mt-4 mb-2 ps-3">
                  <div className="d-flex align-items-center flex-wrap gap-4 gap-md-5 mt-4 mb-2 ps-3">
                    <div className="d-flex align-items-center gap-2"><span className="an-legend-dot bg-warning" /><span className="small fw-bold text-dark">{t("Warning", "Peringatan")}</span></div>
                    <div className="d-flex align-items-center gap-2"><span className="an-legend-dot bg-success" /><span className="small fw-bold text-dark">{t("Good", "Bagus")}</span></div>
                    <div className="d-flex align-items-center gap-2"><span className="an-legend-dot bg-primary" /><span className="small fw-bold text-dark">{t("Suggestion", "Saran")}</span></div>
                  </div>
                  </div>
                </div>
              </Col>

              {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
              <Col xl={4} lg={5} className="d-flex flex-column gap-4">

                {/* 4. Spending by Category — Donut Chart */}
                <Card className="border-0 shadow-sm rounded-4 an-card card-hover anim-fade-right anim-d1">
                  <Card.Body className="p-4 p-xl-4 pb-4">
                    <h5 className="fw-bold an-card-title mb-1">{t("Spending by Category", "Pengeluaran per Kategori")}</h5>
                    <p className="text-muted small mb-0">{t("From your actual transactions", "Dari transaksi aktual Anda")}</p>

                    {categories.length > 0 ? (
                      <>
                        <div className="d-flex justify-content-center align-items-center mt-3 mb-2" style={{ height: 200 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categories}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                              >
                                {categories.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                formatter={(v) => [formatCurrency(v), ""]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="px-2">
                          {categories.map((item, idx) => (
                            <div key={idx} className="d-flex align-items-center justify-content-between mb-2 pb-1 small">
                              <div className="d-flex align-items-center gap-2" style={{ flex: "1 1 auto", minWidth: 0 }}>
                                <span className="an-legend-dot flex-shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-muted fw-medium text-truncate">{item.name}</span>
                              </div>
                              <div className="fw-bold text-dark text-end ms-2" style={{ width: "90px" }}>{formatCurrency(item.value)}</div>
                              <div className="text-muted text-end" style={{ width: "40px" }}>{item.percent}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 mt-3">
                        <div style={{ width: 120, height: 120, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                          <Package size={40} className="text-muted" />
                        </div>
                        <p className="text-muted small mb-1 fw-medium">{t("No expense data yet.", "Belum ada data pengeluaran.")}</p>
                        <p className="text-muted" style={{ fontSize: "0.78rem" }}>{t("Add expense transactions to see breakdown.", "Tambahkan transaksi pengeluaran untuk melihat rincian.")}</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* 5. Highest Spending Category */}
                <Card className="border-0 shadow-sm rounded-4 an-card card-hover anim-fade-right anim-d2">
                  <Card.Body className="p-4 p-xl-4">
                    <h5 className="fw-bold an-card-title mb-1">{t("Highest Spending Category", "Kategori Pengeluaran Terbesar")}</h5>
                    <p className="text-muted small mb-4">
                      {new Date().toLocaleString(user?.language === 'id' ? 'id-ID' : 'en-US', { month: "long", year: "numeric" })}
                    </p>

                    {highest ? (
                      <>
                        <div className="d-flex align-items-center gap-3 mb-4">
                          {(() => {
                            const meta = getCategoryMeta(highest.category);
                            const Icon = meta.icon;
                            return (
                              <div className="an-icon-box" style={{ background: meta.bg, color: meta.color }}>
                                <Icon size={24} />
                              </div>
                            );
                          })()}
                          <div>
                            <p className="text-muted small mb-0">{t("Category", "Kategori")}</p>
                            <h6 className="fw-bold mb-0">{highest.category}</h6>
                          </div>
                        </div>
                        <p className="text-muted small mb-1">{t("Total Spent", "Total Pengeluaran")}</p>
                        <h3 className="fw-bold text-danger mb-2">{formatCurrency(highest.total)}</h3>
                        <div className="d-flex align-items-center gap-1 small mt-2">
                          <ArrowUpRight size={16} strokeWidth={3} className="text-danger" />
                          <span className="text-muted ms-1">{t("Highest this month", "Terbesar bulan ini")}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-3 text-muted small">
                        <Package size={32} className="mb-2 text-muted" />
                        <p className="mb-0">{t("No expense data this month yet.", "Belum ada data pengeluaran bulan ini.")}</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* 6. Month Comparison */}
                <Card className="border-0 shadow-sm rounded-4 an-card card-hover anim-fade-right anim-d3">
                  <Card.Body className="p-4 p-xl-4">
                    <h5 className="fw-bold an-card-title mb-1">{t("Month Comparison", "Perbandingan Bulanan")}</h5>
                    <p className="text-muted small mb-4">{t("Spending overview", "Gambaran pengeluaran")}</p>

                    {monthly ? (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted small fw-medium">{t("This Month", "Bulan Ini")}</span>
                          <span className="fw-bold fs-5 text-dark">{formatCurrency(monthly.thisMonth)}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <span className="text-muted small fw-medium">{t("Last Month", "Bulan Lalu")}</span>
                          <span className="fw-bold fs-5 text-muted">{formatCurrency(monthly.lastMonth)}</span>
                        </div>
                        <hr className="text-muted opacity-25 my-4" />
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-dark small fw-bold">{t("Change", "Perubahan")}</span>
                          <div className="d-flex align-items-center gap-1">
                            <ArrowUpRight
                              size={16}
                              strokeWidth={3}
                              className={monthly.changePct >= 0 ? "text-danger" : "text-success"}
                              style={{ transform: monthly.changePct < 0 ? "rotate(90deg)" : "none" }}
                            />
                            <span className={`fw-bold fs-5 ${monthly.changePct >= 0 ? "text-danger" : "text-success"}`}>
                              {monthly.changePct >= 0 ? "+" : ""}{monthly.changePct}%
                            </span>
                          </div>
                        </div>
                        <p className="text-muted small mb-0">
                          {monthly.diff >= 0
                            ? t(`You spent ${formatCurrency(Math.abs(monthly.diff))} more this month`, `Anda belanja ${formatCurrency(Math.abs(monthly.diff))} lebih banyak bulan ini`)
                            : t(`You saved ${formatCurrency(Math.abs(monthly.diff))} compared to last month`, `Anda berhemat ${formatCurrency(Math.abs(monthly.diff))} dibanding bulan lalu`)}
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-3 text-muted small">No comparison data yet.</div>
                    )}
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
