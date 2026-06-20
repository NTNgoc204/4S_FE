import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
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
      className={`${
        stickyHeader ? "sticky top-0 z-50" : ""
      } border-b border-white/5 bg-[#041326]/60 backdrop-blur-md transition-all duration-300 shadow-md py-2.5`}
    >
      <style>{`
        @keyframes scan {
          0%, 100% { top: 6px; }
          50% { top: calc(100% - 8px); }
        }
        .animate-scanLine {
          animation: scan 2s linear infinite;
        }
      `}</style>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand logo & name */}
        <Link
          className="inline-flex items-center gap-2 text-[#ecc741] no-underline transition-opacity duration-300 hover:opacity-90"
          to="/"
        >
          <img
            alt="4S logo"
            className="h-[52px] w-[52px] object-contain"
            src={fourSLogo}
          />
          <span className="font-display text-lg font-black tracking-tight text-white">
            For Student
          </span>
        </Link>

        {/* Center menu links */}
        {showNav ? (
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-8"
          >
            {navItems.map((item) => (
              <NavLink
                end={item.to === "/"}
                key={item.to}
                className={({ isActive }) =>
                  `text-xs uppercase tracking-wider font-semibold no-underline transition-all duration-300 nav-link-underline ${
                    isActive
                      ? "text-[#f2cb36] active"
                      : "text-slate-400 hover:text-slate-100"
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}

        {/* Right buttons area */}
        <div className="flex items-center gap-4">
          
          {/* Custom Compact Language Switch */}
          <div className="relative inline-flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 text-[10px] select-none shadow-inner">
            <button
              onClick={() => handleLanguageChange("vi")}
              type="button"
              className={`relative z-10 px-3 py-1.5 rounded-full font-bold transition-all duration-300 cursor-pointer ${
                !isEnglish 
                  ? "text-[#0c1e36] bg-[#ecc741] shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              VI
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              type="button"
              className={`relative z-10 px-3 py-1.5 rounded-full font-bold transition-all duration-300 cursor-pointer ${
                isEnglish 
                  ? "text-[#0c1e36] bg-[#ecc741] shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              EN
            </button>
          </div>

          {/* Download Mobile App Button */}
          <div className="relative group">
            <button
              type="button"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-slate-100 hover:scale-105 cursor-default shadow-sm"
              title={isEnglish ? "Scan to download mobile app" : "Quét mã để tải ứng dụng di động"}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Smartphone frame */}
                <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5" />
                {/* Notch / Speaker line */}
                <line x1="10" y1="5" x2="14" y2="5" strokeLinecap="round" />
                {/* Home button circle dot */}
                <circle cx="12" cy="19" r="0.75" fill="currentColor" />
                {/* Download arrow inside screen */}
                <path d="M12 8v6m-3-3l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Awwwards-style Hover Popover Card */}
            <div className="absolute top-full right-0 mt-3 w-56 p-5 rounded-2xl border border-white/10 bg-[#041326]/95 backdrop-blur-xl shadow-2xl transition-all duration-300 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-50 text-center flex flex-col items-center gap-3">
              <h4 className="text-[10px] font-bold text-white tracking-widest uppercase">
                {isEnglish ? "Scan to Download" : "Quét để tải App"}
              </h4>
              <div className="relative p-2 bg-white rounded-xl border border-white/5">
                <QRCodeSVG
                  value={import.meta.env.VITE_APK_DOWNLOAD_URL || "https://4s.vercel.app"}
                  size={96}
                  bgColor={"#FFFFFF"}
                  fgColor={"#041326"}
                  level={"L"}
                  includeMargin={false}
                />
                <div className="absolute inset-x-2 top-2 h-0.5 bg-[#0ed8ab] shadow-[0_0_8px_#0ed8ab] opacity-60 animate-scanLine pointer-events-none" />
              </div>
              <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                {isEnglish ? "Point camera to scan QR Code" : "Hướng camera vào mã QR để quét"}
              </p>
            </div>
          </div>

          {/* User Auth Info */}
          {finalIsLoggedIn ? (
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <span className="inline-flex items-center rounded-lg border border-rose-300/40 bg-rose-400/10 px-2.5 py-1.5 text-[10px] font-black tracking-widest text-rose-300 shadow-inner">
                  ADMIN
                </span>
              ) : (String(reduxAuth.plan).toLowerCase() === "pro" || String(reduxAuth.plan).toLowerCase() === "vip") ? (
                <span className="inline-flex items-center gap-1 rounded-lg border border-[#ecc741]/40 bg-[#ecc741]/10 px-2.5 py-1.5 text-[10px] font-black tracking-widest text-[#f4d040] shadow-inner">
                  <span className="text-xs">👑</span>
                  <span>PRO</span>
                </span>
              ) : null}

              {isAdmin && (
                <button
                  className="rounded-xl border border-[#0ed8ab]/35 bg-[#0ed8ab]/10 hover:bg-[#0ed8ab]/20 px-3.5 py-2 text-xs font-bold text-[#0ed8ab] transition cursor-pointer"
                  onClick={() => navigate("/admin/dashboard")}
                  type="button"
                >
                  Admin Portal
                </button>
              )}

              {/* Notification bell dropdown shortcut */}
              <div className="relative">
                <button
                  onClick={() => setIsNotiOpen(!isNotiOpen)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-slate-100 hover:scale-105 cursor-pointer shadow-sm"
                  type="button"
                >
                  <svg aria-hidden="true" className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-md animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown isOpen={isNotiOpen} onClose={() => setIsNotiOpen(false)} />
              </div>

              {/* User Avatar */}
              <button
                aria-label="User profile"
                className="relative overflow-hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#ffe06e] to-[#e2bb28] text-[#09213f] transition hover:scale-105 cursor-pointer shadow-sm"
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
                  <span className="font-display text-xs font-bold">
                    {getInitials(user?.username)}
                  </span>
                )}
              </button>

              {/* Logout Button */}
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer shadow-sm"
                onClick={handleLogoutClick}
                type="button"
              >
                {t("common:actions.logout")}
              </button>
            </div>
          ) : showGuestCta ? (
            /* Guest login button */
            <button
              className="rounded-xl bg-gradient-to-r from-[#ffe06e] to-[#ecc741] px-5 py-2.5 text-xs font-extrabold text-[#112542] shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
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
