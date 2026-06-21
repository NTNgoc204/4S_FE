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
} from "../../../feature/question/questionSlice";

import CategoryList from "./components/CategoryList";
import QuestionList from "./components/QuestionList";
import CategoryModal from "./components/CategoryModal";
import QuestionModal from "./components/QuestionModal";
import OptionModal from "./components/OptionModal";
import ConfirmModal from "../../../components/ConfirmModal";

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


  // Option Modal State
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [optionParentQuestionId, setOptionParentQuestionId] = useState("");
  const [optionCode, setOptionCode] = useState("");
  const [optionContent, setOptionContent] = useState("");
  const [optionDisplayOrder, setOptionDisplayOrder] = useState(1);

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {},
  });

  const showConfirm = (title, message, onConfirm, type = "warning") => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => {
        onConfirm();
        closeConfirm();
      },
    });
  };

  const closeConfirm = () => {
    setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
  };


  // Fetch initial data
  useEffect(() => {
    if (questions.length === 0) {
      dispatch(fetchQuestionsRequest());
    }
    if (categories.length === 0) {
      dispatch(fetchCategoriesRequest());
    }
  }, [dispatch, questions.length, categories.length]);

  // Auto-select first category if none selected (sorted by displayOrder)
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      const sortedNonChat = [...categories]
        .filter((c) => !c.isChatAi && c.name !== "Trò chuyện hướng nghiệp AI")
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      if (sortedNonChat.length > 0) {
        setSelectedCategoryId(sortedNonChat[0].id);
      }
    }
  }, [categories, selectedCategoryId]);

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
    showConfirm(
      "Xóa bộ câu hỏi",
      `Bạn có chắc chắn muốn xóa bộ câu hỏi "${category.name}"? Điều này sẽ xóa toàn bộ câu hỏi bên trong.`,
      () => {
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
      },
      "danger"
    );
  };

  // --- Question CRUD Handlers ---
  const openQuestionModal = (question = null) => {
    const categoryQuestions = questions.filter((q) => q.categoryId === selectedCategoryId);
    if (question) {
      setEditingQuestion(question);
      setQuestionContent(question.content || "");
      setQuestionDisplayOrder(question.displayOrder || 1);
    } else {
      setEditingQuestion(null);
      setQuestionContent("");
      setQuestionDisplayOrder(categoryQuestions.length + 1);
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
    showConfirm(
      "Xóa câu hỏi",
      "Bạn có chắc chắn muốn xóa câu hỏi này cùng các phương án trả lời của nó?",
      () => {
        dispatch(deleteQuestionRequest({ id: question.id }));
      },
      "danger"
    );
  };

  // --- Option CRUD Handlers ---
  const openOptionModal = (questionId, option = null) => {
    setOptionParentQuestionId(questionId);
    const parentQuestion = questions.find((q) => q.id === questionId);
    const currentOptions = parentQuestion?.options || [];

    if (option) {
      setEditingOption(option);
      const codeVal = (option.code || "").trim().toUpperCase();
      setOptionCode(codeVal);
      setOptionContent(option.content || "");
      const orderVal = codeVal ? (codeVal.charCodeAt(0) - 65 + 1) : 1;
      setOptionDisplayOrder(orderVal);
    } else {
      setEditingOption(null);
      // Tìm chữ cái đầu tiên chưa được sử dụng từ A-Z
      const usedCodes = new Set(currentOptions.map(opt => (opt.code || "").trim().toUpperCase()));
      let nextCode = "A";
      for (let i = 0; i < 26; i++) {
        const char = String.fromCharCode(65 + i);
        if (!usedCodes.has(char)) {
          nextCode = char;
          break;
        }
      }
      setOptionCode(nextCode);
      setOptionContent("");
      setOptionDisplayOrder(nextCode.charCodeAt(0) - 65 + 1);
    }
    setIsOptionModalOpen(true);
  };

  const handleSaveOption = (e) => {
    e.preventDefault();
    if (!optionCode.trim() || !optionContent.trim()) {
      toast.warning("Vui lòng điền mã phương án và nội dung");
      return;
    }

    const finalCode = optionCode.trim().toUpperCase();
    const finalDisplayOrder = finalCode.charCodeAt(0) - 65 + 1;

    const payload = {
      questionId: optionParentQuestionId,
      optionCode: finalCode,
      content: optionContent.trim(),
      displayOrder: finalDisplayOrder,
    };

    const onSuccess = () => setIsOptionModalOpen(false);

    if (editingOption) {
      dispatch(updateQuestionOptionRequest({ optionId: editingOption.id, data: payload, onSuccess }));
    } else {
      dispatch(createQuestionOptionRequest({ data: payload, onSuccess }));
    }
  };

  const handleDeleteOption = (option) => {
    showConfirm(
      "Xóa phương án trả lời",
      `Bạn có chắc chắn muốn xóa phương án "${option.code}"?`,
      () => {
        dispatch(deleteQuestionOptionRequest({ id: option.id }));
      },
      "danger"
    );
  };

  // --- Filtering & Selection ---
  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  // Chỉ hiện các bộ câu hỏi không phải ChatAI và sắp xếp theo displayOrder
  const nonChatCategories = categories
    .filter((c) => !c.isChatAi && c.name !== "Trò chuyện hướng nghiệp AI")
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

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
      {/* Page Header Actions Area (No title/sub description) */}
      <div className="flex justify-end gap-3">
        <input
          accept=".doc,.docx"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-650 transition hover:bg-slate-50 hover:border-slate-350 shadow-xs cursor-pointer"
          onClick={handleDownloadTemplate}
          type="button"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tải File Mẫu Word
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-sm disabled:opacity-50 cursor-pointer"
          disabled={importLoading}
          onClick={triggerFileInput}
          type="button"
        >
          {importLoading ? "Đang import..." : "Import Câu hỏi từ Word"}
        </button>
      </div>

      {/* Main Double Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        
        {/* Left Column: Category (Bộ Câu Hỏi) Management */}
        <CategoryList
          nonChatCategories={nonChatCategories}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          questions={questions}
          openCategoryModal={openCategoryModal}
          handleDeleteCategory={handleDeleteCategory}
        />

        {/* Right Column: Questions & Options list within selected Category */}
        <QuestionList
          currentCategory={currentCategory}
          filteredQuestions={filteredQuestions}
          loading={loading}
          selectedCategoryId={selectedCategoryId}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          openQuestionModal={openQuestionModal}
          handleDeleteQuestion={handleDeleteQuestion}
          openOptionModal={openOptionModal}
          handleDeleteOption={handleDeleteOption}
          getCategoryBadgeClass={getCategoryBadgeClass}
        />

      </div>

      {/* --- Modals dialog forms --- */}

      {/* Category Modal (Bộ câu hỏi) */}
      <CategoryModal
        isCategoryModalOpen={isCategoryModalOpen}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
        editingCategory={editingCategory}
        categoryName={categoryName}
        setCategoryName={setCategoryName}
        handleSaveCategory={handleSaveCategory}
      />

      {/* Question Modal (Câu hỏi) */}
      <QuestionModal
        isQuestionModalOpen={isQuestionModalOpen}
        setIsQuestionModalOpen={setIsQuestionModalOpen}
        editingQuestion={editingQuestion}
        questionContent={questionContent}
        setQuestionContent={setQuestionContent}
        questionDisplayOrder={questionDisplayOrder}
        setQuestionDisplayOrder={setQuestionDisplayOrder}
        handleSaveQuestion={handleSaveQuestion}
      />

      {/* Option Modal (Phương án trả lời) */}
      <OptionModal
        isOptionModalOpen={isOptionModalOpen}
        setIsOptionModalOpen={setIsOptionModalOpen}
        editingOption={editingOption}
        optionCode={optionCode}
        setOptionCode={setOptionCode}
        optionDisplayOrder={optionDisplayOrder}
        setOptionDisplayOrder={setOptionDisplayOrder}
        optionContent={optionContent}
        setOptionContent={setOptionContent}
        handleSaveOption={handleSaveOption}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
        isAdmin={true}
      />
    </section>
  );
}

export default AdminQuestionsPage;
