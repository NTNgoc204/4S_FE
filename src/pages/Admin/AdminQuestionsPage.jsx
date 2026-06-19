import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchQuestionsRequest,
  fetchCategoriesRequest,
  importQuestionsRequest,
  downloadTemplateRequest,
  createCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest,
  createQuestionRequest,
  updateQuestionRequest,
  deleteQuestionRequest,
  createQuestionOptionRequest,
  updateQuestionOptionRequest,
  deleteQuestionOptionRequest,
} from "../../feature/question/questionSlice";

// Map Category name to badge colors
const getCategoryBadgeClass = (categoryName) => {
  const name = (categoryName || "").toLowerCase();
  if (name.includes("realistic") || name.includes("kỹ thuật") || name.includes("thực tế")) {
    return "bg-blue-50 border-blue-200 text-blue-700";
  }
  if (name.includes("investigative") || name.includes("nghiên cứu")) {
    return "bg-amber-50 border-amber-200 text-amber-700";
  }
  if (name.includes("artistic") || name.includes("nghệ thuật")) {
    return "bg-purple-50 border-purple-200 text-purple-700";
  }
  if (name.includes("social") || name.includes("xã hội")) {
    return "bg-emerald-50 border-emerald-200 text-emerald-700";
  }
  if (name.includes("enterprising") || name.includes("quản lý") || name.includes("doanh nhân")) {
    return "bg-rose-50 border-rose-200 text-rose-700";
  }
  if (name.includes("conventional") || name.includes("nghiệp vụ") || name.includes("công sở")) {
    return "bg-cyan-50 border-cyan-200 text-cyan-700";
  }
  return "bg-slate-50 border-slate-200 text-slate-700";
};

// Available RIASEC tags for suggestion
const RIASEC_TAG_SUGGESTIONS = [
  "realistic",
  "investigative",
  "artistic",
  "social",
  "enterprising",
  "conventional",
];

