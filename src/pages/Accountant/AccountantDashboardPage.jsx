import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

function fmtVND(n) {
  return `${Number(n).toLocaleString("vi-VN")} VND`;
}

function fmtShort(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

import { useTranslation } from "react-i18next";

const UI_TEXT = {
  vi: {
    title: "Doanh thu & Báo cáo Tổng quan",
    subtitle: "Xem phân tích doanh số hoạt động và cơ cấu chi phí thực tế.",
    juneRev: "Doanh thu tháng 6 (Gross)",
    vsLastMonth: "so với tháng trước",
    netProfit: "Lợi nhuận Thuần (Net Profit)",
    margin: "Biên lợi nhuận",
    vatCollected: "Thuế GTGT Thu hộ (VAT 10%)",
    preTaxTotal: "Tổng giá trị trước thuế",
    totalExp: "Tổng chi phí Vận hành",
    calculatedFromLedger: "Tính từ sổ sách chi phí",
    analysisReport: "Báo cáo Phân tích",
    analysisSubtitle: "Xem và xuất các thông số biểu đồ tài chính chu kỳ kinh doanh.",
    daily: "Ngày (Daily)",
    monthly: "Tháng (Monthly)",
    yearly: "Năm (Yearly)",
    exportExcel: "Xuất Excel",
    exportPdf: "Xuất PDF",
    dailyAvg: "Trung bình Ngày",
    monthlyAvg: "Trung bình Tháng",
    estYearly: "Doanh số Năm ước tính",
    fiscalCycle: "Chu kỳ tài khóa năm 2026",
    successTxCount: "Số lượng Giao dịch (Thành công)",
    successTxVal: "giao dịch thành công",
    excludeFailedRefunded: "Không bao gồm giao dịch lỗi hoặc đã hoàn tiền",
    refundedAmt: "Số tiền đã Hoàn (Refunded)",
    refundRate: "Tỷ lệ hoàn trả",
    revVsExp: "Doanh thu so với Chi phí",
    last6Months: "Tiến trình hoạt động trong 6 tháng gần nhất",
    revenue: "Doanh thu",
    expense: "Chi phí",
    expBreakdown: "Phân loại Cơ cấu Chi phí",
    opsItems: "Các hạng mục chi tiêu vận hành",
    noExpenses: "Chưa ghi nhận khoản chi nào.",
    plStatement: "Bảng Báo cáo Lợi nhuận & Tổn thất (P&L)",
    plSubtitle: "Báo cáo tổng hợp số liệu chi phí và doanh số tháng 6/2026",
    accountCategory: "Danh mục tài khoản",
    valueVND: "Giá trị (VND)",
    ratioToRev: "Tỷ lệ so với Doanh thu",
    totalGrossRev: "Tổng Doanh thu Gộp",
    vatCollectedRow: "↳ Thuế GTGT thu hộ (10%)",
    netRevExclVat: "Doanh thu Thực nhận (Không gồm VAT)",
    subExpense: "↳ Chi phí: ",
    totalOpsExp: "Tổng Chi phí Vận hành",
    netProfitRetained: "Lợi nhuận ròng Retained",
    processingExport: "Đang xử lý kết xuất dữ liệu...",
    exportSuccess: "Báo cáo tài chính đã xuất thành công dưới dạng",
  },
  en: {
    title: "Revenue & Overview Reports",
    subtitle: "Analyze operational sales performance and actual cost structures.",
    juneRev: "June Gross Revenue",
    vsLastMonth: "vs last month",
    netProfit: "Net Profit",
    margin: "Profit margin",
    vatCollected: "VAT Collected (10%)",
    preTaxTotal: "Total value before tax",
    totalExp: "Total Operational Expenses",
    calculatedFromLedger: "Based on expense ledger",
    analysisReport: "Analysis Report",
    analysisSubtitle: "View and export financial charts and business metrics.",
    daily: "Daily",
    monthly: "Monthly",
    yearly: "Yearly",
    exportExcel: "Export Excel",
    exportPdf: "Export PDF",
    dailyAvg: "Daily Average",
    monthlyAvg: "Monthly Average",
    estYearly: "Estimated Annual Revenue",
    fiscalCycle: "Fiscal cycle 2026",
    successTxCount: "Successful Transactions",
    successTxVal: "successful transactions",
    excludeFailedRefunded: "Excludes failed or refunded transactions",
    refundedAmt: "Total Refunded Amount",
    refundRate: "Refund rate",
    revVsExp: "Revenue vs Expenses",
    last6Months: "Operating progress over the last 6 months",
    revenue: "Revenue",
    expense: "Expenses",
    expBreakdown: "Expense Breakdown Categories",
    opsItems: "Operational expenditure items",
    noExpenses: "No expenses recorded.",
    plStatement: "Profit & Loss (P&L) Statement",
    plSubtitle: "Consolidated cost and revenue report for June 2026",
    accountCategory: "Account Category",
    valueVND: "Value (VND)",
    ratioToRev: "Ratio to Revenue",
    totalGrossRev: "Total Gross Revenue",
    vatCollectedRow: "↳ Collected VAT (10%)",
    netRevExclVat: "Net Revenue (Excl. VAT)",
    subExpense: "↳ Expense: ",
    totalOpsExp: "Total Operational Expenses",
    netProfitRetained: "Retained Net Profit",
    processingExport: "Processing data export...",
    exportSuccess: "Financial report exported successfully as",
  }
};

function AccountantDashboardPage() {
  const { expenses, incomes } = useOutletContext();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const text = UI_TEXT[locale];

  const [revenueFilterType, setRevenueFilterType] = useState("monthly");

  // Calculate dynamic June summaries based on shared states
  const baseRevenue = 450000000; // June fixed baseline
  const juneTransactionInflow = useMemo(() => {
    return incomes
      .filter((i) => i.date.startsWith("2026-06"))
      .reduce((sum, i) => {
        if (i.status === "Success") return sum + i.amount;
        if (i.status === "Refunded") return sum - i.amount;
        return sum;
      }, 0);
  }, [incomes]);

  const totalRevenue = baseRevenue + juneTransactionInflow;

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";

  // Previous month comparison
  const prevRevenue = 428500000;
  const revGrowth = (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1);

  // Grouped expenses for breakdown
  const groupedExpenses = useMemo(() => {
    const groups = {};
    expenses.forEach((item) => {
      groups[item.category] = (groups[item.category] || 0) + item.amount;
    });

    const sum = Object.values(groups).reduce((a, b) => a + b, 0) || 1;
    return Object.keys(groups)
      .map((cat) => ({
        category: cat,
        amount: groups[cat],
        percent: Math.round((groups[cat] / sum) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // Dynamic Bar Chart values
  const MONTHLY_REVENUE = [
    { month: "Jan", revenue: 312000000, expenses: 128000000 },
    { month: "Feb", revenue: 348500000, expenses: 134000000 },
    { month: "Mar", revenue: 381200000, expenses: 141500000 },
    { month: "Apr", revenue: 402700000, expenses: 149000000 },
    { month: "May", revenue: 428500000, expenses: 155000000 },
    { month: "Jun", revenue: totalRevenue, expenses: totalExpenses },
  ];
  const maxBar = Math.max(...MONTHLY_REVENUE.map((m) => Math.max(m.revenue, m.expenses)));

  function handleExport(format) {
    toast.info(text.processingExport);
    setTimeout(() => {
      toast.success(`${text.exportSuccess} ${format.toUpperCase()}!`);
    }, 1000);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">{text.title}</h2>
          <p className="text-sm text-slate-500">{text.subtitle}</p>
        </div>
      </div>

      {/* KPI Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{text.juneRev}</p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-teal-600">{fmtVND(totalRevenue)}</p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            +{revGrowth}% {text.vsLastMonth}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{text.netProfit}</p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-indigo-600">{fmtVND(netProfit)}</p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {text.margin} {profitMargin}%
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            {locale === "vi" ? "Giao dịch thành công" : "Successful Transactions"}
          </p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-[#0ed8ab]">
            {incomes.filter((i) => i.status === "Success").length}
          </p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {locale === "vi" ? `Trên tổng số ${incomes.length} giao dịch` : `Out of ${incomes.length} total transactions`}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{text.totalExp}</p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-rose-600">{fmtVND(totalExpenses)}</p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {text.calculatedFromLedger}
          </span>
        </div>
      </section>

      {/* Reports and Filters */}
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">{text.analysisReport}</h3>
            <p className="text-xs text-slate-400">{text.analysisSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  revenueFilterType === "daily" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setRevenueFilterType("daily")}
                type="button"
              >
                {text.daily}
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  revenueFilterType === "monthly" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setRevenueFilterType("monthly")}
                type="button"
              >
                {text.monthly}
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  revenueFilterType === "yearly" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setRevenueFilterType("yearly")}
                type="button"
              >
                {text.yearly}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => handleExport("excel")}
                type="button"
              >
                {text.exportExcel}
              </button>
              <button
                className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                onClick={() => handleExport("pdf")}
                type="button"
              >
                {text.exportPdf}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              {revenueFilterType === "daily" ? text.dailyAvg : revenueFilterType === "monthly" ? text.monthlyAvg : text.estYearly}
            </p>
            <p className="mt-1.5 font-['Sora'] text-xl font-semibold text-slate-900">
              {revenueFilterType === "daily" ? fmtVND(totalRevenue / 30) : revenueFilterType === "monthly" ? fmtVND(totalRevenue) : fmtVND(totalRevenue * 1.8)}
            </p>
            <p className="text-xs text-slate-400 mt-1">{text.fiscalCycle}</p>
          </div>

          <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{text.successTxCount}</p>
            <p className="mt-1.5 font-['Sora'] text-xl font-semibold text-teal-600">
              +{incomes.filter((i) => i.status === "Success").length} {text.successTxVal}
            </p>
            <p className="text-xs text-slate-400 mt-1">{text.excludeFailedRefunded}</p>
          </div>

          <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{text.refundedAmt}</p>
            <p className="mt-1.5 font-['Sora'] text-xl font-semibold text-rose-600">
              {fmtVND(incomes.filter((i) => i.status === "Refunded").reduce((sum, i) => sum + i.amount, 0))}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {text.refundRate}: {incomes.length > 0 ? ((incomes.filter((i) => i.status === "Refunded").length / incomes.length) * 100).toFixed(1) : "0"}%
            </p>
          </div>
        </div>
      </article>

      {/* Revenue Chart & Breakdown */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Column Chart */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">{text.revVsExp}</h3>
          <p className="mt-1 text-sm text-slate-500">{text.last6Months}</p>

          <div className="mt-6 flex items-end gap-3 h-[160px]">
            {MONTHLY_REVENUE.map((m) => {
              const revH = Math.round((m.revenue / maxBar) * 130);
              const expH = Math.round((m.expenses / maxBar) * 130);
              return (
                <div className="flex flex-1 flex-col items-center gap-1" key={m.month}>
                  <div className="flex w-full items-end justify-center gap-1 h-[130px]">
                    <div
                      className="w-[40%] rounded-t bg-gradient-to-t from-teal-400 to-emerald-500"
                      style={{ height: `${revH}px` }}
                      title={`Doanh thu: ${fmtVND(m.revenue)}`}
                    />
                    <div
                      className="w-[40%] rounded-t bg-rose-400"
                      style={{ height: `${expH}px` }}
                      title={`Chi phí: ${fmtVND(m.expenses)}`}
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
              {text.revenue}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              {text.expense}
            </span>
          </div>
        </article>

        {/* Expense breakdown progress */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">{text.expBreakdown}</h3>
          <p className="mt-1 text-sm text-slate-500">{text.opsItems}</p>

          <div className="mt-5 space-y-4">
            {groupedExpenses.length === 0 ? (
              <p className="text-center py-6 text-sm text-slate-400">{text.noExpenses}</p>
            ) : (
              groupedExpenses.map((item) => (
                <div key={item.category}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-slate-700 font-medium">{item.category}</span>
                    <span className="font-semibold text-rose-600">{fmtVND(item.amount)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-rose-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-xs text-slate-500 font-medium">{item.percent}%</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {/* P&L statement table */}
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">{text.plStatement}</h3>
        <p className="mt-1 text-sm text-slate-500">{text.plSubtitle}</p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
              <tr>
                <th className="px-4 py-3">{text.accountCategory}</th>
                <th className="px-4 py-3 text-right">{text.valueVND}</th>
                <th className="px-4 py-3 text-right">{text.ratioToRev}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 text-slate-800 font-semibold">{text.totalGrossRev}</td>
                <td className="px-4 py-3 text-right text-teal-600 font-semibold">{fmtVND(totalRevenue)}</td>
                <td className="px-4 py-3 text-right text-slate-500">100.0%</td>
              </tr>

              {groupedExpenses.map((item) => (
                <tr key={item.category}>
                  <td className="px-4 py-3 pl-8 text-slate-500">{text.subExpense}{item.category}</td>
                  <td className="px-4 py-3 text-right text-rose-500">{fmtVND(item.amount)}</td>
                  <td className="px-4 py-3 text-right text-slate-400">{((item.amount / totalRevenue) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-3 text-slate-800 font-semibold">{text.totalOpsExp}</td>
                <td className="px-4 py-3 text-right text-rose-600 font-semibold">{fmtVND(totalExpenses)}</td>
                <td className="px-4 py-3 text-right text-slate-500">
                  {((totalExpenses / totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                <td className="px-4 py-3 font-bold text-slate-900">{text.netProfitRetained}</td>
                <td className="px-4 py-3 text-right font-bold text-teal-600">{fmtVND(netProfit)}</td>
                <td className="px-4 py-3 text-right font-bold text-teal-600">{profitMargin}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

export default AccountantDashboardPage;
