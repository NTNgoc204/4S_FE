import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logoutRequest, getMeRequest, refreshTokenRequest, clearError } from "./feature/auth/authSlice";
import { loadNotificationsRequest } from "./feature/notification/notificationSlice";
import { adminAPI } from "./feature/admin/adminAPI";
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
import AdminDashboardPage from "./pages/Admin/Dashboard/AdminDashboardPage";
import AdminPricingPage from "./pages/Admin/Pricing/AdminPricingPage";
import AdminUsersPage from "./pages/Admin/Users/AdminUsersPage";
import AdminRolesPage from "./pages/Admin/Roles/AdminRolesPage";
import AdminFinancePage from "./pages/Admin/Finance/AdminFinancePage";
import AdminQuestionsPage from "./pages/Admin/Questions/AdminQuestionsPage";
import AdminProfilePage from "./pages/Admin/Profile/AdminProfilePage";
import AccountantDashboardPage from "./pages/Accountant/AccountantDashboardPage";
import AccountantExpensesPage from "./pages/Accountant/AccountantExpensesPage";
import AccountantTransactionsPage from "./pages/Accountant/AccountantTransactionsPage";
import SchoolLayout from "./layouts/SchoolLayout";
import SchoolDashboardPage from "./pages/SchoolManager/SchoolDashboardPage";
import SchoolStudentsPage from "./pages/SchoolManager/SchoolStudentsPage";
import SchoolSettingsPage from "./pages/SchoolManager/SchoolSettingsPage";
import ContactLayout from "./layouts/ContactLayout";
import ContactDashboardPage from "./pages/Contact/ContactDashboardPage";
import ContactRegistrationsPage from "./pages/Contact/ContactRegistrationsPage";
import PricingPage from "./pages/Pricing/PricingPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import SkillDashboardPage from "./pages/Profile/SkillDashboardPage";
import GuidedQuizPage from "./pages/Quiz/GuidedQuizPage";
import UniversityDetailPage from "./pages/University/UniversityDetailPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import CheckoutPage from "./pages/Payment/CheckoutPage";
import PaymentQRPage from "./pages/Payment/PaymentQRPage";
import SchoolPaymentPortalPage from "./pages/Payment/SchoolPaymentPortalPage";
import UniversityManagerLayout from "./layouts/UniversityManagerLayout";
import UniversityManagementPage from "./pages/UniversityManager/UniversityManagementPage";
import FeedbackFloatingButton from "./components/FeedbackFloatingButton";

