import React, { useState } from "react";
import { toast } from "react-toastify";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-255",
  Quoted: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-teal-50 text-teal-700 border-teal-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-255",
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
  const [selectedRegKeys, setSelectedRegKeys] = useState(null); // { schoolName, keys: [...] }

  const handleSendKeyEmail = (item) => {
    const subject = encodeURIComponent(`[4S Company] Bàn giao mã kích hoạt tài khoản học đường - ${item.schoolName}`);
    const body = encodeURIComponent(
`Kính gửi Đại diện trường ${item.schoolName},

Ban Tiếp Nhận Học Đường - 4S Company xin chân thành cảm ơn Quý trường đã đăng ký và hoàn tất thanh toán dịch vụ hướng nghiệp của chúng tôi.

Dưới đây là thông tin bàn giao mã kích hoạt tài khoản học đường dành cho học sinh của Quý trường:

- Tên gói cước: ${item.planName || "EDU"}
- Số lượng: ${item.studentCount} tài khoản học sinh
- Mã kích hoạt (Activation Key) dùng chung: ${item.activationKey || ""}

Hướng dẫn kích hoạt dành cho học sinh:
1. Học sinh truy cập và đăng ký tài khoản mới tại website của 4S Company.
2. Đăng ký tài khoản bằng chính địa chỉ email của mình.
3. Sau khi đăng ký và đăng nhập thành công, nhập mã kích hoạt phía trên vào mục "Mã kích hoạt học đường" để nâng cấp tài khoản lên gói Premium/VIP.

Nếu Quý trường hoặc các em học sinh cần bất kỳ sự hỗ trợ kỹ thuật nào trong quá trình kích hoạt tài khoản, xin vui lòng phản hồi email này hoặc liên hệ hotline để được phục vụ.

Trân trọng,
Ban Tiếp Nhận Học Đường - 4S Company
Website: ${window.location.origin}`);

    // Lấy danh sách email học sinh từ studentEmails để đưa vào danh sách gửi ẩn danh (BCC)
    const studentEmails = (item.studentEmails || [])
      .map((se) => se.email)
      .filter((email) => email && email.toLowerCase() !== item.email.toLowerCase());

    const bccString = studentEmails.join(",");
    
    // Đường dẫn soạn thư trực tiếp trên Gmail Web để tránh phải cấu hình Default App của hệ điều hành
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${item.email}&su=${subject}&body=${body}${bccString ? `&bcc=${encodeURIComponent(bccString)}` : ""}`;

    toast.success(isVi ? "Đang mở Gmail Web để soạn thư bàn giao..." : "Opening Gmail Web for key handover...");
    window.open(gmailUrl, "4s_gmail_compose_window");
  };

  return (
    <>
      {/* Desktop Table */}
      <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
              <tr>
                <th className="px-4 py-3.5">{isVi ? "Mã giao dịch" : "TX Code"}</th>
                <th className="px-4 py-3.5">{isVi ? "Trường học / Người liên hệ" : "School / Rep"}</th>
                <th className="px-4 py-3.5">{isVi ? "Gói cước / Học sinh" : "Plan / Students"}</th>
                <th className="px-4 py-3.5 text-right">{isVi ? "Tổng tiền" : "Total Price"}</th>
                <th className="px-4 py-3.5">{isVi ? "Ngày gửi" : "Date"}</th>
                <th className="px-4 py-3.5">{isVi ? "Trạng thái" : "Status"}</th>
                <th className="px-4 py-3.5">{isVi ? "Mã kích hoạt (Keys)" : "Activation Keys"}</th>
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
                    <td className="px-4 py-4.5 text-xs font-mono font-bold text-slate-650 whitespace-nowrap" title={item.id}>
                      {item.transactionCode || "—"}
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
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-750 transition shadow-3xs cursor-pointer"
                              onClick={() => onOpenQuoteModal(item)}
                              type="button"
                            >
                              {isVi ? "Gửi lại báo giá" : "Resend Quote"}
                            </button>
                            <span className="text-xs text-slate-400 font-semibold italic pr-2">
                              {isVi ? "Chờ Kế toán duyệt..." : "Awaiting payment..."}
                            </span>
                          </div>
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
                            {isVi ? "Nhập tệp email HS" : "Upload Emails Docx"}
                          </button>
                        )}
                        {item.status === "Completed" && (
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-xl border border-emerald-250 bg-emerald-50/50 hover:bg-emerald-100/60 px-3 py-1.5 text-xs font-bold text-emerald-700 transition shadow-3xs cursor-pointer flex items-center gap-1"
                              onClick={() => handleSendKeyEmail(item)}
                              type="button"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {isVi ? "Gửi mail bàn giao" : "Send Keys Email"}
                            </button>
                            <span className="text-xs text-emerald-600 font-bold border border-emerald-150 bg-emerald-50/50 rounded-lg px-2.5 py-1 flex items-center gap-1">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {isVi ? "Hoàn tất" : "Completed"}
                            </span>
                          </div>
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
                <span className="text-xs font-mono font-bold text-slate-650" title={item.id}>
                  TX: {item.transactionCode || "—"}
                </span>
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
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                    {isVi ? "Mã kích hoạt (dùng chung)" : "Activation Key (shared)"}
                  </span>
                  <code className="block text-sm font-mono font-extrabold text-emerald-800 select-all tracking-widest">
                    {item.activationKey}
                  </code>
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
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-2xs font-bold text-slate-550 hover:text-slate-750 transition shadow-3xs cursor-pointer"
                        onClick={() => onOpenQuoteModal(item)}
                        type="button"
                      >
                        {isVi ? "Gửi lại" : "Resend"}
                      </button>
                      <span className="text-xs text-slate-450 font-semibold italic">
                        {isVi ? "Chờ duyệt..." : "Awaiting..."}
                      </span>
                    </div>
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
                      {isVi ? "Nhập tệp" : "Upload File"}
                    </button>
                  )}
                  {item.status === "Completed" && (
                    <div className="flex items-center gap-1.5">
                      <button
                        className="rounded-lg border border-emerald-250 bg-emerald-50/50 hover:bg-emerald-100/60 px-2 py-1 text-2xs font-bold text-emerald-700 transition cursor-pointer flex items-center gap-0.5"
                        onClick={() => handleSendKeyEmail(item)}
                        type="button"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {isVi ? "Gửi mail" : "Email"}
                      </button>
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {isVi ? "Hoàn tất" : "Completed"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Keys List Details Modal */}
      {selectedRegKeys && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h4 className="font-['Sora'] text-base font-extrabold text-slate-900">
                  {isVi ? "Danh sách mã kích hoạt học sinh" : "Student Activation Keys"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedRegKeys.schoolName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRegKeys(null)}
                className="rounded-xl p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold text-left uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">{isVi ? "Mã kích hoạt" : "Key"}</th>
                      <th className="px-4 py-2.5">{isVi ? "Đã dùng" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedRegKeys.keys.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{item.email}</td>
                        <td className="px-4 py-3">
                          <code className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-indigo-700 font-mono font-bold tracking-wider">
                            {item.activationKey}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-3xs font-bold uppercase tracking-wider ${
                            item.isUsed
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {item.isUsed ? (isVi ? "Đã dùng" : "Used") : (isVi ? "Chưa dùng" : "Active")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-150 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRegKeys(null)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition shadow-3xs cursor-pointer"
              >
                {isVi ? "Đóng" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
