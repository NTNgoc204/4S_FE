// ─────────────────────────────────────────────────────────────────────────────
// Mock data — hardcoded (no BE required)
// ─────────────────────────────────────────────────────────────────────────────

const VAT_RATE = 0.1;

const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 312_000_000, expenses: 128_000_000 },
  { month: "Feb", revenue: 348_500_000, expenses: 134_000_000 },
  { month: "Mar", revenue: 381_200_000, expenses: 141_500_000 },
  { month: "Apr", revenue: 402_700_000, expenses: 149_000_000 },
  { month: "May", revenue: 428_500_000, expenses: 155_000_000 },
  { month: "Jun", revenue: 451_300_000, expenses: 161_200_000 },
];

const EXPENSES = [
  { category: "Server & Infrastructure", amount: 68_000_000, percent: 44 },
  { category: "AI API Costs (Gemini)", amount: 42_500_000, percent: 27 },
  { category: "Marketing & Ads", amount: 24_700_000, percent: 16 },
  { category: "Support & Operations", amount: 12_000_000, percent: 8 },
  { category: "Miscellaneous", amount: 8_000_000, percent: 5 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmtVND(n) {
  return `${Number(n).toLocaleString("vi-VN")} VND`;
}

function fmtShort(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminFinancePage
// ─────────────────────────────────────────────────────────────────────────────
function AdminFinancePage() {
  // ── KPI totals from latest month ────────────────────────
  const latest = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
  const prev = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2];
  const totalRevenue = latest.revenue;
  const totalExpenses = latest.expenses;
  const netProfit = totalRevenue - totalExpenses;
  const vatCollected = Math.round(totalRevenue * VAT_RATE);
  const revGrowth = (((latest.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1);
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  // ── Bar chart max ────────────────────────────────────────
  const maxBar = Math.max(...MONTHLY_REVENUE.map((m) => m.revenue));

  return (
    <section className="space-y-6">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm text-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-['Sora'] text-2xl font-semibold md:text-3xl text-slate-900">
              Finance Overview
            </h2>
            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Read-only financial dashboard — revenue, VAT &amp; expenses.
              Data is mock/UI-only.
            </p>
          </div>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-700 shadow-sm">
            View Only
          </span>
        </div>
      </header>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          color="text-teal-600"
          delta={`+${revGrowth}% vs last month`}
          label="Monthly Revenue"
          value={`${fmtShort(totalRevenue)} VND`}
        />
        <KpiCard
          color="text-indigo-600"
          delta={`${profitMargin}% margin`}
          label="Net Profit"
          value={`${fmtShort(netProfit)} VND`}
        />
        <KpiCard
          color="text-amber-600"
          delta="10% of gross"
          label="VAT Collected"
          value={`${fmtShort(vatCollected)} VND`}
        />
        <KpiCard
          color="text-rose-600"
          delta="this month"
          label="Total Expenses"
          value={`${fmtShort(totalExpenses)} VND`}
        />
      </section>

      {/* ── Revenue Bar Chart + Expense Breakdown ─────────── */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Bar chart */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-800">
          <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">Revenue vs Expenses</h3>
          <p className="mt-1 text-sm text-slate-500">Last 6 months (VND)</p>

          <div className="mt-6 flex items-end gap-3">
            {MONTHLY_REVENUE.map((m) => {
              const revH = Math.round((m.revenue / maxBar) * 160);
              const expH = Math.round((m.expenses / maxBar) * 160);
              return (
                <div className="flex flex-1 flex-col items-center gap-1" key={m.month}>
                  <div className="flex w-full items-end justify-center gap-1" style={{ height: 160 }}>
                    <div
                      className="w-[45%] rounded-t-md bg-gradient-to-t from-teal-400 to-emerald-500"
                      style={{ height: revH }}
                      title={`Revenue: ${fmtVND(m.revenue)}`}
                    />
                    <div
                      className="w-[45%] rounded-t-md bg-rose-400/80"
                      style={{ height: expH }}
                      title={`Expenses: ${fmtVND(m.expenses)}`}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{m.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-5 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              Expenses
            </span>
          </div>
        </article>

        {/* Expense breakdown */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-800">
          <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">Expense Breakdown</h3>
          <p className="mt-1 text-sm text-slate-500">Current month by category</p>

          <div className="mt-5 space-y-3.5">
            {EXPENSES.map((e) => (
              <div key={e.category}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-700 font-medium">{e.category}</span>
                  <span className="font-semibold text-rose-600">{fmtShort(e.amount)} VND</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-rose-500"
                    style={{ width: `${e.percent}%` }}
                  />
                </div>
                <p className="mt-0.5 text-right text-xs text-slate-500 font-medium">{e.percent}%</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Total Expenses</span>
              <span className="font-semibold text-rose-600">{fmtVND(totalExpenses)}</span>
            </div>
          </div>
        </article>
      </section>

      {/* ── Profit / Revenue / VAT Summary ────────────────── */}
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-800">
        <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">P&amp;L Summary — June 2026</h3>
        <p className="mt-1 text-sm text-slate-500">Profit &amp; Loss statement (mock data, excl. VAT liability)</p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-right">Amount (VND)</th>
                <th className="px-4 py-3 text-right">% Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <PnLRow label="Gross Revenue" value={totalRevenue} of={totalRevenue} color="text-teal-600 font-semibold" />
              <PnLRow label="↳ VAT Collected (10%)" value={vatCollected} of={totalRevenue} color="text-indigo-600" indent />
              <PnLRow label="Revenue (excl. VAT)" value={totalRevenue - vatCollected} of={totalRevenue} color="text-slate-800" />
              <PnLRow label="Total Expenses" value={totalExpenses} of={totalRevenue} color="text-rose-600" />
              <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                <td className="px-4 py-3 font-bold text-slate-900">Net Profit</td>
                <td className="px-4 py-3 text-right font-bold text-teal-600">{fmtVND(netProfit)}</td>
                <td className="px-4 py-3 text-right font-bold text-teal-600">{profitMargin}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function KpiCard({ label, value, delta, color }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm text-slate-800">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 font-['Sora'] text-2xl font-semibold md:text-3xl ${color}`}>{value}</p>
      <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 shadow-sm">
        {delta}
      </span>
    </article>
  );
}

function PnLRow({ label, value, of: total, color, indent = false }) {
  const pct = ((value / total) * 100).toFixed(1);
  return (
    <tr>
      <td className={`px-4 py-3 text-slate-800 ${indent ? "pl-8 text-slate-500" : ""}`}>{label}</td>
      <td className={`px-4 py-3 text-right font-medium ${color}`}>{fmtVND(value)}</td>
      <td className={`px-4 py-3 text-right text-slate-500 ${indent ? "text-slate-400" : ""}`}>{pct}%</td>
    </tr>
  );
}

export default AdminFinancePage;
