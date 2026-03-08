import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import globeIcon from '../assets/Globe.svg'
import fourSLogo from '../assets/logo-4s.png'

function Header({
  isLoggedIn = false,
  currentPlan = '',
  onLogout = () => {},
  showGuestCta = true,
  showNav = true,
  stickyHeader = true,
  containerClassName = 'w-[min(1120px,92vw)]',
}) {
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const isEnglish = i18n.resolvedLanguage !== 'vi'
  const isProUser = isLoggedIn && String(currentPlan).toLowerCase() === 'pro'
  const currentPath = location.pathname

  const baseNavItems = [
    { label: t('home:nav.forSchools'), to: '/for-schools' },
    { label: t('home:nav.pricing'), to: '/pricing' },
    { label: t('home:nav.aboutUs'), to: '/about-us' },
  ]
  const navItems =
    currentPath === '/'
      ? baseNavItems
      : [{ label: t('home:nav.home'), to: '/' }, ...baseNavItems].filter((item) => item.to !== currentPath)

  function handleLanguageChange(language) {
    i18n.changeLanguage(language)
  }

  function handleLogoutClick() {
    onLogout()
    navigate('/')
  }

  function handleGetStartedClick() {
    navigate('/login')
  }

  return (
    <header className={`${stickyHeader ? 'sticky top-0 z-20' : ''} border-b border-white/10 bg-[#041326]/80 backdrop-blur-xl`}>
      <div className={`mx-auto flex min-h-[74px] ${containerClassName} items-center justify-between gap-6`}>
        <Link className="inline-flex items-center gap-3 text-[#ecc741] no-underline" to="/">
          <img alt="4S logo" className="h-[70px] w-[70px] object-contain" src={fourSLogo} />
          <span className="font-['Sora'] text-xl font-bold">{t('common:brand.forStudent')}</span>
        </Link>

        {showNav ? (
          <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                className="text-[0.95rem] text-slate-300 no-underline transition hover:text-slate-100"
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
            <img alt="" aria-hidden="true" className="ml-2 mr-1 h-4 w-4 opacity-70" src={globeIcon} />
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                isEnglish ? 'bg-white/15 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => handleLanguageChange('en')}
              type="button"
            >
              {t('common:language.en')}
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                isEnglish ? 'text-slate-400 hover:text-slate-200' : 'bg-white/15 text-slate-100'
              }`}
              onClick={() => handleLanguageChange('vi')}
              type="button"
            >
              {t('common:language.vi')}
            </button>
          </div>

          {isLoggedIn ? (
            <>
              {isProUser ? (
                <span className="inline-flex items-end gap-1 rounded-lg border border-[#ecc741]/60 bg-[#ecc741]/15 px-3 pb-2 text-sm font-bold tracking-wide text-[#f4d040]">
                  <span className="text-xl">{'\u{1F451}'}</span>
                  <span>PRO</span>
                </span>
              ) : null}
              <button
                aria-label="User profile"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#ffe06e] to-[#e2bb28] text-[#09213f]"
                type="button"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </button>

              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                onClick={handleLogoutClick}
                type="button"
              >
                {t('common:actions.logout')}
              </button>
            </>
          ) : showGuestCta ? (
            <button
              className="hidden rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)] md:inline-flex"
              onClick={handleGetStartedClick}
              type="button"
            >
              {t('common:actions.getStarted')}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Header
