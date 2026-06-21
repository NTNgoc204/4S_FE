import React from "react";

export default function ExpenseBreakdown({
  EXPENSES,
  totalExpenses,
  fmtVND,
  fmtShort,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-slate-850">
      <h3 className="font-['Sora'] text-xl font-bold text-slate-800">Cơ Cấu Chi Phí</h3>
      <p className="mt-1 text-xs text-slate-400">Tháng hiện tại theo danh mục</p>

      <div className="mt-5 space-y-3.5">
        {EXPENSES.map((e) => (
          <div key={e.category}>
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-655">
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
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500">Tổng Chi Phí</span>
          <span className="text-rose-600 font-extrabold">{fmtVND(totalExpenses)}</span>
        </div>
      </div>
    </article>
  );
}
