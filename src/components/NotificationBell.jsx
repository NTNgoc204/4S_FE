import React, { useState, useEffect, useRef } from "react";

export default function NotificationBell({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Load notifications from localStorage
  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem("4s_notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter by role
        const filtered = parsed.filter(n => n.role === role || n.role === "all");
        // Sort latest first
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(filtered);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error("Error parsing notifications:", e);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen for custom event or storage change to reload in real-time
    const handleNotifyUpdate = () => {
      loadNotifications();
    };

    window.addEventListener("4s_notifications_updated", handleNotifyUpdate);
    window.addEventListener("storage", handleNotifyUpdate);

    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("4s_notifications_updated", handleNotifyUpdate);
      window.removeEventListener("storage", handleNotifyUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [role]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = () => {
    try {
      const stored = localStorage.getItem("4s_notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map(n => {
          if (n.role === role || n.role === "all") {
            return { ...n, isRead: true };
          }
          return n;
        });
        localStorage.setItem("4s_notifications", JSON.stringify(updated));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event("4s_notifications_updated"));
      }
    } catch (e) {
      console.error("Error marking notifications as read:", e);
    }
  };

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation(); // prevent dropdown close
    try {
      const stored = localStorage.getItem("4s_notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.filter(n => n.id !== id);
        localStorage.setItem("4s_notifications", JSON.stringify(updated));
        window.dispatchEvent(new Event("4s_notifications_updated"));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        className="relative flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition active:scale-95 shadow-sm cursor-pointer"
        onClick={handleToggle}
        type="button"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {/* Unread Indicator Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl animate-fadeIn text-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
            <h3 className="font-['Sora'] text-sm font-bold text-slate-900">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-850 hover:underline transition cursor-pointer"
                onClick={handleMarkAllAsRead}
                type="button"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <svg className="h-8 w-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-2a2 2 0 00-2 2v1a2 2 0 01-2 2H8a2 2 0 01-2-2v-1a2 2 0 00-2-2H2" />
                </svg>
                <p className="text-xs">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 p-3.5 hover:bg-slate-50 transition relative group ${
                    !notif.isRead ? "bg-indigo-50/20" : ""
                  }`}
                >
                  {/* Icon Indicator based on type */}
                  <div className="shrink-0 mt-0.5">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm ${
                        notif.type === "new_registration"
                          ? "bg-amber-50 text-amber-600 border border-amber-250"
                          : notif.type === "payment_requested"
                          ? "bg-blue-50 text-blue-600 border border-blue-250"
                          : notif.type === "payment_confirmed"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-250"
                          : "bg-slate-50 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {notif.type === "new_registration" && "🏫"}
                      {notif.type === "payment_requested" && "💵"}
                      {notif.type === "payment_confirmed" && "✅"}
                      {!["new_registration", "payment_requested", "payment_confirmed"].includes(notif.type) && "🔔"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-normal">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                      {notif.createdAt}
                    </span>
                  </div>

                  {/* Red Unread Circle */}
                  {!notif.isRead && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-600" />
                  )}

                  {/* Delete Button on Hover */}
                  <button
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    onClick={(e) => handleDeleteNotification(notif.id, e)}
                    title="Xóa thông báo"
                    type="button"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
