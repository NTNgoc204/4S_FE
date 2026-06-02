import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import fourSLogo from "../assets/logo-4s.png";

const INITIAL_EXPENSES = [
  { id: 1, date: "2026-06-01", category: "AI API & Infrastructure (AI & Máy chủ)", amount: 68000000, description: "AWS hosting fee for core service & database backups", status: "Paid" },
  { id: 2, date: "2026-06-01", category: "AI API & Infrastructure (AI & Máy chủ)", amount: 42500000, description: "Token utilization billing for Google Vertex API keys", status: "Paid" },
  { id: 3, date: "2026-06-02", category: "Marketing (Quảng cáo & Ads)", amount: 24700000, description: "Monthly Facebook Ads & student referral campaign costs", status: "Paid" },
  { id: 4, date: "2026-06-02", category: "Operational (Vận hành)", amount: 12000000, description: "Zendesk & Slack licensing fees for operator workspace", status: "Paid" },
  { id: 5, date: "2026-06-02", category: "Miscellaneous (Khác)", amount: 8000000, description: "Office supplies, electricity, and workspace essentials", status: "Pending" },
  { id: 6, date: "2026-06-02", category: "Personnel (Nhân sự & Lương)", amount: 45000000, description: "Salary payout for support team members & facilitators", status: "Paid" },
];

const INITIAL_INCOMES = [
  { id: "TX1001", studentName: "Nguyễn Văn A", email: "vana@gmail.com", plan: "Pro Plan", amount: 150000, date: "2026-06-02 09:15", status: "Success" },
  { id: "TX1002", studentName: "Trần Thị B", email: "thib@gmail.com", plan: "Edu Plan", amount: 299000, date: "2026-06-02 10:22", status: "Success" },
  { id: "TX1003", studentName: "Lê Hoàng C", email: "hoangc@gmail.com", plan: "Pro Plan", amount: 150000, date: "2026-06-02 11:05", status: "Pending" },
  { id: "TX1004", studentName: "Phạm Minh D", email: "minhd@gmail.com", plan: "Edu Plan", amount: 299000, date: "2026-06-02 13:40", status: "Success" },
  { id: "TX1005", studentName: "Đỗ Thanh E", email: "thanhe@gmail.com", plan: "Pro Plan", amount: 150000, date: "2026-06-02 14:12", status: "Failed" },
  { id: "TX1006", studentName: "Nguyễn Lê F", email: "lef@gmail.com", plan: "Pro Plan", amount: 150000, date: "2026-06-01 08:30", status: "Success" },
  { id: "TX1007", studentName: "Vũ Hải G", email: "haig@gmail.com", plan: "Edu Plan", amount: 299000, date: "2026-06-01 09:55", status: "Success" },
  { id: "TX1008", studentName: "Hoàng Đức H", email: "duch@gmail.com", plan: "Pro Plan", amount: 150000, date: "2026-06-01 15:45", status: "Pending" },
  { id: "TX1009", studentName: "Bùi Thị I", email: "thii@gmail.com", plan: "Edu Plan", amount: 299000, date: "2026-05-31 10:00", status: "Success" },
  { id: "TX1010", studentName: "Đặng Văn J", email: "vanj@gmail.com", plan: "Pro Plan", amount: 150000, date: "2026-05-30 16:20", status: "Success" },
];

const INITIAL_INVOICES = [
  { id: "INV-2026-001", txId: "TX1001", customerName: "Nguyễn Văn A", companyName: "Công ty TNHH Tư vấn Giáo dục A-Z", taxCode: "0109876543", amount: 150000, date: "2026-06-02", status: "Issued" },
  { id: "INV-2026-002", txId: "TX1002", customerName: "Trần Thị B", companyName: "Công ty Cổ phần Thương mại B&B", taxCode: "0314785236", amount: 299000, date: "2026-06-02", status: "Pending" },
  { id: "INV-2026-003", txId: "TX1004", customerName: "Phạm Minh D", companyName: "Hộ Kinh doanh Phạm Minh", taxCode: "8045612349", amount: 299000, date: "2026-06-02", status: "Issued" },
];

function AccountantLayout({ onLogout = () => {} }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";

  const NAV_ITEMS = [
    { label: isVi ? "Dashboard & Báo cáo" : "Dashboard & Reports", to: "/accountant/dashboard" },
    { label: isVi ? "Quản lý Khoản chi" : "Expense Management", to: "/accountant/expenses" },
    { label: isVi ? "Sổ giao dịch & Hoàn tiền" : "Transaction & Refund Ledger", to: "/accountant/transactions" },
    { label: isVi ? "Quản lý Hóa đơn & VAT" : "Invoice & VAT Management", to: "/accountant/invoices" },
  ];

  // Shared in-memory states
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [incomes, setIncomes] = useState(INITIAL_INCOMES);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* Sidebar – Desktop */}
        <aside className="hidden min-h-screen w-[290px] shrink-0 border-r border-slate-200/80 bg-white px-5 py-6 lg:flex lg:flex-col shadow-sm">
          <button
            className="flex items-center gap-3 px-1 py-1 text-left transition hover:opacity-90 focus:outline-none"
            onClick={() => navigate("/accountant/dashboard")}
            type="button"
          >
            <img alt="4S logo" className="h-16 w-16 object-contain" src={fourSLogo} />
            <span className="font-['Sora'] text-xl font-bold text-slate-900">4S Accountant</span>
          </button>

          <nav aria-label="Accountant navigation" className="mt-7 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "border-teal-500 bg-teal-50/70 text-teal-700 shadow-sm"
                      : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-2">
            <button
              className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
              onClick={handleLogout}
              type="button"
            >
              {isVi ? "Đăng xuất" : "Logout"}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white px-4 py-4 backdrop-blur-xl md:px-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-medium">
                  {isVi ? "Ban Kế Toán" : "Accountant Panel"}
                </p>
                <h1 className="font-['Sora'] text-xl font-semibold text-slate-900">
                  {isVi ? "Bảng Điều Phối Tài Chính 4S" : "4S Financial Console"}
                </h1>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav aria-label="Accountant mobile navigation" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) =>
                    `rounded-xl border px-3 py-2 text-center text-sm font-semibold transition ${
                      isActive
                        ? "border-teal-500 bg-teal-50/70 text-teal-700 shadow-sm"
                        : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"
                    }`
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                onClick={handleLogout}
                type="button"
              >
                {isVi ? "Đăng xuất" : "Logout"}
              </button>
            </nav>
          </header>

          <main className="w-full flex-1 px-4 py-5 md:px-6 md:py-6">
            <Outlet context={{ expenses, setExpenses, incomes, setIncomes, invoices, setInvoices }} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AccountantLayout;
