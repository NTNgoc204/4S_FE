import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import SiteFooter from '../components/SiteFooter'

function PublicLayout({
  isLoggedIn = false,
  currentPlan = '',
  currentRole = 'user',
  onLogout = () => {},
  showNav = true,
  headerContainerClassName = 'w-[min(1120px,92vw)]',
}) {
  const location = useLocation()
  
  if (isLoggedIn) {
    const roleLower = String(currentRole).toLowerCase()
    if (roleLower === 'admin') {
      return <Navigate replace to="/admin/dashboard" />
    }
    if (roleLower === 'accountant') {
      return <Navigate replace to="/accountant/dashboard" />
    }
    if (roleLower === 'school_manager' || roleLower === 'school') {
      return <Navigate replace to="/school/dashboard" />
    }
  }

  const isLoginPage = location.pathname === '/login'
  const isPricingPage = location.pathname === '/pricing'
  const isUniversityDetailPage = location.pathname.startsWith('/university/')
  const isProfilePage = location.pathname === '/profile'
  const isDashboardPage = location.pathname === '/dashboard'
  const isConsultationPage = location.pathname === '/consultation'
  const isQuizPage = location.pathname === '/quiz'
  const isChatPage = location.pathname === '/chat'

  const pageBackgroundClass = isLoginPage
    ? 'bg-[radial-gradient(circle_at_22%_16%,rgba(255,201,58,0.09),transparent_34%),radial-gradient(circle_at_75%_28%,rgba(15,226,168,0.1),transparent_35%),linear-gradient(160deg,#031124_0%,#071a35_40%,#041224_100%)]'
    : isPricingPage
      ? 'bg-[radial-gradient(circle_at_20%_16%,rgba(255,201,58,0.1),transparent_34%),radial-gradient(circle_at_78%_26%,rgba(15,226,168,0.11),transparent_35%),linear-gradient(160deg,#031124_0%,#071a35_42%,#041224_100%)]'
      : 'relative overflow-hidden bg-[radial-gradient(circle_at_20%_15%,rgba(255,201,58,0.09),transparent_35%),radial-gradient(circle_at_75%_25%,rgba(15,226,168,0.1),transparent_35%),linear-gradient(160deg,#031124_0%,#071a35_40%,#041224_100%)]'

  const shouldShowHeader = !isUniversityDetailPage && !isProfilePage && !isDashboardPage
  const shouldShowFooter =
    !isUniversityDetailPage &&
    !isProfilePage &&
    !isDashboardPage &&
    !isConsultationPage &&
    !isQuizPage &&
    !isChatPage

  return (
    <div className={`min-h-screen text-[#eaf2ff] ${pageBackgroundClass}`}>
      {shouldShowHeader ? (
        <Header
          containerClassName={headerContainerClassName}
          isLoggedIn={isLoggedIn}
          currentPlan={currentPlan}
          currentRole={currentRole}
          onLogout={onLogout}
          showGuestCta={!isLoggedIn && !isLoginPage}
          showNav={showNav}
          stickyHeader={!isLoginPage}
        />
      ) : null}
      <Outlet context={{ isLoggedIn, currentPlan, currentRole, onLogout }} />
      {shouldShowFooter ? <SiteFooter /> : null}
    </div>
  )
}

export default PublicLayout
