import React from "react";

export default function OptionModal({
  isOptionModalOpen,
  setIsOptionModalOpen,
  editingOption,
  optionCode,
  setOptionCode,
  optionDisplayOrder,
  setOptionDisplayOrder,
  optionContent,
  setOptionContent,
  handleSaveOption,
}) {
  if (!isOptionModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <form
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onSubmit={handleSaveOption}
      >
        <h3 className="font-['Sora'] text-lg font-bold text-slate-855">
          {editingOption ? `Cập nhật phương án ${optionCode}` : `Thêm phương án trả lời ${optionCode}`}
        </h3>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-455 uppercase tracking-wide mb-1.5">
              Nội dung đáp án
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 h-20 resize-none shadow-xs transition-all"
              onChange={(e) => setOptionContent(e.target.value)}
              placeholder="Nhập văn bản đáp án..."
              required
              value={optionContent}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
            onClick={() => setIsOptionModalOpen(false)}
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
