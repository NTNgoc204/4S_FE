import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import apiClient from "../config/apiClient";

export default function FeedbackFloatingButton() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";
  const location = useLocation();

  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // questionId -> answerText
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState({}); // questionId -> hovered star value

  // Check if we should render the button
  const isDashboardRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/accountant") ||
    location.pathname.startsWith("/school") ||
    location.pathname.startsWith("/school-manager") ||
    location.pathname.startsWith("/contact");

  // Fetch active questions when modal opens
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      setLoading(true);
      apiClient
        .get("/api/feedback-questions/active")
        .then((res) => {
          const fetchedQuestions = res.data?.data || [];
          // Sort by Order ascending
          fetchedQuestions.sort((a, b) => a.order - b.order);
          setQuestions(fetchedQuestions);

          // Initialize empty answers
          const initialAnswers = {};
          fetchedQuestions.forEach((q) => {
            initialAnswers[q.id] = "";
          });
          setAnswers(initialAnswers);
        })
        .catch((err) => {
          console.error("Failed to load feedback questions:", err);
          toast.error(
            isVi
              ? "Không thể tải danh sách câu hỏi khảo sát."
              : "Failed to load survey questions."
          );
          setIsOpen(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, isLoggedIn, isVi]);

  if (!isLoggedIn || isDashboardRoute) return null;

  const handleSelectAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: String(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all questions are answered
    const unanswered = questions.filter((q) => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      toast.warn(
        isVi
          ? "Vui lòng trả lời đầy đủ tất cả các câu hỏi khảo sát!"
          : "Please answer all the survey questions!"
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userEmail: user?.email || "",
        userFullName: user?.fullName || "",
        answers: Object.entries(answers).map(([qId, text]) => ({
          questionId: qId,
          answerText: text,
        })),
      };

      await apiClient.post("/api/feedbacks", payload);

      toast.success(
        isVi
          ? "Cảm ơn ý kiến đóng góp quý báu của bạn dành cho 4S!"
          : "Thank you for your valuable feedback to 4S!"
      );
      setIsOpen(false);
      setAnswers({});
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      toast.error(
        isVi
          ? "Gửi phản hồi thất bại. Vui lòng thử lại sau!"
          : "Failed to submit feedback. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes floatPulse {
          0%, 100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4), 0 8px 10px -6px rgba(99, 102, 241, 0.4);
          }
          50% {
            transform: translateY(-6px) scale(1.05);
            box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.5), 0 10px 10px -5px rgba(99, 102, 241, 0.5);
          }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleUp {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes ripple {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .animate-fab {
          animation: floatPulse 3s ease-in-out infinite;
        }
        .animate-modal-bg {
          animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-modal-card {
          animation: modalScaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .ripple-effect::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 4px solid rgb(99, 102, 241);
          animation: ripple 2s infinite ease-out;
        }
      `}</style>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="animate-fab ripple-effect fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl hover:from-indigo-750 hover:to-violet-600 transition-all duration-300 focus:outline-none cursor-pointer"
        title={isVi ? "Góp ý & Đóng góp ý kiến" : "Send Feedback"}
      >
        <svg
          className="h-6 w-6 relative z-10 transition-transform duration-300 hover:rotate-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      </button>

      {/* Survey Modal Overlay */}
      {isOpen && (
        <div className="animate-modal-bg fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md">
          {/* Modal Container */}
          <div className="animate-modal-card relative w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/95 p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Ambient Background Glows */}
            <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="font-['Sora'] text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>✉️</span> {isVi ? "Khảo sát ý kiến người dùng" : "User Satisfaction Survey"}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {isVi
                    ? "Ý kiến của bạn giúp chúng tôi cải thiện chất lượng dịch vụ hướng nghiệp tốt hơn."
                    : "Your inputs directly help us refine and improve our career advisor services."}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="rounded-xl p-1.5 hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="relative z-10 flex-1 overflow-y-auto my-6 pr-1.5 space-y-6">
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
                  <span className="text-xs text-slate-400 font-medium">
                    {isVi ? "Đang tải bộ câu hỏi khảo sát..." : "Loading survey questions..."}
                  </span>
                </div>
              ) : questions.length === 0 ? (
                <p className="text-center py-12 text-sm text-slate-400 italic">
                  {isVi
                    ? "Hiện tại không có khảo sát nào đang hoạt động."
                    : "There are no active survey questions at the moment."}
                </p>
              ) : (
                questions.map((q, idx) => {
                  const currentValue = answers[q.id] || "";

                  return (
                    <div key={q.id} className="space-y-2 border-b border-white/5 pb-4 last:border-b-0">
                      <label className="block text-sm font-bold text-slate-200">
                        {idx + 1}. {q.QuestionText}
                      </label>

                      {/* 1. Rating Question Type */}
                      {q.QuestionType === "Rating" && (
                        <div className="flex items-center gap-1.5 pt-1.5">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const isFilled =
                              val <= (hoveredRating[q.id] || Number(currentValue) || 0);
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleSelectAnswer(q.id, val)}
                                onMouseEnter={() =>
                                  setHoveredRating((prev) => ({ ...prev, [q.id]: val }))
                                }
                                onMouseLeave={() =>
                                  setHoveredRating((prev) => ({ ...prev, [q.id]: 0 }))
                                }
                                className={`text-2xl transition-all duration-200 focus:outline-none hover:scale-125 cursor-pointer ${
                                  isFilled ? "text-amber-400" : "text-slate-650"
                                }`}
                              >
                                {isFilled ? "★" : "☆"}
                              </button>
                            );
                          })}
                          {currentValue && (
                            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md ml-3">
                              {currentValue} / 5
                            </span>
                          )}
                        </div>
                      )}

                      {/* 2. YesNo Question Type */}
                      {q.QuestionType === "YesNo" && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {[
                            { label: isVi ? "Có" : "Yes", value: "Yes" },
                            { label: isVi ? "Không" : "No", value: "No" },
                          ].map((opt) => {
                            const isSelected = currentValue === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleSelectAnswer(q.id, opt.value)}
                                className={`rounded-xl border py-2.5 text-xs font-bold transition-all duration-300 focus:outline-none cursor-pointer hover:bg-white/5 ${
                                  isSelected
                                    ? "border-indigo-500 bg-indigo-500/15 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                                    : "border-white/10 bg-white/3 text-slate-400"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. Multiple Choice Question Type */}
                      {q.QuestionType === "MultipleChoice" && (
                        <div className="space-y-2 pt-1">
                          {(q.Options || "")
                            .split(",")
                            .map((opt) => opt.trim())
                            .filter(Boolean)
                            .map((optVal) => {
                              const isSelected = currentValue === optVal;
                              return (
                                <button
                                  key={optVal}
                                  type="button"
                                  onClick={() => handleSelectAnswer(q.id, optVal)}
                                  className={`w-full text-left rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-300 focus:outline-none cursor-pointer flex items-center justify-between hover:bg-white/5 ${
                                    isSelected
                                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-3xs"
                                      : "border-white/10 bg-white/3 text-slate-350"
                                  }`}
                                >
                                  <span>{optVal}</span>
                                  <span
                                    className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "border-indigo-500 bg-indigo-500"
                                        : "border-white/20"
                                    }`}
                                  >
                                    {isSelected && (
                                      <span className="h-2 w-2 rounded-full bg-white animate-scaleIn" />
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      )}

                      {/* 4. Text Question Type */}
                      {q.QuestionType === "Text" && (
                        <textarea
                          rows={2.5}
                          value={currentValue}
                          onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                          placeholder={
                            isVi
                              ? "Nhập câu trả lời hoặc góp ý của bạn tại đây..."
                              : "Enter your answer or thoughts here..."
                          }
                          className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none leading-relaxed"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </form>

            {/* Footer Actions */}
            {!loading && questions.length > 0 && (
              <div className="relative z-10 border-t border-white/5 pt-4 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={submitting}
                  className="rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 px-5 py-2.5 text-xs font-bold text-slate-350 transition active:scale-97 cursor-pointer focus:outline-none"
                >
                  {isVi ? "Đóng" : "Close"}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white hover:from-indigo-700 hover:to-violet-600 px-6 py-2.5 text-xs font-bold transition active:scale-97 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  {submitting && (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  )}
                  {isVi ? "Gửi phản hồi" : "Submit Feedback"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
