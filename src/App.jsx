import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/Auth/LoginPage";
import SignUpPage from "./pages/Auth/SignUpPage";
import AboutPage from "./pages/About/AboutPage";
import ChatPage from "./pages/Chat/ChatPage";
import ConsultationPage from "./pages/Consultation/ConsultationPage";
import ForSchoolsPage from "./pages/ForSchools/ForSchoolsPage";
import HomePage from "./pages/Home/HomePage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminPricingPage from "./pages/Admin/AdminPricingPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import PricingPage from "./pages/Pricing/PricingPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import SkillDashboardPage from "./pages/Profile/SkillDashboardPage";
import GuidedQuizPage from "./pages/Quiz/GuidedQuizPage";
import UniversityDetailPage from "./pages/University/UniversityDetailPage";

const authStorageKey = "is_logged_in";
const planStorageKey = "demo_plan";
const roleStorageKey = "demo_role";
const chatStateStorageKey = "chat_page_state_v1";
const quizStateStorageKey = "guided_quiz_state_v1";

function getInitialLoggedIn() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(authStorageKey) === "true";
}

function getInitialPlan() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(planStorageKey) ?? "";
}

function getInitialRole() {
  if (typeof window === "undefined") {
    return "user";
  }
  return window.localStorage.getItem(roleStorageKey) ?? "user";
}

function App() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialLoggedIn);
  const [currentPlan, setCurrentPlan] = useState(getInitialPlan);
  const [currentRole, setCurrentRole] = useState(getInitialRole);
  const isAdmin = isLoggedIn && String(currentRole).toLowerCase() === "admin";
  const defaultAfterAuthPath = isAdmin ? "/admin" : "/";

  function handleSignIn(payload) {
    const resolvedPlan =
      typeof payload === "string" ? payload : payload?.plan ?? "";
    const resolvedRole =
      typeof payload === "string" ? "user" : payload?.role ?? "user";

    setIsLoggedIn(true);
    setCurrentPlan(resolvedPlan);
    setCurrentRole(resolvedRole);
    window.localStorage.setItem(authStorageKey, "true");
    window.localStorage.setItem(planStorageKey, resolvedPlan);
    window.localStorage.setItem(roleStorageKey, resolvedRole);
    toast.success(t("auth:loginSuccess"));
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setCurrentPlan("");
    setCurrentRole("user");
    window.localStorage.removeItem(authStorageKey);
    window.localStorage.removeItem(planStorageKey);
    window.localStorage.removeItem(roleStorageKey);
    window.sessionStorage.removeItem(chatStateStorageKey);
    window.sessionStorage.removeItem(quizStateStorageKey);
    toast.success(t("auth:logoutSuccess"));
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <PublicLayout
              currentPlan={currentPlan}
              currentRole={currentRole}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
          }
        >
          <Route
            path="/"
            element={isAdmin ? <Navigate replace to="/admin" /> : <HomePage />}
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate replace to={defaultAfterAuthPath} />
              ) : (
                <LoginPage onSignIn={handleSignIn} />
              )
            }
          />
          <Route
            path="/sign-up"
            element={
              isLoggedIn ? (
                <Navigate replace to={defaultAfterAuthPath} />
              ) : (
                <SignUpPage />
              )
            }
          />
          <Route path="/for-schools" element={<ForSchoolsPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <SkillDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultation"
            element={
              <ProtectedRoute
                currentPlan={currentPlan}
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
                currentPlan={currentPlan}
                isAuthenticated={isLoggedIn}
                requirePro
                unauthorizedTo="/pricing"
              >
                <GuidedQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <PricingPage currentPlan={currentPlan} isLoggedIn={isLoggedIn} />
            }
          />
          <Route
            path="/university/:schoolId"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <UniversityDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate replace to={defaultAfterAuthPath} />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              currentRole={currentRole}
              isAuthenticated={isLoggedIn}
            >
              <AdminLayout currentPlan={currentPlan} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/pricing" element={<AdminPricingPage />} />
        </Route>
      </Routes>
      <ToastContainer
        autoClose={1000}
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
