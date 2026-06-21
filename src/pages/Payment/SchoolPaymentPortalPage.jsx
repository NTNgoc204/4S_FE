import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import logo from "../../assets/logo-4s.png";

export default function SchoolPaymentPortalPage() {
  const { registrationId } = useParams();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";

  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load and sync registration details from localStorage
  const checkStatus = () => {
    try {
      const data = localStorage.getItem("4s_school_registrations");
      if (data) {
        const list = JSON.parse(data);
        const matched = list.find((r) => r.id === registrationId);
        if (matched) {
          setRegistration(matched);
        } else {
          setRegistration(null);
        }
      }
    } catch (e) {
      console.error("Error reading school registrations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Set polling every 3 seconds to auto-update when status changes in localStorage
    const interval = setInterval(checkStatus, 3000);

    const handleStorageUpdate = () => {
      checkStatus();
    };
    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("4s_registrations_updated", handleStorageUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("4s_registrations_updated", handleStorageUpdate);
    };
  }, [registrationId]);

  const handleCopyKey = () => {
    if (registration && registration.activationKey) {
      navigator.clipboard.writeText(registration.activationKey);
      setCopied(true);
      toast.success(isVi ? "Đã sao chép khóa kích hoạt!" : "Activation Key copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fmtVND = (val) => {
    return `${Number(val).toLocaleString("vi-VN")} VND`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-semibold">{isVi ? "Đang tải hóa đơn..." : "Loading invoice details..."}</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-['Sora']">
            {isVi ? "Không tìm thấy đơn hàng" : "Order Not Found"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {isVi 
              ? `Mã đơn hàng "${registrationId}" không tồn tại trên hệ thống hoặc đã bị hủy. Vui lòng kiểm tra lại đường dẫn.`
              : `Order ID "${registrationId}" does not exist in our system or was cancelled. Please check the URL link.`}
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              {isVi ? "Quay lại Trang chủ" : "Back to Home"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate pricing
  const totalPrice = Number(registration.price) || 0;
  const priceBeforeTax = Math.round(totalPrice / 1.1);
  const vatAmount = totalPrice - priceBeforeTax;
  const unitPrice = Math.round(priceBeforeTax / registration.studentCount);

  // Dynamic VietQR generator link
  const qrCodeUrl = `https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=${totalPrice}&addInfo=${registration.id}&accountName=4S%20CORP`;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 md:px-8 font-sans text-slate-800 print:bg-white print:py-0 print:px-0">
      
      {/* Container Page */}
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Header Branding (Hidden on Print) */}
        <header className="flex items-center justify-between pb-4 border-b border-slate-200/80 print:hidden">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="4S Logo" className="h-9 object-contain" />
            <span className="font-['Sora'] font-extrabold text-slate-900 tracking-tight text-base">
              4S CAREER GUIDANCE
            </span>
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-3xs"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm5-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h6z" />
            </svg>
            {isVi ? "In báo giá / Tải PDF" : "Print Invoice / PDF"}
          </button>
        </header>

        {/* Content Portal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:grid-cols-1 print:gap-0">
          
          {/* COLUMN LEFT: Invoice Detail Card (Span 7) */}
          <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm font-serif relative print:border-none print:shadow-none print:p-0">
            
            {/* PDF Watermark decoration (Hidden on Print) */}
            <div className="absolute top-4 right-4 rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-1 text-[10px] font-sans font-bold text-slate-450 select-none print:hidden">
              {isVi ? "BẢN IN BÁO GIÁ" : "OFFICIAL PROPOSAL"}
            </div>

            <div className="space-y-6">
              {/* Proposal Header */}
              <div className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
                <div className="font-sans">
                  <h1 className="font-extrabold text-lg text-slate-900 leading-none tracking-tight">4S CAREER GROUP</h1>
                  <p className="text-[11px] text-slate-550 mt-1.5 font-bold">4S Career Guidance & AI Solutions</p>
                  <p className="text-[10px] text-slate-450 font-semibold">Hotline: 0912.345.678 • Email: contact@4s.edu.vn</p>
                  <p className="text-[10px] text-slate-400 font-medium">Techcombank: 190367899999 • Hà Nội, Việt Nam</p>
                </div>
                <div className="text-right font-sans">
                  <h2 className="font-black text-base text-indigo-700 leading-none uppercase tracking-wide">
                    {isVi ? "BÁO GIÁ DỊCH VỤ" : "PROPOSAL & INVOICE"}
                  </h2>
                  <p className="text-xs text-slate-900 font-extrabold mt-2 bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                    {registration.id}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {isVi ? "Ngày phát hành:" : "Date issued:"} {new Date(registration.createdAt).toLocaleDateString(isVi ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Client Info Section */}
              <div className="text-xs space-y-1.5 font-sans border-b border-slate-150 pb-5">
                <h3 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  {isVi ? "THÔNG TIN KHÁCH HÀNG" : "CLIENT SPECIFICATIONS"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                  <span className="sm:col-span-3 text-slate-450 font-bold uppercase tracking-wide">{isVi ? "Trường học:" : "School:"}</span>
                  <span className="sm:col-span-9 font-extrabold text-slate-900">{registration.schoolName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                  <span className="sm:col-span-3 text-slate-450 font-bold uppercase tracking-wide">{isVi ? "Đại diện:" : "Representative:"}</span>
                  <span className="sm:col-span-9 font-semibold text-slate-800">{registration.representative}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                  <span className="sm:col-span-3 text-slate-450 font-bold uppercase tracking-wide">{isVi ? "Điện thoại:" : "Phone:"}</span>
                  <span className="sm:col-span-9 font-medium text-slate-700">{registration.phoneNumber}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                  <span className="sm:col-span-3 text-slate-450 font-bold uppercase tracking-wide">Email:</span>
                  <span className="sm:col-span-9 font-medium text-slate-700">{registration.email}</span>
                </div>
              </div>

              {/* Items pricing table */}
              <div className="overflow-hidden border border-slate-200 rounded-xl font-sans">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="px-4 py-3 text-left">{isVi ? "Hạng mục / Gói cước" : "Item Description"}</th>
                      <th className="px-3 py-3 text-right">{isVi ? "Số lượng" : "Quantity"}</th>
                      <th className="px-4 py-3 text-right">{isVi ? "Đơn giá" : "Rate"}</th>
                      <th className="px-4 py-3 text-right">{isVi ? "Thành tiền" : "Total (VND)"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700 bg-white font-medium">
                    <tr>
                      <td className="px-4 py-3.5">
                        <p className="font-extrabold text-slate-900 text-sm">{registration.planName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          {isVi 
                            ? "Cấp quyền sử dụng hệ thống trắc nghiệm hướng nghiệp thông minh & Trợ lý tư vấn AI chuyên sâu cho học sinh toàn trường." 
                            : "Enterprise licensing for online career guidance quizzes and interactive AI counseling bot for all students."}
                        </p>
                      </td>
                      <td className="px-3 py-3.5 text-right font-bold whitespace-nowrap">{registration.studentCount} {isVi ? "HS" : "users"}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">{fmtVND(unitPrice)}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-bold text-slate-800">{fmtVND(priceBeforeTax)}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-550" colSpan={3}>
                        {isVi ? "Tạm tính (Chưa gồm VAT 10%)" : "Subtotal (Excl. VAT)"}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap font-bold text-slate-750">{fmtVND(priceBeforeTax)}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-550" colSpan={3}>
                        {isVi ? "Thuế GTGT (VAT 10%)" : "Value Added Tax (VAT 10%)"}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap font-bold text-slate-750">{fmtVND(vatAmount)}</td>
                    </tr>
                    <tr className="bg-indigo-50/20">
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900" colSpan={3}>
                        {isVi ? "TỔNG TIỀN PHẢI THANH TOÁN" : "TOTAL AMOUNT PAYABLE"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap font-black text-indigo-700 text-sm">
                        {fmtVND(totalPrice)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms of Proposal */}
              <div className="text-[10px] text-slate-400 font-sans space-y-1 leading-relaxed border-t border-slate-100 pt-4 print:pt-2">
                <p className="font-bold text-slate-500 uppercase tracking-wider">{isVi ? "* ĐIỀU KHOẢN BÁO GIÁ:" : "* TERMS & CONDITIONS:"}</p>
                <p>1. {isVi ? "Báo giá có hiệu lực trong vòng 14 ngày kể từ ngày phát hành." : "This proposal remains valid for 14 days from issue date."}</p>
                <p>2. {isVi ? "Mã kích hoạt khóa học sẽ được mở khóa và bàn giao trực tiếp tại cổng thông tin này sau khi thanh toán được hệ thống xác nhận." : "The subscription key will be unlocked and rendered directly on this page once payment is successfully verified."}</p>
                <p>3. {isVi ? "Mọi thắc mắc vui lòng liên hệ hotline 0912.345.678 để được hỗ trợ kịp thời." : "For support regarding payments or custom billing, contact our accounts department at finance@4s.edu.vn."}</p>
              </div>
            </div>

          </section>

          {/* COLUMN RIGHT: Payment Details & Expiration Status (Span 5) */}
          <section className="lg:col-span-5 space-y-6 print:hidden">
            
            {/* Status Indicator Card */}
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-['Sora'] font-bold text-slate-900 text-sm tracking-tight">
                {isVi ? "Trạng thái thanh toán" : "Payment Status"}
              </h3>
              
              <div className="flex items-center gap-3">
                {/* Blinking/Static status badge */}
                {registration.status === "Pending" && (
                  <>
                    <span className="flex h-3.5 w-3.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-amber-700 uppercase tracking-wider">{isVi ? "Đang chờ duyệt đơn" : "Pending Inquiry"}</p>
                      <p className="text-2xs text-slate-450 font-semibold mt-0.5">{isVi ? "Đang chờ ban tiếp nhận gửi báo giá..." : "Waiting for quote confirmation..."}</p>
                    </div>
                  </>
                )}
                {registration.status === "Quoted" && (
                  <>
                    <span className="flex h-3.5 w-3.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-blue-700 uppercase tracking-wider">{isVi ? "Chờ chuyển khoản" : "Awaiting Transfer"}</p>
                      <p className="text-2xs text-slate-450 font-semibold mt-0.5">{isVi ? "Vui lòng quét mã QR thanh toán phía dưới" : "Please scan the payment QR code below"}</p>
                    </div>
                  </>
                )}
                {registration.status === "Paid" && (
                  <>
                    <span className="flex h-3.5 w-3.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500"></span>
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-teal-700 uppercase tracking-wider">{isVi ? "Đã nhận tiền thành công" : "Payment Received"}</p>
                      <p className="text-2xs text-slate-450 font-semibold mt-0.5">{isVi ? "Đang chờ cấp khóa kích hoạt học đường..." : "Waiting for key generation..."}</p>
                    </div>
                  </>
                )}
                {registration.status === "KeyGenerated" && (
                  <>
                    <span className="flex h-3.5 w-3.5">
                      <span className="inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-emerald-700 uppercase tracking-wider">{isVi ? "Đã hoàn thành cấp Key" : "Order Completed"}</p>
                      <p className="text-2xs text-slate-450 font-semibold mt-0.5">{isVi ? "Bản quyền trường học đã sẵn sàng" : "School subscription license activated"}</p>
                    </div>
                  </>
                )}
              </div>
            </article>

            {/* CONDITIONAL RENDER BASED ON STATUS */}

            {/* 1. STATUS: Pending */}
            {registration.status === "Pending" && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center py-10 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-900 font-['Sora']">{isVi ? "Yêu cầu đang xử lý" : "Processing Inquiry"}</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {isVi 
                    ? "Ban tiếp nhận đang kiểm tra số lượng học sinh và lập báo giá chính thức. Vui lòng quay lại trang này sau khi nhận được email thông báo."
                    : "Our representative is reviewing your student count to draft an official proposal. Please visit this link again after receiving email confirmation."}
                </p>
              </article>
            )}

            {/* 2. STATUS: Quoted (Show VietQR payOS) */}
            {registration.status === "Quoted" && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h4 className="font-['Sora'] font-bold text-slate-900 text-sm tracking-tight">
                    {isVi ? "Thanh toán quét mã QR" : "Scan to pay with VietQR"}
                  </h4>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                    payOS Active
                  </span>
                </div>

                <div className="flex flex-col items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  {/* QR Image */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                    <img
                      alt="VietQR code"
                      className="h-44 w-44 object-contain block"
                      src={qrCodeUrl}
                    />
                  </div>
                  <p className="text-3xs text-slate-400 font-medium text-center">
                    {isVi 
                      ? "* Khuyên dùng: Quét mã QR trên bằng ứng dụng ngân hàng để tự động nhập đầy đủ Số tiền & Nội dung chuyển khoản."
                      : "* Recommended: Scan QR above using banking app to auto-fill amount, account, and transfer notes."}
                  </p>
                </div>

                {/* Bank account credentials */}
                <div className="text-xs space-y-2.5 font-medium text-slate-700 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isVi ? "Ngân hàng:" : "Bank:"}</span>
                    <span className="font-bold text-slate-800">MB Bank (Quân Đội)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isVi ? "Số tài khoản:" : "Account Number:"}</span>
                    <span className="font-extrabold text-slate-900 text-sm">0912345678</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isVi ? "Tên tài khoản:" : "Account Owner:"}</span>
                    <span className="font-bold text-slate-800">CONG TY CP HUONG NGHIEP 4S</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-150/50 pt-2.5">
                    <span className="text-slate-400">{isVi ? "Nội dung chuyển khoản:" : "Transfer Note:"}</span>
                    <span className="font-black text-indigo-700 text-sm">{registration.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isVi ? "Số tiền chuyển:" : "Amount Payable:"}</span>
                    <span className="font-extrabold text-teal-600">{fmtVND(totalPrice)}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-150 bg-blue-50/30 p-3 flex items-start gap-2.5 text-2xs text-blue-700 leading-relaxed">
                  <svg className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>
                    {isVi 
                      ? "Hệ thống sẽ tự động phê duyệt ngay lập tức sau khi nhận được đúng số tiền và nội dung chuyển khoản qua payOS."
                      : "The system validates transactions automatically. Please ensure transfer note and amount match exactly."}
                  </p>
                </div>
              </article>
            )}

            {/* 3. STATUS: Paid (Show success screen but waiting for key) */}
            {registration.status === "Paid" && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center py-10 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-500">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg font-black text-slate-900 font-['Sora']">{isVi ? "Xác nhận nhận tiền thành công!" : "Payment Confirmed!"}</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    {isVi 
                      ? `Hệ thống đã ghi nhận số tiền thanh toán ${fmtVND(totalPrice)} của đơn ${registration.id}.`
                      : `We have successfully received payment of ${fmtVND(totalPrice)} for invoice ${registration.id}.`}
                  </p>
                </div>

                <div className="rounded-2xl border border-teal-100 bg-teal-50/20 p-4.5 text-xs text-teal-800 text-left leading-relaxed space-y-2 max-w-sm mx-auto">
                  <p className="font-bold flex items-center gap-1.5 text-teal-900">
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                    {isVi ? "Đang chờ sinh Activation Key..." : "Preparing Activation Key..."}
                  </p>
                  <p className="text-slate-550 text-[11px]">
                    {isVi 
                      ? "Ban tiếp nhận (Contact) đang thực hiện thủ tục cấp phát key bản quyền và gửi thư bàn giao. Mã Activation Key sẽ tự động hiển thị tại trang này ngay khi hoàn tất."
                      : "The accounts team is registering your license package. Your activation credentials will render on this screen immediately once processed."}
                  </p>
                </div>
              </article>
            )}

            {/* 4. STATUS: KeyGenerated (Show Key + instructions) */}
            {registration.status === "KeyGenerated" && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="text-center py-3 space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-base font-black text-slate-900 font-['Sora']">{isVi ? "Hoàn tất bàn giao!" : "Licensing Ready!"}</h4>
                  <p className="text-2xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {isVi 
                      ? "Thanh toán đã được đối chiếu & Key bản quyền trường học đã kích hoạt thành công."
                      : "Your school portal package key has been generated and validated."}
                  </p>
                </div>

                {/* Code Card */}
                <div className="bg-slate-550/5 border border-slate-200/80 rounded-2xl p-5 text-center space-y-2 relative overflow-hidden">
                  <span className="text-[9px] font-bold text-slate-450 tracking-wider uppercase block">{isVi ? "MÃ KÍCH HOẠT HỌC ĐƯỜNG" : "SCHOOL ACTIVATION KEY"}</span>
                  <div className="font-mono text-base font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl py-3 px-4 select-all break-all tracking-wide">
                    {registration.activationKey}
                  </div>
                  <button
                    onClick={handleCopyKey}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-650 hover:text-indigo-650 transition cursor-pointer select-none bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-3xs"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    {copied ? (isVi ? "Đã chép" : "Copied") : (isVi ? "Sao chép mã" : "Copy key")}
                  </button>
                </div>

                {/* Instructions */}
                <div className="rounded-xl border border-slate-150 bg-slate-50 p-4 text-2xs text-slate-600 leading-relaxed space-y-2">
                  <p className="font-extrabold text-slate-800 text-2xs">{isVi ? "HƯỚNG DẪN KÍCH HOẠT:" : "ACTIVATION GUIDE:"}</p>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>
                      {isVi 
                        ? "Đại diện ban quản lý nhà trường truy cập trang đăng ký tài khoản (Sign-up)."
                        : "Go to Sign-up portal to create a School Manager profile."}
                    </li>
                    <li>
                      {isVi 
                        ? "Chọn hình thức tài khoản 'Quản lý Trường học' (School Manager)."
                        : "Select 'School Manager' registration role options."}
                    </li>
                    <li>
                      {isVi 
                        ? "Nhập mã Activation Key ở trên vào ô đăng ký để liên kết bản quyền gói cước."
                        : "Enter the Activation Key above to link and activate school credits."}
                    </li>
                    <li>
                      {isVi 
                        ? "Sau khi kích hoạt, bạn có thể nhập danh sách học sinh để cấp tài khoản VIP miễn phí."
                        : "Once logged in, upload student lists to grant VIP licenses immediately."}
                    </li>
                  </ol>
                </div>
              </article>
            )}

          </section>

        </div>

      </div>

    </main>
  );
}
