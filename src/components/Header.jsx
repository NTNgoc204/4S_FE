import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import globeIcon from "../assets/Globe.svg";
import fourSLogo from "../assets/logo-4s.png";
import NotificationDropdown from "./NotificationDropdown";

function Header({
  isLoggedIn = false,
  currentRole = "user",
  onLogout = () => {},
  showGuestCta = true,
  showNav = true,
  stickyHeader = true,
}) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get notification state
  const { unreadCount } = useSelector((state) => state.notification);
  const [isNotiOpen, setIsNotiOpen] = useState(false);

  // Get auth state from Redux
  const reduxAuth = useSelector((state) => state.auth);
  const user = reduxAuth.user;

  // Use Redux auth if available, fallback to props
  const finalIsLoggedIn = reduxAuth.isLoggedIn ?? isLoggedIn;

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.avatarUrl]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const isEnglish = i18n.resolvedLanguage !== "vi";
  const isAdmin =
    finalIsLoggedIn &&
    String(reduxAuth.role || currentRole).toLowerCase() === "admin";

  const navItems = [
    { label: t("home:nav.home"), to: "/" },
    { label: t("home:nav.forSchools"), to: "/for-schools" },
    { label: t("home:nav.pricing"), to: "/pricing" },
    { label: t("home:nav.aboutUs"), to: "/about-us" },
  ];

  function handleLanguageChange(language) {
    i18n.changeLanguage(language);
  }

  function handleLogoutClick() {
    onLogout();
    navigate("/");
  }

  function handleGetStartedClick() {
    navigate("/login");
  }

  return (
    <header
      className={`${stickyHeader ? "sticky top-0 z-20" : ""} border-b border-white/10 bg-[#041326]/80 backdrop-blur-xl`}
    >
      <div
        className={`flex min-h-18.5 mx-4 items-center justify-between gap-6`}
      >
        <Link
          className="inline-flex items-center gap-3 text-[#ecc741] no-underline"
          to="/"
        >
          <img
            alt="4S logo"
            className="h-[70px] w-[70px] object-contain"
            src={fourSLogo}
          />
          <span className="font-['Sora'] text-xl font-bold">For Student</span>
        </Link>

        {showNav ? (
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 lg:flex"
          >
            {navItems.map((item) => (
              <NavLink
                end={item.to === "/"}
                key={item.to}
                className={({ isActive }) =>
                  `text-[0.95rem] no-underline transition ${
                    isActive
                      ? "font-semibold text-[#f2cb36]"
                      : "text-slate-300 hover:text-slate-100"
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
            <img
              alt=""
              aria-hidden="true"
              className="ml-2 mr-1 h-4 w-4 opacity-70"
              src={globeIcon}
            />
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                isEnglish
                  ? "bg-white/15 text-slate-100"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => handleLanguageChange("en")}
              type="button"
            >
              {t("common:language.en")}
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                isEnglish
                  ? "text-slate-400 hover:text-slate-200"
                  : "bg-white/15 text-slate-100"
              }`}
              onClick={() => handleLanguageChange("vi")}
              type="button"
            >
              {t("common:language.vi")}
            </button>
          </div>

          {finalIsLoggedIn ? (
            <>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/60 bg-rose-400/12 px-3 py-2 text-sm font-bold tracking-wide text-rose-300">
                  <span>ADMIN</span>
                </span>
              ) : (String(reduxAuth.plan).toLowerCase() === "pro" || String(reduxAuth.plan).toLowerCase() === "vip") ? (
                <span className="inline-flex items-end gap-1 rounded-lg border border-[#ecc741]/60 bg-[#ecc741]/15 px-3 pb-2 text-sm font-bold tracking-wide text-[#f4d040]">
                  <span className="text-xl">{"\u{1F451}"}</span>
                  <span>PRO</span>
                </span>
              ) : null}
              {isAdmin ? (
                <button
                  className="rounded-xl border border-[#0ed8ab]/35 bg-[#0ed8ab]/15 px-3 py-2 text-sm font-semibold text-[#0ed8ab] transition hover:bg-[#0ed8ab]/25"
                  onClick={() => navigate("/admin/dashboard")}
                  type="button"
                >
                  Admin
                </button>
              ) : null}
              <div className="relative">
                <button
                  onClick={() => setIsNotiOpen(!isNotiOpen)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-slate-100 hover:scale-105"
                  type="button"
                >
                  <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown isOpen={isNotiOpen} onClose={() => setIsNotiOpen(false)} />
              </div>

              <button
                aria-label="User profile"
                className="relative overflow-hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#ffe06e] to-[#e2bb28] text-[#09213f] transition hover:scale-105"
                onClick={() => navigate("/profile")}
                type="button"
              >
                {user?.avatarUrl && !imgError ? (
                  <img
                    src={user.avatarUrl}
                    alt="User avatar"
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="font-['Sora'] text-sm font-bold">
                    {getInitials(user?.username)}
                  </span>
                )}
              </button>

              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                onClick={handleLogoutClick}
                type="button"
              >
                {t("common:actions.logout")}
              </button>
            </>
          ) : showGuestCta ? (
            <button
              className="hidden rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)] md:inline-flex"
              onClick={handleGetStartedClick}
              type="button"
            >
              {t("common:actions.getStarted")}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Header;
