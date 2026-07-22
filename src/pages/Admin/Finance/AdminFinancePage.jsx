import { useEffect, useState } from "react";
import { financeAPI } from "../../../feature/finance/financeAPI";

function fmtVND(n) {
  return `${Math.round(Number(n)).toLocaleString("vi-VN")} VND`;
}

function fmtShort(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function AdminFinancePage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: "0.0",
  });

  useEffect(() => {
    async function loadYearData() {
      setLoading(true);
      try {
        // Fetch financial summary and expenses for months 1 to 12 in parallel
        const promises = Array.from({ length: 12 }, (_, idx) => {
          const monthNum = idx + 1;
          return Promise.all([
            financeAPI.getSummary(monthNum, selectedYear),
            financeAPI.getExpenses(monthNum, selectedYear),
          ]).then(([sR, eR]) => ({
            month: monthNum,
            monthLabel: `Tháng ${monthNum}`,
            revenue: sR.data?.grossRevenue || 0,
            expenses: eR.data?.totalOperationalExpenses || 0,
            breakdown: eR.data?.breakdown || {},
          })).catch((err) => {
            console.warn(`Failed loading financial data for month ${monthNum}/${selectedYear}:`, err);
            return {
              month: monthNum,
              monthLabel: `Tháng ${monthNum}`,
              revenue: 0,
              expenses: 0,
              breakdown: {},
            };
          });
        });

        const results = await Promise.all(promises);
        setMonthlyData(results);

        // Aggregate YTD numbers
        const ytdRevenue = results.reduce((acc, cur) => acc + cur.revenue, 0);
        const ytdExpenses = results.reduce((acc, cur) => acc + cur.expenses, 0);
        const ytdProfit = ytdRevenue - ytdExpenses;
        const profitMargin = ytdRevenue > 0 
          ? ((ytdProfit / ytdRevenue) * 100).toFixed(1) 
          : "0.0";

        setKpis({
          totalRevenue: ytdRevenue,
          totalExpenses: ytdExpenses,
          netProfit: ytdProfit,
          profitMargin,
        });

        // Aggregate expenses by category
        const annualBreakdown = {
          "AI API & Infrastructure": 0,
          "Personnel": 0,
          "Marketing": 0,
          "Operational": 0,
          "Miscellaneous": 0,
        };

        results.forEach((m) => {
          Object.keys(m.breakdown).forEach((cat) => {
            if (annualBreakdown[cat] !== undefined) {
              annualBreakdown[cat] += m.breakdown[cat] || 0;
            }
          });
        });

        const totalAnnualExp = ytdExpenses || 1;
        const formattedExpenses = Object.keys(annualBreakdown).map((cat) => {
          const amt = annualBreakdown[cat];
          return {
            category: cat,
            amount: amt,
            percent: Math.round((amt / totalAnnualExp) * 100) || 0,
          };
        }).sort((a, b) => b.amount - a.amount);

        setExpenseBreakdown(formattedExpenses);
      } catch (err) {
        console.error("Failed to fetch YTD executive statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadYearData();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  const maxVal = Math.max(...monthlyData.map((m) => Math.max(m.revenue, m.expenses)), 1000000);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Year Select & View Mode Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-500">Năm tài khóa:</label>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-bold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm cursor-pointer"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-xs">
          Executive Financial Report (YTD)
        </span>
      </div>

      {/* YTD KPI Cards with gradients (3 Cards: Revenue, Expenses, Net Profit) */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-tr from-white to-indigo-50/20 p-5 shadow-xs transition-transform duration-300 hover:scale-101">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Tổng Doanh Thu YTD</p>
          <p className="mt-2.5 font-['Sora'] text-2xl font-black text-indigo-900 md:text-3xl">{fmtVND(kpis.totalRevenue)}</p>
          <span className="mt-3.5 inline-block rounded-full bg-indigo-100/60 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
            Cộng dồn cả năm
          </span>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-tr from-white to-rose-50/20 p-5 shadow-xs transition-transform duration-300 hover:scale-101">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Tổng Chi Phí YTD</p>
          <p className="mt-2.5 font-['Sora'] text-2xl font-black text-rose-800 md:text-3xl">{fmtVND(kpis.totalExpenses)}</p>
          <span className="mt-3.5 inline-block rounded-full bg-rose-100/60 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
            Chi phí vận hành
          </span>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-tr from-white to-emerald-50/20 p-5 shadow-xs transition-transform duration-300 hover:scale-101">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Lợi Nhuận Ròng YTD</p>
          <p className="mt-2.5 font-['Sora'] text-2xl font-black text-emerald-800 md:text-3xl">{fmtVND(kpis.netProfit)}</p>
          <span className="mt-3.5 inline-block rounded-full bg-emerald-100/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            Biên lợi nhuận {kpis.profitMargin}%
          </span>
        </article>
      </section>

      {/* Main Spline Curve Area Chart & Cost Breakdown */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Spline Area Chart */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs text-slate-850">
          <h3 className="font-['Sora'] text-base font-bold text-slate-800">Biểu đồ Doanh Thu &amp; Chi Phí {selectedYear}</h3>
          <p className="mt-1 text-xs text-slate-400">Xu hướng dòng tiền cộng dồn qua 12 tháng</p>
          
          <div className="mt-6 w-full overflow-hidden">
            <YTDSplineLineChart data={monthlyData} maxVal={maxVal} />
          </div>

          <div className="mt-4 flex gap-5 text-xs text-slate-400 font-bold justify-center">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              Doanh Thu Gộp
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              Chi Phí Vận Hành
            </span>
          </div>
        </article>

        {/* Expenses categories aggregated annually */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs text-slate-850 flex flex-col justify-between">
          <div>
            <h3 className="font-['Sora'] text-base font-bold text-slate-800">Cơ Cấu Chi Phí Cả Năm</h3>
            <p className="mt-1 text-xs text-slate-400">Phân bổ chi phí theo danh mục chính trong năm {selectedYear}</p>
          </div>

          <div className="mt-5 space-y-4">
            {expenseBreakdown.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-6">Chưa phát sinh chi phí nào trong năm.</p>
            ) : (
              expenseBreakdown.map((e) => (
                <div key={e.category}>
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 font-medium">{e.category}</span>
                    <span className="font-bold text-rose-600">{fmtShort(e.amount)} VND</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-rose-500"
                      style={{ width: `${e.percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[10px] text-slate-400 font-medium">{e.percent}%</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Tổng Chi Phí YTD</span>
              <span className="text-rose-600 font-extrabold">{fmtVND(kpis.totalExpenses)}</span>
            </div>
          </div>
        </article>
      </section>

      {/* P&L Statement for the entire year */}
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-slate-850">
        <h3 className="font-['Sora'] text-base font-bold text-slate-800">Báo Cáo P&amp;L Toàn Niên — {selectedYear}</h3>
        <p className="mt-1 text-xs text-slate-400">Kết quả hoạt động kinh doanh lũy kế theo năm tài khóa</p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-400 bg-slate-50/80 font-bold">
              <tr>
                <th className="px-5 py-3.5">Khoản Mục</th>
                <th className="px-5 py-3.5 text-right">Giá Trị Lũy Kế (VND)</th>
                <th className="px-5 py-3.5 text-right">% Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              <tr className="hover:bg-slate-50/10">
                <td className="px-5 py-4 font-semibold text-slate-700">Doanh Thu Gộp YTD</td>
                <td className="px-5 py-4 text-right text-indigo-650 font-bold">{fmtVND(kpis.totalRevenue)}</td>
                <td className="px-5 py-4 text-right text-slate-400 font-medium">100.0%</td>
              </tr>
              <tr className="hover:bg-slate-50/10">
                <td className="px-5 py-4 font-semibold text-slate-700">Tổng Chi Phí Hoạt Động (YTD)</td>
                <td className="px-5 py-4 text-right text-rose-650 font-bold">{fmtVND(kpis.totalExpenses)}</td>
                <td className="px-5 py-4 text-right text-slate-400 font-medium">{kpis.totalRevenue > 0 ? ((kpis.totalExpenses / kpis.totalRevenue) * 100).toFixed(1) : "0.0"}%</td>
              </tr>
              <tr className="border-t-2 border-slate-200 bg-slate-50/70 font-bold">
                <td className="px-5 py-4 text-slate-800">Lợi Nhuận Ròng Lũy Kế</td>
                <td className="px-5 py-4 text-right text-emerald-600 font-black">{fmtVND(kpis.netProfit)}</td>
                <td className="px-5 py-4 text-right text-emerald-600 font-black">{kpis.profitMargin}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

// ── Sub-component: YTDSplineLineChart (SVG Spline Line representation) ─────
function YTDSplineLineChart({ data, maxVal }) {
  if (!data || data.length === 0) return null;
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const pointsRev = data.map((d, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (data.length - 1);
    const y = height - paddingY - (d.revenue * (height - paddingY * 2)) / maxVal;
    return { x, y, label: `T${d.month}`, value: d.revenue };
  });

  const pointsExp = data.map((d, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (data.length - 1);
    const y = height - paddingY - (d.expenses * (height - paddingY * 2)) / maxVal;
    return { x, y, value: d.expenses };
  });

  const getSplinePath = (pts) => {
    return pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (p.x - prev.x) / 2;
      const cpY2 = p.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, "");
  };

  const pathRevD = getSplinePath(pointsRev);
  const pathExpD = getSplinePath(pointsExp);

  const fillRevD = pointsRev.length > 0 
    ? `${pathRevD} L ${pointsRev[pointsRev.length - 1].x} ${height - paddingY} L ${pointsRev[0].x} ${height - paddingY} Z`
    : "";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
        const y = paddingY + ratio * (height - paddingY * 2);
        return (
          <line
            key={index}
            x1={paddingX}
            y1={y}
            x2={width - paddingX}
            y2={y}
            stroke="#f1f5f9"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        );
      })}

      {/* Revenue Area */}
      {fillRevD && <path d={fillRevD} fill="url(#revGrad)" />}

      {/* Revenue Path */}
      {pathRevD && (
        <path
          d={pathRevD}
          fill="none"
          stroke="#6366f1"
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}

      {/* Expense Path */}
      {pathExpD && (
        <path
          d={pathExpD}
          fill="none"
          stroke="#f43f5e"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="1 1"
        />
      )}

      {/* Points Revenue */}
      {pointsRev.map((p, index) => (
        <g key={`rev-pt-${index}`} className="group">
          <circle
            cx={p.x}
            cy={p.y}
            r={3.5}
            className="fill-white stroke-indigo-500 stroke-2 transition-all duration-300 hover:r-5 cursor-pointer"
          />
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            className="fill-slate-800 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {fmtShort(p.value)}
          </text>
        </g>
      ))}

      {/* Points Expense */}
      {pointsExp.map((p, index) => (
        <g key={`exp-pt-${index}`} className="group">
          <circle
            cx={p.x}
            cy={p.y}
            r={3.5}
            className="fill-white stroke-rose-450 stroke-2 transition-all duration-300 hover:r-5 cursor-pointer"
          />
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            className="fill-slate-800 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {fmtShort(p.value)}
          </text>
        </g>
      ))}

      {/* Labels */}
      {pointsRev.map((p, index) => (
        <text
          key={index}
          x={p.x}
          y={height - 10}
          textAnchor="middle"
          className="fill-slate-400 text-[10px] font-bold"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export default AdminFinancePage;
