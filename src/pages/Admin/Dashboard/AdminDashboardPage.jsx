const KPI_CARDS = [
  {
    id: "totalUsers",
    label: "Total Users",
    value: "18,240",
    delta: "+12.4%",
    icon: (
      <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: "activeUsers",
    label: "Active Users",
    value: "14,905",
    delta: "+7.8%",
    icon: (
      <svg className="h-5 w-5 text-[#8b99ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "proUsers",
    label: "Pro Accounts",
    value: "2,184",
    delta: "+21.3%",
    icon: (
      <svg className="h-5 w-5 text-[#ecc741]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: "monthlyRevenue",
    label: "Monthly Revenue",
    value: "428.5M VND",
    delta: "+9.1%",
    icon: (
      <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const CHANNEL_PERFORMANCE = [
  { name: "Organic Search", percent: 74, value: "6,810 visits" },
  { name: "Social Media", percent: 48, value: "3,172 visits" },
  { name: "Paid Campaigns", percent: 36, value: "1,834 visits" },
  { name: "School Partnerships", percent: 58, value: "2,540 visits" },
];

const PLAN_BREAKDOWN = [
  { name: "Free", users: 12870, ratio: 70.5, gradient: "from-teal-500 to-emerald-400" },
  { name: "Pro", users: 2184, ratio: 12, gradient: "from-amber-500 to-yellow-400" },
  { name: "Edu", users: 3186, ratio: 17.5, gradient: "from-indigo-500 to-purple-400" },
];

const RECENT_ACTIVITY = [
  { id: "a1", action: "New users created", amount: 92, time: "Today, 09:35" },
  { id: "a2", action: "Users switched to Pro", amount: 18, time: "Today, 08:10" },
  { id: "a3", action: "Pricing package updated", amount: 3, time: "Yesterday, 17:52" },
  { id: "a4", action: "Accounts deactivated by admin", amount: 7, time: "Yesterday, 16:04" },
];

function AdminDashboardPage() {
  return (
    <section className="space-y-6">

      {/* KPI Section */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between hover:border-slate-300 shadow-xs transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{item.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                {item.icon}
              </span>
            </div>
            <div className="mt-4">
              <p className="font-['Sora'] text-3xl font-extrabold text-slate-800">{item.value}</p>
              <div className="mt-3.5 flex items-center">
                <span className="inline-flex items-center rounded-lg border border-emerald-250 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  {item.delta}
                </span>
                <span className="ml-2 text-[10px] font-medium text-slate-400">vs last period</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Charts & Breakdown */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Traffic */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <h3 className="font-['Sora'] text-base font-bold text-slate-800">Traffic & Acquisition</h3>
          <p className="mt-1 text-xs text-slate-400">Where users come from this month</p>

          <div className="mt-6 space-y-4">
            {CHANNEL_PERFORMANCE.map((channel) => (
              <div key={channel.name}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{channel.name}</span>
                  <span className="font-semibold text-indigo-650">{channel.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                    style={{ width: `${channel.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Plan Breakdown */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <h3 className="font-['Sora'] text-base font-bold text-slate-800">Plan Distribution</h3>
          <p className="mt-1 text-xs text-slate-400">Users grouped by current package</p>

          <div className="mt-6 space-y-3">
            {PLAN_BREAKDOWN.map((item) => (
              <div key={item.name} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <p className="font-bold text-slate-700">{item.name}</p>
                  <p className="text-slate-500 font-semibold">{item.users.toLocaleString()} users</p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-150">
                  <span
                    className={`block h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                    style={{ width: `${item.ratio}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400 font-medium">{item.ratio}% of active base</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Recent Activities */}
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-['Sora'] text-base font-bold text-slate-800">Recent Admin Activity</h3>
          <button
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-650 transition hover:bg-slate-100 hover:border-slate-300 shadow-xs active:scale-97 cursor-pointer"
            type="button"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-1.5">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Volume</th>
                <th className="px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ACTIVITY.map((row) => (
                <tr key={row.id} className="group rounded-xl bg-slate-50/20 border border-slate-100 hover:bg-slate-50 transition-all">
                  <td className="rounded-l-xl px-4 py-3 text-xs text-slate-600 font-medium border-t border-b border-l border-slate-100/70">{row.action}</td>
                  <td className="px-4 py-3 text-xs font-bold text-indigo-600 border-t border-b border-slate-100/70">{row.amount}</td>
                  <td className="rounded-r-xl px-4 py-3 text-xs text-slate-400 border-t border-b border-r border-slate-100/70">{row.time}</td>
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
