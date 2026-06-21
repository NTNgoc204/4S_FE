import React from "react";
import { formatDateForFE } from "../../../../util/dateHelper";

function formatRole(roleName) {
  if (!roleName) return "—";
  return roleName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDateTimeSplit(dateStr) {
  if (!dateStr) return { date: "—", time: "" };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: "—", time: "" };
    const datePart = formatDateForFE(dateStr);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return { date: datePart, time: `${hours}:${minutes}` };
  } catch (e) {
    return { date: "—", time: "" };
  }
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${isActive
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-amber-250 bg-amber-55 text-amber-700"
        }`}
    >
      {isActive ? "active" : "inactive"}
    </span>
  );
}

function EditActionButton({ onClick, fullWidth = false }) {
  const widthClass = fullWidth ? "flex-1" : "w-32";
  return (
    <button
      className={`${widthClass} inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 shadow-xs cursor-pointer`}
      onClick={onClick}
      type="button"
    >
      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
        <path
          d="m14.7 5.3 4 4L8.5 19.5l-4 1 1-4L14.7 5.3Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
      <span>Edit</span>
    </button>
  );
}

function ToggleStatusActionButton({
  isActive,
  onClick,
  fullWidth = false,
  disabled = false,
  loading = false,
}) {
  const widthClass = fullWidth ? "flex-1" : "w-32";
  return (
    <button
      className={`${widthClass} inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition ${isActive
          ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/50"
          : "border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100/50"
        } disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer`}
      disabled={disabled || loading}
      onClick={onClick}
      type="button"
      title={
        disabled && !loading
          ? "Bạn không thể tự khóa/kích hoạt tài khoản của chính mình"
          : undefined
      }
    >
      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
        <path d="M12 4v7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M8 6.7a7 7 0 1 0 8 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
      <span>{loading ? "…" : isActive ? "Deactivate" : "Activate"}</span>
    </button>
  );
}

function SkeletonTable() {
  return (
    <article className="animate-pulse space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      {[...Array(4)].map((_, i) => (
        <div className="flex gap-4" key={i}>
          <div className="h-10 flex-1 rounded-lg bg-slate-100" />
          <div className="h-10 w-24 rounded-lg bg-slate-100" />
          <div className="h-10 w-20 rounded-lg bg-slate-100" />
        </div>
      ))}
    </article>
  );
}

export default function UserTable({
  usersLoading,
  filteredUsers,
  currentUserId,
  toggleStatusLoading,
  openEditForm,
  handleToggleStatus,
}) {
  if (usersLoading) {
    return <SkeletonTable />;
  }

  return (
    <>
      <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-400 bg-slate-50/80 font-bold">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5">Last Login</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-slate-400" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    className="border-b border-slate-150 last:border-b-0 hover:bg-slate-50/40 transition-colors"
                    key={user.userId}
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 leading-tight">{user.username}</p>
                      <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm capitalize text-slate-600 font-medium">
                      {formatRole(user.roleName)}
                    </td>
                    <td className="px-5 py-4 text-sm uppercase text-slate-600 font-bold">
                      {String(user.roleName).toLowerCase() === "student" ? (user.planName ?? "—") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {(() => {
                        const { date, time } = formatDateTimeSplit(user.lastLoginTime);
                        return (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-slate-650">
                              <svg
                                className="h-3.5 w-3.5 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              <span className="text-sm font-medium tracking-tight text-slate-700">{date}</span>
                            </div>
                            {time && (
                              <div className="flex items-center gap-1.5 text-slate-450 pl-0.5">
                                <svg
                                  className="h-3.5 w-3.5 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span className="text-xs font-normal text-slate-500">{time}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge isActive={user.isActive} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <EditActionButton onClick={() => openEditForm(user)} />
                        <ToggleStatusActionButton
                          disabled={user.userId === currentUserId}
                          loading={toggleStatusLoading === user.userId}
                          isActive={user.isActive}
                          onClick={() => handleToggleStatus(user)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* Card list – mobile */}
      <section className="space-y-3 md:hidden">
        {filteredUsers.map((user) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs" key={user.userId}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800">{user.username}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              </div>
              <StatusBadge isActive={user.isActive} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <p>
                Role: <span className="font-semibold text-slate-700">{formatRole(user.roleName)}</span>
              </p>
              <p>
                Plan:{" "}
                <span className="font-semibold uppercase text-slate-700">
                  {String(user.roleName).toLowerCase() === "student" ? (user.planName ?? "—") : "—"}
                </span>
              </p>
              <p className="col-span-2">
                Last Login:{" "}
                <span className="font-semibold text-slate-700">
                  {(() => {
                    const { date, time } = formatDateTimeSplit(user.lastLoginTime);
                    return time ? `${date} ${time}` : date;
                  })()}
                </span>
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <EditActionButton fullWidth onClick={() => openEditForm(user)} />
              <ToggleStatusActionButton
                disabled={user.userId === currentUserId}
                loading={toggleStatusLoading === user.userId}
                fullWidth
                isActive={user.isActive}
                onClick={() => handleToggleStatus(user)}
              />
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
