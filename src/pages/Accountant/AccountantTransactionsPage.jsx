import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

function fmtVND(n) {
  return `${Number(n).toLocaleString("vi-VN")} VND`;
}

import { useTranslation } from "react-i18next";

const UI_TEXT = {
  vi: {
    title: "Sổ Giao dịch Học sinh & Hoàn tiền",
    subtitle: "Tra cứu lịch sử thanh toán nâng cấp VIP, hoàn tiền và phê duyệt thủ công.",
    searchPlaceholder: "Tìm mã giao dịch, tên học sinh, email...",
    statusAll: "Trạng thái (Tất cả)",
    statusSuccess: "Success (Thành công)",
    statusPending: "Pending (Chờ duyệt)",
    statusRefunded: "Refunded (Đã hoàn tiền)",
    statusExpired: "Expired (Hết hạn)",
    colTxId: "Mã GD",
    colStudent: "Học sinh / Email",
    colPlan: "Gói cước",
    colAmount: "Số tiền",
    colDate: "Thời gian",
    colStatus: "Trạng thái",
    colActions: "Hành động",
    noTransactions: "Không tìm thấy giao dịch nào.",
    actionApprove: "Duyệt thủ công",
    actionInvoice: "Xuất Hóa đơn VAT",
    actionRefund: "Hoàn tiền (Refund)",
    actionRefundMobile: "Hoàn tiền",
    modalTitle: "Xuất Hóa đơn VAT (10% Thuế GTGT)",
    labelTxId: "Mã Giao dịch liên kết",
    labelCompany: "Tên đơn vị mua hàng (Công ty / Tổ chức)",
    companyPlaceholder: "Ví dụ: Công ty TNHH Giải pháp Công nghệ 4S",
    labelTaxCode: "Mã số thuế (GST/Tax Code)",
    taxCodePlaceholder: "Ví dụ: 0102030405",
    labelAddress: "Địa chỉ xuất hóa đơn",
    addressPlaceholder: "Địa chỉ trụ sở đăng ký kinh doanh...",
    btnCancel: "Hủy bỏ",
    btnSave: "Phát hành Hóa đơn",
    confirmApprove: "Xác nhận duyệt thủ công giao dịch",
    confirmRefund: "Bạn có chắc chắn muốn hoàn tiền cho giao dịch không? Quyền lợi gói cước của học sinh sẽ bị đảo ngược.",
    toastApproved: "Đã duyệt thủ công giao dịch. Doanh thu tổng đã được cập nhật.",
    toastRefunded: "Giao dịch đã được hoàn tiền. Chỉ số doanh thu tổng đã giảm tương ứng.",
    toastErrInvalidTx: "Không tìm thấy mã giao dịch liên kết hợp lệ.",
    toastInvoiceSuccess: "Hóa đơn VAT đã được phát hành thành công.",
    labelPlan: "Gói: ",
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
    modalTitle: "Issue VAT Invoice (10% Tax)",
    labelTxId: "Linked Transaction ID",
    labelCompany: "Billing Company / Corporate Name",
    companyPlaceholder: "e.g., 4S Technology Solutions LLC",
    labelTaxCode: "Tax Identification Code",
    taxCodePlaceholder: "e.g., 0102030405",
    labelAddress: "Registered Billing Address",
    addressPlaceholder: "Business headquarters registered address...",
    btnCancel: "Cancel",
    btnSave: "Issue Invoice",
    confirmApprove: "Confirm manual approval for transaction",
    confirmRefund: "Are you sure you want to refund transaction? The student's premium package benefits will be revoked.",
    toastApproved: "Transaction manually approved. Gross revenue updated.",
    toastRefunded: "Transaction refunded. Gross revenue adjusted downwards.",
    toastErrInvalidTx: "No valid matching transaction ID found.",
    toastInvoiceSuccess: "VAT Invoice has been successfully issued.",
    labelPlan: "Plan: ",
  }
};

function AccountantTransactionsPage() {
  const { incomes, setIncomes } = useOutletContext();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const text = UI_TEXT[locale];

  const [incSearchText, setIncSearchText] = useState("");
  const [incStatusFilter, setIncStatusFilter] = useState("all");

  // Filter incomes list
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

  function handleManualApprove(id) {
    if (window.confirm(`${text.confirmApprove} ${id}?`)) {
      setIncomes((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "Success" } : item))
      );
      toast.success(`${text.toastApproved.replace("giao dịch", id)}`);
    }
  }

  function handleRefund(id) {
    if (window.confirm(`${text.confirmRefund.replace("giao dịch", id)}`)) {
      setIncomes((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "Refunded" } : item))
      );
      toast.warn(`${text.toastRefunded.replace("Giao dịch", `Giao dịch ${id}`)}`);
    }
  }



  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">{text.title}</h2>
          <p className="text-sm text-slate-500">{text.subtitle}</p>
        </div>
      </div>

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
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
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
                            className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 border border-teal-200 transition hover:bg-teal-100"
                            onClick={() => handleManualApprove(item.id)}
                            type="button"
                          >
                            {text.actionApprove}
                          </button>
                        )}
                        {item.status === "Success" && (
                          <button
                            className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 transition hover:bg-rose-100"
                            onClick={() => handleRefund(item.id)}
                            type="button"
                          >
                            {text.actionRefund}
                          </button>
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
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : item.status === "Refunded"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
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
                    className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 border border-teal-200 hover:bg-teal-100"
                    onClick={() => handleManualApprove(item.id)}
                    type="button"
                  >
                    {text.actionApprove}
                  </button>
                )}
                {item.status === "Success" && (
                  <button
                    className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 hover:bg-rose-100"
                    onClick={() => handleRefund(item.id)}
                    type="button"
                  >
                    {text.actionRefundMobile}
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </section>

    </div>
  );
}

export default AccountantTransactionsPage;
