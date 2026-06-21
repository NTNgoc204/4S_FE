import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ContactDashboardPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";

  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    // Load registrations from localStorage to count dynamically
    const loadData = () => {
      const stored = localStorage.getItem("4s_school_registrations");
      if (stored) {
        setRegistrations(JSON.parse(stored));
      }
    };
    loadData();

    // Listen to changes
    window.addEventListener("storage", loadData);
    window.addEventListener("4s_registrations_updated", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("4s_registrations_updated", loadData);
    };
  }, []);

  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter(r => r.status === "Pending").length;
    const quoted = registrations.filter(r => r.status === "Quoted").length;
    const activePaid = registrations.filter(r => r.status === "Paid" || r.status === "KeyGenerated").length;
    
    // Revenue from paid or activated keys
    const revenue = registrations
      .filter(r => r.status === "Paid" || r.status === "KeyGenerated")
      .reduce((sum, r) => sum + (Number(r.price) || 0), 0);

    return { total, pending, quoted, activePaid, revenue };
  }, [registrations]);

  const recentRegistrations = useMemo(() => {
    // Return top 4 recent
    return [...registrations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [registrations]);

  const fmtVND = (val) => {
    return `${Number(val).toLocaleString("vi-VN")} VND`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="font-['Sora'] text-2xl font-extrabold text-slate-900 tracking-tight">
          {isVi ? "Tổng quan Ban Tiếp nhận" : "Contact Console Overview"}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isVi
            ? "Theo dõi tiến độ tiếp nhận đăng ký của các trường học, phát hành báo giá và cấp khóa kích hoạt."
            : "Monitor school contact inquiries, issue pricing quote details, and activate keys."}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <KPIItem
          label={isVi ? "Tổng Số Đơn Liên Hệ" : "Total School Inquiries"}
          value={stats.total}
          valueClass="text-slate-800"
          bgClass="bg-white border-slate-200"
        />
        <KPIItem
          label={isVi ? "Chờ Tiếp Nhận" : "Pending Inquiries"}
          value={stats.pending}
          valueClass="text-amber-600"
          bgClass="bg-white border-slate-200"
        />
        <KPIItem
          label={isVi ? "Đã Báo Giá / Chờ Duyệt" : "Quotes Issued"}
          value={stats.quoted}
          valueClass="text-blue-600"
          bgClass="bg-white border-slate-200"
        />
        <KPIItem
          label={isVi ? "Đã Thanh Toán & Cấp Key" : "Paid & Keys Created"}
          value={stats.activePaid}
          valueClass="text-emerald-600"
          bgClass="bg-white border-slate-200"
        />
        <KPIItem
          label={isVi ? "Doanh Thu Học Đường" : "Total School Revenue"}
          value={fmtVND(stats.revenue)}
          valueClass="text-indigo-600 text-lg md:text-xl"
          bgClass="bg-indigo-50/20 border-indigo-100/50"
        />
      </section>

      {/* Lower section */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Recent registrations list */}
        <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-['Sora'] text-base font-bold text-slate-900">
              {isVi ? "Đơn liên hệ mới gửi" : "Recent Registrations"}
            </h3>
            <button
              className="text-xs font-bold text-indigo-600 hover:text-indigo-850 hover:underline transition cursor-pointer"
              onClick={() => navigate("/contact/registrations")}
              type="button"
            >
              {isVi ? "Xem tất cả" : "View all"}
            </button>
          </div>

          <div className="space-y-3.5">
            {recentRegistrations.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">
                {isVi ? "Chưa có đơn liên hệ nào." : "No school registrations yet."}
              </p>
            ) : (
              recentRegistrations.map((item) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 hover:border-slate-200/80 transition-all duration-200"
                  key={item.id}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-sm leading-none">{item.schoolName}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{item.id}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {isVi
                        ? `Người đại diện: ${item.representative} • Email: ${item.email}`
                        : `Rep: ${item.representative} • Email: ${item.email}`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {isVi ? `Gửi ngày: ${item.createdAt}` : `Submitted at: ${item.createdAt}`}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-extrabold text-indigo-600">{fmtVND(item.price)}</span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border shadow-xs ${
                        item.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : item.status === "Quoted"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.status === "Paid"
                          ? "bg-teal-50 text-teal-700 border-teal-200"
                          : item.status === "KeyGenerated"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {item.status === "Pending" && (isVi ? "Chờ xử lý" : "Pending")}
                      {item.status === "Quoted" && (isVi ? "Đã gửi báo giá" : "Quoted")}
                      {item.status === "Paid" && (isVi ? "Đã thanh toán" : "Paid")}
                      {item.status === "KeyGenerated" && (isVi ? "Đã cấp key" : "Key Activated")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Quick info panel */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="font-['Sora'] text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            {isVi ? "Hướng Dẫn Quy Trình" : "Operational Guideline"}
          </h3>
          <div className="space-y-4">
            <TimelineStep
              step="1"
              title={isVi ? "Tiếp nhận và Gửi Báo giá" : "Review & Issue Quote"}
              desc={isVi ? "Xem đơn đăng ký chờ xử lý ở danh sách. Nhấn 'Gửi Báo Giá' để soạn email và đính kèm báo giá PDF có QR Code thanh toán." : "Check pending orders. Issue quote and attach PDF bill with payment QR code to school representative via email."}
            />
            <TimelineStep
              step="2"
              title={isVi ? "Kế toán duyệt chuyển khoản" : "Accounting Approval"}
              desc={isVi ? "Sau khi trường chuyển khoản với nội dung là Mã đơn hàng, Kế toán sẽ vào mục Xác nhận học đường để phê duyệt đã nhận tiền." : "Once the school transfers the fund matching Registration ID, the accountant checks bank notifications and manually approves payment."}
            />
            <TimelineStep
              step="3"
              title={isVi ? "Sinh Key kích hoạt" : "Generate Activation Key"}
              desc={isVi ? "Sau khi được Kế toán duyệt (đèn chuông thông báo sẽ sáng), Contact quay lại bấm 'Sinh Key' để hoàn tất quy trình và gửi mã cho trường." : "Once accounting confirms payment, Contact hits 'Generate Key' to produce school subscription activation code."}
            />
          </div>
        </article>
      </div>
    </div>
  );
}

function KPIItem({ label, value, valueClass = "", bgClass = "" }) {
  return (
    <article className={`rounded-2xl border p-4.5 shadow-xs ${bgClass}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-none">{label}</p>
      <p className={`mt-3.5 font-['Sora'] text-xl md:text-2xl font-extrabold ${valueClass}`}>{value}</p>
    </article>
  );
}

function TimelineStep({ step, title, desc }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100">
        {step}
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{title}</h4>
        <p className="text-xs text-slate-500 leading-normal">{desc}</p>
      </div>
    </div>
  );
}
