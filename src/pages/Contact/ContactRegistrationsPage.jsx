import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import RegistrationTable from "./components/RegistrationTable";
import EmailTemplateModal from "./components/EmailTemplateModal";
import ImportStudentEmailsModal from "./components/ImportStudentEmailsModal";
import {
  fetchRegistrationsRequest,
  sendQuoteRequest,
  completeRegistrationRequest,
} from "../../feature/edu/eduSlice";

export default function ContactRegistrationsPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";
  const dispatch = useDispatch();

  const { registrations, loading, actionLoading } = useSelector((s) => s.edu);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedRegForImport, setSelectedRegForImport] = useState(null);

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchRegistrationsRequest());

    const handleUpdate = () => dispatch(fetchRegistrationsRequest());
    window.addEventListener("4s_registrations_updated", handleUpdate);
    return () => window.removeEventListener("4s_registrations_updated", handleUpdate);
  }, [dispatch]);

  const fmtVND = (val) => `${Number(val).toLocaleString("vi-VN")} VND`;

  const filteredRegs = useMemo(() => {
    return registrations.filter((r) => {
      const keyword = searchText.trim().toLowerCase();
      const matchSearch =
        keyword === "" ||
        (r.schoolName || "").toLowerCase().includes(keyword) ||
        (r.representative || "").toLowerCase().includes(keyword) ||
        (r.email || "").toLowerCase().includes(keyword) ||
        (r.id || "").toLowerCase().includes(keyword);
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [registrations, searchText, statusFilter]);

  // ── Open quote modal ──────────────────────────────────────────────────────
  const handleOpenQuoteModal = (reg) => {
    setSelectedReg(reg);
    setIsQuoteModalOpen(true);
  };

  // ── Dispatch sendQuote saga ───────────────────────────────────────────────
  const handleSendQuoteSubmit = (id, subject, body) => {
    dispatch(
      sendQuoteRequest({
        id,
        emailContent: body,
        onSuccess: () => {
          setIsQuoteModalOpen(false);

          // FE notification → Accountant
          const targetReg = registrations.find((r) => r.id === id);
          const newNotif = {
            id: "NOTIF_" + Date.now(),
            role: "accountant",
            title: isVi
              ? `Yêu cầu thanh toán học đường: ${targetReg?.schoolName}`
              : `School Payment Approval: ${targetReg?.schoolName}`,
            message: isVi
              ? `Đơn đăng ký ${id} của trường ${targetReg?.schoolName} đang chờ xác nhận thanh toán.`
              : `Proposal ${id} for ${targetReg?.schoolName} is awaiting bank confirmation.`,
            createdAt: new Date().toLocaleString("sv-SE", { hour12: false }).substring(0, 16),
            isRead: false,
            type: "payment_requested",
          };
          const stored = localStorage.getItem("4s_notifications");
          const notifs = stored ? JSON.parse(stored) : [];
          notifs.push(newNotif);
          localStorage.setItem("4s_notifications", JSON.stringify(notifs));
          window.dispatchEvent(new Event("4s_notifications_updated"));
        },
      })
    );
  };

  // ── Open import modal ─────────────────────────────────────────────────────
  const handleOpenImportModal = (reg) => {
    setSelectedRegForImport(reg);
    setIsImportModalOpen(true);
  };

  // ── Dispatch completeRegistration saga ────────────────────────────────────
  const handleImportSuccess = (id, formData, modalCallback) => {
    dispatch(
      completeRegistrationRequest({
        id,
        formData,
        onSuccess: (keysList) => {
          window.dispatchEvent(new Event("4s_registrations_updated"));
          if (modalCallback) {
            modalCallback(keysList);
          }
        },
      })
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-850">
      {/* Title */}
      <div>
        <h2 className="font-['Sora'] text-2xl font-extrabold text-slate-900 tracking-tight">
          {isVi ? "Đơn Đăng Ký Học Đường" : "School Subscription Orders"}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isVi
            ? "Xem danh sách liên hệ từ các trường. Soạn báo giá + QR thanh toán, sau khi trường chuyển khoản thì nhập danh sách email học sinh để cấp key kích hoạt."
            : "Review school inquiries. Issue payment proposals with QR, then import student emails to generate activation keys after payment is confirmed."}
        </p>
      </div>

      {/* Status Flow Steps */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto pb-1">
        {[
          { label: isVi ? "Chờ tiếp nhận" : "Pending", color: "bg-amber-100 text-amber-700 border-amber-300" },
          { label: "→", color: "" },
          { label: isVi ? "Đã báo giá" : "Quoted", color: "bg-blue-100 text-blue-700 border-blue-300" },
          { label: "→", color: "" },
          { label: isVi ? "Đã thanh toán" : "Paid", color: "bg-teal-100 text-teal-700 border-teal-300" },
          { label: "→", color: "" },
          { label: isVi ? "Hoàn tất" : "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
        ].map((s, i) =>
          s.label === "→" ? (
            <span key={i} className="text-slate-300 shrink-0">→</span>
          ) : (
            <span key={i} className={`shrink-0 rounded-full border px-2.5 py-0.5 ${s.color}`}>
              {s.label}
            </span>
          )
        )}
      </div>

      {/* Filters */}
      <article className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 w-full max-w-2xl">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-3xs transition-all"
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={isVi ? "Tìm tên trường, email, mã đơn..." : "Search school name, email, ID..."}
              type="text"
              value={searchText}
            />
            <select
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-3xs transition-all"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="all">{isVi ? "Trạng thái (Tất cả)" : "Status (All)"}</option>
              <option value="Pending">{isVi ? "Chờ tiếp nhận" : "Pending"}</option>
              <option value="Quoted">{isVi ? "Đã báo giá / Chờ thanh toán" : "Quote Issued"}</option>
              <option value="Paid">{isVi ? "Đã thanh toán (Chờ nhập email HS)" : "Paid (Awaiting import)"}</option>
              <option value="Completed">{isVi ? "Hoàn tất" : "Completed"}</option>
            </select>
          </div>
          <button
            onClick={() => dispatch(fetchRegistrationsRequest())}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
            type="button"
            disabled={loading}
          >
            <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isVi ? "Tải lại" : "Refresh"}
          </button>
        </div>
      </article>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-sm text-slate-400 font-medium animate-pulse">
          {isVi ? "Đang tải dữ liệu..." : "Loading..."}
        </div>
      )}

      {/* Table */}
      {!loading && (
        <RegistrationTable
          fmtVND={fmtVND}
          isVi={isVi}
          onOpenImportModal={handleOpenImportModal}
          onOpenQuoteModal={handleOpenQuoteModal}
          registrations={filteredRegs}
          actionLoading={actionLoading}
        />
      )}

      {/* Quote Modal */}
      <EmailTemplateModal
        fmtVND={fmtVND}
        isOpen={isQuoteModalOpen}
        isVi={isVi}
        onClose={() => setIsQuoteModalOpen(false)}
        onSendQuote={handleSendQuoteSubmit}
        registration={selectedReg}
        isSending={actionLoading}
      />

      {/* Import Student Emails Modal */}
      <ImportStudentEmailsModal
        isOpen={isImportModalOpen}
        isVi={isVi}
        onClose={() => {
          setIsImportModalOpen(false);
          setSelectedRegForImport(null);
        }}
        onImportSuccess={handleImportSuccess}
        registration={selectedRegForImport}
      />
    </div>
  );
}
