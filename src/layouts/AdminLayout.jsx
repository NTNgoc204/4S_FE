import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import fourSLogo from "../assets/logo-4s.png";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-indigo-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    label: "User Management",
    to: "/admin/users",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-blue-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Question Management",
    to: "/admin/questions",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-amber-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Pricing Management",
    to: "/admin/pricing",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-emerald-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Role Management",
    to: "/admin/roles",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-purple-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: "Finance",
    to: "/admin/finance",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-rose-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
];

function AdminLayout({ onLogout = () => {} }) {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function handleLogout() {
    onLogout();
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Sidebar */}
        <aside className="hidden sticky top-0 h-screen w-[280px] shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col shadow-[1px_0_10px_rgba(0,0,0,0.01)] overflow-y-auto">
          <button
            className="flex items-center gap-3 px-2 py-1 text-left transition hover:opacity-90 active:scale-98"
            onClick={() => navigate("/admin/dashboard")}
            type="button"
          >
            <img alt="4S logo" className="h-12 w-12 object-contain" src={fourSLogo} />
            <span className="font-['Sora'] text-lg font-bold text-slate-900 tracking-tight">4S Panel</span>
          </button>

          <nav aria-label="Admin navigation" className="mt-8 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                end={item.to === "/admin/dashboard"}
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

          <div className="mt-auto pt-6 border-t border-slate-100 space-y-2">
            <button
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-750 transition hover:bg-slate-50 hover:border-slate-350 active:scale-98 cursor-pointer shadow-xs"
              onClick={() => navigate("/admin/profile")}
              type="button"
            >
              <svg className="h-4 w-4 text-cyan-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile & Language</span>
            </button>

            <button
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-rose-200 bg-rose-50/40 py-2.5 text-sm font-bold text-rose-600 transition-all duration-300 hover:bg-rose-50 hover:text-rose-700 active:scale-98 cursor-pointer"
              onClick={handleLogout}
              type="button"
            >
              <svg className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Content body */}
        <div className="flex min-h-screen w-full flex-col min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-md px-4 py-4 md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-semibold leading-none">Console Control</p>
                <h1 className="font-['Sora'] text-lg font-bold text-slate-800 mt-1.5">4S Operations Console</h1>
              </div>

              {/* Status Indicator */}
              <div
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs transition-colors duration-300 ${
                  isOnline
                    ? "border-emerald-250 bg-emerald-50 text-emerald-700"
                    : "border-rose-250 bg-rose-50 text-rose-700"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isOnline ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isOnline ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  ></span>
                </span>
                <span>{isOnline ? "System Online" : "System Offline"}</span>
              </div>
            </div>

            {/* Mobile Nav */}
            <nav aria-label="Admin mobile navigation" className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:hidden">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  end={item.to === "/admin/dashboard"}
                  key={item.to}
                  className={({ isActive }) =>
                    `group flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "border-indigo-500/25 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

          <main className="w-full flex-1 px-4 py-6 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
