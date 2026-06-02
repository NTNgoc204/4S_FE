import { useNavigate } from "react-router-dom";

const KPI_CARDS = [
  { id: "totalUsers", label: "Total Users", value: "18,240", delta: "+12.4%" },
  { id: "activeUsers", label: "Active Users", value: "14,905", delta: "+7.8%" },
  { id: "proUsers", label: "Pro Accounts", value: "2,184", delta: "+21.3%" },
  { id: "monthlyRevenue", label: "Monthly Revenue", value: "428.5M VND", delta: "+9.1%" },
];

const CHANNEL_PERFORMANCE = [
  { name: "Organic Search", percent: 74, value: "6,810 visits" },
  { name: "Social Media", percent: 48, value: "3,172 visits" },
  { name: "Paid Campaigns", percent: 36, value: "1,834 visits" },
  { name: "School Partnerships", percent: 58, value: "2,540 visits" },
];

const PLAN_BREAKDOWN = [
  { name: "Free", users: 12870, ratio: 70.5, colorClass: "bg-[#16d2ac]" },
  { name: "Pro", users: 2184, ratio: 12, colorClass: "bg-[#ecc741]" },
  { name: "Edu", users: 3186, ratio: 17.5, colorClass: "bg-[#7f8cff]" },
];

const RECENT_ACTIVITY = [
  { id: "a1", action: "New users created", amount: 92, time: "Today, 09:35" },
  { id: "a2", action: "Users switched to Pro", amount: 18, time: "Today, 08:10" },
  { id: "a3", action: "Pricing package updated", amount: 3, time: "Yesterday, 17:52" },
  { id: "a4", action: "Accounts deactivated by admin", amount: 7, time: "Yesterday, 16:04" },
];

function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-['Sora'] text-2xl font-semibold md:text-3xl text-slate-900">Admin Dashboard</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-500 md:text-base">
              Monitor user growth, account status, and package performance in one place.
              This page is UI-only and uses mock data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100/80 shadow-sm"
              onClick={() => navigate("/admin/users")}
              type="button"
            >
              Manage Users
            </button>
            <button
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100/80 shadow-sm"
              onClick={() => navigate("/admin/pricing")}
              type="button"
            >
              Edit Pricing
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 font-['Sora'] text-3xl font-semibold text-slate-900">{item.value}</p>
            <span className="mt-3 inline-flex rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
              {item.delta} vs last period
            </span>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">Traffic & Acquisition</h3>
          <p className="mt-1 text-sm text-slate-500">Where users come from this month</p>

          <div className="mt-5 space-y-4">
            {CHANNEL_PERFORMANCE.map((channel) => (
              <div key={channel.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-700 font-medium">{channel.name}</span>
                  <span className="font-semibold text-teal-600">{channel.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                    style={{ width: `${channel.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">Plan Distribution</h3>
          <p className="mt-1 text-sm text-slate-500">Users grouped by current package</p>

          <div className="mt-5 space-y-3">
            {PLAN_BREAKDOWN.map((item) => {
              // Map old colors to professional light-theme colors
              let colorClass = "bg-teal-500";
              if (item.name === "Pro") colorClass = "bg-amber-500";
              if (item.name === "Edu") colorClass = "bg-indigo-500";
              return (
                <div key={item.name} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-slate-600 font-medium">{item.users.toLocaleString()} users</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200/60">
                    <span
                      className={`block h-full rounded-full ${colorClass}`}
                      style={{ width: `${item.ratio}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.ratio}% of active base</p>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">Recent Admin Activity</h3>
          <button
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            type="button"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.13em] text-slate-500 font-semibold">
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Volume</th>
                <th className="px-3 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ACTIVITY.map((row) => (
                <tr key={row.id} className="rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <td className="rounded-l-xl px-3 py-3 text-sm text-slate-800 font-medium">{row.action}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-teal-600">{row.amount}</td>
                  <td className="rounded-r-xl px-3 py-3 text-sm text-slate-500">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default AdminDashboardPage;
