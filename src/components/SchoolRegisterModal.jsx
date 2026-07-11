import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import apiClient from "../config/apiClient";

export default function SchoolRegisterModal({ isOpen, onClose }) {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";

  const [schoolName, setSchoolName] = useState("");
  const [representative, setRepresentative] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [planName, setPlanName] = useState("Edu Premium");
  const [studentCount, setStudentCount] = useState(500);
  const [submitting, setSubmitting] = useState(false);

  // Fetch real plans from backend when modal is open
  useEffect(() => {
    if (isOpen) {
      apiClient
        .get("/api/Plans")
        .then((res) => {
          const allPlans = res.data || [];
          // Filter for plans containing 'edu' (case-insensitive)
          const eduPlans = allPlans.filter((p) =>
            p.name.toLowerCase().includes("edu")
          );
          setPlans(eduPlans.length > 0 ? eduPlans : allPlans);

          // Select first plan by default
          const defaultPlan = eduPlans.length > 0 ? eduPlans[0] : allPlans[0];
          if (defaultPlan) {
            setSelectedPlanId(defaultPlan.id);
            setPlanName(defaultPlan.name);
          }
        })
        .catch((err) => {
          console.error("Failed to load plans from backend:", err);
          // Fallback to hardcoded mock guid if BE call fails
          setSelectedPlanId("d3b07384-d113-4c5e-855d-7a6c2d76a715");
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // POST the registration to real BE endpoint
      await apiClient.post("/api/edu/register", {
        schoolName: schoolName.trim(),
        contactName: representative.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        studentCount: Number(studentCount),
        notes: `Gói đăng ký đề xuất: ${planName}`,
        planId: selectedPlanId,
      });

      // Dispatch custom events for real-time reactivity in Contact staff view
      window.dispatchEvent(new Event("4s_registrations_updated"));
      window.dispatchEvent(new Event("4s_notifications_updated"));

      toast.success(
        isVi
          ? "Gửi yêu cầu thành công! Ban tiếp nhận 4S sẽ sớm liên hệ gửi báo giá qua email của trường."
          : "Inquiry submitted successfully! 4S team will contact you shortly with the proposal email."
      );

      // Reset form & close
      setSchoolName("");
      setRepresentative("");
      setEmail("");
      setPhoneNumber("");
      setStudentCount(500);
      onClose();
    } catch (err) {
      console.error("Failed to register school:", err);
      const msg = err?.response?.data?.message;
      toast.error(
        isVi
          ? `Đã có lỗi xảy ra: ${msg || "Vui lòng thử lại!"}`
          : `An error occurred: ${msg || "Please try again."}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-fadeIn font-sans text-slate-100">
      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/95 p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col">
        {/* Glow ambient decors */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/15 blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-teal-500/15 blur-[50px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
          <h3 className="font-['Sora'] text-lg font-extrabold text-white tracking-tight">
            {isVi ? "Đăng Ký Tư Vấn Học Đường" : "Register School Inquiry"}
          </h3>
          <button
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form className="mt-5 space-y-4 relative z-10" onSubmit={handleSubmit}>
          {/* School Name */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold text-slate-300 tracking-wide"
              htmlFor="schoolName"
            >
              {isVi ? "Tên trường học" : "School Name"}{" "}
              <span className="text-rose-400">*</span>
            </label>
            <input
              id="schoolName"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:ring-1 focus:ring-[#ecc741] focus:outline-none transition-all shadow-inner"
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder={
                isVi
                  ? "Ví dụ: Trường THPT Nguyễn Thượng Hiền"
                  : "e.g., High School Name"
              }
              required
              type="text"
              value={schoolName}
              disabled={submitting}
            />
          </div>

          {/* Representative & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold text-slate-300 tracking-wide"
                htmlFor="representative"
              >
                {isVi ? "Người đại diện" : "Representative Rep"}{" "}
                <span className="text-rose-400">*</span>
              </label>
              <input
                id="representative"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:ring-1 focus:ring-[#ecc741] focus:outline-none transition-all shadow-inner"
                onChange={(e) => setRepresentative(e.target.value)}
                placeholder={
                  isVi ? "Ví dụ: Thầy Nguyễn Văn An" : "Representative name"
                }
                required
                type="text"
                value={representative}
                disabled={submitting}
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold text-slate-300 tracking-wide"
                htmlFor="phoneNumber"
              >
                {isVi ? "Số điện thoại" : "Phone Number"}{" "}
                <span className="text-rose-400">*</span>
              </label>
              <input
                id="phoneNumber"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:ring-1 focus:ring-[#ecc741] focus:outline-none transition-all shadow-inner"
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={isVi ? "Ví dụ: 0912345678" : "Phone number"}
                required
                type="tel"
                value={phoneNumber}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Email Representative */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold text-slate-300 tracking-wide"
              htmlFor="email"
            >
              {isVi ? "Email nhận báo giá" : "Inquiry Email"}{" "}
              <span className="text-rose-400">*</span>
            </label>
            <input
              id="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:ring-1 focus:ring-[#ecc741] focus:outline-none transition-all shadow-inner"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="school.email@edu.vn"
              required
              type="email"
              value={email}
              disabled={submitting}
            />
          </div>

          {/* Plan Selection (if multiple plans exist) */}
          {plans.length > 0 && (
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold text-slate-300 tracking-wide"
                htmlFor="planSelect"
              >
                {isVi ? "Gói cước đăng ký" : "Subscription Plan"}{" "}
                <span className="text-rose-400">*</span>
              </label>
              <select
                id="planSelect"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 focus:border-[#ecc741] focus:ring-1 focus:ring-[#ecc741] focus:outline-none transition-all shadow-inner"
                onChange={(e) => {
                  const p = plans.find((x) => x.id === e.target.value);
                  if (p) {
                    setSelectedPlanId(p.id);
                    setPlanName(p.name);
                  }
                }}
                value={selectedPlanId}
                disabled={submitting}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {Number(p.price).toLocaleString("vi-VN")} VND/HS
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Count */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold text-slate-300 tracking-wide"
              htmlFor="studentCount"
            >
              {isVi ? "Số lượng học sinh" : "Student Count"}{" "}
              <span className="text-rose-400">*</span>
            </label>
            <input
              id="studentCount"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:ring-1 focus:ring-[#ecc741] focus:outline-none transition-all shadow-inner"
              onChange={(e) => setStudentCount(e.target.value)}
              required
              type="number"
              min={10}
              value={studentCount}
              disabled={submitting}
            />
          </div>

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-355 hover:bg-white/10 hover:text-white transition cursor-pointer"
              onClick={onClose}
              type="button"
              disabled={submitting}
            >
              {isVi ? "Hủy bỏ" : "Cancel"}
            </button>
            <button
              className="rounded-xl bg-gradient-to-r from-[#ffe06e] to-[#ecc741] hover:scale-[1.02] active:scale-95 px-6 py-2.5 text-xs font-bold text-[#0c1e36] transition shadow-md shadow-amber-950/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? isVi
                  ? "Đang gửi..."
                  : "Submitting..."
                : isVi
                ? "Đăng ký liên hệ"
                : "Submit Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
