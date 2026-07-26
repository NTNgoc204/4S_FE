import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import fourSLogo from "../assets/logo-4s.png";
import NotificationBell from "../components/NotificationBell";

export default function ContactLayout({ onLogout = () => {} }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";
  const isEnglish = i18n.resolvedLanguage !== "vi";

  // System network status monitoring
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Sidebar toggle state (persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("4s_contact_sidebar_collapsed") === "true";
  });

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  function handleLanguageChange(lang) {
    i18n.changeLanguage(lang);
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("4s_contact_sidebar_collapsed", String(next));
      return next;
    });
  };

  const NAV_ITEMS = [
    {
      label: isVi ? "Dashboard & Báo cáo" : "Dashboard & Reports",
      to: "/contact/dashboard",
      icon: (
        <svg className="h-4.5 w-4.5 text-indigo-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      label: isVi ? "Đơn Đăng Ký Học Đường" : "School Registrations",
      to: "/contact/registrations",
      icon: (
        <svg className="h-4.5 w-4.5 text-amber-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-500/20 selection:text-indigo-900">
      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Sidebar – Desktop with smooth transition toggle */}
        <aside
          className={`hidden sticky top-0 h-screen shrink-0 border-slate-200 bg-white py-6 lg:flex lg:flex-col shadow-[1px_0_10px_rgba(0,0,0,0.01)] transition-all duration-300 overflow-y-auto ${
            isSidebarCollapsed
              ? "w-0 border-r-0 px-0 overflow-hidden opacity-0"
              : "w-[280px] border-r px-5 opacity-100"
          }`}
        >
          <button
            className="flex items-center gap-3 px-2 py-1 text-left transition hover:opacity-90 active:scale-98 cursor-pointer focus:outline-none"
            onClick={() => navigate("/contact/dashboard")}
            type="button"
          >
            <img alt="4S logo" className="h-12 w-12 object-contain" src={fourSLogo} />
            <span className="font-['Sora'] text-lg font-bold text-slate-900 tracking-tight">4S Contact</span>
          </button>

          <nav aria-label="Contact navigation" className="mt-8 space-y-1.5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-indigo-500/20 bg-indigo-50/70 text-indigo-700 shadow-sm"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
                to={item.to}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-2 pt-6 border-t border-slate-100">
            <button
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-750 transition hover:bg-slate-50 hover:border-slate-350 active:scale-98 cursor-pointer shadow-xs"
              onClick={handleLogout}
              type="button"
            >
              <svg className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{isVi ? "Đăng xuất" : "Logout"}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white px-4 py-3 md:px-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Toggle Sidebar Button */}
                <button
                  onClick={toggleSidebar}
                  className="hidden lg:flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-indigo-650 transition shadow-2xs cursor-pointer focus:outline-none"
                  type="button"
                  title={isSidebarCollapsed ? (isVi ? "Hiện thanh bên" : "Show sidebar") : (isVi ? "Ẩn thanh bên" : "Hide sidebar")}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={isSidebarCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M4 6h16M4 12h10M4 18h16"} />
                  </svg>
                </button>

                {/* System Status Indicators */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    isOnline
                      ? "border-emerald-250 bg-emerald-50 text-emerald-700 animate-pulse"
                      : "border-rose-250 bg-rose-50 text-rose-700"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-600" : "bg-rose-600"}`} />
                  {isOnline ? "System Online" : "System Offline"}
                </span>
              </div>

              {/* Actions Right (Notifications, Language & Profile Name) */}
              <div className="flex items-center gap-3.5">
                {/* Dynamic Notification Bell */}
                <NotificationBell role="contact" />

                {/* Profile User Text */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">Ban Tiếp Nhận 4S</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Contact Agent</span>
                </div>

                {/* Language Switcher */}
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-xs">
                  <button
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      isEnglish
                        ? "bg-white text-indigo-600 shadow-xs border border-slate-100"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    onClick={() => handleLanguageChange("en")}
                    type="button"
                  >
                    EN
                  </button>
                  <button
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      isEnglish
                        ? "text-slate-500 hover:text-slate-800"
                        : "bg-white text-indigo-600 shadow-xs border border-slate-100"
                    }`}
                    onClick={() => handleLanguageChange("vi")}
                    type="button"
                  >
                    VI
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav aria-label="Contact mobile navigation" className="mt-3 grid grid-cols-2 gap-2 lg:hidden">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center text-xs font-bold transition ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-xs"
                        : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50"
                    }`
                  }
                  to={item.to}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="w-full flex-1 px-4 py-5 md:px-6 md:py-6 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
