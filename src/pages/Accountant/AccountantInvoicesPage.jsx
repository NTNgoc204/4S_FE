import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

function fmtVND(n) {
  return `${Number(n).toLocaleString("vi-VN")} VND`;
}

function AccountantInvoicesPage() {
  const { invoices, setInvoices, incomes } = useOutletContext();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form State for creating new manual invoice
  const [form, setForm] = useState({
    txId: "",
    customerName: "",
    companyName: "",
    taxCode: "",
    email: "",
    address: "",
    amount: "",
    date: "",
  });

  // Calculate totals
  const totals = useMemo(() => {
    let issuedVat = 0;
    let pendingVat = 0;
    let issuedCount = 0;
    let pendingCount = 0;

    invoices.forEach((inv) => {
      const vatAmount = Math.round(inv.amount * 0.1);
      if (inv.status === "Issued") {
        issuedVat += vatAmount;
        issuedCount++;
      } else if (inv.status === "Pending") {
        pendingVat += vatAmount;
        pendingCount++;
      }
    });

    return { issuedVat, pendingVat, issuedCount, pendingCount };
  }, [invoices]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        inv.id.toLowerCase().includes(query) ||
        inv.txId.toLowerCase().includes(query) ||
        inv.customerName.toLowerCase().includes(query) ||
        inv.companyName.toLowerCase().includes(query) ||
        inv.taxCode.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  function handleIssueInvoice(id) {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Issued" } : inv))
    );
    toast.success(
      isVi
        ? `Đã phát hành hóa đơn ${id} thành công!`
        : `Invoice ${id} has been issued successfully!`
    );
  }

  function handleCancelInvoice(id) {
    if (
      window.confirm(
        isVi
          ? `Bạn có chắc chắn muốn hủy hóa đơn ${id}?`
          : `Are you sure you want to cancel invoice ${id}?`
      )
    ) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: "Cancelled" } : inv))
      );
      toast.warn(
        isVi
          ? `Đã hủy hóa đơn ${id}.`
          : `Invoice ${id} has been cancelled.`
      );
    }
  }

  function handleCreateInvoice(e) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error(isVi ? "Vui lòng nhập số tiền hợp lệ!" : "Please enter a valid amount!");
      return;
    }

    const newInv = {
      id: `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`,
      txId: form.txId.trim() || `TX-MANUAL-${Date.now().toString().slice(-4)}`,
      customerName: form.customerName.trim(),
      companyName: form.companyName.trim(),
      taxCode: form.taxCode.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      amount: amt,
      date: form.date || new Date().toISOString().split("T")[0],
      status: "Pending",
    };

    setInvoices((prev) => [newInv, ...prev]);
    toast.success(
      isVi
        ? `Đã tạo yêu cầu xuất hóa đơn ${newInv.id} thành công!`
        : `Invoice request ${newInv.id} created successfully!`
    );
    setIsCreateModalOpen(false);
  }

  function openCreateModal() {
    setForm({
      txId: "",
      customerName: "",
      companyName: "",
      taxCode: "",
      email: "",
      address: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsCreateModalOpen(true);
  }

  function handleDownloadPDF(inv) {
    toast.info(isVi ? "Đang tạo bản in hóa đơn PDF..." : "Generating invoice PDF printout...");
    setTimeout(() => {
      toast.success(
        isVi
          ? `Đã tải xuống hóa đơn ${inv.id} thành công!`
          : `Downloaded invoice ${inv.id} successfully!`
      );
    }, 1000);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">
            {isVi ? "Quản lý Hóa đơn & Thuế VAT" : "Invoice & VAT Management"}
          </h2>
          <p className="text-sm text-slate-500">
            {isVi
              ? "Theo dõi hóa đơn đỏ điện tử, thông tin thuế doanh nghiệp và tình trạng xuất hóa đơn VAT."
              : "Track electronic red invoices, corporate tax info, and VAT issuance status."}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            {isVi ? "Tổng VAT Đã Phát Hành" : "Total VAT Issued"}
          </p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-teal-600">
            {fmtVND(totals.issuedVat)}
          </p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {isVi ? `Từ ${totals.issuedCount} hóa đơn` : `From ${totals.issuedCount} invoices`}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            {isVi ? "Thuế VAT Chờ Xử Lý" : "Total VAT Pending"}
          </p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-amber-600">
            {fmtVND(totals.pendingVat)}
          </p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {isVi ? `Có ${totals.pendingCount} yêu cầu` : `Have ${totals.pendingCount} requests`}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            {isVi ? "Tỷ Lệ Thuế GTGT thu hộ" : "VAT Collection Rate"}
          </p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-slate-900">10%</p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {isVi ? "Áp dụng toàn hệ thống" : "Applied system-wide"}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            {isVi ? "Tổng số Hóa đơn" : "Total Invoice Records"}
          </p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-indigo-600">
            {invoices.length}
          </p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {isVi ? "Ghi nhận trong bộ nhớ" : "Recorded in memory"}
          </span>
        </div>
      </section>

      {/* Filters & Add Button */}
      <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 flex-1 max-w-2xl">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isVi
                  ? "Tìm kiếm hóa đơn, MST, khách hàng, mã giao dịch..."
                  : "Search invoices, tax code, customer, TXID..."
              }
              type="text"
              value={searchQuery}
            />
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="all">{isVi ? "Trạng thái (Tất cả)" : "Status (All)"}</option>
              <option value="Issued">{isVi ? "Issued (Đã phát hành)" : "Issued"}</option>
              <option value="Pending">{isVi ? "Pending (Chờ xử lý)" : "Pending"}</option>
              <option value="Cancelled">{isVi ? "Cancelled (Đã hủy)" : "Cancelled"}</option>
            </select>
          </div>

          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 shadow-sm"
            onClick={openCreateModal}
            type="button"
          >
            {isVi ? "+ Tạo Hóa đơn Thủ công" : "+ Create Manual Invoice"}
          </button>
        </div>
      </article>

      {/* Invoices Table (Desktop) */}
      <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
              <tr>
                <th className="px-4 py-3">{isVi ? "Mã Hóa đơn" : "Invoice ID"}</th>
                <th className="px-4 py-3">{isVi ? "Mã giao dịch" : "TXID"}</th>
                <th className="px-4 py-3">{isVi ? "Khách hàng / Doanh nghiệp" : "Customer / Company"}</th>
                <th className="px-4 py-3">{isVi ? "Mã số thuế" : "Tax Code"}</th>
                <th className="px-4 py-3 text-right">{isVi ? "Số tiền trước VAT" : "Amount (Excl. VAT)"}</th>
                <th className="px-4 py-3 text-right">{isVi ? "Thuế VAT (10%)" : "VAT (10%)"}</th>
                <th className="px-4 py-3">{isVi ? "Trạng thái" : "Status"}</th>
                <th className="px-4 py-3 text-right">{isVi ? "Thao tác" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={8}>
                    {isVi ? "Không tìm thấy hóa đơn nào." : "No invoices found."}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((item) => {
                  const vat = Math.round(item.amount * 0.1);
                  return (
                    <tr className="hover:bg-slate-50/50 transition-colors" key={item.id}>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                        {item.id}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap font-mono">
                        {item.txId}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900">{item.companyName}</p>
                        <p className="text-xs text-slate-500">
                          {isVi ? "Đại diện: " : "Rep: "} {item.customerName}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 font-mono whitespace-nowrap">
                        {item.taxCode || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700 text-right whitespace-nowrap">
                        {fmtVND(item.amount)}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-amber-600 text-right whitespace-nowrap">
                        {fmtVND(vat)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                            item.status === "Issued"
                              ? "bg-teal-50 text-teal-700 border border-teal-200"
                              : item.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 shadow-sm"
                            onClick={() => setSelectedInvoice(item)}
                            type="button"
                          >
                            {isVi ? "Xem chi tiết" : "Details"}
                          </button>
                          {item.status === "Pending" && (
                            <button
                              className="inline-flex h-9 items-center justify-center rounded-lg bg-teal-50 px-2.5 text-sm font-semibold text-teal-700 border border-teal-200 transition hover:bg-teal-100"
                              onClick={() => handleIssueInvoice(item.id)}
                              type="button"
                            >
                              {isVi ? "Phát hành" : "Issue"}
                            </button>
                          )}
                          {item.status !== "Cancelled" && (
                            <button
                              className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-50 px-2.5 text-sm font-semibold text-rose-700 border border-rose-200 transition hover:bg-rose-100"
                              onClick={() => handleCancelInvoice(item.id)}
                              type="button"
                            >
                              {isVi ? "Hủy" : "Cancel"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* Invoices List (Mobile) */}
      <section className="space-y-3 md:hidden">
        {filteredInvoices.length === 0 ? (
          <p className="text-center py-6 text-sm text-slate-400">
            {isVi ? "Không tìm thấy hóa đơn nào." : "No invoices found."}
          </p>
        ) : (
          filteredInvoices.map((item) => {
            const vat = Math.round(item.amount * 0.1);
            return (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5"
                key={item.id}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">{item.id}</span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                      item.status === "Issued"
                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                        : item.status === "Pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{item.companyName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">MST: {item.taxCode}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">TXID: {item.txId}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">{isVi ? "Tổng cộng" : "Grand Total"}</p>
                    <p className="font-bold text-slate-900 text-sm">{fmtVND(item.amount + vat)}</p>
                  </div>
                  <span className="text-xs text-slate-500">{item.date}</span>
                </div>

                {/* Mobile Actions */}
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => setSelectedInvoice(item)}
                    type="button"
                  >
                    {isVi ? "Chi tiết" : "Details"}
                  </button>
                  {item.status === "Pending" && (
                    <button
                      className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 border border-teal-200 hover:bg-teal-100"
                      onClick={() => handleIssueInvoice(item.id)}
                      type="button"
                    >
                      {isVi ? "Phát hành" : "Issue"}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* CREATE MANUAL INVOICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <article className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <header className="flex items-center justify-between">
              <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">
                {isVi ? "Tạo Yêu cầu Hóa đơn Mới" : "Create New Invoice Request"}
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold focus:outline-none"
                onClick={() => setIsCreateModalOpen(false)}
                type="button"
              >
                &times;
              </button>
            </header>

            <form className="space-y-3" onSubmit={handleCreateInvoice}>
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">
                  {isVi ? "Mã Giao dịch liên kết (Tùy chọn)" : "Linked Transaction ID (Optional)"}
                </p>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm font-mono"
                  onChange={(e) => setForm((prev) => ({ ...prev, txId: e.target.value }))}
                  placeholder="Ví dụ: TX1001"
                  type="text"
                  value={form.txId}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-600">
                    {isVi ? "Số tiền (VND)" : "Amount (VND)"}
                  </p>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm font-semibold"
                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="Ví dụ: 150000"
                    required
                    type="number"
                    value={form.amount}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-600">
                    {isVi ? "Ngày giao dịch" : "Transaction Date"}
                  </p>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    required
                    type="date"
                    value={form.date}
                  />
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">
                  {isVi ? "Tên người đại diện mua hàng" : "Customer / Representative Name"}
                </p>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                  onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                  type="text"
                  value={form.customerName}
                />
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">
                  {isVi ? "Tên công ty xuất hóa đơn" : "Company / Corporate Name"}
                </p>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                  onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Ví dụ: Công ty TNHH Giáo dục & Đào tạo A-Z"
                  required
                  type="text"
                  value={form.companyName}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-600">
                    {isVi ? "Mã số thuế" : "Tax Code (MST)"}
                  </p>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm font-mono"
                    onChange={(e) => setForm((prev) => ({ ...prev, taxCode: e.target.value }))}
                    placeholder="MST doanh nghiệp"
                    required
                    type="text"
                    value={form.taxCode}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-600">
                    {isVi ? "Email nhận hóa đơn" : "Invoice Receiver Email"}
                  </p>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="billing@company.com"
                    type="email"
                    value={form.email}
                  />
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">
                  {isVi ? "Địa chỉ trụ sở chính" : "Billing Registered Address"}
                </p>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/TP..."
                  type="text"
                  value={form.address}
                />
              </div>

              <footer className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  onClick={() => setIsCreateModalOpen(false)}
                  type="button"
                >
                  {isVi ? "Hủy bỏ" : "Cancel"}
                </button>
                <button
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 shadow-sm"
                  type="submit"
                >
                  {isVi ? "Tạo Yêu cầu" : "Create Request"}
                </button>
              </footer>
            </form>
          </article>
        </div>
      )}

      {/* DETAILED INVOICE MODAL (BILLING INFORMATION SHEET) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <article className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <header className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-['Sora'] text-lg font-bold text-slate-900">
                {isVi ? "Chi tiết Hóa đơn đỏ điện tử" : "Electronic E-Invoice Details"}
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold focus:outline-none"
                onClick={() => setSelectedInvoice(null)}
                type="button"
              >
                &times;
              </button>
            </header>

            {/* E-Invoice Bill Content */}
            <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-6 space-y-6 text-sm text-slate-800 shadow-inner">
              {/* Bill Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-['Sora'] text-base font-bold text-teal-700">4S EDUCATION GROUP</h4>
                  <p className="text-xs text-slate-500">Lầu 8, Tòa nhà FPT, Quận 9, TP. Hồ Chí Minh</p>
                  <p className="text-xs text-slate-500">MST: 0101998877</p>
                </div>
                <div className="text-right">
                  <h4 className="font-['Sora'] text-lg font-bold text-slate-900">
                    {isVi ? "HÓA ĐƠN GTGT" : "VAT INVOICE"}
                  </h4>
                  <p className="text-xs text-slate-600 font-mono">No: {selectedInvoice.id}</p>
                  <p className="text-xs text-slate-500">
                    {isVi ? "Ngày xuất: " : "Date: "} {selectedInvoice.date}
                  </p>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Billing Party Details */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <h5 className="font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                    {isVi ? "Đơn vị bán hàng" : "Seller"}
                  </h5>
                  <p className="font-bold text-slate-800">Công ty Cổ phần Công nghệ Giáo dục 4S</p>
                  <p className="text-slate-600">Tài khoản ngân hàng: 190288889999 Techcombank</p>
                  <p className="text-slate-600">Email liên hệ: finance@4s.edu.vn</p>
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                    {isVi ? "Đơn vị mua hàng" : "Buyer"}
                  </h5>
                  <p className="font-bold text-slate-800">{selectedInvoice.companyName || "N/A"}</p>
                  <p className="text-slate-600">
                    {isVi ? "Người mua: " : "Attn: "} {selectedInvoice.customerName}
                  </p>
                  <p className="text-slate-600 font-mono">
                    {isVi ? "Mã số thuế: " : "Tax ID: "} {selectedInvoice.taxCode || "N/A"}
                  </p>
                  {selectedInvoice.address && (
                    <p className="text-slate-600">
                      {isVi ? "Địa chỉ: " : "Address: "} {selectedInvoice.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">{isVi ? "Tên dịch vụ nâng cấp" : "Service Description"}</th>
                      <th className="px-3 py-2 text-right">{isVi ? "Đơn giá" : "Unit Price"}</th>
                      <th className="px-3 py-2 text-center">{isVi ? "Số lượng" : "Qty"}</th>
                      <th className="px-3 py-2 text-right">{isVi ? "Thành tiền (VND)" : "Subtotal"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="px-3 py-2.5">1</td>
                      <td className="px-3 py-2.5 font-medium">
                        {isVi ? `Gói nâng cấp tài khoản học sinh (Liên kết GD ${selectedInvoice.txId})` : `Premium Student Plan Upgrade (Linked to TX ${selectedInvoice.txId})`}
                      </td>
                      <td className="px-3 py-2.5 text-right">{fmtVND(selectedInvoice.amount)}</td>
                      <td className="px-3 py-2.5 text-center">1</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{fmtVND(selectedInvoice.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>{isVi ? "Cộng tiền hàng:" : "Subtotal (Excl. VAT):"}</span>
                    <span>{fmtVND(selectedInvoice.amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{isVi ? "Thuế suất GTGT (10%):" : "VAT Rate (10%):"}</span>
                    <span>{fmtVND(Math.round(selectedInvoice.amount * 0.1))}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                    <span>{isVi ? "Tổng cộng tiền thanh toán:" : "Total Amount Due:"}</span>
                    <span className="text-teal-600">{fmtVND(Math.round(selectedInvoice.amount * 1.1))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <footer className="flex justify-between items-center gap-2 pt-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold border ${
                  selectedInvoice.status === "Issued"
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : selectedInvoice.status === "Pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {isVi ? `Trạng thái: ${selectedInvoice.status}` : `Status: ${selectedInvoice.status}`}
              </span>

              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  onClick={() => setSelectedInvoice(null)}
                  type="button"
                >
                  {isVi ? "Đóng" : "Close"}
                </button>
                <button
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 shadow-sm"
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  type="button"
                >
                  {isVi ? "Tải xuống PDF / In" : "Download PDF / Print"}
                </button>
              </div>
            </footer>
          </article>
        </div>
      )}
    </div>
  );
}

export default AccountantInvoicesPage;
