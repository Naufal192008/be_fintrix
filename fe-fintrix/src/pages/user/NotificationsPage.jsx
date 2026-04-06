import React, { useState } from "react";
import SidebarComponent from "../../components/SidebarComponent";
import TopNavbarComponent from "../../components/TopNavbarComponent";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { Filter, Inbox, AlertTriangle, DollarSign, Clock, TrendingUp, Check, X, CalendarClock } from "lucide-react";
import "../../styles/NotificationsPage.css";
import "../../styles/animations.css";

const mockNotifications = [
  { id: 1, type: "budget",      title: "Your food budget is almost exceeded",    message: "You've spent $1,180 of your $1,200 food budget this month.", time: "2 hours ago", tag: "Budget Alert",  unread: true  },
  { id: 2, type: "transaction", title: "You made a large transaction of $500",   message: "A transaction of $500.00 was recorded for Shopping at Target.", time: "5 hours ago", tag: "Transaction", unread: true  },
  { id: 3, type: "reminder",    title: "Don't forget to record today's expenses",message: "Keep your financial records up to date by logging your expenses.", time: "8 hours ago", tag: "Reminder",   unread: true  },
  { id: 4, type: "investment",  title: "Investment portfolio updated",           message: "Your portfolio gained 2.4% this week. Total value: $48,320.", time: "1 day ago",   tag: "Investment",  unread: false },
  { id: 5, type: "bill",        title: "Electricity bill is due tomorrow",       message: "Your electricity bill of $89.00 is due on March 31, 2026.", time: "1 day ago",   tag: "Reminder",    unread: false },
];

const typeStyles = {
  budget:      { icon: AlertTriangle, bg: "#fff4db", color: "#f59f00" },
  transaction: { icon: DollarSign,   bg: "#e7f5ff", color: "#339af0" },
  reminder:    { icon: Clock,         bg: "#f3e8ff", color: "#845ef7" },
  investment:  { icon: TrendingUp,    bg: "#ebfbee", color: "#40c057" },
  bill:        { icon: CalendarClock, bg: "#ffe8e6", color: "#ff6b6b" },
};

const getTypeStyle = (type) => typeStyles[type] || { icon: Inbox, bg: "#f1f3f5", color: "#868e96" };

const filterButtons = [
  { label: "All",            tag: "All",          icon: Inbox },
  { label: "Budget Alerts",  tag: "Budget Alert", icon: AlertTriangle },
  { label: "Transactions",   tag: "Transaction",  icon: DollarSign },
  { label: "Reminders",      tag: "Reminder",     icon: Clock },
  { label: "Investments",    tag: "Investment",   icon: TrendingUp },
];

function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeFilter, setActiveFilter] = useState("All");
  const [settings, setSettings] = useState({ budget: true, transaction: true, daily: true, investment: true, bill: true });

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, unread: false })));
  const clearAll    = () => setNotifications([]);

  const filtered = notifications.filter(n => activeFilter === "All" || n.tag === activeFilter);

  const settingRows = [
    { key: "budget",      icon: AlertTriangle, color: "#f59f00", title: "Budget Alerts",           subtitle: "Get notified about budget limits" },
    { key: "transaction", icon: DollarSign,   color: "#339af0", title: "Large Transaction Alerts", subtitle: "Alert for transactions over $100" },
    { key: "daily",       icon: Clock,         color: "#845ef7", title: "Daily Expense Reminder",   subtitle: "Daily reminder to log expenses" },
    { key: "investment",  icon: TrendingUp,    color: "#40c057", title: "Investment Updates",       subtitle: "Portfolio performance alerts" },
    { key: "bill",        icon: CalendarClock, color: "#ff6b6b", title: "Bill Reminders",           subtitle: "Upcoming bill payment alerts" },
  ];

  return (
    <div className="d-flex notif-page">
      <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout notif-layout flex-grow-1 d-flex flex-column">
        <TopNavbarComponent onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

        <main className="dashboard-main p-4 p-md-5">
          <Container fluid className="px-0 px-md-3">

            {/* Header */}
            <div className="notif-header mb-4 anim-fade-up anim-d0">
              <h2 className="fw-bold m-0">Notifications</h2>
              <p className="text-muted">Stay updated with your financial activities and reminders</p>
            </div>

            {/* Filter Bar */}
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
                        <Check size={16} className="me-2" /> Mark all as read
                      </Button>
                      <Button className="notif-btn-clear d-flex align-items-center px-4 py-2" onClick={clearAll}>
                        <X size={16} className="me-2" /> Clear all
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
                      <Card.Body className="text-center p-5 text-muted">No notifications found.</Card.Body>
                    </Card>
                  ) : filtered.map((notif, idx) => {
                    const style = getTypeStyle(notif.type);
                    const Icon  = style.icon;
                    return (
                      <Card key={notif.id} className={`shadow-sm bg-white notif-card card-hover ${notif.unread ? "notif-card--unread" : "notif-card--read"} anim-fade-up anim-d${Math.min(idx + 2, 8)}`}>
                        <Card.Body className="d-flex align-items-start p-4">
                          <div className="notif-icon-circle me-3 flex-shrink-0" style={{ backgroundColor: style.bg, color: style.color }}>
                            <Icon size={22} />
                          </div>
                          <div className="flex-grow-1 pe-3">
                            <h6 className="fw-bold mb-1 text-dark notif-title">{notif.title}</h6>
                            <p className="text-secondary mb-3 notif-message">{notif.message}</p>
                            <div className="d-flex align-items-center flex-wrap gap-2">
                              <span className="text-muted fw-bold notif-time">{notif.time}</span>
                              <span className="notif-tag" style={{ backgroundColor: style.bg, color: style.color }}>{notif.tag}</span>
                            </div>
                          </div>
                          {notif.unread && <div className="position-absolute notif-unread-dot" />}
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
                    <h5 className="fw-bold text-dark mb-1">Notification Settings</h5>
                    <p className="text-muted small mb-4">Manage your alert preferences</p>
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
                      Save Preference
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
