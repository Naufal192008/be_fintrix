import { Routes, Route } from "react-router-dom";
import NavBarComponent from "./components/NavBarComponent";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthSuccess from "./pages/AuthSuccess";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import FooterComponent from "./components/FooterComponent";
import DashboardPage from "./pages/user/DashboardPage.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import DashboardAdmin from "./pages/admin/DashboardAdmin.jsx";
import TransactionsPage from "./pages/user/TransactionsPage.jsx";
import AnalyticsPage from "./pages/user/AnalyticsPage.jsx";
import BudgetPage from "./pages/user/BudgetPage.jsx";
import InvestmentPage from "./pages/user/InvestmentPage.jsx";
import ReportsPage from "./pages/user/ReportsPage.jsx";
import NotificationsPage from "./pages/user/NotificationsPage.jsx";
import SettingsPage from "./pages/user/SettingsPage.jsx";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <TransactionsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <AnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <PrivateRoute>
              <BudgetPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/investment"
          element={
            <PrivateRoute>
              <InvestmentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <ReportsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <DashboardAdmin />
            </AdminRoute>
          }
        />
        <Route
          path="/"
          element={
            <>
              <NavBarComponent />
              <HomePage />
              <FooterComponent />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;