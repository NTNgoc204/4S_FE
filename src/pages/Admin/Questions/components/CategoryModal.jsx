import React from "react";

export default function CategoryModal({
  isCategoryModalOpen,
  setIsCategoryModalOpen,
  editingCategory,
  categoryName,
  setCategoryName,
  handleSaveCategory,
}) {
  if (!isCategoryModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <form
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onSubmit={handleSaveCategory}
      >
        <h3 className="font-['Sora'] text-lg font-bold text-slate-855">
          {editingCategory ? "Cập nhật Bộ câu hỏi" : "Tạo Bộ câu hỏi mới"}
        </h3>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-450 uppercase tracking-wide mb-1.5">
              Tên bộ câu hỏi
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition-all"
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ví dụ: Thực tế (Realistic)"
              required
              type="text"
              value={categoryName}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
            onClick={() => setIsCategoryModalOpen(false)}
            type="button"
          >
            Hủy
          </button>
          <button
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition cursor-pointer"
            type="submit"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
