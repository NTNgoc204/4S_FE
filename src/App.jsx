import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logoutRequest, getMeRequest } from "./feature/auth/authSlice";
import { loadNotificationsRequest } from "./feature/notification/notificationSlice";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import AccountantLayout from "./layouts/AccountantLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/Auth/LoginPage";
import SignUpPage from "./pages/Auth/SignUpPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import AboutPage from "./pages/About/AboutPage";
import ChatPage from "./pages/Chat/ChatPage";
import ConsultationPage from "./pages/Consultation/ConsultationPage";
import ForSchoolsPage from "./pages/ForSchools/ForSchoolsPage";
import HomePage from "./pages/Home/HomePage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminPricingPage from "./pages/Admin/AdminPricingPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import AdminRolesPage from "./pages/Admin/AdminRolesPage";
import AdminFinancePage from "./pages/Admin/AdminFinancePage";
import AccountantDashboardPage from "./pages/Accountant/AccountantDashboardPage";
import AccountantExpensesPage from "./pages/Accountant/AccountantExpensesPage";
import AccountantTransactionsPage from "./pages/Accountant/AccountantTransactionsPage";
import AccountantInvoicesPage from "./pages/Accountant/AccountantInvoicesPage";
import PricingPage from "./pages/Pricing/PricingPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import SkillDashboardPage from "./pages/Profile/SkillDashboardPage";
import GuidedQuizPage from "./pages/Quiz/GuidedQuizPage";
import UniversityDetailPage from "./pages/University/UniversityDetailPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import CheckoutPage from "./pages/Payment/CheckoutPage";
import MockPaymentPortal from "./pages/Payment/MockPaymentPortal";

function App() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get auth state from Redux
  const { isLoggedIn, plan, role } = useSelector((state) => state.auth);

  // Tự động khôi phục thông tin user và thông báo khi load trang
  useEffect(() => {
    dispatch(loadNotificationsRequest());
    if (isLoggedIn) {
      dispatch(getMeRequest());
    }
  }, [dispatch, isLoggedIn]);

  function handleLogout() {
    dispatch(logoutRequest());
    toast.success(t("auth:logoutSuccess"));
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Layout - cho public users + student users */}
        <Route
          element={
            <PublicLayout
              currentPlan={plan}
              currentRole={role}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
          }
        >
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/for-schools" element={<ForSchoolsPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route
            path="/pricing"
            element={<PricingPage currentPlan={plan} isLoggedIn={isLoggedIn} />}
          />

          {/* Protected Student Routes */}
          <Route
            element={
              <ProtectedRoute
                isAuthenticated={isLoggedIn}
                currentRole={role}
                roles={["student"]}
              />
            }
          >
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/dashboard" element={<SkillDashboardPage />} />
            <Route
              path="/consultation"
              element={
                <ProtectedRoute
                  currentPlan={plan}
                  isAuthenticated={isLoggedIn}
                  requirePro
                  unauthorizedTo="/pricing"
                >
                  <ConsultationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute
                  currentPlan={plan}
                  isAuthenticated={isLoggedIn}
                  requirePro
                  unauthorizedTo="/pricing"
                >
                  <GuidedQuizPage />
                </ProtectedRoute>
              }
            />
            <Route path="/chat" element={<ChatPage />} />
            <Route
              path="/university/:schoolId"
              element={<UniversityDetailPage />}
            />
          </Route>
        </Route>

        {/* Admin Layout - cho admin */}
        <Route
          element={
            <ProtectedRoute
              roles={["admin"]}
              currentRole={role}
              isAuthenticated={isLoggedIn}
              useRedux={true}
            >
              <AdminLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/pricing" element={<AdminPricingPage />} />
          <Route path="/admin/roles" element={<AdminRolesPage />} />
          <Route path="/admin/finance" element={<AdminFinancePage />} />
        </Route>

        {/* Accountant Layout - cho accountant */}
        <Route
          element={
            <ProtectedRoute
              roles={["accountant"]}
              currentRole={role}
              isAuthenticated={isLoggedIn}
              useRedux={true}
            >
              <AccountantLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate replace to="/accountant/dashboard" />} />
          <Route path="/accountant/dashboard" element={<AccountantDashboardPage />} />
          <Route path="/accountant/expenses" element={<AccountantExpensesPage />} />
          <Route path="/accountant/transactions" element={<AccountantTransactionsPage />} />
          <Route path="/accountant/invoices" element={<AccountantInvoicesPage />} />
        </Route>

        <Route path="/mock-payment-portal" element={<MockPaymentPortal />} />

        {/* Catch all - phải ở cuối cùng */}
        <Route path="*" element={<Navigate replace to="/not-found" />} />
      </Routes>
      <ToastContainer
        autoClose={2000}
        closeOnClick
        draggable
        hideProgressBar={false}
        newestOnTop
        pauseOnFocusLoss
        pauseOnHover
        position="top-right"
        theme="dark"
      />
    </BrowserRouter>
  );
}

export default App;
