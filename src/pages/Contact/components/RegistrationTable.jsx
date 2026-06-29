import React from "react";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-250",
  Quoted: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-teal-50 text-teal-700 border-teal-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-250",
};

function StatusBadge({ status, isVi, size = "sm" }) {
  const labels = {
    Pending: isVi ? "Chờ tiếp nhận" : "Pending",
    Quoted: isVi ? "Đã báo giá" : "Quote Issued",
    Paid: isVi ? "Đã thanh toán" : "Paid",
    Completed: isVi ? "Hoàn tất" : "Completed",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wide border shadow-2xs ${
        size === "xs" ? "text-3xs" : "text-2xs"
      } ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}
    >
      {labels[status] || status}
    </span>
  );
}

export default function RegistrationTable({
  registrations,
  onOpenQuoteModal,
  onOpenImportModal,
  isVi,
  fmtVND,
}) {
  return (
    <>
      {/* Desktop Table */}
      <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
              <tr>
                <th className="px-4 py-3.5">{isVi ? "Mã đơn" : "REG ID"}</th>
                <th className="px-4 py-3.5">{isVi ? "Trường học / Người liên hệ" : "School / Rep"}</th>
                <th className="px-4 py-3.5">{isVi ? "Gói cước / Học sinh" : "Plan / Students"}</th>
                <th className="px-4 py-3.5 text-right">{isVi ? "Tổng tiền" : "Total Price"}</th>
                <th className="px-4 py-3.5">{isVi ? "Ngày gửi" : "Date"}</th>
                <th className="px-4 py-3.5">{isVi ? "Trạng thái" : "Status"}</th>
                <th className="px-4 py-3.5">{isVi ? "HS đã cấp key" : "Keys Issued"}</th>
                <th className="px-4 py-3.5 text-right">{isVi ? "Hành động" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-sm text-slate-400 font-medium" colSpan={8}>
                    {isVi ? "Không tìm thấy đơn đăng ký nào." : "No school registrations found."}
                  </td>
                </tr>
              ) : (
                registrations.map((item) => (
                  <tr className="hover:bg-slate-50/50 transition-colors" key={item.id}>
                    <td className="px-4 py-4.5 text-sm font-bold text-slate-700 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="px-4 py-4.5">
                      <p className="text-sm font-bold text-slate-900 leading-tight">{item.schoolName}</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        {item.representative} • {item.phoneNumber}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.email}</p>
                    </td>
                    <td className="px-4 py-4.5">
                      <p className="text-sm font-bold text-slate-800">{item.planName}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                        {item.studentCount} {isVi ? "học sinh" : "students"}
                      </p>
                    </td>
                    <td className="px-4 py-4.5 text-sm font-extrabold text-indigo-600 text-right whitespace-nowrap">
                      {fmtVND(item.price)}
                    </td>
                    <td className="px-4 py-4.5 text-xs text-slate-450 font-semibold whitespace-nowrap">
                      {item.createdAt}
                    </td>
                    <td className="px-4 py-4.5 whitespace-nowrap">
                      <StatusBadge status={item.status} isVi={isVi} />
                    </td>

                    {/* Keys issued column */}
                    <td className="px-4 py-4.5 whitespace-nowrap">
                      {item.status === "Completed" && item.activationKey ? (
                        <code className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 select-all tracking-wider">
                          {item.activationKey}
                        </code>
                      ) : (
                        <span className="text-xs text-slate-350 italic font-medium">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4.5 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {item.status === "Pending" && (
                          <button
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                            onClick={() => onOpenQuoteModal(item)}
                            type="button"
                          >
                            {isVi ? "Gửi Báo Giá" : "Issue Quote"}
                          </button>
                        )}
                        {item.status === "Quoted" && (
                          <span className="text-xs text-slate-400 font-semibold italic pr-2">
                            {isVi ? "Chờ Kế toán duyệt..." : "Awaiting payment..."}
                          </span>
                        )}
                        {item.status === "Paid" && (
                          <button
                            className="rounded-xl bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm cursor-pointer flex items-center gap-1.5"
                            onClick={() => onOpenImportModal(item)}
                            type="button"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            {isVi ? "Nhập email HS" : "Import Emails"}
                          </button>
                        )}
                        {item.status === "Completed" && (
                          <span className="text-xs text-emerald-600 font-bold border border-emerald-150 bg-emerald-50/50 rounded-lg px-2.5 py-1 flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {isVi ? "Hoàn tất" : "Completed"}
                          </span>
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

      {/* Mobile Card List */}
      <section className="space-y-3.5 md:hidden">
        {registrations.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-400">
            {isVi ? "Không tìm thấy đơn đăng ký nào." : "No school registrations found."}
          </p>
        ) : (
          registrations.map((item) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3" key={item.id}>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700">{item.id}</span>
                <StatusBadge status={item.status} isVi={isVi} size="xs" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.schoolName}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {item.representative} • {item.phoneNumber}
                </p>
                <p className="text-xs text-slate-400">{item.email}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-bold">
                    {item.planName} ({item.studentCount} {isVi ? "HS" : "students"})
                  </span>
                  <span className="font-extrabold text-indigo-600 text-sm">{fmtVND(item.price)}</span>
                </div>
              </div>

              {/* Shared key (mobile) */}
              {item.status === "Completed" && item.activationKey && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 space-y-1">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    {isVi ? "Mã kích hoạt (dùng chung)" : "Activation Key (shared)"}
                  </span>
                  <code className="block text-sm font-mono font-extrabold text-emerald-800 select-all tracking-widest">
                    {item.activationKey}
                  </code>
                  <p className="text-[10px] text-emerald-600 font-medium">
                    {item.studentEmails?.length || 0} {isVi ? "HS trong danh sách" : "students in list"}
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                <span className="text-2xs text-slate-400 font-semibold">{item.createdAt}</span>
                <div className="flex gap-2">
                  {item.status === "Pending" && (
                    <button
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                      onClick={() => onOpenQuoteModal(item)}
                      type="button"
                    >
                      {isVi ? "Gửi Báo Giá" : "Issue Quote"}
                    </button>
                  )}
                  {item.status === "Quoted" && (
                    <span className="text-xs text-slate-450 font-semibold italic">
                      {isVi ? "Chờ Kế toán duyệt..." : "Awaiting payment..."}
                    </span>
                  )}
                  {item.status === "Paid" && (
                    <button
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1.5"
                      onClick={() => onOpenImportModal(item)}
                      type="button"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      {isVi ? "Nhập email HS" : "Import Emails"}
                    </button>
                  )}
                  {item.status === "Completed" && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {isVi ? "Hoàn tất" : "Completed"}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}
