import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import fourSLogo from "../assets/logo-4s.png";
import { planAPI } from "../feature/plan/planAPI";
import { adminAPI } from "../feature/admin/adminAPI";
import NotificationBell from "../components/NotificationBell";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { API_BASE_URL } from "../config/apiClient";
import { toast } from "react-toastify";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};


const INITIAL_EXPENSES = [];

function AccountantLayout({ onLogout = () => {} }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["accountant", "common"]);
  const isVi = i18n.resolvedLanguage === "vi";
  const isEnglish = !isVi;

  function handleLanguageChange(lang) {
    i18n.changeLanguage(lang);
  }

  const NAV_ITEMS = [
    { label: isVi ? "Dashboard & Báo cáo" : "Dashboard & Reports", to: "/accountant/dashboard" },
    { label: isVi ? "Quản lý Khoản chi" : "Expense Management", to: "/accountant/expenses" },
    { label: isVi ? "Sổ giao dịch" : "Transaction Ledger", to: "/accountant/transactions" },
  ];

  // Shared in-memory states
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [incomes, setIncomes] = useState([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Trigger auto-refetch when transactions change
  useEffect(() => {
    const handleRefetch = () => setRefetchTrigger((prev) => prev + 1);
    window.addEventListener("4s_transactions_refetch", handleRefetch);
    return () => window.removeEventListener("4s_transactions_refetch", handleRefetch);
  }, []);

  // Fetch transaction list from API
  useEffect(() => {
    let active = true;
    async function fetchTransactions() {
      try {
        const [txRes, usersRes] = await Promise.all([
          planAPI.getAllTransactions(),
          adminAPI.getUsers().catch((err) => {
            console.warn("Failed to fetch users in AccountantLayout:", err);
            return { data: [] };
          }),
        ]);

        if (!active) return;

        const transactions = txRes.data || [];
        const users = usersRes.data || [];

        const userMap = {};
        users.forEach((u) => {
          userMap[u.userId] = u;
        });

        const mappedIncomes = transactions.map((tx) => {
          const matchedUser = userMap[tx.userId];
          return {
            id: tx.transactionCode || tx.transactionId,
            transactionId: tx.transactionId,
            studentName: matchedUser ? matchedUser.username : "Người dùng ẩn danh",
            email: matchedUser ? matchedUser.email : "n/a",
            plan: tx.planName || "VIP Plan",
            amount: tx.amount,
            date: formatDate(tx.createdAt),
            status: tx.status,
          };
        });

        // Sort latest first
        mappedIncomes.sort((a, b) => new Date(b.date) - new Date(a.date));

        setIncomes(mappedIncomes);
      } catch (err) {
        console.error("Error loading Accountant transaction list:", err);
      }
    }
    fetchTransactions();
    return () => {
      active = false;
    };
  }, [refetchTrigger]);

  // Connect to SignalR Payment Hub to receive real-time updates and add notifications
  useEffect(() => {
    let connection;
    try {
      connection = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/payment-hub`)
        .withAutomaticReconnect()
        .build();

      connection.start()
        .then(() => {
          console.log("Accountant connected to SignalR payment-hub successfully.");
          
          // Listen for PaymentConfirmed event broadcast from server
          connection.on("PaymentConfirmed", (data) => {
            console.log("Real-time payment confirmation received:", data);
            
            // 1. Show toast notification
            const amountStr = data?.amount ? `${Number(data.amount).toLocaleString('vi-VN')} VND` : "";
            const planName = data?.planName || "VIP";
            const txId = data?.transactionCode || data?.transactionId || "TX_" + Date.now();
            toast.success(t("notifications.realtimeToast", { id: txId, plan: planName }));

            // 2. Create local notification item for the Accountant Bell
            const newNotif = {
              id: "NOTIF_" + Date.now(),
              role: "accountant",
              title: t("notifications.confirmTitle"),
              message: t("notifications.confirmMessage", { id: txId, plan: planName, amount: amountStr }),
              createdAt: new Date().toLocaleString("sv-SE", { hour12: false }).substring(0, 16),
              isRead: false,
              type: "payment_confirmed",
              txId: txId
            };
            
            try {
              const stored = localStorage.getItem("4s_notifications");
              const notifs = stored ? JSON.parse(stored) : [];
              notifs.push(newNotif);
              localStorage.setItem("4s_notifications", JSON.stringify(notifs));
              window.dispatchEvent(new Event("4s_notifications_updated"));
            } catch (err) {
              console.error("Error saving real-time notification:", err);
            }

            // 3. Trigger refetch transactions to update list in real-time
            window.dispatchEvent(new Event("4s_transactions_refetch"));
          });
        })
        .catch((err) => console.warn("Accountant SignalR connection to payment-hub failed:", err));
    } catch (e) {
      console.warn("SignalR HubConnectionBuilder error:", e);
    }

    return () => {
      if (connection) {
        connection.stop().catch((e) => console.log("Stopped Accountant SignalR connection:", e));
      }
    };
  }, [t]);


  function handleLogout() {
    onLogout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <style>{`
        /* Reset green/teal theme overrides for Accountant Panel to ensure clean corporate design */
        html[data-theme-mode="light"] body,
        html[data-theme-mode="light"] #root,
        html[data-theme-mode="light"] .min-h-screen,
        html[data-theme-mode="dark"] body,
        html[data-theme-mode="dark"] #root,
        html[data-theme-mode="dark"] .min-h-screen {
          background-color: #f8fafc !important;
          background-image: none !important;
          color: #1e293b !important;
        }
        html[data-theme-mode="light"] header.sticky,
        html[data-theme-mode="dark"] header.sticky {
          background-color: #ffffff !important;
          border-color: #e2e8f0 !important;
        }
        html[data-theme-mode="light"] aside,
        html[data-theme-mode="dark"] aside {
          background-color: #ffffff !important;
          border-color: #e2e8f0 !important;
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* Sidebar – Desktop */}
        <aside className="hidden sticky top-0 h-screen w-[290px] shrink-0 border-r border-slate-200/80 bg-white px-5 py-6 lg:flex lg:flex-col shadow-sm">
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

              {/* Actions Right (Notifications & Language) */}
              <div className="flex items-center gap-3.5">
                <NotificationBell role="accountant" />

                {/* Language Switcher */}
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                  <button
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                      isEnglish
                        ? "bg-white text-teal-700 shadow-sm border border-slate-100"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    onClick={() => handleLanguageChange("en")}
                    type="button"
                  >
                    EN
                  </button>
                  <button
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                      isEnglish
                        ? "text-slate-500 hover:text-slate-800"
                        : "bg-white text-teal-700 shadow-sm border border-slate-100"
                    }`}
                    onClick={() => handleLanguageChange("vi")}
                    type="button"
                  >
                    VI
                  </button>
                </div>
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
            <Outlet context={{ expenses, setExpenses, incomes, setIncomes }} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AccountantLayout;
