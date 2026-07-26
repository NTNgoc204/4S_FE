import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import apiClient from "../../../config/apiClient";
import { formatDateTimeForFE } from "../../../util/dateHelper";

export default function AdminFeedbackPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null); // Detailed view

  // Filters (Default to last 30 days)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const fetchFeedbacks = () => {
    setLoading(true);
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
        toast.error(
          isVi
            ? "Không thể tải danh sách phản hồi."
            : "Failed to load feedback list."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [startDate, endDate]);

  const handleExportExcel = async () => {
    if (!startDate || !endDate) {
      toast.warn(
        isVi
          ? "Vui lòng chọn khoảng thời gian xuất báo cáo!"
          : "Please select a date range for the report!"
      );
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

      toast.success(
        isVi ? "Tải xuống báo cáo Excel thành công!" : "Excel report downloaded successfully!"
      );
    } catch (err) {
      console.error("Failed to export Excel report:", err);
      toast.error(
        isVi ? "Lỗi khi xuất báo cáo Excel." : "Error exporting Excel report."
      );
    } finally {
      setExporting(false);
    }
  };

  // Filter local search
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
            {isVi ? "Quản Lý Ý Kiến Phản Hồi" : "Feedback Management"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isVi
              ? "Xem các ý kiến đóng góp, nhận xét từ người dùng hệ thống và tải báo cáo Excel."
              : "Review suggestions, comments from system users and download Excel reports."}
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={exporting || feedbacks.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-5 py-2.5 text-sm font-bold shadow-xs transition cursor-pointer"
        >
          {exporting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <span>{isVi ? "Xuất báo cáo Excel" : "Export Excel Report"}</span>
        </button>
      </div>

      {/* Filters bar */}
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {/* Search bar */}
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

          {/* Start Date */}
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

          {/* End Date */}
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
        </div>
      </article>

      {/* Main Table */}
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                      <span>{isVi ? "Đang tải dữ liệu..." : "Loading feedback data..."}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400 italic">
                    {isVi ? "Không có phản hồi nào phù hợp." : "No matching feedbacks found."}
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb, idx) => (
                  <tr key={fb.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-center font-semibold text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{fb.userFullName || (isVi ? "Khách vãng lai" : "Guest User")}</td>
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
                        className="rounded-xl border border-slate-250 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition shadow-3xs cursor-pointer focus:outline-none"
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

      {/* Details Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleIn">
            
            {/* Header */}
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

            {/* Answers List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {(selectedFeedback.answers || []).map((ans, index) => (
                <div key={ans.questionId} className="space-y-1.5 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                  <h5 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    {isVi ? `Câu hỏi ${index + 1}` : `Question ${index + 1}`}
                  </h5>
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {ans.questionText}
                  </p>
                  
                  {/* Render based on question type */}
                  <div className="pt-1.5">
                    {ans.questionType === "Rating" ? (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isFilled = val <= (Number(ans.answerText) || 0);
                          return (
                            <span
                              key={val}
                              className={`text-xl ${isFilled ? "text-amber-400" : "text-slate-200"}`}
                            >
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

            {/* Footer */}
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
    </div>
  );
}
