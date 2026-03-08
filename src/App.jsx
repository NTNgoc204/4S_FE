import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LoginPage from './pages/Auth/LoginPage'
import HomePage from './pages/Home/HomePage'

const authStorageKey = 'is_logged_in'

function getInitialLoggedIn() {
  if (typeof window === 'undefined') {
    return false
  }
  return window.localStorage.getItem(authStorageKey) === 'true'
}

function App() {
  const { t } = useTranslation()
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialLoggedIn)

  function handleSignIn(plan) {
    setIsLoggedIn(true)
    window.localStorage.setItem(authStorageKey, 'true')
    window.localStorage.setItem('demo_plan', plan)
    toast.success(t('auth:loginSuccess'))
  }

  function handleLogout() {
    setIsLoggedIn(false)
    window.localStorage.removeItem(authStorageKey)
    window.localStorage.removeItem('demo_plan')
    toast.success(t('auth:logoutSuccess'))
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onSignIn={handleSignIn} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
