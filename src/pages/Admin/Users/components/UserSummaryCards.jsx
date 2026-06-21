import React from "react";

function SummaryCard({ label, value, valueClass }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`mt-2 font-['Sora'] text-3xl font-extrabold ${valueClass}`}>{value}</p>
    </article>
  );
}

export default function UserSummaryCards({ summary }) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <SummaryCard label="Total Users" value={summary.total} valueClass="text-slate-800" />
      <SummaryCard label="Active" value={summary.active} valueClass="text-emerald-600" />
      <SummaryCard label="Inactive" value={summary.inactive} valueClass="text-amber-650" />
    </section>
  );
}
