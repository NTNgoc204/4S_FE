import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicLayout from "./layouts/PublicLayout";
import LoginPage from "./pages/Auth/LoginPage";
import SignUpPage from "./pages/Auth/SignUpPage";
import AboutPage from "./pages/About/AboutPage";
import ChatPage from "./pages/Chat/ChatPage";
import ConsultationPage from "./pages/Consultation/ConsultationPage";
import ForSchoolsPage from "./pages/ForSchools/ForSchoolsPage";
import HomePage from "./pages/Home/HomePage";
import PricingPage from "./pages/Pricing/PricingPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import SkillDashboardPage from "./pages/Profile/SkillDashboardPage";
import GuidedQuizPage from "./pages/Quiz/GuidedQuizPage";
import UniversityDetailPage from "./pages/University/UniversityDetailPage";

const authStorageKey = "is_logged_in";
const planStorageKey = "demo_plan";
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

function App() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialLoggedIn);
  const [currentPlan, setCurrentPlan] = useState(getInitialPlan);
  const isProAccount = String(currentPlan).toLowerCase() === "pro";

  function handleSignIn(plan) {
    setIsLoggedIn(true);
    setCurrentPlan(plan);
    window.localStorage.setItem(authStorageKey, "true");
    window.localStorage.setItem(planStorageKey, plan);
    toast.success(t("auth:loginSuccess"));
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setCurrentPlan("");
    window.localStorage.removeItem(authStorageKey);
    window.localStorage.removeItem(planStorageKey);
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
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onSignIn={handleSignIn} />
              )
            }
          />
          <Route
            path="/sign-up"
            element={isLoggedIn ? <Navigate to="/" replace /> : <SignUpPage />}
          />
          <Route path="/for-schools" element={<ForSchoolsPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route
            path="/profile"
            element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/dashboard"
            element={isLoggedIn ? <SkillDashboardPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/consultation"
            element={
              isLoggedIn ? (
                isProAccount ? (
                  <ConsultationPage />
                ) : (
                  <Navigate to="/pricing" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/quiz"
            element={
              isLoggedIn ? (
                isProAccount ? (
                  <GuidedQuizPage />
                ) : (
                  <Navigate to="/pricing" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/chat"
            element={
              isLoggedIn ? (
                <ChatPage />
              ) : (
                <Navigate to="/login" replace />
              )
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
              isLoggedIn ? (
                <UniversityDetailPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
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
