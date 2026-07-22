import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchRegistrationsRequest } from "../../feature/edu/eduSlice";
import { financeAPI } from "../../feature/finance/financeAPI";

function fmtVND(n) {
  return `${Math.round(Number(n)).toLocaleString("vi-VN")} VND`;
}

const mapCategoryToUI = (beCat) => beCat;

const getCategoryLabel = (cat, t) => {
  if (cat === "Operational") return t("expenses.categories.operational");
  if (cat === "Marketing") return t("expenses.categories.marketing");
  if (cat === "Personnel") return t("expenses.categories.personnel");
  if (cat === "AI API & Infrastructure") return t("expenses.categories.ai");
  return t("expenses.categories.misc");
};

function AccountantDashboardPage() {
  const { t, i18n } = useTranslation(["accountant", "common"]);
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueFilterType, setRevenueFilterType] = useState("monthly");
  const { incomes = [] } = useOutletContext() || {};
  const dispatch = useDispatch();
  const { registrations: schoolRegistrations = [] } = useSelector((s) => s.edu);

  useEffect(() => {
    dispatch(fetchRegistrationsRequest());
  }, [dispatch]);
  
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    grossRevenue: 0,
    netProfit: 0,
    successfulTransactions: 0,
  });
  const [expensesInfo, setExpensesInfo] = useState({
    totalOperationalExpenses: 0,
    breakdown: {},
    list: [],
  });
  const [historicalData, setHistoricalData] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState(0);

  // Fetch summary, expenses, and historical charts for the entire year
  const fetchData = async () => {
    setLoading(true);
    try {
      const monthIndexes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      
      // Fetch summary and expenses for all 12 months in parallel
      const monthlyDataRequests = monthIndexes.map(async (mNum) => {
        try {
          const [sR, eR] = await Promise.all([
            financeAPI.getSummary(mNum, selectedYear),
            financeAPI.getExpenses(mNum, selectedYear),
          ]);
          return {
            monthNum: mNum,
            revenue: sR.data.grossRevenue || 0,
            expenses: eR.data.totalOperationalExpenses || 0,
            successfulTransactions: sR.data.successfulTransactions || 0,
            breakdown: eR.data.breakdown || {},
            expensesList: eR.data.expenses || [],
          };
        } catch {
          return {
            monthNum: mNum,
            revenue: 0,
            expenses: 0,
            successfulTransactions: 0,
            breakdown: {},
            expensesList: [],
          };
        }
      });

      const resolvedMonths = await Promise.all(monthlyDataRequests);

      // 1. Calculate annual aggregated KPI values
      const annualGrossRevenue = resolvedMonths.reduce((sum, item) => sum + item.revenue, 0);
      const annualTotalExpenses = resolvedMonths.reduce((sum, item) => sum + item.expenses, 0);
      const annualNetProfit = annualGrossRevenue - annualTotalExpenses;
      const annualSuccessfulTransactions = resolvedMonths.reduce((sum, item) => sum + item.successfulTransactions, 0);

      setSummary({
        grossRevenue: annualGrossRevenue,
        netProfit: annualNetProfit,
        successfulTransactions: annualSuccessfulTransactions,
      });

      // 2. Combine all expense category breakdowns and lists
      const annualBreakdown = {
        "AI API & Infrastructure": 0,
        "Personnel": 0,
        "Marketing": 0,
        "Operational": 0,
        "Miscellaneous": 0,
      };

      const combinedExpensesList = [];

      resolvedMonths.forEach((item) => {
        combinedExpensesList.push(...item.expensesList);
        Object.keys(item.breakdown).forEach((cat) => {
          const normalizedCat = cat.trim();
          const foundKey = Object.keys(annualBreakdown).find(k => k.toLowerCase() === normalizedCat.toLowerCase());
          if (foundKey) {
            annualBreakdown[foundKey] += item.breakdown[cat] || 0;
          } else {
            annualBreakdown[normalizedCat] = item.breakdown[cat] || 0;
          }
        });
      });

      setExpensesInfo({
        totalOperationalExpenses: annualTotalExpenses,
        breakdown: annualBreakdown,
        list: combinedExpensesList,
      });

      // 3. Format historical data (all 12 months) for the chart
      const chartData = resolvedMonths.map((item) => {
        const monthLabel = t(`dashboard.monthShort.${item.monthNum}`);
        return {
          month: monthLabel,
          revenue: item.revenue,
          expenses: item.expenses,
          monthNum: item.monthNum,
        };
      });
      setHistoricalData(chartData);
      setYearlyRevenue(annualGrossRevenue);
    } catch (err) {
      console.error("Failed to load financial dashboard:", err);
      toast.error(t("dashboard.errLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const profitMargin = useMemo(() => {
    if (summary.grossRevenue <= 0) return "0.0";
    return ((summary.netProfit / summary.grossRevenue) * 100).toFixed(1);
  }, [summary]);

  const maxBar = useMemo(() => {
    if (historicalData.length === 0) return 100000;
    const vals = historicalData.map((m) => Math.max(m.revenue, m.expenses));
    return Math.max(...vals, 100000);
  }, [historicalData]);

  const isCurrentYear = useMemo(() => {
    return selectedYear === new Date().getFullYear();
  }, [selectedYear]);

  const currentMonthNum = useMemo(() => {
    return new Date().getMonth() + 1;
  }, []);

  const currentMonthRevenue = useMemo(() => {
    const found = historicalData.find((h) => h.monthNum === currentMonthNum);
    return found ? found.revenue : 0;
  }, [historicalData, currentMonthNum]);

  const dailyRevenue = useMemo(() => {
    const today = new Date();
    const yr = today.getFullYear();
    const mo = today.getMonth() + 1;
    const dy = today.getDate();

    const studentTotal = incomes.reduce((sum, item) => {
      if (item.status === "Success" && item.date) {
        const parts = item.date.split(" ");
        if (parts.length > 0) {
          const dateParts = parts[0].split("-");
          if (dateParts.length === 3) {
            const yVal = parseInt(dateParts[0]);
            const mVal = parseInt(dateParts[1]);
            const dVal = parseInt(dateParts[2]);
            if (yVal === yr && mVal === mo && dVal === dy) {
              return sum + (item.amount || 0);
            }
          }
        }
      }
      return sum;
    }, 0);

    const schoolTotal = schoolRegistrations.reduce((sum, item) => {
      if ((item.status === "Paid" || item.status === "Completed") && item.createdAt) {
        const parts = item.createdAt.split(" ");
        if (parts.length > 0) {
          const dateParts = parts[0].split("-");
          if (dateParts.length === 3) {
            const yVal = parseInt(dateParts[0]);
            const mVal = parseInt(dateParts[1]);
            const dVal = parseInt(dateParts[2]);
            if (yVal === yr && mVal === mo && dVal === dy) {
              return sum + (item.price || 0);
            }
          }
        }
      }
      return sum;
    }, 0);

    return studentTotal + schoolTotal;
  }, [incomes, schoolRegistrations]);

  const transformedBreakdown = useMemo(() => {
    const list = [];
    const breakdown = expensesInfo.breakdown;
    const total = expensesInfo.totalOperationalExpenses || 1;

    Object.keys(breakdown).forEach((cat) => {
      const amt = breakdown[cat] || 0;
      list.push({
        category: getCategoryLabel(cat, t),
        rawCategory: cat,
        amount: amt,
        percent: Math.round((amt / total) * 100),
      });
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [expensesInfo, t]);

  function exportCSV() {
    const title = t("dashboard.financialReportTitle", { year: selectedYear });
    const header = [
      t("dashboard.financialIndicator"),
      t("dashboard.valueVND"),
      t("dashboard.ratioToRev")
    ];

    const kpiRows = [
      [t("dashboard.grossRev"), summary.grossRevenue, "100.0%"],
      [t("dashboard.totalExp"), expensesInfo.totalOperationalExpenses, summary.grossRevenue > 0 ? ((expensesInfo.totalOperationalExpenses / summary.grossRevenue) * 100).toFixed(1) + "%" : "0.0%"],
      [t("dashboard.netProfit"), summary.netProfit, profitMargin + "%"],
      [t("dashboard.successTxCount"), summary.successfulTransactions, "-"]
    ];

    const breakdownHeader = [
      t("dashboard.expenseCategory"),
      t("dashboard.valueVND"),
      t("dashboard.breakdownRatio")
    ];

    const breakdownRows = transformedBreakdown.map(item => [
      item.category,
      item.amount,
      item.percent + "%"
    ]);

    // Build CSV string with BOM for Excel UTF-8 support
    let csvContent = "\uFEFF"; 
    csvContent += `"${title}"\n\n`;
    
    csvContent += `"${header.join('","')}"\n`;
    kpiRows.forEach(row => {
      csvContent += `"${row.join('","')}"\n`;
    });
    
    csvContent += "\n";
    csvContent += `"${breakdownHeader.join('","')}"\n`;
    breakdownRows.forEach(row => {
      csvContent += `"${row.join('","')}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_cao_tai_chinh_nam_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(t("dashboard.excelExportSuccess"));
  }

  function exportPDF() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error(t("dashboard.pdfPopupBlocker"));
      return;
    }

    const title = t("dashboard.financialReportTitle", { year: selectedYear }).toUpperCase();
    const company = t("dashboard.company");

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; background-color: #fff; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
            .company { font-size: 14px; font-weight: bold; color: #64748b; letter-spacing: 0.05em; }
            h1 { font-size: 22px; color: #0f172a; margin: 10px 0 5px 0; font-weight: 700; }
            .date { font-size: 12px; color: #94a3b8; }
            
            .kpis { display: flex; gap: 20px; margin-bottom: 30px; }
            .kpi-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #f8fafc; }
            .kpi-title { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
            .kpi-value { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 5px; }
            .kpi-value.green { color: #0d9488; }
            .kpi-value.red { color: #e11d48; }
            .kpi-value.indigo { color: #4f46e5; }
            
            h2 { font-size: 16px; color: #0f172a; border-left: 4px solid #0d9488; padding-left: 10px; margin-top: 30px; margin-bottom: 15px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
            th, td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
            th { background-color: #f1f5f9; color: #475569; font-weight: 600; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; background-color: #f8fafc; }
            .footer-notes { margin-top: 50px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">${company}</div>
            <h1>${title}</h1>
            <div class="date">${t("dashboard.exportedAt")}: ${new Date().toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}</div>
          </div>
          
          <div class="kpis">
            <div class="kpi-card">
              <div class="kpi-title">${t("dashboard.grossRev")}</div>
              <div class="kpi-value green">${fmtVND(summary.grossRevenue)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">${t("dashboard.totalExp")}</div>
              <div class="kpi-value red">${fmtVND(expensesInfo.totalOperationalExpenses)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">${t("dashboard.netProfit")}</div>
              <div class="kpi-value indigo">${fmtVND(summary.netProfit)} (${t("dashboard.margin")} ${profitMargin}%)</div>
            </div>
          </div>
          
          <h2>${t("dashboard.expBreakdown")}</h2>
          <table>
            <thead>
              <tr>
                <th>${t("dashboard.expenseCategory")}</th>
                <th class="text-right">${t("dashboard.valueVND")}</th>
                <th class="text-right">${t("dashboard.breakdownRatio")}</th>
              </tr>
            </thead>
            <tbody>
              ${transformedBreakdown.map(item => `
                <tr>
                  <td>${item.category}</td>
                  <td class="text-right">${fmtVND(item.amount)}</td>
                  <td class="text-right">${item.percent}%</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td>${t("dashboard.totalExpenses")}</td>
                <td class="text-right">${fmtVND(expensesInfo.totalOperationalExpenses)}</td>
                <td class="text-right">100%</td>
              </tr>
            </tbody>
          </table>
          
          <h2>${t("dashboard.plStatement")}</h2>
          <table>
            <thead>
              <tr>
                <th>${t("dashboard.accountCategory")}</th>
                <th class="text-right">${t("dashboard.valueVND")}</th>
                <th class="text-right">${t("dashboard.ratioToRev")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${t("dashboard.totalGrossRev")}</td>
                <td class="text-right">${fmtVND(summary.grossRevenue)}</td>
                <td class="text-right">100.0%</td>
              </tr>
              ${transformedBreakdown.map(item => `
                <tr>
                  <td>&nbsp;&nbsp;&nbsp;&nbsp;${t("dashboard.subExpense")}${item.category}</td>
                  <td class="text-right" style="color: #e11d48;">${fmtVND(item.amount)}</td>
                  <td class="text-right">${summary.grossRevenue > 0 ? ((item.amount / summary.grossRevenue) * 100).toFixed(1) : "0.0"}%</td>
                </tr>
              `).join('')}
              <tr class="total-row" style="border-top: 2px solid #1e293b;">
                <td>${t("dashboard.netProfitRetained")}</td>
                <td class="text-right" style="color: #0d9488;">${fmtVND(summary.netProfit)}</td>
                <td class="text-right">${profitMargin}%</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer-notes">
            ${t("dashboard.automatedReportFooter")}
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success(t("dashboard.pdfExportSuccess"));
  }

  function handleExport(format) {
    if (format === "excel") {
      exportCSV();
    } else if (format === "pdf") {
      exportPDF();
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">{t("dashboard.title")}</h2>
          <p className="text-sm text-slate-500">{t("dashboard.subtitle")}</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500">{t("dashboard.selectYear")}</span>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm font-semibold cursor-pointer"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            value={selectedYear}
          >
            {[2024, 2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
        </div>
      ) : (
        <>
          {/* KPI Statistics */}
          <section className="grid gap-4 sm:grid-cols-3">
            {/* Card 1: Gross Revenue */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{t("dashboard.grossRev")}</p>
              <p className="mt-2 font-['Sora'] text-2xl font-semibold text-teal-600">
                {fmtVND(summary.grossRevenue)}
              </p>
              <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {t("dashboard.realtimeData")}
              </span>
            </div>

            {/* Card 2: Operational Expenses */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{t("dashboard.totalExp")}</p>
              <p className="mt-2 font-['Sora'] text-2xl font-semibold text-rose-600">
                {fmtVND(expensesInfo.totalOperationalExpenses)}
              </p>
              <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {t("dashboard.realtimeData")}
              </span>
            </div>

            {/* Card 3: Net Profit */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{t("dashboard.netProfit")}</p>
              <p className="mt-2 font-['Sora'] text-2xl font-semibold text-indigo-600">
                {fmtVND(summary.netProfit)}
              </p>
              <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                {t("dashboard.margin")} {profitMargin}%
              </span>
            </div>
          </section>

          {/* Reports and Filters */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">{t("dashboard.analysisReport")}</h3>
                <p className="text-xs text-slate-400">{t("dashboard.analysisSubtitle")}</p>
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
                    {t("dashboard.daily")}
                  </button>
                  <button
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      revenueFilterType === "monthly" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                    onClick={() => setRevenueFilterType("monthly")}
                    type="button"
                  >
                    {t("dashboard.monthly")}
                  </button>
                  <button
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      revenueFilterType === "yearly" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                    onClick={() => setRevenueFilterType("yearly")}
                    type="button"
                  >
                    {t("dashboard.yearly")}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleExport("excel")}
                    type="button"
                  >
                    {t("dashboard.exportExcel")}
                  </button>
                  <button
                    className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white-force transition hover:bg-teal-700 cursor-pointer"
                    onClick={() => handleExport("pdf")}
                    type="button"
                  >
                    {t("dashboard.exportPdf")}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  {revenueFilterType === "daily" 
                    ? (isCurrentYear 
                        ? t("dashboard.todayRevenue")
                        : t("dashboard.dailyAvg")) 
                    : revenueFilterType === "monthly" 
                    ? (isCurrentYear 
                        ? t("dashboard.thisMonthRevenue")
                        : t("dashboard.monthlyAvg")) 
                    : t("dashboard.yearlyRevenue")}
                </p>
                <p className="mt-1.5 font-['Sora'] text-xl font-semibold text-slate-900">
                  {revenueFilterType === "daily" 
                    ? (isCurrentYear ? fmtVND(dailyRevenue) : fmtVND(summary.grossRevenue / 365)) 
                    : revenueFilterType === "monthly" 
                    ? (isCurrentYear ? fmtVND(currentMonthRevenue) : fmtVND(summary.grossRevenue / 12)) 
                    : fmtVND(summary.grossRevenue)}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {revenueFilterType === "daily" 
                    ? (isCurrentYear 
                        ? t("dashboard.todayRevenueDesc")
                        : t("dashboard.dailyAvgDesc", { year: selectedYear }))
                    : revenueFilterType === "monthly"
                    ? (isCurrentYear 
                        ? t("dashboard.thisMonthRevenueDesc", { month: currentMonthNum, year: selectedYear })
                        : t("dashboard.monthlyAvgDesc", { year: selectedYear }))
                    : t("dashboard.yearlyRevenueDesc", { year: selectedYear })
                  }
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t("dashboard.successTxCount")}</p>
                <p className="mt-1.5 font-['Sora'] text-xl font-semibold text-teal-600">
                  +{summary.successfulTransactions} {t("dashboard.successTxVal")}
                </p>
                <p className="text-xs text-slate-400 mt-1">{t("dashboard.excludeFailedRefunded")}</p>
              </div>
            </div>
          </article>

          {/* Revenue Chart & Breakdown */}
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Column Chart */}
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">{t("dashboard.revVsExp")}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {t("dashboard.chartTitle", { year: selectedYear })}
              </p>

              <div className="mt-6 flex items-end gap-3 h-[160px]">
                {historicalData.map((m) => {
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
                  {t("dashboard.revenue")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  {t("dashboard.expense")}
                </span>
              </div>
            </article>

            {/* Expense breakdown progress */}
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">{t("dashboard.expBreakdown")}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {t("dashboard.opsExpenditure", { year: selectedYear })}
              </p>

              <div className="mt-5 space-y-4">
                {transformedBreakdown.length === 0 ? (
                  <p className="text-center py-6 text-sm text-slate-400">{t("dashboard.noExpenses")}</p>
                ) : (
                  transformedBreakdown.map((item) => (
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
            <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">{t("dashboard.plStatement")}</h3>
            <p className="mt-1 text-sm text-slate-500">{t("dashboard.plSubtitle")}</p>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-555 bg-slate-55 bg-slate-50 font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">{t("dashboard.accountCategory")}</th>
                    <th className="px-4 py-3 text-right">{t("dashboard.valueVND")}</th>
                    <th className="px-4 py-3 text-right">{t("dashboard.ratioToRev")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 text-slate-800 font-semibold">{t("dashboard.totalGrossRev")}</td>
                    <td className="px-4 py-3 text-right text-teal-600 font-semibold">{fmtVND(summary.grossRevenue)}</td>
                    <td className="px-4 py-3 text-right text-slate-500">100.0%</td>
                  </tr>

                  {transformedBreakdown.map((item) => (
                    <tr key={item.rawCategory}>
                      <td className="px-4 py-3 pl-8 text-slate-500">{t("dashboard.subExpense")}{item.category}</td>
                      <td className="px-4 py-3 text-right text-rose-500">{fmtVND(item.amount)}</td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        {summary.grossRevenue > 0 ? ((item.amount / summary.grossRevenue) * 100).toFixed(1) : "0.0"}%
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-4 py-3 text-slate-800 font-semibold">{t("dashboard.totalOpsExp")}</td>
                    <td className="px-4 py-3 text-right text-rose-600 font-semibold">{fmtVND(expensesInfo.totalOperationalExpenses)}</td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {summary.grossRevenue > 0 ? ((expensesInfo.totalOperationalExpenses / summary.grossRevenue) * 100).toFixed(1) : "0.0"}%
                    </td>
                  </tr>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                    <td className="px-4 py-3 font-bold text-slate-900">{t("dashboard.netProfitRetained")}</td>
                    <td className="px-4 py-3 text-right font-bold text-teal-600">{fmtVND(summary.netProfit)}</td>
                    <td className="px-4 py-3 text-right font-bold text-teal-600">{profitMargin}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}
    </div>
  );
}

export default AccountantDashboardPage;
