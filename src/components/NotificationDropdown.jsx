import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  markAsReadRequest,
  markAllAsReadRequest,
  clearNotificationsRequest,
} from "../feature/notification/notificationSlice";

function NotificationDropdown({ isOpen, onClose }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  const notifications = useSelector((state) => state.notification.notifications);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("notifications:time.justNow", "Vừa xong");
    if (diffMins < 60) return t("notifications:time.minutes", "{{count}} phút trước", { count: diffMins });
    if (diffHours < 24) return t("notifications:time.hours", "{{count}} giờ trước", { count: diffHours });
    return t("notifications:time.days", "{{count}} ngày trước", { count: diffDays });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-[min(380px,90vw)] rounded-2xl border border-white/10 bg-[#061528] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
        <h3 className="font-['Sora'] text-base font-semibold text-slate-100">
          {t("notifications:title", "Thông báo")}
        </h3>
        {notifications.length > 0 && (
          <button
            onClick={() => dispatch(markAllAsReadRequest())}
            className="text-xs font-semibold text-[#f2cb36] hover:underline bg-transparent border-0 cursor-pointer"
            type="button"
          >
            {t("notifications:actions.markAllRead", "Đọc tất cả")}
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            {t("notifications:empty", "Không có thông báo nào")}
          </div>
        ) : (
          notifications.map((noti) => (
            <div
              key={noti.id}
              onClick={() => dispatch(markAsReadRequest(noti.id))}
              className={`group relative flex items-start gap-3 rounded-xl p-2.5 transition cursor-pointer ${
                noti.isRead
                  ? "bg-transparent hover:bg-white/5"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {/* Type Indicator Dot */}
              <div
                className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                  noti.isRead
                    ? "bg-slate-500/40"
                    : noti.type === "success"
                    ? "bg-emerald-400"
                    : noti.type === "warning"
                    ? "bg-amber-400"
                    : noti.type === "error"
                    ? "bg-rose-400"
                    : "bg-[#7f8cff]"
                }`}
              />

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm tracking-wide leading-tight group-hover:text-slate-100 ${
                    noti.isRead ? "text-slate-300 font-normal" : "text-slate-100 font-semibold"
                  }`}
                >
                  {noti.titleKey ? t(noti.titleKey, noti.titleDefault || "") : noti.title}
                </p>
                <p className="mt-1 text-xs text-slate-400 leading-normal">
                  {noti.messageKey
                    ? t(noti.messageKey, { defaultValue: noti.messageDefault || "", ...noti.messageParams })
                    : noti.message}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  {formatRelativeTime(noti.createdAt)}
                </p>
              </div>

              {/* Unread indicator */}
              {!noti.isRead && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#f2cb36]" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-white/10 text-center">
          <button
            onClick={() => dispatch(clearNotificationsRequest())}
            className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition bg-transparent border-0 cursor-pointer"
            type="button"
          >
            {t("notifications:actions.clearAll", "Xoá tất cả")}
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
