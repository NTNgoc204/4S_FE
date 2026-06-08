import { NavLink, Outlet, useNavigate } from "react-router-dom";
import fourSLogo from "../assets/logo-4s.png";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "User Management", to: "/admin/users" },
  { label: "Question Management", to: "/admin/questions" },
  { label: "Pricing Management", to: "/admin/pricing" },
  { label: "Role Management", to: "/admin/roles" },
  { label: "Finance", to: "/admin/finance" },
];

function AdminLayout({ onLogout = () => {} }) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside className="hidden min-h-screen w-[290px] shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col shadow-sm">
          <button
            className="flex items-center gap-3 px-1 py-1 text-left transition hover:opacity-90"
            onClick={() => navigate("/admin/dashboard")}
            type="button"
          >
            <img alt="4S logo" className="h-16 w-16 object-contain" src={fourSLogo} />
            <span className="font-['Sora'] text-xl font-bold text-slate-900">4S Admin</span>
          </button>

          <nav aria-label="Admin navigation" className="mt-7 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                end={item.to === "/admin/dashboard"}
                key={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
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
              className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 shadow-sm"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-4 backdrop-blur-xl md:px-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-medium">Admin Panel</p>
                <h1 className="font-['Sora'] text-xl font-semibold text-slate-900">4S Operations Console</h1>
              </div>
            </div>

            <nav aria-label="Admin mobile navigation" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  end={item.to === "/admin/dashboard"}
                  key={item.to}
                  className={({ isActive }) =>
                    `rounded-xl border px-3 py-2 text-center text-sm font-semibold transition ${
                      isActive
                        ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                        : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"
                    }`
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
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

export default AdminLayout;
