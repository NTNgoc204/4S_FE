import React from "react";

export default function PlanList({
  adminPlans,
  selectedPlanId,
  handleSelectPlan,
  formatPrice,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs text-slate-850">
      <h3 className="mb-4 font-['Sora'] text-lg font-bold text-slate-800">Gói Dịch Vụ</h3>
      <div className="space-y-3">
        {adminPlans.map((plan) => {
          const selected = plan.id === selectedPlanId;
          const isEdu = (plan.name || "").toLowerCase().includes("edu");
          return (
            <button
              className={`w-full rounded-xl border p-3.5 text-left transition cursor-pointer ${
                selected
                  ? "border-indigo-500 bg-indigo-50/50 shadow-xs"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              type="button"
            >
              <p className="font-semibold text-slate-850">{plan.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                {plan.description || "—"}
              </p>
              <p className="mt-2 text-sm font-bold text-indigo-600">
                {formatPrice(plan.price)}{isEdu ? " / tài khoản" : ""}
              </p>
            </button>
          );
        })}

        {adminPlans.length === 0 && (
          <p className="text-sm text-slate-400">Không tìm thấy gói nào.</p>
        )}
      </div>
    </article>
  );
}
