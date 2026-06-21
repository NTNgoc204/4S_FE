import React from "react";

export default function CategoryList({
  nonChatCategories,
  selectedCategoryId,
  setSelectedCategoryId,
  questions,
  openCategoryModal,
  handleDeleteCategory,
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col h-[680px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-['Sora'] text-base font-bold text-slate-800">
            Bộ câu hỏi
          </h3>
          <button
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            onClick={() => openCategoryModal(null)}
            type="button"
          >
            + Thêm bộ
          </button>
        </div>

        {/* List of sets */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 [scrollbar-width:thin]">
          {nonChatCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const setQuestions = questions.filter((q) => q.categoryId === cat.id);
            return (
              <div
                key={cat.id}
                className={`group relative flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                  isSelected
                    ? "bg-indigo-50/70 border-indigo-200 text-indigo-700 shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                <div className="flex-1 min-w-0 pr-10">
                  <p className="text-sm font-semibold truncate leading-tight">
                    {cat.displayOrder}. {cat.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    {setQuestions.length} câu hỏi
                  </p>
                </div>

                {/* Actions on hover */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1 rounded bg-slate-100 hover:bg-slate-250 text-slate-650 transition cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCategoryModal(cat);
                    }}
                    title="Sửa tên bộ"
                    type="button"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-650 transition cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat);
                    }}
                    title="Xóa bộ"
                    type="button"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
