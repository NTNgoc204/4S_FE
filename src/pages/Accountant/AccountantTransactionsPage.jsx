import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRegistrationsRequest,
  confirmPaymentRequest,
} from "../../feature/edu/eduSlice";

function fmtVND(n) {
  return `${Number(n).toLocaleString("vi-VN")} VND`;
}

const UI_TEXT = {
  vi: {
    title: "Sá»• Giao dá»‹ch Há»c sinh & HoÃ n tiá»n",
    subtitle: "Tra cá»©u lá»‹ch sá»­ thanh toÃ¡n nÃ¢ng cáº¥p VIP, hoÃ n tiá»n vÃ  phÃª duyá»‡t thá»§ cÃ´ng.",
    searchPlaceholder: "TÃ¬m mÃ£ giao dá»‹ch, tÃªn há»c sinh, email...",
    statusAll: "Tráº¡ng thÃ¡i (Táº¥t cáº£)",
    statusSuccess: "Success (ThÃ nh cÃ´ng)",
    statusPending: "Pending (Chá» duyá»‡t)",
    statusRefunded: "Refunded (ÄÃ£ hoÃ n tiá»n)",
    statusExpired: "Expired (Háº¿t háº¡n)",
    colTxId: "MÃ£ GD",
    colStudent: "Há»c sinh / Email",
    colPlan: "GÃ³i cÆ°á»›c",
    colAmount: "Sá»‘ tiá»n",
    colDate: "Thá»i gian",
    colStatus: "Tráº¡ng thÃ¡i",
    colActions: "HÃ nh Ä‘á»™ng",
    noTransactions: "KhÃ´ng tÃ¬m tháº¥y giao dá»‹ch nÃ o.",
    actionApprove: "Duyá»‡t thá»§ cÃ´ng",
    actionInvoice: "Xuáº¥t HÃ³a Ä‘Æ¡n VAT",
    actionRefund: "HoÃ n tiá»n (Refund)",
    actionRefundMobile: "HoÃ n tiá»n",
    confirmApprove: "XÃ¡c nháº­n duyá»‡t thá»§ cÃ´ng giao dá»‹ch",
    confirmRefund: "Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n hoÃ n tiá»n cho giao dá»‹ch khÃ´ng? Quyá»n lá»£i gÃ³i cÆ°á»›c cá»§a há»c sinh sáº½ bá»‹ Ä‘áº£o ngÆ°á»£c.",
    toastApproved: "ÄÃ£ duyá»‡t thá»§ cÃ´ng giao dá»‹ch. Doanh thu tá»•ng Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t.",
    toastRefunded: "Giao dá»‹ch Ä‘Ã£ Ä‘Æ°á»£c hoÃ n tiá»n. Chá»‰ sá»‘ doanh thu tá»•ng Ä‘Ã£ giáº£m tÆ°Æ¡ng á»©ng.",
    labelPlan: "GÃ³i: ",
  },
  en: {
    title: "Student Transactions & Refunds Ledger",
    subtitle: "Look up student payment history, trigger refunds, and manually approve payments.",
    searchPlaceholder: "Search transaction ID, student name, email...",
    statusAll: "Status (All)",
    statusSuccess: "Success",
    statusPending: "Pending",
    statusRefunded: "Refunded",
    statusExpired: "Expired",
    colTxId: "TXID",
    colStudent: "Student / Email",
    colPlan: "Plan",
    colAmount: "Amount",
    colDate: "Date",
    colStatus: "Status",
    colActions: "Actions",
    noTransactions: "No transactions found.",
    actionApprove: "Manual Approve",
    actionInvoice: "Issue VAT Invoice",
    actionRefund: "Refund Payment",
    actionRefundMobile: "Refund",
    confirmApprove: "Confirm manual approval for transaction",
    confirmRefund: "Are you sure you want to refund transaction? The student's premium package benefits will be revoked.",
    toastApproved: "Transaction manually approved. Gross revenue updated.",
    toastRefunded: "Transaction refunded. Gross revenue adjusted downwards.",
    labelPlan: "Plan: ",
  }
};

