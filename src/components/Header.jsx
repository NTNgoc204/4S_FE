import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import fourSLogo from "../assets/logo-4s.png";
import NotificationDropdown from "./NotificationDropdown";
import { setThemeMode, setColorTheme } from "../feature/theme/themeSlice";

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

  // Get theme state
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const theme = useSelector((state) => state.theme || { themeMode: "dark", colorTheme: "emerald" });

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

  // Ref & listener to close theme dropdown when clicking outside
  const themeRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Color presets map — used by theme picker dropdown
  const colorMap = {
    emerald: { id: "emerald", hex: "#0ed8ab", label: isEnglish ? "Emerald" : "Ngọc lục" },
    ocean:   { id: "ocean",   hex: "#0ea5e9", label: isEnglish ? "Ocean"   : "Đại dương" },
    violet:  { id: "violet",  hex: "#8b5cf6", label: isEnglish ? "Violet"  : "Màu tím"   },
    sunset:  { id: "sunset",  hex: "#f97316", label: isEnglish ? "Sunset"  : "Hoàng hôn" },
  };
  const userRole = String(reduxAuth.role || currentRole).toLowerCase();
  const isOrgRole = finalIsLoggedIn && ["admin", "accountant", "contact", "school_manager"].includes(userRole);
  
  const isAdmin = finalIsLoggedIn && userRole === "admin";
  const isContact = finalIsLoggedIn && userRole === "contact";
  const showThemeSettings = !isOrgRole;

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
            <div className="absolute top-full right-0 mt-3 w-56 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#041326]/97 backdrop-blur-xl shadow-2xl transition-all duration-300 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-50 text-center flex flex-col items-center gap-3">
              <h4 className="text-[10px] font-bold text-slate-800 dark:text-white tracking-widest uppercase">
                {isEnglish ? "Scan to Download" : "Quét để tải App"}
              </h4>
              <div className="relative p-2 bg-white rounded-xl border border-slate-100 dark:border-white/5">
                <QRCodeSVG
                  value={import.meta.env.VITE_APK_DOWNLOAD_URL || "https://4s.vercel.app"}
                  size={96}
                  bgColor={"#FFFFFF"}
                  fgColor={"#041326"}
                  level={"L"}
                  includeMargin={false}
                />
                <div className="absolute inset-x-2 top-2 h-0.5 bg-primary-color shadow-[0_0_8px_var(--primary-color)] opacity-60 animate-scanLine pointer-events-none" />
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
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
              ) : String(reduxAuth.plan).toLowerCase() === "edu" ? (
                <span className="inline-flex items-center gap-1 rounded-lg border border-teal-500/40 bg-teal-500/10 px-2.5 py-1.5 text-[10px] font-black tracking-widest text-teal-400 shadow-inner">
                  <span className="text-xs">🎓</span>
                  <span>EDU</span>
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
              {isContact && (
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
              )}

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

              {/* Logout SVG Icon Button */}
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10 hover:scale-105 cursor-pointer shadow-sm"
                onClick={handleLogoutClick}
                type="button"
                title={t("common:actions.logout")}
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
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

          {/* Theme Settings Toggle & Dropdown — always visible for all users */}
          {showThemeSettings && (
            <div className="relative" ref={themeRef}>
              {/* Toggle button — adapts to mode */}
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                type="button"
                title="Customize Theme"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 12, cursor: 'pointer',
                  border: `1px solid ${theme.themeMode === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
                  background: isThemeOpen
                    ? (theme.themeMode === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.12)')
                    : (theme.themeMode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'),
                  color: theme.themeMode === 'light' ? '#334155' : '#cbd5e1',
                  transition: 'all 0.2s ease',
                  boxShadow: isThemeOpen ? `0 0 0 2px ${colorMap[theme.colorTheme]?.hex || '#0ed8ab'}40` : 'none',
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </button>

              {isThemeOpen && (
                <>
                  {/* Dropdown — fully inline styled, immune to CSS variable conflicts */}
                  <div
                    className="absolute right-0 mt-3 z-50 animate-fadeIn"
                    style={{
                      width: 272,
                      borderRadius: 20,
                      padding: '20px',
                      background: theme.themeMode === 'light'
                        ? 'rgba(255,255,255,0.95)'
                        : 'rgba(4,18,38,0.97)',
                      border: `1px solid ${theme.themeMode === 'light' ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.09)'}`,
                      boxShadow: theme.themeMode === 'light'
                        ? '0 20px 48px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)'
                        : '0 20px 48px -8px rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                  >
                    {/* Color preview strip */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderRadius: 8, overflow: 'hidden', height: 4 }}>
                      {Object.values(colorMap).map(c => (
                        <div key={c.hex} style={{ flex: 1, background: c.hex, opacity: theme.colorTheme === c.id ? 1 : 0.3, transition: 'opacity 0.3s' }} />
                      ))}
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                      textTransform: 'uppercase', marginBottom: 16,
                      color: colorMap[theme.colorTheme]?.hex || '#0ed8ab',
                    }}>
                      {isEnglish ? 'Theme Settings' : 'Tùy biến giao diện'}
                    </h3>

                    {/* Mode Selector */}
                    <div style={{ marginBottom: 18 }}>
                      <p style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: theme.themeMode === 'light' ? '#94a3b8' : '#475569', marginBottom: 10,
                      }}>
                        {isEnglish ? 'Appearance' : 'Chế độ'}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { mode: 'light', icon: '☀️', label: isEnglish ? 'Light' : 'Sáng' },
                          { mode: 'dark',  icon: '🌙', label: isEnglish ? 'Dark'  : 'Tối'  },
                        ].map(({ mode, icon, label }) => {
                          const isActiveMode = theme.themeMode === mode;
                          const primaryHex = colorMap[theme.colorTheme]?.hex || '#0ed8ab';
                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => dispatch(setThemeMode(mode))}
                              style={{
                                display: 'flex', alignItems: 'center', justifycontent: 'center',
                                gap: 6, padding: '8px 12px', borderRadius: 12, cursor: 'pointer',
                                fontSize: 12, fontWeight: 600, transition: 'all 0.2s ease',
                                border: isActiveMode
                                  ? `1.5px solid ${primaryHex}60`
                                  : `1px solid ${theme.themeMode === 'light' ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.08)'}`,
                                background: isActiveMode
                                  ? `${primaryHex}18`
                                  : (theme.themeMode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)'),
                                color: isActiveMode
                                  ? primaryHex
                                  : (theme.themeMode === 'light' ? '#64748b' : '#94a3b8'),
                              }}
                            >
                              <span>{icon}</span>
                              <span>{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: theme.themeMode === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)', marginBottom: 16 }} />

                    {/* Color Presets */}
                    <div>
                      <p style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: theme.themeMode === 'light' ? '#94a3b8' : '#475569', marginBottom: 10,
                      }}>
                        {isEnglish ? 'Color Preset' : 'Chủ đề màu'}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {Object.values(colorMap).map((c) => {
                          const isActive = theme.colorTheme === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => dispatch(setColorTheme(c.id))}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '9px 12px', borderRadius: 12, cursor: 'pointer',
                                fontSize: 12, fontWeight: 600, transition: 'all 0.2s ease',
                                border: isActive
                                  ? `1.5px solid ${c.hex}60`
                                  : `1px solid ${theme.themeMode === 'light' ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.07)'}`,
                                background: isActive
                                  ? `${c.hex}18`
                                  : (theme.themeMode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)'),
                                color: isActive
                                  ? c.hex
                                  : (theme.themeMode === 'light' ? '#64748b' : '#94a3b8'),
                                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                              }}
                            >
                              {/* Color swatch */}
                              <span style={{
                                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                                backgroundColor: c.hex,
                                boxShadow: isActive ? `0 0 0 2px ${c.hex}40, 0 0 0 3px ${c.hex}20` : 'none',
                                transition: 'box-shadow 0.2s',
                              }} />
                              <span style={{ flex: 1, textAlign: 'left' }}>{c.label}</span>
                              {/* Checkmark */}
                              {isActive && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                                  <path d="M2 6l3 3 5-5" stroke={c.hex} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
