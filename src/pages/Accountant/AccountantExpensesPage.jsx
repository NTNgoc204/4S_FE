import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { financeAPI } from "../../feature/finance/financeAPI";

const OPERATIONAL_CATEGORIES = [
  "Operational",
  "Marketing",
  "Personnel",
  "AI API & Infrastructure",
  "Miscellaneous",
];

function fmtVND(n) {
  return `${Math.round(Number(n)).toLocaleString("vi-VN")} VND`;
}

const mapCategoryToBE = (uiCat) => uiCat;
const mapCategoryToUI = (beCat) => beCat;

const getCategoryLabel = (cat, t) => {
  if (cat === "Operational") return t("expenses.categories.operational");
  if (cat === "Marketing") return t("expenses.categories.marketing");
  if (cat === "Personnel") return t("expenses.categories.personnel");
  if (cat === "AI API & Infrastructure") return t("expenses.categories.ai");
  return t("expenses.categories.misc");
};

function AccountantExpensesPage() {
  const { t, i18n } = useTranslation(["accountant", "common"]);
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const [expSearchText, setExpSearchText] = useState("");
  const [expCategoryFilter, setExpCategoryFilter] = useState("all");

  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expForm, setExpForm] = useState({
    date: "",
    category: "",
    amount: "",
    description: "",
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await financeAPI.getExpenses(selectedMonth, selectedYear);
      const list = res.data.expenses || [];
      const normalized = list.map(item => ({
        id: item.id,
        date: item.date.split("T")[0],
        category: mapCategoryToUI(item.category),
        amount: item.amount,
        description: item.description,
      }));
      setExpenses(normalized);
    } catch (err) {
      console.error("Failed to load expenses:", err);
      toast.error(t("expenses.errLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);

  // Filter expenses locally
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const desc = e.description || "";
      const cat = e.category || "";
      const matchSearch =
        expSearchText.trim() === "" ||
        desc.toLowerCase().includes(expSearchText.toLowerCase()) ||
        cat.toLowerCase().includes(expSearchText.toLowerCase());
      const matchCategory = expCategoryFilter === "all" || e.category === expCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [expenses, expSearchText, expCategoryFilter]);

  function openAddExp() {
    setEditingExpense(null);
    setExpForm({
      date: new Date().toISOString().split("T")[0],
      category: OPERATIONAL_CATEGORIES[0],
      amount: "",
      description: "",
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
    });
    setIsExpModalOpen(true);
  }

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    const amt = parseFloat(expForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error(t("expenses.errInvalidAmount"));
      return;
    }

    const desc = expForm.description.trim();
    if (!desc) {
      toast.error(t("expenses.enterMemo"));
      return;
    }

    const payload = {
      category: mapCategoryToBE(expForm.category),
      Category: mapCategoryToBE(expForm.category),
      description: desc,
      Description: desc,
      amount: amt,
      Amount: amt,
      date: new Date(expForm.date).toISOString(),
      Date: new Date(expForm.date).toISOString(),
    };

    try {
      if (editingExpense) {
        await financeAPI.updateExpense(editingExpense.id, payload);
        toast.success(t("expenses.msgUpdated"));
      } else {
        await financeAPI.createExpense(payload);
        toast.success(t("expenses.msgCreated"));
      }
      setIsExpModalOpen(false);
      fetchExpenses();
    } catch (err) {
      console.error("Error saving expense:", err);
      toast.error(t("expenses.errSave"));
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">{t("expenses.title")}</h2>
          <p className="text-sm text-slate-500">{t("expenses.subtitle")}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-4 flex-1 max-w-4xl">
            {/* Search */}
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setExpSearchText(e.target.value)}
              placeholder={t("expenses.searchPlaceholder")}
              type="text"
              value={expSearchText}
            />

            {/* Category Filter */}
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setExpCategoryFilter(e.target.value)}
              value={expCategoryFilter}
            >
              <option value="all">{t("expenses.catAll")}</option>
              {OPERATIONAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat, t)}
                </option>
              ))}
            </select>

            {/* Period Selector: Month */}
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              value={selectedMonth}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {t("expenses.monthLabel", { m })}
                </option>
              ))}
            </select>

            {/* Period Selector: Year */}
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              value={selectedYear}
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white-force transition hover:bg-teal-700 shadow-sm cursor-pointer"
            onClick={openAddExp}
            type="button"
          >
            {t("expenses.createBtn")}
          </button>
        </div>
      </article>

      {/* Loading Indicator */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
        </div>
      ) : (
        <>
          {/* Desktop Expenses Table */}
          <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-550 bg-slate-50 font-semibold">
                  <tr>
                    <th className="px-4 py-3">{t("expenses.colDate")}</th>
                    <th className="px-4 py-3">{t("expenses.colCategory")}</th>
                    <th className="px-4 py-3">{t("expenses.colDescription")}</th>
                    <th className="px-4 py-3 text-right">{t("expenses.colAmount")}</th>
                    <th className="px-4 py-3 text-right">{t("expenses.colActions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={5}>
                        {t("expenses.noExpenses")}
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((item) => (
                      <tr className="hover:bg-slate-50/50 transition-colors" key={item.id}>
                        <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap font-medium">
                          {new Date(item.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">
                          {getCategoryLabel(item.category, t)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500 max-w-xs truncate" title={item.description}>
                          {item.description || "—"}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-rose-600 text-right whitespace-nowrap">
                          {fmtVND(item.amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 shadow-sm cursor-pointer"
                              onClick={() => openEditExp(item)}
                              type="button"
                            >
                              {t("expenses.actionEdit")}
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
              <p className="text-center py-6 text-sm text-slate-400">{t("expenses.noExpenses")}</p>
            ) : (
              filteredExpenses.map((item) => (
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5" key={item.id}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-505 font-semibold">
                      {new Date(item.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{getCategoryLabel(item.category, t)}</h4>
                    <p className="text-xs text-slate-505 mt-1">{item.description || t("expenses.noDesc")}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="font-bold text-rose-600 text-sm">{fmtVND(item.amount)}</span>
                    <div className="flex gap-1.5">
                      <button
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        onClick={() => openEditExp(item)}
                        type="button"
                      >
                        {t("expenses.actionEdit")}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}

      {/* EXPENSE ADD/EDIT MODAL */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <article className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <header className="flex items-center justify-between">
              <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">
                {editingExpense ? t("expenses.modalEditTitle") : t("expenses.modalAddTitle")}
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
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">{t("expenses.labelDate")}</p>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                  onChange={(e) => setExpForm((prev) => ({ ...prev, date: e.target.value }))}
                  required
                  type="date"
                  value={expForm.date}
                />
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">{t("expenses.labelCategory")}</p>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                  onChange={(e) => setExpForm((prev) => ({ ...prev, category: e.target.value }))}
                  value={expForm.category}
                >
                  {OPERATIONAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat, t)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-600">{t("expenses.labelAmount")}</p>
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
                <p className="mb-1.5 text-sm font-medium text-slate-600">{t("expenses.labelMemo")}</p>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm h-20 resize-none"
                  onChange={(e) => setExpForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={t("expenses.memoPlaceholder")}
                  required
                  value={expForm.description}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  onClick={() => setIsExpModalOpen(false)}
                  type="button"
                >
                  {t("expenses.btnCancel")}
                </button>
                <button
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white-force transition hover:bg-teal-700 shadow-sm"
                  type="submit"
                >
                  {t("expenses.btnSave")}
                </button>
              </div>
            </form>
          </article>
        </div>
      )}
    </div>
  );
}

export default AccountantExpensesPage;
