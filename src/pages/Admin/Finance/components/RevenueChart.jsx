import React from "react";

export default function RevenueChart({
  MONTHLY_REVENUE,
  maxBar,
  fmtVND,
  fmtShort,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-slate-850">
      <h3 className="font-['Sora'] text-xl font-bold text-slate-800">Doanh Thu vs Chi Phí</h3>
      <p className="mt-1 text-xs text-slate-400">6 tháng qua (VND)</p>

      <div className="mt-6 flex items-end gap-3">
        {MONTHLY_REVENUE.map((m) => {
          const revH = Math.round((m.revenue / maxBar) * 160);
          const expH = Math.round((m.expenses / maxBar) * 160);
          return (
            <div className="flex flex-1 flex-col items-center gap-1.5" key={m.month}>
              <div className="flex w-full items-end justify-center gap-1.5" style={{ height: 160 }}>
                <div
                  className="w-[45%] rounded-t-md bg-gradient-to-t from-indigo-500 to-indigo-650"
                  style={{ height: revH }}
                  title={`Doanh thu: ${fmtVND(m.revenue)}`}
                />
                <div
                  className="w-[45%] rounded-t-md bg-slate-200"
                  style={{ height: expH }}
                  title={`Chi phí: ${fmtVND(m.expenses)}`}
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">{m.month}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-5 text-xs text-slate-400 font-bold">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
          Doanh Thu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          Chi Phí
        </span>
      </div>
    </article>
  );
}
