import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

const OPERATIONAL_CATEGORIES = [
  "Operational (Vận hành)",
  "Marketing (Quảng cáo & Ads)",
  "Personnel (Nhân sự & Lương)",
  "AI API & Infrastructure (AI & Máy chủ)",
  "Miscellaneous (Khác)",
];

function fmtVND(n) {
  return `${Number(n).toLocaleString("vi-VN")} VND`;
}

import { useTranslation } from "react-i18next";

const UI_TEXT = {
  vi: {
    title: "Quản lý Khoản chi Vận hành",
    subtitle: "Tạo, chỉnh sửa, phân loại và theo dõi các khoản chi phí phát sinh.",
    searchPlaceholder: "Tìm kiếm chi phí, từ khóa...",
    catAll: "Phân loại Chi phí (Tất cả)",
    statusAll: "Trạng thái (Tất cả)",
    statusPaid: "Paid (Đã thanh toán)",
    statusPending: "Pending (Chờ duyệt)",
    createBtn: "+ Tạo Khoản chi",
    colDate: "Ngày chi",
    colCategory: "Phân loại chi phí",
    colDescription: "Nội dung chi / Chi tiết",
    colAmount: "Số tiền (VND)",
    colStatus: "Trạng thái",
    colActions: "Thao tác",
    noExpenses: "Không tìm thấy khoản chi nào.",
    actionEdit: "Sửa",
    actionDelete: "Xóa",
    noDesc: "Chưa có nội dung mô tả",
    modalEditTitle: "Chỉnh sửa Khoản chi",
    modalAddTitle: "Tạo Khoản chi mới",
    labelDate: "Ngày chi",
    labelStatus: "Trạng thái",
    labelCategory: "Phân loại chi phí",
    labelAmount: "Số tiền chi (VND)",
    labelMemo: "Chi tiết khoản chi / Memo",
    memoPlaceholder: "Ghi chú chi tiết về khoản chi tiêu này...",
    btnCancel: "Hủy bỏ",
    btnSave: "Lưu khoản chi",
    errInvalidAmount: "Vui lòng nhập số tiền chi phí hợp lệ.",
    msgUpdated: "Đã cập nhật thông tin khoản chi.",
    msgCreated: "Đã tạo thêm khoản chi mới thành công.",
    confirmDelete: "Bạn có chắc chắn muốn xóa mục chi phí này không?",
    msgDeleted: "Đã xóa khoản chi phí thành công.",
  },
  en: {
    title: "Operational Expense Management",
    subtitle: "Create, edit, classify, and track operational expenditure items.",
    searchPlaceholder: "Search expenses, keywords...",
    catAll: "Expense Categories (All)",
    statusAll: "Status (All)",
    statusPaid: "Paid",
    statusPending: "Pending",
    createBtn: "+ Create Expense",
    colDate: "Expense Date",
    colCategory: "Category",
    colDescription: "Description / Memo",
    colAmount: "Amount (VND)",
    colStatus: "Status",
    colActions: "Actions",
    noExpenses: "No expenses found.",
    actionEdit: "Edit",
    actionDelete: "Delete",
    noDesc: "No description provided",
    modalEditTitle: "Edit Expense Details",
    modalAddTitle: "Create New Expense",
    labelDate: "Expense Date",
    labelStatus: "Status",
    labelCategory: "Expense Category",
    labelAmount: "Amount (VND)",
    labelMemo: "Description / Memo",
    memoPlaceholder: "Detailed notes about this expenditure...",
    btnCancel: "Cancel",
    btnSave: "Save Expense",
    errInvalidAmount: "Please enter a valid expense amount.",
    msgUpdated: "Expense details updated successfully.",
    msgCreated: "New expense created successfully.",
    confirmDelete: "Are you sure you want to delete this expense item?",
    msgDeleted: "Expense item deleted successfully.",
  }
};

