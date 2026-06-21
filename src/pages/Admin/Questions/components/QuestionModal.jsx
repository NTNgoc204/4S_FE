import React from "react";

export default function QuestionModal({
  isQuestionModalOpen,
  setIsQuestionModalOpen,
  editingQuestion,
  questionContent,
  setQuestionContent,
  questionDisplayOrder,
  setQuestionDisplayOrder,
  handleSaveQuestion,
}) {
  if (!isQuestionModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <form
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onSubmit={handleSaveQuestion}
      >
        <h3 className="font-['Sora'] text-lg font-bold text-slate-850">
          {editingQuestion ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}
        </h3>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-455 uppercase tracking-wide mb-1.5">
              Nội dung câu hỏi
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 h-28 resize-none shadow-xs transition-all"
              onChange={(e) => setQuestionContent(e.target.value)}
              placeholder="Nhập đề bài câu hỏi..."
              required
              value={questionContent}
            />
          </div>

        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
            onClick={() => setIsQuestionModalOpen(false)}
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