function AccountantTransactionsPage() {
  const { incomes, setIncomes } = useOutletContext();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const text = UI_TEXT[locale];
  const dispatch = useDispatch();

  const { registrations: schoolRegistrations } = useSelector((s) => s.edu);

  const [activeTab, setActiveTab] = useState("students");

  // Student transactions state
  const [incSearchText, setIncSearchText] = useState("");
  const [incStatusFilter, setIncStatusFilter] = useState("all");

  // School registrations state — from Redux (edu slice)
  const [schoolSearchText, setSchoolSearchText] = useState("");
  const [schoolStatusFilter, setSchoolStatusFilter] = useState("all");

  // Confirm Modal state
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

  // Load school registrations via saga on mount
  useEffect(() => {
    dispatch(fetchRegistrationsRequest());
    const handleUpdate = () => dispatch(fetchRegistrationsRequest());
    window.addEventListener("4s_registrations_updated", handleUpdate);
    return () => window.removeEventListener("4s_registrations_updated", handleUpdate);
  }, [dispatch]);

  // Filter incomes list (Student)
  const filteredIncomes = useMemo(() => {
    return incomes.filter((i) => {
      const studentName = i.studentName || "";
      const email = i.email || "";
      const id = i.id || "";
      const matchSearch =
        incSearchText.trim() === "" ||
        studentName.toLowerCase().includes(incSearchText.toLowerCase()) ||
        email.toLowerCase().includes(incSearchText.toLowerCase()) ||
        id.toLowerCase().includes(incSearchText.toLowerCase());
      const matchStatus = incStatusFilter === "all" || i.status === incStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [incomes, incSearchText, incStatusFilter]);

  // Filter school registrations list (School)
  const filteredSchoolRegistrations = useMemo(() => {
    return schoolRegistrations.filter((r) => {
      const keyword = schoolSearchText.trim().toLowerCase();
      const matchSearch =
        keyword === "" ||
        (r.schoolName || "").toLowerCase().includes(keyword) ||
        (r.representative || "").toLowerCase().includes(keyword) ||
        (r.id || "").toLowerCase().includes(keyword);
      const matchStatus = schoolStatusFilter === "all" || r.status === schoolStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [schoolRegistrations, schoolSearchText, schoolStatusFilter]);

  function handleManualApprove(id) {
    showConfirm(
      locale === "vi" ? "Duyá»‡t giao dá»‹ch" : "Approve Transaction",
      `${text.confirmApprove} ${id}?`,
      () => {
        setIncomes((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "Success" } : item))
        );
        toast.success(`${text.toastApproved.replace("giao dá»‹ch", id)}`);
      },
      "warning"
    );
  }

  function handleRefund(id) {
    showConfirm(
      locale === "vi" ? "HoÃ n tiá» n giao dá»‹ch" : "Refund Transaction",
      `${text.confirmRefund.replace("giao dá»‹ch", id)}`,
      () => {
        setIncomes((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "Refunded" } : item))
        );
        toast.warn(`${text.toastRefunded.replace("Giao dá»‹ch", `Giao dá»‹ch ${id}`)}`);
      },
      "danger"
    );
  }

  // Handle accountant confirms bank transfer from school → dispatch confirmPaymentSaga
  function handleConfirmSchoolPayment(reg) {
    showConfirm(
      locale === "vi" ? "Xác nhận nhận tiền chuyển khoản" : "Confirm Received Fund",
      locale === "vi"
        ? `Bạn có chắc chắn đã nhận đủ số tiền ${fmtVND(reg.price)} từ trường "${reg.schoolName}" cho đơn hàng ${reg.id}?`
        : `Are you sure you have received ${fmtVND(reg.price)} from school "${reg.schoolName}" for order ${reg.id}?`,
      () => {
        dispatch(
          confirmPaymentRequest({
            id: reg.id,
            onSuccess: () => {
              // FE notification → Contact
              const newNotif = {
                id: "NOTIF_" + Date.now(),
                role: "contact",
                title: locale === "vi"
                  ? `Thanh toán học đường thành công: ${reg.schoolName}`
                  : `School Payment Successful: ${reg.schoolName}`,
                message: locale === "vi"
                  ? `Trường ${reg.schoolName} đã được xác nhận thanh toán đơn ${reg.id}. Vui lòng nhập email học sinh để cấp key kích hoạt.`
                  : `School ${reg.schoolName} payment confirmed for order ${reg.id}. Please import student emails.`,
                createdAt: new Date().toLocaleString("sv-SE", { hour12: false }).substring(0, 16),
                isRead: false,
                type: "payment_confirmed",
              };
              const stored = localStorage.getItem("4s_notifications");
              const notifs = stored ? JSON.parse(stored) : [];
              notifs.push(newNotif);
              localStorage.setItem("4s_notifications", JSON.stringify(notifs));
              window.dispatchEvent(new Event("4s_notifications_updated"));
              window.dispatchEvent(new Event("4s_registrations_updated"));
            },
          })
        );
      },
      "warning"
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn text-slate-850">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">
            {activeTab === "students" ? text.title : (locale === "vi" ? "PhÃª duyá»‡t Thanh toÃ¡n Há»c Ä‘Æ°á»ng" : "School Payment Confirmations")}
          </h2>
          <p className="text-sm text-slate-500">
            {activeTab === "students" ? text.subtitle : (locale === "vi" ? "XÃ¡c nháº­n tiá»n chuyá»ƒn khoáº£n tá»« cÃ¡c trÆ°á»ng há»c Ä‘Äƒng kÃ½ mua gÃ³i dá»‹ch vá»¥." : "Verify bank transfer from schools registering for career guidance subscriptions.")}
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "students"
              ? "border-teal-500 text-teal-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("students")}
          type="button"
        >
          {locale === "vi" ? "Giao dá»‹ch cÃ¡ nhÃ¢n (Há»c sinh)" : "Student Transactions"}
        </button>
        <button
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "schools"
              ? "border-teal-500 text-teal-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("schools")}
          type="button"
        >
          {locale === "vi" ? "XÃ¡c nháº­n há»c Ä‘Æ°á»ng (TrÆ°á»ng há»c)" : "School Confirmations"}
        </button>
      </div>

      {/* RENDER TAB 1: STUDENT TRANSACTIONS */}
      {activeTab === "students" && (
        <>
          {/* Filters */}
          <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-2xl">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
                onChange={(e) => setIncSearchText(e.target.value)}
                placeholder={text.searchPlaceholder}
                type="text"
                value={incSearchText}
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
                onChange={(e) => setIncStatusFilter(e.target.value)}
                value={incStatusFilter}
              >
                <option value="all">{text.statusAll}</option>
                <option value="Success">{text.statusSuccess}</option>
                <option value="Pending">{text.statusPending}</option>
                <option value="Refunded">{text.statusRefunded}</option>
                <option value="Expired">{text.statusExpired}</option>
              </select>
            </div>
          </article>

          {/* Desktop Table View */}
          <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
                  <tr>
                    <th className="px-4 py-3">{text.colTxId}</th>
                    <th className="px-4 py-3">{text.colStudent}</th>
                    <th className="px-4 py-3">{text.colPlan}</th>
                    <th className="px-4 py-3 text-right">{text.colAmount}</th>
                    <th className="px-4 py-3">{text.colDate}</th>
                    <th className="px-4 py-3">{text.colStatus}</th>
                    <th className="px-4 py-3 text-right">{text.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncomes.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={7}>
                        {text.noTransactions}
                      </td>
                    </tr>
                  ) : (
                    filteredIncomes.map((item) => (
                      <tr className="hover:bg-slate-50/50 transition-colors" key={item.id}>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-900">{item.studentName}</p>
                          <p className="text-xs text-slate-500">{item.email}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700 font-medium whitespace-nowrap">
                          {item.plan}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-teal-600 text-right whitespace-nowrap">
                          {fmtVND(item.amount)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                              item.status === "Success"
                                ? "bg-teal-50 text-teal-700 border border-teal-200"
                                : item.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : item.status === "Refunded"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            {item.status === "Pending" && (
                              <button
                                className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 border border-teal-200 transition hover:bg-teal-100 cursor-pointer"
                                onClick={() => handleManualApprove(item.id)}
                                type="button"
                              >
                                {text.actionApprove}
                              </button>
                            )}
                            {/* Refund action removed */}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          {/* Mobile Card List View */}
          <section className="space-y-3 md:hidden">
            {filteredIncomes.length === 0 ? (
              <p className="text-center py-6 text-sm text-slate-400">{text.noTransactions}</p>
            ) : (
              filteredIncomes.map((item) => (
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5" key={item.id}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">{item.id}</span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                        item.status === "Success"
                          ? "bg-teal-50 text-teal-700 border border-teal-200"
                          : item.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : item.status === "Refunded"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{item.studentName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{text.labelPlan}{item.plan}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{item.date}</span>
                    <span className="font-bold text-teal-600 text-sm">{fmtVND(item.amount)}</span>
                  </div>

                  {/* Actions for Mobile */}
                  <div className="flex justify-end gap-1.5 pt-1">
                    {item.status === "Pending" && (
                      <button
                        className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 border border-teal-200 hover:bg-teal-100 cursor-pointer"
                        onClick={() => handleManualApprove(item.id)}
                        type="button"
                      >
                        {text.actionApprove}
                      </button>
                    )}
                    {/* Refund action removed */}
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}

      {/* RENDER TAB 2: SCHOOL PAYMENT CONFIRMATIONS */}
      {activeTab === "schools" && (
        <>
          {/* Filters */}
          <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-2xl">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
                onChange={(e) => setSchoolSearchText(e.target.value)}
                placeholder={locale === "vi" ? "TÃ¬m mÃ£ Ä‘Æ¡n, tÃªn trÆ°á»ng, email..." : "Search Order ID, school name..."}
                type="text"
                value={schoolSearchText}
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
                onChange={(e) => setSchoolStatusFilter(e.target.value)}
                value={schoolStatusFilter}
              >
                <option value="all">{locale === "vi" ? "Tráº¡ng thÃ¡i (Táº¥t cáº£)" : "Status (All)"}</option>
                <option value="Pending">{locale === "vi" ? "Chá» tiáº¿p nháº­n" : "Pending Inquiry"}</option>
                <option value="Quoted">{locale === "vi" ? "Chá» chuyá»ƒn khoáº£n" : "Awaiting Transfer"}</option>
                <option value="Paid">{locale === "vi" ? "ÄÃ£ nháº­n tiá»n (Chá» sinh Key)" : "Paid (Awaiting Key)"}</option>
                <option value="Completed">{locale === "vi" ? "ÄÃ£ hoÃ n thÃ nh cáº¥p Key" : "Completed / Key Created"}</option>
              </select>
            </div>
          </article>

          {/* Desktop Table View */}
          <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-slate-800">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
                  <tr>
                    <th className="px-4 py-3.5">{locale === "vi" ? "MÃ£ ÄÆ¡n" : "REG ID"}</th>
                    <th className="px-4 py-3.5">{locale === "vi" ? "TrÆ°á»ng há»c / NgÆ°á»i liÃªn há»‡" : "School / Rep"}</th>
                    <th className="px-4 py-3.5">{locale === "vi" ? "GÃ³i Ä‘Äƒng kÃ½" : "Plan"}</th>
                    <th className="px-4 py-3.5 text-right">{locale === "vi" ? "Sá»‘ tiá»n chuyá»ƒn" : "Price"}</th>
                    <th className="px-4 py-3.5">{locale === "vi" ? "NgÃ y yÃªu cáº§u" : "Date"}</th>
                    <th className="px-4 py-3.5">{locale === "vi" ? "Tráº¡ng thÃ¡i" : "Status"}</th>
                    <th className="px-4 py-3.5 text-right">{locale === "vi" ? "HÃ nh Ä‘á»™ng" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchoolRegistrations.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={7}>
                        {locale === "vi" ? "KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n Ä‘Äƒng kÃ½ nÃ o." : "No school registrations found."}
                      </td>
                    </tr>
                  ) : (
                    filteredSchoolRegistrations.map((item) => (
                      <tr className="hover:bg-slate-50/50 transition-colors" key={item.id}>
                        <td className="px-4 py-4 text-sm font-bold text-slate-700 whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-900 leading-tight">{item.schoolName}</p>
                          <p className="text-xs text-slate-550 mt-1 font-semibold">
                            {item.representative} â€¢ {item.phoneNumber}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.email}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-750">{item.planName}</p>
                          <p className="text-xs text-slate-500 font-medium">{item.studentCount} HS</p>
                        </td>
                        <td className="px-4 py-4 text-sm font-extrabold text-teal-600 text-right whitespace-nowrap">
                          {fmtVND(item.price)}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap font-medium">
                          {item.createdAt}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wide border shadow-2xs ${
                              item.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : item.status === "Quoted"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : item.status === "Paid"
                                ? "bg-teal-50 text-teal-700 border-teal-200"
                                : item.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {item.status === "Pending" && (locale === "vi" ? "Chá» tiáº¿p nháº­n" : "Pending")}
                            {item.status === "Quoted" && (locale === "vi" ? "Chá» chuyá»ƒn khoáº£n" : "Awaiting payment")}
                            {item.status === "Paid" && (locale === "vi" ? "ÄÃ£ nháº­n tiá»n" : "Paid")}
                            {item.status === "Completed" && (locale === "vi" ? "ÄÃ£ cáº¥p key" : "Completed")}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            {item.status === "Quoted" ? (
                              <button
                                className="rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                                onClick={() => handleConfirmSchoolPayment(item)}
                                type="button"
                              >
                                {locale === "vi" ? "XÃ¡c nháº­n Ä‘Ã£ nháº­n tiá»n" : "Confirm Received"}
                              </button>
                            ) : item.status === "Pending" ? (
                              <span className="text-xs text-slate-400 font-semibold italic">
                                {locale === "vi" ? "Chá» Contact bÃ¡o giÃ¡..." : "Awaiting quote..."}
                              </span>
                            ) : (
                              <span className="text-xs text-teal-600 font-bold border border-teal-150 bg-teal-50/50 rounded-lg px-2.5 py-1">
                                {locale === "vi" ? "Thanh toÃ¡n há»£p lá»‡" : "Payment Verified"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          {/* Mobile Card List View */}
          <section className="space-y-3.5 md:hidden">
            {filteredSchoolRegistrations.length === 0 ? (
              <p className="text-center py-6 text-sm text-slate-400">
                {locale === "vi" ? "KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n Ä‘Äƒng kÃ½ nÃ o." : "No school registrations found."}
              </p>
            ) : (
              filteredSchoolRegistrations.map((item) => (
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3" key={item.id}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700">{item.id}</span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wide border shadow-2xs ${
                        item.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : item.status === "Quoted"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.status === "Paid"
                          ? "bg-teal-50 text-teal-700 border-teal-200"
                          : item.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {item.status === "Pending" && (locale === "vi" ? "Chá» tiáº¿p nháº­n" : "Pending")}
                      {item.status === "Quoted" && (locale === "vi" ? "Chá» chuyá»ƒn khoáº£n" : "Awaiting payment")}
                      {item.status === "Paid" && (locale === "vi" ? "ÄÃ£ nháº­n tiá»n" : "Paid")}
                      {item.status === "Completed" && (locale === "vi" ? "ÄÃ£ cáº¥p key" : "Completed")}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.schoolName}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Rep: {item.representative} â€¢ {item.phoneNumber}</p>
                    <p className="text-xs text-slate-400">{item.email}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-bold">{item.planName} ({item.studentCount} HS)</span>
                      <span className="font-extrabold text-teal-600 text-sm">{fmtVND(item.price)}</span>
                    </div>
                  </div>

                  {/* Actions for Mobile */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                    <span className="text-2xs text-slate-400 font-semibold">{item.createdAt}</span>
                    <div>
                      {item.status === "Quoted" ? (
                        <button
                          className="rounded-xl bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                          onClick={() => handleConfirmSchoolPayment(item)}
                          type="button"
                        >
                          {locale === "vi" ? "XÃ¡c nháº­n nháº­n tiá»n" : "Confirm Received"}
                        </button>
                      ) : item.status === "Pending" ? (
                        <span className="text-xs text-slate-400 italic">
                          {locale === "vi" ? "Chá» bÃ¡o giÃ¡..." : "Awaiting quote..."}
                        </span>
                      ) : (
                        <span className="text-xs text-teal-600 font-bold">
                          {locale === "vi" ? "ÄÃ£ nháº­n tiá»n" : "Paid Verified"}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}

      {/* Confirm Modal (Light Theme for Accountant via isAdmin=true) */}
      <ConfirmModal
        isAdmin={true}
        isOpen={confirmConfig.isOpen}
        message={confirmConfig.message}
        onCancel={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        type={confirmConfig.type}
      />
    </div>
  );
}

export default AccountantTransactionsPage;