function AccountantExpensesPage() {
  const { expenses, setExpenses } = useOutletContext();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const text = UI_TEXT[locale];

  const [expSearchText, setExpSearchText] = useState("");
  const [expCategoryFilter, setExpCategoryFilter] = useState("all");
  const [expStatusFilter, setExpStatusFilter] = useState("all");

  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expForm, setExpForm] = useState({
    date: "",
    category: "",
    amount: "",
    description: "",
    status: "Paid",
  });

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const desc = e.description || "";
      const cat = e.category || "";
      const matchSearch =
        expSearchText.trim() === "" ||
        desc.toLowerCase().includes(expSearchText.toLowerCase()) ||
        cat.toLowerCase().includes(expSearchText.toLowerCase());
      const matchCategory = expCategoryFilter === "all" || e.category === expCategoryFilter;
      const matchStatus = expStatusFilter === "all" || e.status === expStatusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [expenses, expSearchText, expCategoryFilter, expStatusFilter]);

  function openAddExp() {
    setEditingExpense(null);
    setExpForm({
      date: new Date().toISOString().split("T")[0],
      category: OPERATIONAL_CATEGORIES[0],
      amount: "",
      description: "",
      status: "Paid",
    });
    setIsExpModalOpen(true);
  }

  function openEditExp(item) {
    setEditingExpense(item);
    setExpForm({
      date: item.date,
      category: item.category,
      amount: String(item.amount),
      description: item.description || "",
      status: item.status,
    });
    setIsExpModalOpen(true);
  }

  function handleSaveExpense(e) {
    e.preventDefault();
    const amt = parseFloat(expForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error(text.errInvalidAmount);
      return;
    }

    const finalRecord = {
      date: expForm.date,
      category: expForm.category,
      amount: amt,
      description: expForm.description.trim(),
      status: expForm.status,
    };

    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((item) => (item.id === editingExpense.id ? { ...item, ...finalRecord } : item))
      );
      toast.success(text.msgUpdated);
    } else {
      setExpenses((prev) => [...prev, { id: Date.now(), ...finalRecord }]);
      toast.success(text.msgCreated);
    }
    setIsExpModalOpen(false);
  }

  function handleDeleteExpense(id) {
    if (window.confirm(text.confirmDelete)) {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      toast.success(text.msgDeleted);
    }
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">{text.title}</h2>
          <p className="text-sm text-slate-500">{text.subtitle}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 flex-1 max-w-3xl">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setExpSearchText(e.target.value)}
              placeholder={text.searchPlaceholder}
              type="text"
              value={expSearchText}
            />
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setExpCategoryFilter(e.target.value)}
              value={expCategoryFilter}
            >
              <option value="all">{text.catAll}</option>
              {OPERATIONAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setExpStatusFilter(e.target.value)}
              value={expStatusFilter}
            >
              <option value="all">{text.statusAll}</option>
              <option value="Paid">{text.statusPaid}</option>
              <option value="Pending">{text.statusPending}</option>
            </select>
          </div>

          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 shadow-sm"
            onClick={openAddExp}
            type="button"
          >
            {text.createBtn}
          </button>
        </div>
      </article>

      {/* Desktop Expenses Table */}
      <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
              <tr>
                <th className="px-4 py-3">{text.colDate}</th>
                <th className="px-4 py-3">{text.colCategory}</th>
                <th className="px-4 py-3">{text.colDescription}</th>
                <th className="px-4 py-3 text-right">{text.colAmount}</th>
                <th className="px-4 py-3">{text.colStatus}</th>
                <th className="px-4 py-3 text-right">{text.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>
                    {text.noExpenses}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item) => (
                  <tr className="hover:bg-slate-50/50 transition-colors" key={item.id}>
                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 max-w-xs truncate" title={item.description}>
                      {item.description || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-rose-600 text-right whitespace-nowrap">
                      {fmtVND(item.amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                          item.status === "Paid"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 shadow-sm"
                          onClick={() => openEditExp(item)}
                          type="button"
                        >
                          {text.actionEdit}
                        </button>
                        <button
                          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 shadow-sm"
                          onClick={() => handleDeleteExpense(item.id)}
                          type="button"
                        >
                          {text.actionDelete}
                        </button>
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
        {filteredExpenses.length === 0 ? (
          <p className="text-center py-6 text-sm text-slate-400">{text.noExpenses}</p>
        ) : (
          filteredExpenses.map((item) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5" key={item.id}>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-semibold">
                  {new Date(item.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                    item.status === "Paid"
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{item.category}</h4>
                <p className="text-xs text-slate-500 mt-1">{item.description || text.noDesc}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="font-bold text-rose-600 text-sm">{fmtVND(item.amount)}</span>
                <div className="flex gap-1.5">
                  <button
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => openEditExp(item)}
                    type="button"
                  >
                    {text.actionEdit}
                  </button>
                  <button
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    onClick={() => handleDeleteExpense(item.id)}
                    type="button"
                  >
                    {text.actionDelete}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* EXPENSE ADD/EDIT MODAL */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <article className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <header className="flex items-center justify-between">
              <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">
                {editingExpense ? text.modalEditTitle : text.modalAddTitle}
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold focus:outline-none"
                onClick={() => setIsExpModalOpen(false)}
                type="button"
              >
                &times;
              </button>
            </header>

            <form className="space-y-4" onSubmit={handleSaveExpense}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelDate}</p>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                    onChange={(e) => setExpForm((prev) => ({ ...prev, date: e.target.value }))}
                    required
                    type="date"
                    value={expForm.date}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelStatus}</p>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                    onChange={(e) => setExpForm((prev) => ({ ...prev, status: e.target.value }))}
                    value={expForm.status}
                  >
                    <option value="Paid">{text.statusPaid}</option>
                    <option value="Pending">{text.statusPending}</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelCategory}</p>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                  onChange={(e) => setExpForm((prev) => ({ ...prev, category: e.target.value }))}
                  value={expForm.category}
                >
                  {OPERATIONAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelAmount}</p>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm font-semibold text-rose-600"
                  onChange={(e) => setExpForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="Ví dụ: 12000000"
                  required
                  type="number"
                  value={expForm.amount}
                />
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">{text.labelMemo}</p>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm h-20 resize-none"
                  onChange={(e) => setExpForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={text.memoPlaceholder}
                  value={expForm.description}
                />
              </div>

              <footer className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  onClick={() => setIsExpModalOpen(false)}
                  type="button"
                >
                  {text.btnCancel}
                </button>
                <button
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 shadow-sm"
                  type="submit"
                >
                  {text.btnSave}
                </button>
              </footer>
            </form>
          </article>
        </div>
      )}
    </div>
  );
}

export default AccountantExpensesPage;