function App() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get auth state from Redux
  const { isLoggedIn, plan, role, refreshTokenError } = useSelector((state) => state.auth);
  const { themeMode, colorTheme } = useSelector((state) => state.theme || { themeMode: "dark", colorTheme: "emerald" });

  // Update HTML data-attributes dynamically based on selected theme configs
  useEffect(() => {
    document.documentElement.setAttribute("data-theme-mode", themeMode || "dark");
    document.documentElement.setAttribute("data-color-theme", colorTheme || "emerald");
  }, [themeMode, colorTheme]);

  // Track whether we have already fetched user info for the current session
  const hasFetchedMe = useRef(false);

  // Load notifications once on mount
  useEffect(() => {
    dispatch(loadNotificationsRequest());
  }, [dispatch]);

  // Record overall daily web visit once per session
  useEffect(() => {
    const hasIncremented = sessionStorage.getItem("web_visit_incremented");
    if (!hasIncremented) {
      sessionStorage.setItem("web_visit_incremented", "true");
      adminAPI.incrementDailyWebVisits().catch(() => {});
    }
  }, []);

  // Record authenticated user visit once per session when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const userRecordedKey = `user_visit_recorded_${sessionStorage.getItem("access_token") || "active"}`;
      const hasRecorded = sessionStorage.getItem(userRecordedKey);
      if (!hasRecorded) {
        sessionStorage.setItem(userRecordedKey, "true");
        adminAPI.recordDailyUserVisit().catch(() => {});
      }
    }
  }, [isLoggedIn]);

  // Silent refresh on mount if previously logged in
  useEffect(() => {
    const wasLoggedIn = localStorage.getItem("was_logged_in") === "true";
    const hasToken = Boolean(sessionStorage.getItem("access_token"));

    if (!isLoggedIn && !hasToken) {
      if (wasLoggedIn) {
        dispatch(refreshTokenRequest());
      } else {
        // Nếu không có trạng thái đăng nhập cũ và đang ở trang bảo mật, quay về trang chủ
        const path = window.location.pathname;
        const isPublicPath = [
          "/",
          "/login",
          "/sign-up",
          "/forgot-password",
          "/reset-password",
          "/for-schools",
          "/about-us",
          "/not-found",
          "/pricing",
          "/school-payment"
        ].some(p => path === p || path.startsWith(p + "/"));

        if (!isPublicPath) {
          navigate("/");
        }
      }
    }
  }, [dispatch, isLoggedIn, navigate]);

  // Handle session expired error reactively
  useEffect(() => {
    if (refreshTokenError) {
      toast.error(t("auth:sessionExpired", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."));
      dispatch(clearError());
      navigate("/");
    }
  }, [refreshTokenError, navigate, dispatch, t]);

  // Fetch user info once when the user is (or becomes) logged in
  useEffect(() => {
    if (isLoggedIn && !hasFetchedMe.current) {
      hasFetchedMe.current = true;
      dispatch(getMeRequest());
    }
    if (!isLoggedIn) {
      // Reset so the next login triggers a fresh fetch
      hasFetchedMe.current = false;
    }
  }, [dispatch, isLoggedIn]);

  function handleLogout() {
    dispatch(logoutRequest());
  }

  return (
    <>
      <Routes>
        {/* Standalone B2B Public Pages (No Header/Footer from PublicLayout) */}
        <Route path="/school-payment/:registrationId" element={<SchoolPaymentPortalPage />} />

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
            <Route path="/payment-qr" element={<PaymentQRPage />} />
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
          <Route path="/admin/questions" element={<AdminQuestionsPage />} />
          <Route path="/admin/pricing" element={<AdminPricingPage />} />
          <Route path="/admin/roles" element={<AdminRolesPage />} />
          <Route path="/admin/finance" element={<AdminFinancePage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
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
          <Route path="/accountant/dashboard" element={<AccountantDashboardPage />} />
          <Route path="/accountant/expenses" element={<AccountantExpensesPage />} />
          <Route path="/accountant/transactions" element={<AccountantTransactionsPage />} />
        </Route>

        {/* Contact Layout - cho contact */}
        <Route
          element={
            <ProtectedRoute
              roles={["contact"]}
              currentRole={role}
              isAuthenticated={isLoggedIn}
              useRedux={true}
            >
              <ContactLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/contact/dashboard" element={<ContactDashboardPage />} />
          <Route path="/contact/registrations" element={<ContactRegistrationsPage />} />
        </Route>

        {/* School Layout - cho school (THPT Manager) */}
        <Route
          element={
            <ProtectedRoute
              roles={["school"]}
              currentRole={role}
              isAuthenticated={isLoggedIn}
              useRedux={true}
            >
              <SchoolLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/school/dashboard" element={<SchoolDashboardPage />} />
          <Route path="/school/students" element={<SchoolStudentsPage />} />
          <Route path="/school/settings" element={<SchoolSettingsPage />} />
        </Route>

        {/* University Manager Layout - cho school_manager (University Admin) */}
        <Route
          element={
            <ProtectedRoute
              roles={["school_manager"]}
              currentRole={role}
              isAuthenticated={isLoggedIn}
              useRedux={true}
            >
              <UniversityManagerLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/school-manager/dashboard" element={<Navigate to="/school-manager/university" replace />} />
          <Route path="/school-manager/university" element={<UniversityManagementPage />} />
          <Route path="/school/university" element={<Navigate to="/school-manager/university" replace />} />
        </Route>



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
        theme={themeMode === "light" ? "light" : "dark"}
      />
      <FeedbackFloatingButton />
    </>
  );
}

export default App;
