import React from "react";

export default function QuestionList({
  currentCategory,
  filteredQuestions,
  loading,
  selectedCategoryId,
  searchTerm,
  setSearchTerm,
  openQuestionModal,
  handleDeleteQuestion,
  openOptionModal,
  handleDeleteOption,
  getCategoryBadgeClass,
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 min-h-[680px]">
        {/* Header controls for selected category */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Sora'] text-lg font-bold text-slate-800">
                {currentCategory ? currentCategory.name : "Vui lòng chọn bộ câu hỏi"}
              </h3>
              {currentCategory && (
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getCategoryBadgeClass(currentCategory.name)}`}>
                  {filteredQuestions.length} câu
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Quản lý nội dung các câu hỏi và đáp án thuộc bộ này.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Search in set */}
            <input
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 w-48 shadow-xs transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Lọc câu hỏi trong bộ..."
              type="text"
              value={searchTerm}
            />
            
            {selectedCategoryId && (
              <button
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-sm cursor-pointer"
                onClick={() => openQuestionModal(null)}
                type="button"
              >
                + Thêm câu hỏi
              </button>
            )}
          </div>
        </div>

        {/* Questions list with Loading Skeletons */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="animate-pulse rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <div className="h-4 bg-slate-200 w-1/4 rounded" />
                <div className="h-6 bg-slate-200 w-3/4 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-slate-150 rounded" />
                  <div className="h-10 bg-slate-150 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !selectedCategoryId ? (
          <div className="text-center py-20 text-slate-400">
            Vui lòng chọn hoặc tạo bộ câu hỏi ở danh sách bên trái để bắt đầu.
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            Không tìm thấy câu hỏi nào trong bộ này. Nhấn "+ Thêm câu hỏi" để bắt đầu.
          </div>
        ) : (
          <div className="space-y-5">
            {filteredQuestions.map((q, index) => (
              <article
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-350 hover:shadow-xs shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 space-y-4 relative group/question"
              >
                {/* Question Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 font-['Sora'] text-xs font-bold text-slate-600">
                      {q.displayOrder || index + 1}
                    </span>
                  </div>

                  {/* Question Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-655 transition cursor-pointer"
                      onClick={() => openQuestionModal(q)}
                      type="button"
                    >
                      Sửa
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded bg-rose-50 border border-rose-100 hover:bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-650 transition cursor-pointer"
                      onClick={() => handleDeleteQuestion(q)}
                      type="button"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Question content */}
                <h4 className="font-['Sora'] text-sm font-semibold text-slate-800 leading-relaxed">
                  {q.content}
                </h4>

                {/* Options list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Các phương án trả lời
                    </span>
                    <button
                      className="text-[11px] font-bold text-indigo-650 hover:text-indigo-700 cursor-pointer"
                      onClick={() => openOptionModal(q.id, null)}
                      type="button"
                    >
                      + Thêm phương án
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {(q.options || []).map((opt) => (
                      <div
                        key={opt.id}
                        className="group/option relative rounded-lg border border-slate-200 bg-slate-50/40 p-3 hover:border-indigo-300 hover:bg-white transition-all duration-150 flex flex-col justify-center min-h-[50px]"
                      >
                        <div className="flex items-start gap-2.5 pr-14">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600 shadow-xs">
                            {opt.code}
                          </span>
                          <p className="text-xs font-medium text-slate-700 leading-normal">
                            {opt.content}
                          </p>
                        </div>

                        {/* Option Actions (Absolute at top-right, visible on hover) */}
                        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover/option:opacity-100 transition-opacity">
                          <button
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-750 bg-indigo-50 px-1.5 py-0.5 rounded transition cursor-pointer"
                            onClick={() => openOptionModal(q.id, opt)}
                            type="button"
                          >
                            Sửa
                          </button>
                          <button
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-750 bg-rose-50 px-1.5 py-0.5 rounded transition cursor-pointer"
                            onClick={() => handleDeleteOption(opt)}
                            type="button"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
