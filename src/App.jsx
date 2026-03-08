import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import PublicLayout from './layouts/PublicLayout'
import LoginPage from './pages/Auth/LoginPage'
import ConsultationPage from './pages/Consultation/ConsultationPage'
import HomePage from './pages/Home/HomePage'
import PricingPage from './pages/Pricing/PricingPage'

const authStorageKey = 'is_logged_in'
const planStorageKey = 'demo_plan'

function getInitialLoggedIn() {
  if (typeof window === 'undefined') {
    return false
  }
  return window.localStorage.getItem(authStorageKey) === 'true'
}

function getInitialPlan() {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.localStorage.getItem(planStorageKey) ?? ''
}

function App() {
  const { t } = useTranslation()
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialLoggedIn)
  const [currentPlan, setCurrentPlan] = useState(getInitialPlan)

  function handleSignIn(plan) {
    setIsLoggedIn(true)
    setCurrentPlan(plan)
    window.localStorage.setItem(authStorageKey, 'true')
    window.localStorage.setItem(planStorageKey, plan)
    toast.success(t('auth:loginSuccess'))
  }

  function handleLogout() {
    setIsLoggedIn(false)
    setCurrentPlan('')
    window.localStorage.removeItem(authStorageKey)
    window.localStorage.removeItem(planStorageKey)
    toast.success(t('auth:logoutSuccess'))
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout currentPlan={currentPlan} isLoggedIn={isLoggedIn} onLogout={handleLogout} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onSignIn={handleSignIn} />} />
          <Route path="/consultation" element={isLoggedIn ? <ConsultationPage /> : <Navigate to="/login" replace />} />
          <Route path="/pricing" element={<PricingPage currentPlan={currentPlan} isLoggedIn={isLoggedIn} />} />
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
  )
}

export default App