function AdminQuestionsPage() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const { questions, categories, loading, importLoading } = useSelector(
    (state) => state.question
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDisplayOrder, setCategoryDisplayOrder] = useState(1);

  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionContent, setQuestionContent] = useState("");
  const [questionDisplayOrder, setQuestionDisplayOrder] = useState(1);
  const [questionAllowCustomAnswer, setQuestionAllowCustomAnswer] = useState(false);

  // Option Modal State
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [optionParentQuestionId, setOptionParentQuestionId] = useState("");
  const [optionCode, setOptionCode] = useState("");
  const [optionContent, setOptionContent] = useState("");
  const [optionDisplayOrder, setOptionDisplayOrder] = useState(1);
  const [optionScoreTag, setOptionScoreTag] = useState("");

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchQuestionsRequest());
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

  // Auto-select first category if none selected
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      const nonChatCategories = categories.filter((c) => !c.isChatAi && c.name !== "Trò chuyện hướng nghiệp AI");
      if (nonChatCategories.length > 0) {
        setSelectedCategoryId(nonChatCategories[0].id);
      }
    }
  }, [categories, selectedCategoryId]);

  // Handle template download
  // Handle template download
  const handleDownloadTemplate = () => {
    dispatch(downloadTemplateRequest());
  };

  // Handle file import
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "docx" && ext !== "doc") {
      toast.error("Vui lòng chọn file Word (.docx hoặc .doc)");
      return;
    }

    dispatch(
      importQuestionsRequest({
        file,
        onSuccess: () => {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      })
    );
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- Category CRUD Handlers ---
  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name || "");
      setCategoryDisplayOrder(category.displayOrder || 1);
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryDisplayOrder(categories.length + 1);
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.warning("Vui lòng nhập tên bộ câu hỏi");
      return;
    }

    const payload = {
      name: categoryName.trim(),
      displayOrder: parseInt(categoryDisplayOrder) || 1,
    };

    const onSuccess = () => setIsCategoryModalOpen(false);

    if (editingCategory) {
      dispatch(updateCategoryRequest({ id: editingCategory.id, data: payload, onSuccess }));
    } else {
      dispatch(createCategoryRequest({ data: payload, onSuccess }));
    }
  };

  const handleDeleteCategory = (category) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ câu hỏi "${category.name}"? Điều này sẽ xóa toàn bộ câu hỏi bên trong.`)) {
      return;
    }

    dispatch(
      deleteCategoryRequest({
        id: category.id,
        onSuccess: () => {
          if (selectedCategoryId === category.id) {
            setSelectedCategoryId("");
          }
        },
      })
    );
  };

  // --- Question CRUD Handlers ---
  const openQuestionModal = (question = null) => {
    const categoryQuestions = questions.filter((q) => q.categoryId === selectedCategoryId);
    if (question) {
      setEditingQuestion(question);
      setQuestionContent(question.content || "");
      setQuestionDisplayOrder(question.displayOrder || 1);
      setQuestionAllowCustomAnswer(question.allowCustomAnswer || false);
    } else {
      setEditingQuestion(null);
      setQuestionContent("");
      setQuestionDisplayOrder(categoryQuestions.length + 1);
      setQuestionAllowCustomAnswer(false);
    }
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionContent.trim()) {
      toast.warning("Vui lòng nhập nội dung câu hỏi");
      return;
    }

    const payload = {
      categoryId: selectedCategoryId,
      content: questionContent.trim(),
      displayOrder: parseInt(questionDisplayOrder) || 1,
      allowCustomAnswer: questionAllowCustomAnswer,
      isActice: "Active", // Mapped to .NET string 'IsActice'
    };

    const onSuccess = () => setIsQuestionModalOpen(false);

    if (editingQuestion) {
      dispatch(updateQuestionRequest({ id: editingQuestion.id, data: payload, onSuccess }));
    } else {
      dispatch(createQuestionRequest({ data: payload, onSuccess }));
    }
  };

  const handleDeleteQuestion = (question) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này cùng các phương án trả lời của nó?")) {
      return;
    }

    dispatch(deleteQuestionRequest({ id: question.id }));
  };

  // --- Option CRUD Handlers ---
  const openOptionModal = (questionId, option = null) => {
    setOptionParentQuestionId(questionId);
    const parentQuestion = questions.find((q) => q.id === questionId);
    const currentOptions = parentQuestion?.options || [];

    if (option) {
      setEditingOption(option);
      setOptionCode(option.code || "");
      setOptionContent(option.content || "");
      setOptionDisplayOrder(option.displayOrder || 1);
      setOptionScoreTag(option.scoreTag || "");
    } else {
      setEditingOption(null);
      const nextCode = String.fromCharCode(65 + currentOptions.length); // A, B, C, D...
      setOptionCode(nextCode);
      setOptionContent("");
      setOptionDisplayOrder(currentOptions.length + 1);
      setOptionScoreTag("");
    }
    setIsOptionModalOpen(true);
  };

  const handleSaveOption = (e) => {
    e.preventDefault();
    if (!optionCode.trim() || !optionContent.trim()) {
      toast.warning("Vui lòng điền mã phương án và nội dung");
      return;
    }

    const payload = {
      questionId: optionParentQuestionId,
      optionCode: optionCode.trim().toUpperCase(),
      content: optionContent.trim(),
      displayOrder: parseInt(optionDisplayOrder) || 1,
      scoreTag: optionScoreTag.trim(),
    };

    const onSuccess = () => setIsOptionModalOpen(false);

    if (editingOption) {
      dispatch(updateQuestionOptionRequest({ optionId: editingOption.id, data: payload, onSuccess }));
    } else {
      dispatch(createQuestionOptionRequest({ data: payload, onSuccess }));
    }
  };

  const handleDeleteOption = (option) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phương án "${option.code}"?`)) {
      return;
    }

    dispatch(deleteQuestionOptionRequest({ id: option.id }));
  };

  // --- Filtering & Selection ---
  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  // Chỉ hiện các bộ câu hỏi không phải ChatAI
  const nonChatCategories = categories.filter((c) => !c.isChatAi && c.name !== "Trò chuyện hướng nghiệp AI");

  const filteredQuestions = questions
    .filter((q) => q.categoryId === selectedCategoryId)
    .filter((q) => {
      const matchesSearch =
        (q.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.options || []).some((opt) =>
          (opt.content || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesSearch;
    })
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <section className="space-y-6 max-w-7xl mx-auto px-2">
      {/* Page Header Area */}
      <header className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-['Sora'] text-2xl font-bold md:text-3xl text-slate-950">
              Quản lý Ngân hàng Câu hỏi
            </h2>
            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Hệ thống quản lý đầy đủ các bộ câu hỏi (Categories), câu hỏi và phương án trả lời RIASEC.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              accept=".doc,.docx"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
              onClick={handleDownloadTemplate}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Tải File Mẫu Word
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 shadow-sm disabled:opacity-50"
              disabled={importLoading}
              onClick={triggerFileInput}
              type="button"
            >
              {importLoading ? "Đang import..." : "Import Câu hỏi từ Word"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Double Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        
        {/* Left Column: Category (Bộ Câu Hỏi) Management */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col h-[680px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-['Sora'] text-base font-bold text-slate-900">
                Bộ câu hỏi
              </h3>
              <button
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition"
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
                        ? "bg-teal-50 border-teal-200 text-teal-700 shadow-xs"
                        : "bg-white border-slate-150 text-slate-700 hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    <div className="flex-1 min-w-0 pr-10">
                      <p className="text-sm font-semibold truncate">
                        {cat.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {setQuestions.length} câu hỏi — Thứ tự: {cat.displayOrder}
                      </p>
                    </div>

                    {/* Actions on hover */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
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
                        className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
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

        {/* Right Column: Questions & Options list within selected Category */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 min-h-[680px]">
            {/* Header controls for selected category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Sora'] text-lg font-bold text-slate-900">
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
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-500 placeholder-slate-400 w-44"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Lọc câu hỏi trong bộ..."
                  type="text"
                  value={searchTerm}
                />
                
                {selectedCategoryId && (
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-teal-700 shadow-sm"
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
                    className="rounded-xl border border-slate-200 bg-slate-50/20 p-4 hover:border-slate-350 hover:bg-white transition-all duration-200 space-y-4 relative group/question"
                  >
                    {/* Question Card Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 font-['Sora'] text-xs font-bold text-slate-700">
                          {q.displayOrder || index + 1}
                        </span>
                        {q.allowCustomAnswer && (
                          <span className="bg-amber-50 border border-amber-200 text-amber-700 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                            Tự trả lời
                          </span>
                        )}
                      </div>

                      {/* Question Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition"
                          onClick={() => openQuestionModal(q)}
                          type="button"
                        >
                          Sửa
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded bg-rose-50 hover:bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-600 transition"
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
                        <span className="text-xs font-bold text-slate-500">
                          Các phương án trả lời
                        </span>
                        <button
                          className="text-[11px] font-bold text-teal-600 hover:text-teal-700"
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
                            className="group/option relative rounded-lg border border-slate-150 bg-white p-3 hover:border-teal-200 transition-colors flex flex-col justify-between"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                                {opt.code}
                              </span>
                              <p className="text-xs font-medium text-slate-700 leading-normal">
                                {opt.content}
                              </p>
                            </div>

                            {/* Option footer / scoretag */}
                            <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                Tag: {opt.scoreTag || "none"}
                              </span>

                              {/* Option Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover/option:opacity-100 transition-opacity">
                                <button
                                  className="text-[10px] font-semibold text-teal-600 hover:underline"
                                  onClick={() => openOptionModal(q.id, opt)}
                                  type="button"
                                >
                                  Sửa
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  className="text-[10px] font-semibold text-rose-500 hover:underline"
                                  onClick={() => handleDeleteOption(opt)}
                                  type="button"
                                >
                                  Xóa
                                </button>
                              </div>
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

      </div>

      {/* --- Modals dialog forms --- */}

      {/* Category Modal (Bộ câu hỏi) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4"
            onSubmit={handleSaveCategory}
          >
            <h3 className="font-['Sora'] text-lg font-bold text-slate-900">
              {editingCategory ? "Cập nhật Bộ câu hỏi" : "Tạo Bộ câu hỏi mới"}
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Tên bộ câu hỏi
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500"
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ví dụ: Thực tế (Realistic)"
                  required
                  type="text"
                  value={categoryName}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Thứ tự hiển thị
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500"
                  min="1"
                  onChange={(e) => setCategoryDisplayOrder(e.target.value)}
                  required
                  type="number"
                  value={categoryDisplayOrder}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                onClick={() => setIsCategoryModalOpen(false)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
                type="submit"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Question Modal (Câu hỏi) */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4"
            onSubmit={handleSaveQuestion}
          >
            <h3 className="font-['Sora'] text-lg font-bold text-slate-900">
              {editingQuestion ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nội dung câu hỏi
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 h-28 resize-none"
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="Nhập đề bài câu hỏi..."
                  required
                  value={questionContent}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Thứ tự hiển thị
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500"
                    min="1"
                    onChange={(e) => setQuestionDisplayOrder(e.target.value)}
                    required
                    type="number"
                    value={questionDisplayOrder}
                  />
                </div>

                <div className="flex items-center pt-5">
                  <input
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    id="allowCustomAnswer"
                    checked={questionAllowCustomAnswer}
                    onChange={(e) => setQuestionAllowCustomAnswer(e.target.checked)}
                    type="checkbox"
                  />
                  <label htmlFor="allowCustomAnswer" className="ml-2 text-sm font-semibold text-slate-700 cursor-pointer select-none">
                    Cho tự trả lời tùy chọn
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                onClick={() => setIsQuestionModalOpen(false)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
                type="submit"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Option Modal (Phương án trả lời) */}
      {isOptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4"
            onSubmit={handleSaveOption}
          >
            <h3 className="font-['Sora'] text-lg font-bold text-slate-900">
              {editingOption ? "Cập nhật phương án" : "Thêm phương án trả lời"}
            </h3>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Mã phương án
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500"
                    maxLength="5"
                    onChange={(e) => setOptionCode(e.target.value)}
                    placeholder="Ví dụ: A, B, C..."
                    required
                    type="text"
                    value={optionCode}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Thứ tự hiển thị
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500"
                    min="1"
                    onChange={(e) => setOptionDisplayOrder(e.target.value)}
                    required
                    type="number"
                    value={optionDisplayOrder}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nội dung đáp án
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500 h-20 resize-none"
                  onChange={(e) => setOptionContent(e.target.value)}
                  placeholder="Nhập văn bản đáp án..."
                  required
                  value={optionContent}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center justify-between">
                  <span>Nhãn tính điểm (ScoreTag)</span>
                  <span className="text-[10px] text-slate-400 normal-case font-medium">Gợi ý: {RIASEC_TAG_SUGGESTIONS.join(", ")}</span>
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500"
                  list="riasec-suggestions"
                  onChange={(e) => setOptionScoreTag(e.target.value)}
                  placeholder="Nhập tag (ví dụ: tech, social...)"
                  type="text"
                  value={optionScoreTag}
                />
                <datalist id="riasec-suggestions">
                  {RIASEC_TAG_SUGGESTIONS.map((tag) => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                onClick={() => setIsOptionModalOpen(false)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
                type="submit"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default AdminQuestionsPage;
