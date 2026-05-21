import { NavLink, Outlet, useNavigate } from "react-router-dom";
import fourSLogo from "../assets/logo-4s.png";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "User Management", to: "/admin/users" },
  { label: "Pricing Management", to: "/admin/pricing" },
];

function AdminLayout({ currentPlan = "", onLogout = () => {} }) {
  const navigate = useNavigate();
  const planLabel = String(currentPlan || "free").toUpperCase();

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(255,201,58,0.08),transparent_36%),radial-gradient(circle_at_84%_16%,rgba(15,226,168,0.11),transparent_38%),linear-gradient(160deg,#031124_0%,#071a35_38%,#041224_100%)] text-[#eaf2ff]">
      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside className="hidden min-h-screen w-[290px] shrink-0 border-r border-white/10 bg-[#0f223a]/88 px-5 py-6 lg:flex lg:flex-col">
          <button
            className="flex items-center gap-3 px-1 py-1 text-left transition hover:opacity-90"
            onClick={() => navigate("/admin/dashboard")}
            type="button"
          >
            <img alt="4S logo" className="h-16 w-16 object-contain" src={fourSLogo} />
            <span className="font-['Sora'] text-xl font-semibold text-[#f2cb36]">4S Admin</span>
          </button>

          <nav aria-label="Admin navigation" className="mt-7 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                end={item.to === "/admin/dashboard"}
                key={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "border-[#0ed8ab]/45 bg-[#0ed8ab]/18 text-[#0ed8ab]"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-7 rounded-2xl border border-[#ecc741]/25 bg-[#ecc741]/8 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#f3d459]">Current Plan</p>
            <p className="mt-1 font-['Sora'] text-2xl font-semibold">{planLabel}</p>
            <p className="mt-1 text-sm text-slate-300">UI-only mode. All actions are local demo state.</p>
          </div>

          <div className="mt-auto space-y-2">
            <button
              className="w-full rounded-xl border border-[#ecc741]/45 bg-[#ecc741]/14 px-4 py-2 text-sm font-semibold text-[#f3d459] transition hover:bg-[#ecc741]/24"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#102944]/82 px-4 py-4 backdrop-blur-xl md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Admin Panel</p>
                <h1 className="font-['Sora'] text-xl font-semibold">4S Operations Console</h1>
              </div>
            </div>

            <nav aria-label="Admin mobile navigation" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:hidden">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  end={item.to === "/admin/dashboard"}
                  key={item.to}
                  className={({ isActive }) =>
                    `rounded-xl border px-3 py-2 text-center text-sm font-semibold transition ${
                      isActive
                        ? "border-[#0ed8ab]/45 bg-[#0ed8ab]/18 text-[#0ed8ab]"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
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
