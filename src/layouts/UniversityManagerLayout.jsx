import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import fourSLogo from "../assets/logo-4s.png";

function UniversityManagerLayout({ onLogout = () => {} }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";
  const isEnglish = i18n.resolvedLanguage !== "vi";

  function handleLanguageChange(lang) {
    i18n.changeLanguage(lang);
  }

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  const NAV_ITEMS = [
    { label: isVi ? "Quản lý Đại học" : "University Management", to: "/school-manager/university" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* Sidebar – Desktop */}
        <aside className="hidden sticky top-0 h-screen w-[290px] shrink-0 border-r border-slate-200/80 bg-white px-5 py-6 lg:flex lg:flex-col shadow-sm overflow-y-auto">
          <button
            className="flex items-center gap-3 px-1 py-1 text-left transition hover:opacity-90 focus:outline-none"
            onClick={() => navigate("/school-manager/university")}
            type="button"
          >
            <img alt="4S logo" className="h-16 w-16 object-contain" src={fourSLogo} />
            <span className="font-['Sora'] text-lg font-bold text-slate-900 leading-tight">4S Admin Portal</span>
          </button>

          <div className="mt-3 px-2 py-1.5 rounded-xl bg-teal-50/50 border border-teal-100/50 text-teal-800">
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">
              {isVi ? "Vai trò hệ thống" : "System Role"}
            </p>
            <p className="text-xs font-bold truncate mt-0.5">
              {isVi ? "Quản lý Đại học" : "University Admin"}
            </p>
          </div>

          <nav aria-label="University manager navigation" className="mt-7 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "border-teal-550 bg-teal-50/70 text-teal-700 shadow-sm"
                      : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-2">
            <button
              className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
              onClick={handleLogout}
              type="button"
            >
              {isVi ? "Đăng xuất" : "Logout"}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white px-4 py-4 backdrop-blur-xl md:px-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-medium">
                  {isVi ? "Quản lý Tuyển sinh" : "Admissions & Universities"}
                </p>
                <h1 className="font-['Sora'] text-xl font-semibold text-slate-900">
                  {isVi ? "Cổng Quản Trị Đại Học 4S" : "4S University Management Console"}
                </h1>
              </div>

              {/* Language Switcher */}
              <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                <button
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    isEnglish
                      ? "bg-white text-teal-700 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => handleLanguageChange("en")}
                  type="button"
                >
                  EN
                </button>
                <button
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    isEnglish
                      ? "text-slate-500 hover:text-slate-800"
                      : "bg-white text-teal-700 shadow-sm border border-slate-100"
                  }`}
                  onClick={() => handleLanguageChange("vi")}
                  type="button"
                >
                  VI
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav aria-label="University manager mobile navigation" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) =>
                    `rounded-xl border px-3 py-2 text-center text-sm font-semibold transition ${
                      isActive
                        ? "border-teal-550 bg-teal-50/70 text-teal-700 shadow-sm"
                        : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"
                    }`
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                onClick={handleLogout}
                type="button"
              >
                {isVi ? "Đăng xuất" : "Logout"}
              </button>
            </nav>
          </header>

          <main className="w-full flex-1 px-4 py-5 md:px-6 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default UniversityManagerLayout;
