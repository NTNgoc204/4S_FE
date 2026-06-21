import React from "react";

export default function RoleList({
  roles,
  isCreateMode,
  selectedRoleId,
  startEditMode,
  getRoleId,
  getRoleName,
  getRoleDescription,
  getRoleUsersCount,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs text-slate-850">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-['Sora'] text-lg font-bold text-slate-800">Vai Trò</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 shadow-xs">
          {roles.length} mục
        </span>
      </div>

      <div className="space-y-3">
        {roles.map((role) => {
          const roleId = getRoleId(role);
          const isSelected = !isCreateMode && selectedRoleId === roleId;

          return (
            <button
              className={`w-full rounded-xl border p-3.5 text-left transition cursor-pointer ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/50 shadow-xs text-indigo-700"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
              key={roleId}
              onClick={() => startEditMode(role)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-855">{getRoleName(role)}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {getRoleDescription(role) || "—"}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 shadow-xs">
                  {getRoleUsersCount(role)} người dùng
                </span>
              </div>
            </button>
          );
        })}

        {roles.length === 0 && (
          <p className="text-sm text-slate-400">Không tìm thấy vai trò nào.</p>
        )}
      </div>
    </article>
  );
}
