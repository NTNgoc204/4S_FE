import React from "react";

export default function RoleEditForm({
  isCreateMode,
  dirty,
  form,
  updateForm,
  startCreateMode,
  handleSave,
  createRoleLoading,
  updateRoleLoading,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-slate-850">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-['Sora'] text-xl font-bold text-slate-800">
            {isCreateMode ? "Tạo Vai Trò" : "Chỉnh sửa Vai Trò"}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {isCreateMode
              ? "Thêm một vai trò mới với tên và mô tả."
              : "Cập nhật thông tin vai trò đã chọn."}
          </p>
        </div>
        {dirty && (
          <span className="rounded-full border border-amber-250 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            Có thay đổi chưa lưu
          </span>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide" htmlFor="role-name">
            Tên Vai Trò
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-xs transition-all"
            id="role-name"
            maxLength={50}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="Ví dụ: counselor"
            type="text"
            value={form.name}
          />
          <p className="mt-1.5 text-xs text-slate-400">Tối đa 50 ký tự.</p>
        </div>

        <div>
          <label
            className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide"
            htmlFor="role-description"
          >
            Mô tả
          </label>
          <textarea
            className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-xs transition-all"
            id="role-description"
            onChange={(e) => updateForm("description", e.target.value)}
            placeholder="Mô tả vai trò này dùng để làm gì..."
            rows={5}
            value={form.description}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {!isCreateMode && (
          <button
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            onClick={startCreateMode}
            type="button"
          >
            Hủy Chỉnh Sửa
          </button>
        )}
        <button
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50 shadow-sm cursor-pointer"
          disabled={createRoleLoading || updateRoleLoading || !dirty}
          onClick={handleSave}
          type="button"
        >
          {createRoleLoading || updateRoleLoading
            ? "Đang lưu…"
            : isCreateMode
              ? "Tạo Vai Trò"
              : "Lưu Thay Đổi"}
        </button>
      </div>
    </article>
  );
}
