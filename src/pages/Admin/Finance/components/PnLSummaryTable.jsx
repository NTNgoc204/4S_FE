import React from "react";

function PnLRow({ label, value, of: total, color, fmtVND, indent = false }) {
  const pct = ((value / total) * 100).toFixed(1);
  return (
    <tr className="hover:bg-slate-50/20">
      <td className={`px-5 py-3 text-slate-700 ${indent ? "pl-9 text-slate-400 text-xs font-medium" : "font-medium"}`}>{label}</td>
      <td className={`px-5 py-3 text-right ${color}`}>{fmtVND(value)}</td>
      <td className={`px-5 py-3 text-right text-slate-400 font-medium ${indent ? "text-slate-350 text-xs" : ""}`}>{pct}%</td>
    </tr>
  );
}

export default function PnLSummaryTable({
  totalRevenue,
  vatCollected,
  totalExpenses,
  netProfit,
  profitMargin,
  fmtVND,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-slate-850">
      <h3 className="font-['Sora'] text-xl font-bold text-slate-800">Báo Cáo P&amp;L — Tháng 6/2026</h3>
      <p className="mt-1 text-xs text-slate-400">Báo cáo kết quả hoạt động kinh doanh (Dữ liệu mẫu, chưa tính nghĩa vụ thuế VAT thực tế)</p>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-400 bg-slate-50/80 font-bold">
            <tr>
              <th className="px-5 py-3.5">Mục tiêu</th>
              <th className="px-5 py-3.5 text-right">Số tiền (VND)</th>
              <th className="px-5 py-3.5 text-right">% Doanh thu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            <PnLRow label="Doanh Thu Gộp" value={totalRevenue} of={totalRevenue} fmtVND={fmtVND} color="text-indigo-650 font-bold" />
            <PnLRow label="↳ Thuế VAT Thu Hộ (10%)" value={vatCollected} of={totalRevenue} fmtVND={fmtVND} color="text-amber-600 font-medium" indent />
            <PnLRow label="Doanh Thu Thuần (Không gồm VAT)" value={totalRevenue - vatCollected} of={totalRevenue} fmtVND={fmtVND} color="text-slate-700 font-medium" />
            <PnLRow label="Tổng Chi Phí" value={totalExpenses} of={totalRevenue} fmtVND={fmtVND} color="text-rose-650 font-medium" />
            <tr className="border-t-2 border-slate-200 bg-slate-50/70">
              <td className="px-5 py-4 font-bold text-slate-800">Lợi Nhuận Ròng</td>
              <td className="px-5 py-4 text-right font-extrabold text-emerald-600">{fmtVND(netProfit)}</td>
              <td className="px-5 py-4 text-right font-extrabold text-emerald-600">{profitMargin}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
