import React from "react";

export default function PlanEditForm({
  selectedPlan,
  form,
  dirty,
  updateForm,
  handleSave,
  updatePlanLoading,
  formatPrice,
}) {
  if (!selectedPlan) return null;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-slate-850">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-['Sora'] text-xl font-bold text-slate-800">Chỉnh sửa Gói</h3>
          <p className="mt-1 text-sm text-slate-400">
            Các thay đổi sẽ được lưu vào cơ sở dữ liệu khi bạn nhấn Lưu.
          </p>
        </div>
        {dirty && (
          <span className="rounded-full border border-amber-250 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            Có thay đổi chưa lưu
          </span>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {/* Name */}
        <div>
          <label
            className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide"
            htmlFor="plan-name"
          >
            Tên Gói
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-xs transition-all"
            id="plan-name"
            onChange={(e) => updateForm("name", e.target.value)}
            type="text"
            value={form.name}
          />
        </div>

        {/* Description */}
        <div>
          <label
            className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide"
            htmlFor="plan-description"
          >
            Mô tả
          </label>
          <textarea
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-xs transition-all"
            id="plan-description"
            onChange={(e) => updateForm("description", e.target.value)}
            rows={3}
            value={form.description}
          />
        </div>

        {/* Price */}
        <div>
          <label
            className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide"
            htmlFor="plan-price"
          >
            Giá (VND)
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-xs transition-all"
            id="plan-price"
            min="0"
            onChange={(e) => updateForm("price", e.target.value)}
            type="number"
            value={form.price}
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Xem trước: <span className="font-semibold text-indigo-650">
              {formatPrice(form.price)}{(selectedPlan.name || "").toLowerCase().includes("edu") ? " / tài khoản" : ""}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 shadow-sm cursor-pointer"
          disabled={updatePlanLoading || !dirty}
          onClick={handleSave}
          type="button"
        >
          {updatePlanLoading ? "Đang lưu…" : "Lưu Thay Đổi"}
        </button>
      </div>
    </article>
  );
}
