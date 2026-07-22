import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRegistrationsRequest,
  confirmPaymentRequest,
} from "../../feature/edu/eduSlice";

function fmtVND(n) {
  return `${Math.round(Number(n)).toLocaleString("vi-VN")} VND`;
}

function AccountantTransactionsPage() {
  const { incomes, setIncomes } = useOutletContext();
  const { t, i18n } = useTranslation(["accountant", "common"]);
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const dispatch = useDispatch();

  const { registrations: schoolRegistrations } = useSelector((s) => s.edu);

  const [activeTab, setActiveTab] = useState("students");

  // Student transactions state
  const [incSearchText, setIncSearchText] = useState("");
  const [incStatusFilter, setIncStatusFilter] = useState("all");

  // School registrations state
  const [schoolSearchText, setSchoolSearchText] = useState("");
  const [schoolStatusFilter, setSchoolStatusFilter] = useState("all");

  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  // Handle highlight parameter from notifications click
  useEffect(() => {
    if (highlightId && incomes.length > 0) {
      const isStudentTx = incomes.some((i) => String(i.id) === String(highlightId));
      if (isStudentTx) {
        setActiveTab("students");
        setIncSearchText(highlightId);
        setIncStatusFilter("all");
      } else {
        const isSchoolTx = schoolRegistrations.some((r) => String(r.transactionCode) === String(highlightId) || String(r.id) === String(highlightId));
        if (isSchoolTx) {
          setActiveTab("schools");
          setSchoolSearchText(highlightId);
          setSchoolStatusFilter("all");
        }
      }
    }
  }, [highlightId, incomes, schoolRegistrations]);

  const handleClearHighlight = () => {
    setSearchParams({});
    setIncSearchText("");
    setSchoolSearchText("");
  };

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
      // Loại bỏ giao dịch gói EDU của học sinh (gói kích hoạt miễn phí bằng key của trường, không có tiền mặt thực tế)
      if (i.plan && i.plan.toUpperCase() === "EDU") return false;

      // Loại bỏ các giao dịch đã hết hạn (Expired) - Kế toán chỉ quan tâm giao dịch đã thanh toán hoặc đang chờ thanh toán
      if (i.status === "Expired") return false;

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
      // Bỏ qua trạng thái Pending (Chờ tiếp nhận) - Kế toán chỉ hiển thị từ lúc chờ chuyển khoản (Quoted) trở đi
      if (r.status === "Pending") return false;

      const keyword = schoolSearchText.trim().toLowerCase();
      const matchSearch =
        keyword === "" ||
        (r.schoolName || "").toLowerCase().includes(keyword) ||
        (r.representative || "").toLowerCase().includes(keyword) ||
        (r.transactionCode || "").toLowerCase().includes(keyword);

      let matchStatus = true;
      if (schoolStatusFilter === "unpaid") {
        matchStatus = r.status === "Quoted";
      } else if (schoolStatusFilter === "paid") {
        matchStatus = r.status === "Paid" || r.status === "Completed";
      }
      return matchSearch && matchStatus;
    });
  }, [schoolRegistrations, schoolSearchText, schoolStatusFilter]);

  function handleManualApprove(id) {
    showConfirm(
      t("actionApprove"),
      `${t("confirmApprove")} ${id}?`,
      () => {
        setIncomes((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "Success" } : item))
        );
        toast.success(t("toastApproved"));

        // Add a notification item so they can test the notification row highlighting feature!
        const newNotif = {
          id: "NOTIF_" + Date.now(),
          role: "accountant",
          title: t("notifications.manualApproveTitle"),
          message: t("notifications.manualApproveMessage", { id }),
          createdAt: new Date().toLocaleString("sv-SE", { hour12: false }).substring(0, 16),
          isRead: false,
          type: "payment_confirmed",
          txId: id,
        };
        try {
          const stored = localStorage.getItem("4s_notifications");
          const notifs = stored ? JSON.parse(stored) : [];
          notifs.push(newNotif);
          localStorage.setItem("4s_notifications", JSON.stringify(notifs));
          window.dispatchEvent(new Event("4s_notifications_updated"));
        } catch (err) {
          console.error(err);
        }
      },
      "warning"
    );
  }


  return (
    <div className="space-y-4 animate-fadeIn text-slate-800">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">
            {t("title")}
          </h2>
          <p className="text-sm text-slate-500">
            {t("subtitle")}
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
          {t("tabIndividual")}
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
          {t("tabSchool")}
        </button>
      </div>

      {highlightId && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800 shadow-sm animate-fadeIn">
          <span className="font-semibold flex items-center gap-1.5">
            ✨ {t("highlighting.banner", { id: highlightId })}
          </span>
          <button
            onClick={handleClearHighlight}
            className="font-bold text-amber-700 hover:text-amber-900 underline hover:no-underline transition cursor-pointer"
            type="button"
          >
            {t("highlighting.clearBtn")}
          </button>
        </div>
      )}

      {/* RENDER TAB 1: STUDENT TRANSACTIONS */}
      {activeTab === "students" && (
        <>
          {/* Filters */}
          <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-2xl">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
                onChange={(e) => setIncSearchText(e.target.value)}
                placeholder={t("searchPlaceholder")}
                type="text"
                value={incSearchText}
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
                onChange={(e) => setIncStatusFilter(e.target.value)}
                value={incStatusFilter}
              >
                <option value="all">{t("statusAll")}</option>
                <option value="Success">{t("statusSuccess")}</option>
                <option value="Pending">{t("statusPending")}</option>
              </select>
            </div>
          </article>

          {/* Desktop Table View */}
          <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
                  <tr>
                    <th className="px-4 py-3">{t("colTxId")}</th>
                    <th className="px-4 py-3">{t("colStudent")}</th>
                    <th className="px-4 py-3">{t("colPlan")}</th>
                    <th className="px-4 py-3 text-right">{t("colAmount")}</th>
                    <th className="px-4 py-3">{t("colDate")}</th>
                    <th className="px-4 py-3">{t("colStatus")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncomes.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>
                        {t("noTransactions")}
                      </td>
                    </tr>
                  ) : (
                    filteredIncomes.map((item) => (
                      <tr
                        className={`transition-all ${
                          String(item.id) === String(highlightId)
                            ? "bg-amber-50 hover:bg-amber-100/80 ring-2 ring-amber-300 ring-offset-1 font-semibold animate-pulse"
                            : "hover:bg-slate-50/50"
                        }`}
                        key={item.id}
                      >
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-900">{item.studentName}</p>
                          <p className="text-xs text-slate-500 font-normal">{item.email}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700 font-semibold whitespace-nowrap">
                          {item.plan}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-teal-600 text-right whitespace-nowrap">
                          {fmtVND(item.amount)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-550 whitespace-nowrap font-medium">
                          {item.date}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {item.status === "Success" ? (
                            <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {t("statusSuccess")}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm bg-amber-50 text-amber-700 border border-amber-200">
                              {t("statusPending")}
                            </span>
                          )}
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
              <p className="text-center py-6 text-sm text-slate-400">{t("noTransactions")}</p>
            ) : (
              filteredIncomes.map((item) => (
                <article
                  className={`rounded-2xl border p-4 shadow-sm space-y-2.5 transition-all ${
                    String(item.id) === String(highlightId)
                      ? "border-amber-300 bg-amber-50/60 ring-2 ring-amber-200 animate-pulse"
                      : "border-slate-200 bg-white"
                  }`}
                  key={item.id}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">{item.id}</span>
                    {item.status === "Success" ? (
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm bg-teal-50 text-teal-700 border border-teal-200">
                        {t("statusSuccess")}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm bg-amber-50 text-amber-700 border border-amber-200">
                        {t("statusPending")}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{item.studentName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{t("labelPlan")}{item.plan}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{item.date}</span>
                    <span className="font-bold text-teal-600 text-sm">{fmtVND(item.amount)}</span>
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
                placeholder={t("schoolTable.searchPlaceholder")}
                type="text"
                value={schoolSearchText}
              />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
                onChange={(e) => setSchoolStatusFilter(e.target.value)}
                value={schoolStatusFilter}
              >
                <option value="all">{t("statusAll")}</option>
                <option value="unpaid">{t("schoolTable.unpaid")}</option>
                <option value="paid">{t("schoolTable.paid")}</option>
              </select>
            </div>
          </article>

          {/* Desktop Table View */}
          <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-slate-850">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-550 bg-slate-50 font-semibold">
                  <tr>
                    <th className="px-4 py-3.5">{t("schoolTable.paymentCode")}</th>
                    <th className="px-4 py-3.5">{t("schoolTable.schoolRep")}</th>
                    <th className="px-4 py-3.5">{t("schoolTable.plan")}</th>
                    <th className="px-4 py-3.5 text-right">{t("schoolTable.price")}</th>
                    <th className="px-4 py-3.5">{t("schoolTable.date")}</th>
                    <th className="px-4 py-3.5">{t("schoolTable.status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchoolRegistrations.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>
                        {t("schoolTable.noRegistrations")}
                      </td>
                    </tr>
                  ) : (
                    filteredSchoolRegistrations.map((item) => (
                      <tr
                        className={`transition-all ${
                          String(item.transactionCode) === String(highlightId) || String(item.id) === String(highlightId)
                            ? "bg-amber-50 hover:bg-amber-100/80 ring-2 ring-amber-300 ring-offset-1 font-semibold animate-pulse"
                            : "hover:bg-slate-50/50"
                        }`}
                        key={item.id}
                      >
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                          {item.transactionCode || "—"}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-900 leading-tight">{item.schoolName}</p>
                          <p className="text-xs text-slate-500 font-normal mt-1">
                            {item.representative} • {item.phoneNumber}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 font-normal">{item.email}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-700">{item.planName}</p>
                          <p className="text-xs text-slate-500 font-normal">{item.studentCount} HS</p>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-teal-600 text-right whitespace-nowrap">
                          {fmtVND(item.price)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-550 whitespace-nowrap font-medium">
                          {item.createdAt}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {item.status === "Quoted" ? (
                            <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm bg-amber-50 text-amber-700 border border-amber-200">
                              {t("schoolTable.unpaid")}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm bg-emerald-50 text-emerald-700 border-emerald-200">
                              {t("schoolTable.paid")}
                            </span>
                          )}
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
                {t("schoolTable.noRegistrations")}
              </p>
            ) : (
              filteredSchoolRegistrations.map((item) => (
                <article
                  className={`rounded-2xl border p-4 shadow-sm space-y-3 transition-all ${
                    String(item.transactionCode) === String(highlightId) || String(item.id) === String(highlightId)
                      ? "border-amber-300 bg-amber-50/60 ring-2 ring-amber-200 animate-pulse"
                      : "border-slate-200 bg-white"
                  }`}
                  key={item.id}
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700">Code: {item.transactionCode || "—"}</span>
                    {item.status === "Quoted" ? (
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm bg-amber-50 text-amber-700 border border-amber-200">
                        {t("schoolTable.unpaid")}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm bg-emerald-50 text-emerald-700 border-emerald-200">
                        {t("schoolTable.paid")}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.schoolName}</h4>
                    <p className="text-xs text-slate-500 font-normal mt-1">Rep: {item.representative} • {item.phoneNumber}</p>
                    <p className="text-xs text-slate-400 font-normal">{item.email}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-bold">{item.planName} ({item.studentCount} HS)</span>
                      <span className="font-bold text-teal-600 text-sm">{fmtVND(item.price)}</span>
                    </div>
                  </div>

                  {/* Footer for Mobile */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">{item.createdAt}</span>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}

      {/* Confirm Modal */}
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
