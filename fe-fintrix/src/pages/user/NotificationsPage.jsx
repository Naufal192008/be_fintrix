import React, { useState } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { Filter, Inbox, AlertTriangle, DollarSign, Clock, TrendingUp, Check, X, CalendarClock } from "lucide-react";
import { notificationAPI } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/NotificationsPage.css";
import "../../styles/animations.css";

const typeStyles = {
  budget:      { icon: AlertTriangle, bg: "#fff4db", color: "#f59f00" },
  transaction: { icon: DollarSign,   bg: "#e7f5ff", color: "#339af0" },
  reminder:    { icon: Clock,         bg: "#f3e8ff", color: "#845ef7" },
  investment:  { icon: TrendingUp,    bg: "#ebfbee", color: "#40c057" },
  bill:        { icon: CalendarClock, bg: "#ffe8e6", color: "#ff6b6b" },
};

const getTypeStyle = (type) => typeStyles[type] || { icon: Inbox, bg: "#f1f3f5", color: "#868e96" };

const formatTime = (dateString, lang) => {
  const tTime = (en, id) => lang === 'id' ? id : en;
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return tTime("Just now", "Baru saja");
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${tTime("minutes ago", "menit yang lalu")}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${tTime("hours ago", "jam yang lalu")}`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ${tTime("days ago", "hari yang lalu")}`;
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US');
  } catch (err) { console.error(err);
    return tTime("Just now", "Baru saja");
  }
};

