import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import apiClient from "../../../config/apiClient";
import { formatDateTimeForFE } from "../../../util/dateHelper";

export default function AdminFeedbackPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";

  // Tab state: "feedbacks" | "questions"
  const [activeTab, setActiveTab] = useState("feedbacks");

  // --- FEEDBACK TAB STATE ---
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null); // Detailed view
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // --- QUESTION TAB STATE ---
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // For Edit/Create modal
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  
  // Question Form Fields
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("Rating");
  const [qOptions, setQOptions] = useState("");
  const [qOrder, setQOrder] = useState(1);
  const [qIsActive, setQIsActive] = useState(true);

  // --- API CALLS ---
  const fetchFeedbacks = () => {
    setLoadingFeedbacks(true);
    apiClient
      .get("/api/admin/feedbacks", {
        params: {
          startDate: startDate ? `${startDate}T00:00:00` : undefined,
          endDate: endDate ? `${endDate}T23:59:59` : undefined,
        },
      })
      .then((res) => {
        setFeedbacks(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Failed to load feedbacks:", err);
        toast.error(isVi ? "Không thể tải danh sách phản hồi." : "Failed to load feedback list.");
      })
      .finally(() => {
        setLoadingFeedbacks(false);
      });
  };

  const fetchQuestions = () => {
    setLoadingQuestions(true);
    apiClient
      .get("/api/admin/feedback-questions")
      .then((res) => {
        setQuestions(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Failed to load questions:", err);
        toast.error(isVi ? "Không thể tải danh sách câu hỏi." : "Failed to load question list.");
      })
      .finally(() => {
        setLoadingQuestions(false);
      });
  };

  useEffect(() => {
    if (activeTab === "feedbacks") {
      fetchFeedbacks();
    } else {
      fetchQuestions();
    }
  }, [activeTab, startDate, endDate]);

  const handleExportExcel = async () => {
    if (!startDate || !endDate) {
      toast.warn(isVi ? "Vui lòng chọn khoảng thời gian xuất báo cáo!" : "Please select a date range!");
      return;
    }
    setExporting(true);
    try {
      const response = await apiClient.get("/api/admin/feedbacks/export", {
        params: {
          startDate: `${startDate}T00:00:00`,
          endDate: `${endDate}T23:59:59`,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BaoCaoPhanHoi_${startDate.replace(/-/g, "")}_to_${endDate.replace(/-/g, "")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(isVi ? "Tải xuống báo cáo Excel thành công!" : "Excel report downloaded!");
    } catch (err) {
      console.error(err);
      toast.error(isVi ? "Lỗi khi xuất báo cáo Excel." : "Error exporting Excel report.");
    } finally {
      setExporting(false);
    }
  };

  // --- QUESTION CRUD OPERATIONS ---
  const openCreateModal = () => {
    setEditingQuestion(null);
    setQText("");
    setQType("Rating");
    setQOptions("");
    setQOrder(questions.length + 1);
    setQIsActive(true);
    setQuestionModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setQText(q.questionText || q.QuestionText || "");
    setQType(q.questionType || q.QuestionType || "Rating");
    setQOptions(q.options || q.Options || "");
    setQOrder(q.order || q.Order || 1);
    setQIsActive(q.isActive !== undefined ? q.isActive : q.IsActive);
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!qText.trim()) {
      toast.warn(isVi ? "Vui lòng nhập nội dung câu hỏi!" : "Please enter question text!");
      return;
    }

    const payload = {
      questionText: qText,
      questionType: qType,
      options: qType === "MultipleChoice" ? qOptions : "",
      order: Number(qOrder),
      isActive: qIsActive,
    };

    const request = editingQuestion
      ? apiClient.put(`/api/admin/feedback-questions/${editingQuestion.id}`, payload)
      : apiClient.post("/api/admin/feedback-questions", payload);

    request
      .then(() => {
        toast.success(
          editingQuestion
            ? (isVi ? "Cập nhật câu hỏi thành công!" : "Question updated successfully!")
            : (isVi ? "Tạo câu hỏi thành công!" : "Question created successfully!")
        );
        setQuestionModalOpen(false);
        fetchQuestions();
      })
      .catch((err) => {
        console.error(err);
        toast.error(isVi ? "Lỗi lưu câu hỏi." : "Error saving question.");
      });
  };

  const handleDeleteQuestion = (id) => {
    if (!window.confirm(isVi ? "Bạn chắc chắn muốn xóa/ngưng kích hoạt câu hỏi này?" : "Are you sure you want to delete/deactivate this question?")) return;

    apiClient
      .delete(`/api/admin/feedback-questions/${id}`)
      .then(() => {
        toast.success(isVi ? "Xóa câu hỏi thành công!" : "Question deleted successfully!");
        fetchQuestions();
      })
      .catch((err) => {
        console.error(err);
        toast.error(isVi ? "Không thể xóa câu hỏi." : "Failed to delete question.");
      });
  };

  // Filter local search for feedbacks
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const text = searchText.toLowerCase();
    const name = (fb.userFullName || "").toLowerCase();
    const email = (fb.userEmail || "").toLowerCase();
    return name.includes(text) || email.includes(text);
  });

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-2xl font-extrabold text-slate-900 tracking-tight">
            {isVi ? "Hệ Thống Ý Kiến Khảo Sát" : "User Survey System"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isVi
              ? "Quản lý câu hỏi khảo sát và phân tích các ý kiến đóng góp từ người dùng."
              : "Manage survey questions and analyze user feedback inputs."}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab("feedbacks")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "feedbacks"
                ? "bg-white text-indigo-650 shadow-3xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isVi ? "Ý kiến Phản hồi" : "User Feedbacks"}
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "questions"
                ? "bg-white text-indigo-650 shadow-3xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isVi ? "Thiết lập Câu hỏi" : "Survey Questions"}
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: FEEDBACKS LIST */}
      {/* ==================================================== */}
      {activeTab === "feedbacks" && (
        <>
          {/* Filters bar */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wide">
                  {isVi ? "Tìm kiếm" : "Search"}
                </label>
                <input
                  type="text"
                  placeholder={isVi ? "Tìm tên, email..." : "Search name, email..."}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wide">
                  {isVi ? "Từ ngày" : "Start Date"}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wide">
                  {isVi ? "Đến ngày" : "End Date"}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                />
              </div>

              <button
                onClick={handleExportExcel}
                disabled={exporting || feedbacks.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2.5 text-sm font-bold shadow-xs transition cursor-pointer"
              >
                {exporting ? (
                  <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                <span>{isVi ? "Xuất Excel" : "Export Excel"}</span>
              </button>
            </div>
          </article>

          {/* Table */}
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5 text-center w-16">STT</th>
                    <th className="px-5 py-3.5">{isVi ? "Họ Tên / Người dùng" : "Full Name"}</th>
                    <th className="px-5 py-3.5">{isVi ? "Email liên hệ" : "Email Address"}</th>
                    <th className="px-5 py-3.5">{isVi ? "Ngày gửi phản hồi" : "Submission Date"}</th>
                    <th className="px-5 py-3.5 text-center w-28">{isVi ? "Số câu trả lời" : "Answers"}</th>
                    <th className="px-5 py-3.5 text-right w-32">{isVi ? "Hành động" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loadingFeedbacks ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                          <span>{isVi ? "Đang tải dữ liệu..." : "Loading..."}</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400 italic">
                        {isVi ? "Không có phản hồi nào phù hợp." : "No feedbacks found."}
                      </td>
                    </tr>
                  ) : (
                    filteredFeedbacks.map((fb, idx) => (
                      <tr key={fb.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 text-center font-semibold text-slate-400">{idx + 1}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{fb.userFullName || (isVi ? "Ẩn danh" : "Anonymous")}</td>
                        <td className="px-5 py-4 font-medium text-slate-600">{fb.userEmail || "—"}</td>
                        <td className="px-5 py-4 font-medium text-slate-500 whitespace-nowrap">
                          {formatDateTimeForFE(fb.submittedAt)}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-2xs font-extrabold text-indigo-700">
                            {fb.answers?.length || 0} {isVi ? "câu" : "answers"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedFeedback(fb)}
                            className="rounded-xl border border-slate-250 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-650 hover:text-slate-950 transition shadow-3xs cursor-pointer focus:outline-none"
                          >
                            {isVi ? "Xem chi tiết" : "View Details"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}

      {/* ==================================================== */}
      {/* TAB 2: QUESTIONS CONFIGURATION */}
      {/* ==================================================== */}
      {activeTab === "questions" && (
        <>
          {/* Action button */}
          <div className="flex justify-end">
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>{isVi ? "Thêm câu hỏi khảo sát" : "Add Survey Question"}</span>
            </button>
          </div>

          {/* Table */}
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5 text-center w-16">{isVi ? "Thứ tự" : "Order"}</th>
                    <th className="px-5 py-3.5">{isVi ? "Nội dung câu hỏi" : "Question Text"}</th>
                    <th className="px-5 py-3.5 w-40">{isVi ? "Loại câu hỏi" : "Type"}</th>
                    <th className="px-5 py-3.5">{isVi ? "Tùy chọn (Lựa chọn)" : "Options"}</th>
                    <th className="px-5 py-3.5 text-center w-28">{isVi ? "Trạng thái" : "Status"}</th>
                    <th className="px-5 py-3.5 text-right w-32">{isVi ? "Hành động" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loadingQuestions ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                          <span>{isVi ? "Đang tải bộ câu hỏi..." : "Loading..."}</span>
                        </div>
                      </td>
                    </tr>
                  ) : questions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400 italic">
                        {isVi ? "Chưa có câu hỏi khảo sát nào được tạo." : "No survey questions found."}
                      </td>
                    </tr>
                  ) : (
                    questions
                      .sort((a, b) => (a.order || a.Order || 0) - (b.order || b.Order || 0))
                      .map((q) => {
                        const typeVal = q.questionType || q.QuestionType || "";
                        const optionsVal = q.options || q.Options || "";
                        const orderVal = q.order || q.Order || "";
                        const activeVal = q.isActive !== undefined ? q.isActive : q.IsActive;

                        return (
                          <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 text-center font-bold text-slate-900">{orderVal}</td>
                            <td className="px-5 py-4 font-semibold text-slate-800 leading-snug">{q.questionText || q.QuestionText}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-2xs font-extrabold border ${
                                typeVal === "Rating"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : typeVal === "YesNo"
                                  ? "bg-sky-50 text-sky-700 border-sky-200"
                                  : typeVal === "MultipleChoice"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}>
                                {typeVal}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-slate-500 italic max-w-xs truncate">
                              {optionsVal || "—"}
                            </td>
                            <td className="px-5 py-4 text-center whitespace-nowrap">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-2xs font-bold ${
                                activeVal
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-400"
                              }`}>
                                {activeVal ? (isVi ? "Kích hoạt" : "Active") : (isVi ? "Tắt" : "Disabled")}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                              <button
                                onClick={() => openEditModal(q)}
                                className="rounded-lg border border-slate-200 hover:bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                              >
                                {isVi ? "Sửa" : "Edit"}
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="rounded-lg border border-red-100 hover:bg-red-50 px-2.5 py-1 text-xs font-bold text-red-650 transition cursor-pointer"
                              >
                                {isVi ? "Xóa" : "Delete"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}

      {/* ==================================================== */}
      {/* 1. FEEDBACK DETAILS MODAL */}
      {/* ==================================================== */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h4 className="font-['Sora'] text-base font-extrabold text-slate-900">
                  {isVi ? "Chi tiết ý kiến phản hồi" : "Feedback Details"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedFeedback.userFullName || "Guest"} • {selectedFeedback.userEmail || "No email"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="rounded-xl p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition cursor-pointer focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {(selectedFeedback.answers || []).map((ans, index) => (
                <div key={ans.questionId} className="space-y-1.5 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                  <h5 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    {isVi ? `Câu hỏi ${index + 1}` : `Question ${index + 1}`}
                  </h5>
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {ans.questionText}
                  </p>
                  
                  <div className="pt-1.5">
                    {ans.questionType === "Rating" ? (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isFilled = val <= (Number(ans.answerText) || 0);
                          return (
                            <span key={val} className={`text-xl ${isFilled ? "text-amber-400" : "text-slate-200"}`}>
                              ★
                            </span>
                          );
                        })}
                        <span className="text-xs font-bold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded ml-2">
                          {ans.answerText} / 5
                        </span>
                      </div>
                    ) : ans.questionType === "YesNo" ? (
                      <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold border ${
                        ans.answerText === "Yes"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {ans.answerText === "Yes" ? (isVi ? "Có" : "Yes") : (isVi ? "Không" : "No")}
                      </span>
                    ) : ans.questionType === "MultipleChoice" ? (
                      <span className="inline-flex rounded-lg bg-indigo-50 border border-indigo-150 px-3 py-1 text-xs font-bold text-indigo-700">
                        {ans.answerText}
                      </span>
                    ) : (
                      <div className="rounded-2xl bg-slate-50 border border-slate-150 p-4.5 text-xs text-slate-700 leading-relaxed font-medium italic">
                        "{ans.answerText}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="rounded-xl border border-slate-250 bg-white hover:bg-slate-50 px-5 py-2 text-xs font-bold text-slate-650 transition shadow-3xs cursor-pointer focus:outline-none"
              >
                {isVi ? "Đóng" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. QUESTION CRUD MODAL */}
      {/* ==================================================== */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100">
              <h4 className="font-['Sora'] text-base font-extrabold text-slate-900">
                {editingQuestion
                  ? (isVi ? "Chỉnh sửa câu hỏi khảo sát" : "Edit Survey Question")
                  : (isVi ? "Tạo câu hỏi khảo sát mới" : "Create Survey Question")}
              </h4>
            </div>

            {/* Form body */}
            <form onSubmit={handleSaveQuestion} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Question Text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                  {isVi ? "Nội dung câu hỏi" : "Question Text"}
                </label>
                <textarea
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder={isVi ? "Ví dụ: Bạn đánh giá thế nào về chất lượng tư vấn hướng nghiệp?" : "e.g., How do you rate our service?"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Question Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                  {isVi ? "Loại câu hỏi" : "Question Type"}
                </label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="Rating">{isVi ? "Đánh giá sao (Rating)" : "Star Rating (Rating)"}</option>
                  <option value="YesNo">{isVi ? "Có/Không (YesNo)" : "Yes/No (YesNo)"}</option>
                  <option value="MultipleChoice">{isVi ? "Trắc nghiệm trích chọn (MultipleChoice)" : "Multiple Choice (MultipleChoice)"}</option>
                  <option value="Text">{isVi ? "Ý kiến tự do (Text)" : "Text Input (Text)"}</option>
                </select>
              </div>

              {/* MultipleChoice Options */}
              {qType === "MultipleChoice" && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                    {isVi ? "Các tùy chọn câu trả lời (Cách nhau bằng dấu phẩy)" : "Answer Options (Comma-separated)"}
                  </label>
                  <input
                    type="text"
                    value={qOptions}
                    onChange={(e) => setQOptions(e.target.value)}
                    placeholder={isVi ? "Ví dụ: Dịch vụ tốt, Chatbot nhanh, Xem học phí, Khác" : "e.g., Option A, Option B, Option C"}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                  />
                  <p className="text-3xs text-slate-400 italic">
                    {isVi ? "* Hãy nhập các phương án lựa chọn và tách biệt bằng dấu phẩy ','" : "* Enter options separated by a comma ','"}
                  </p>
                </div>
              )}

              {/* Order & Active Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                    {isVi ? "Thứ tự hiển thị" : "Display Order"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={qOrder}
                    onChange={(e) => setQOrder(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input
                      type="checkbox"
                      checked={qIsActive}
                      onChange={(e) => setQIsActive(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {isVi ? "Kích hoạt hiển thị" : "Is Active"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3.5 border-t border-slate-100 pt-4.5">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="rounded-xl border border-slate-250 bg-white hover:bg-slate-50 px-5 py-2 text-xs font-bold text-slate-650 cursor-pointer focus:outline-none"
                >
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 text-xs font-bold cursor-pointer focus:outline-none"
                >
                  {isVi ? "Lưu lại" : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
