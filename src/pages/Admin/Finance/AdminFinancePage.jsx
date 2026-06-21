import React from "react";
import RevenueChart from "./components/RevenueChart";
import ExpenseBreakdown from "./components/ExpenseBreakdown";
import PnLSummaryTable from "./components/PnLSummaryTable";

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
      {/* Page Header Actions Area (No title/sub description) */}
      <div className="flex justify-end">
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-xs">
          Chỉ Xem (View Only)
        </span>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          color="text-indigo-600"
          delta={`+${revGrowth}% so với tháng trước`}
          label="Doanh Thu Tháng"
          value={`${fmtShort(totalRevenue)} VND`}
        />
        <KpiCard
          color="text-emerald-600"
          delta={`Biên lợi nhuận ${profitMargin}%`}
          label="Lợi Nhuận Ròng"
          value={`${fmtShort(netProfit)} VND`}
        />
        <KpiCard
          color="text-amber-600"
          delta="10% doanh thu gộp"
          label="Thuế VAT Thu Hộ"
          value={`${fmtShort(vatCollected)} VND`}
        />
        <KpiCard
          color="text-rose-650"
          delta="Tháng này"
          label="Tổng Chi Phí"
          value={`${fmtShort(totalExpenses)} VND`}
        />
      </section>

      {/* ── Revenue Bar Chart + Expense Breakdown ─────────── */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Bar chart */}
        <RevenueChart
          MONTHLY_REVENUE={MONTHLY_REVENUE}
          maxBar={maxBar}
          fmtVND={fmtVND}
          fmtShort={fmtShort}
        />

        {/* Expense breakdown */}
        <ExpenseBreakdown
          EXPENSES={EXPENSES}
          totalExpenses={totalExpenses}
          fmtVND={fmtVND}
          fmtShort={fmtShort}
        />
      </section>

      {/* ── Profit / Revenue / VAT Summary ────────────────── */}
      <PnLSummaryTable
        totalRevenue={totalRevenue}
        vatCollected={vatCollected}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        profitMargin={profitMargin}
        fmtVND={fmtVND}
      />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function KpiCard({ label, value, delta, color }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs text-slate-850">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`mt-2 font-['Sora'] text-2xl font-extrabold md:text-3xl ${color}`}>{value}</p>
      <span className="mt-3 inline-flex rounded-full border border-slate-155 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 shadow-xs">
        {delta}
      </span>
    </article>
  );
}

export default AdminFinancePage;