function NotificationsPage() {
  const { user, formatCurrency, t } = useAuth();

  const localizeNotif = (notif) => {
    let title = notif.title;
    let message = notif.message;

    if (title === "Savings goal updated!") title = t("Savings goal updated!", "Target tabungan diperbarui!");
    if (title === "Investment portfolio updated") title = t("Investment portfolio updated", "Portofolio investasi diperbarui");
    if (title.toLowerCase().includes("budget alert")) {
      title = title.replace(/budget alert/i, t("budget alert", "peringatan anggaran"));
    }

    const currencyRegex = /\$(\d+(?:\.\d+)?)/g;
    message = message.replace(currencyRegex, (match, amount) => {
      return formatCurrency(parseFloat(amount));
    });

    if (user?.language === 'id') {
      message = message.replace("You successfully added", "Anda berhasil menambahkan")
                        .replace("to your", "ke")
                        .replace("target goal. Keep it up!", "target Anda. Ayo semangat!")
                        .replace("Your new investment", "Investasi baru Anda")
                        .replace("was added with an initial amount of", "telah ditambahkan dengan jumlah awal")
                        .replace("You've spent on", "Anda baru saja belanja di")
                        .replace("just now. Monitor your spending carefully.", "baru saja. Pantau pengeluaran Anda dengan hati-hati.");
    }

    return { ...notif, title, message };
  };
  
  const filterButtons = [
    { label: t("All", "Semua"),            tag: "All",          icon: Inbox },
    { label: t("Budget Alerts", "Peringatan Anggaran"),  tag: "Budget Alert", icon: AlertTriangle },
    { label: t("Transactions", "Transaksi"),   tag: "Transaction",  icon: DollarSign },
    { label: t("Reminders", "Pengingat"),      tag: "Reminder",     icon: Clock },
    { label: t("Investments", "Investasi"),    tag: "Investment",   icon: TrendingUp },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [settings, setSettings] = useState({ budget: true, transaction: true, daily: true, investment: true, bill: true });

  const fetchNotifs = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data?.data || []);
    } catch (err) { console.error(err);
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err);
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err);
      console.error(err);
    }
  };

  const clearAll = () => setNotifications([]); 

  const filtered = notifications.filter(n => activeFilter === "All" || n.tag === activeFilter);

  const settingRows = [
    { key: "budget",      icon: AlertTriangle, color: "#f59f00", title: t("Budget Alerts", "Peringatan Anggaran"),           subtitle: t("Get notified about budget limits", "Dapatkan notifikasi tentang batas anggaran") },
    { key: "transaction", icon: DollarSign,   color: "#339af0", title: t("Large Transaction Alerts", "Transaksi Besar"), subtitle: t(`Alert for transactions over $100`, `Peringatan untuk transaksi di atas ${formatCurrency(100)}`) },
    { key: "daily",       icon: Clock,         color: "#845ef7", title: t("Daily Expense Reminder", "Pengingat Harian"),   subtitle: t("Daily reminder to log expenses", "Pengingat harian untuk mencatat pengeluaran") },
    { key: "investment",  icon: TrendingUp,    color: "#40c057", title: t("Investment Updates", "Pembaruan Investasi"),       subtitle: t("Portfolio performance alerts", "Peringatan kinerja portofolio") },
    { key: "bill",        icon: CalendarClock, color: "#ff6b6b", title: t("Bill Reminders", "Pengingat Tagihan"),           subtitle: t("Upcoming bill payment alerts", "Peringatan pembayaran tagihan mendatang") },
  ];

  return (
    <div className="d-flex notif-page">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout notif-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

        <main className="dashboard-main p-4 p-md-5">
          <Container fluid className="px-0 px-md-3">

            <div className="notif-header mb-4 anim-fade-up anim-d0">
              <h2 className="fw-bold m-0">{t("Notifications", "Notifikasi")}</h2>
              <p className="text-muted">{t("Stay updated with your financial activities and reminders", "Tetap terupdate dengan aktivitas finansial dan pengingat Anda")}</p>
            </div>

            <Row className="mb-4">
              <Col>
                <Card className="shadow-sm notif-filter-card card-hover anim-fade-up anim-d1">
                  <Card.Body className="d-flex flex-column flex-xl-row align-items-xl-center p-3">
                    <div className="d-flex align-items-center notif-filter-scroll pb-1" style={{ flexGrow: 1 }}>
                      <Filter size={20} className="text-muted mx-2 flex-shrink-0" />
                      <div className="d-flex gap-2 ms-2">
                        {filterButtons.map((btn, idx) => {
                          const isActive = activeFilter === btn.tag;
                          return (
                            <Button
                              key={idx}
                              className={`notif-filter-btn px-3 py-2 ${isActive ? "notif-filter-btn--active" : "notif-filter-btn--inactive"}`}
                              onClick={() => setActiveFilter(btn.tag)}
                            >
                              <btn.icon size={16} className="me-2" /> {btn.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-xl-0 ms-xl-auto ps-xl-4 notif-filter-actions">
                      <Button className="notif-btn-read d-flex align-items-center px-4 py-2" onClick={markAllRead}>
                        <Check size={16} className="me-2" /> {t("Mark all as read", "Tandai semua dibaca")}
                      </Button>
                      <Button className="notif-btn-clear d-flex align-items-center px-4 py-2" onClick={clearAll}>
                        <X size={16} className="me-2" /> {t("Clear all", "Hapus semua")}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-4">
              {/* Notification List */}
              <Col xs={12} lg={7} xl={8}>
                <div className="d-flex flex-column gap-3">
                  {filtered.length === 0 ? (
                    <Card className="shadow-sm notif-empty-card anim-fade-up anim-d2">
                      <Card.Body className="text-center p-5 text-muted">{t("No notifications found.", "Tidak ada notifikasi.")}</Card.Body>
                    </Card>
                  ) : filtered.map((origNotif, idx) => {
                    const notif = localizeNotif(origNotif);
                    const style = getTypeStyle(notif.type);
                    const Icon  = style.icon;
                    return (
                      <Card key={notif._id} 
                            onClick={() => !notif.isRead && markRead(notif._id)}
                            className={`shadow-sm bg-white notif-card card-hover ${!notif.isRead ? "notif-card--unread" : "notif-card--read"} anim-fade-up anim-d${Math.min(idx + 2, 8)}`} 
                            style={{ cursor: !notif.isRead ? "pointer" : "default" }}
                      >
                        <Card.Body className="d-flex align-items-start p-4">
                          <div className="notif-icon-circle me-3 flex-shrink-0" style={{ backgroundColor: style.bg, color: style.color }}>
                            <Icon size={22} />
                          </div>
                          <div className="flex-grow-1 pe-3">
                            <h6 className="fw-bold mb-1 text-dark notif-title">{notif.title}</h6>
                            <p className="text-secondary mb-3 notif-message">{notif.message}</p>
                            <div className="d-flex align-items-center flex-wrap gap-2">
                              <span className="text-muted fw-bold notif-time">{formatTime(notif.createdAt || notif.date, user?.language)}</span>
                              <span className="notif-tag" style={{ backgroundColor: style.bg, color: style.color }}>{notif.tag}</span>
                            </div>
                          </div>
                          {!notif.isRead && <div className="position-absolute notif-unread-dot" />}
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              </Col>

              {/* Settings Panel */}
              <Col xs={12} lg={5} xl={4}>
                <Card className="shadow-sm notif-settings-card card-hover anim-fade-right anim-d2">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold text-dark mb-1">{t("Notification Settings", "Pengaturan Notifikasi")}</h5>
                    <p className="text-muted small mb-4">{t("Manage your alert preferences", "Kelola preferensi peringatan Anda")}</p>
                    <div className="d-flex flex-column mb-2">
                      {settingRows.map(sr => (
                        <div key={sr.key} className="notif-setting-row d-flex align-items-center p-3 mb-3">
                          <div className="notif-setting-icon me-3" style={{ color: sr.color }}>
                            <sr.icon size={24} />
                          </div>
                          <div className="flex-grow-1 pe-2">
                            <h6 className="fw-bold mb-0 text-dark notif-setting-title">{sr.title}</h6>
                            <p className="text-secondary mb-0 mt-1 notif-setting-desc">{sr.subtitle}</p>
                          </div>
                          <Form.Check
                            type="switch"
                            id={`switch-${sr.key}`}
                            className="notif-switch ms-auto"
                            checked={settings[sr.key]}
                            onChange={() => setSettings({ ...settings, [sr.key]: !settings[sr.key] })}
                          />
                        </div>
                      ))}
                    </div>
                    <Button className="notif-btn-save w-100 fw-bold py-3 mt-2 rounded-3">
                      {t("Save Preference", "Simpan Preferensi")}
                    </Button>
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

export default NotificationsPage;
