import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import logo from "../../assets/logo-4s.png";

export default function EduCheckoutPage() {
  const { registrationId } = useParams();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";

  const [copied, setCopied] = useState(false);
  const [regData, setRegData] = useState(null);

  // Load and sync registration details from localStorage
  const syncRegistration = () => {
    try {
      let data = localStorage.getItem("4s_school_registrations");
      let list = data ? JSON.parse(data) : [];

      // Preseed if empty
      if (list.length === 0) {
        list = [
          {
            id: "REG1001",
            schoolName: "Trường THPT Nguyễn Thượng Hiền",
            representative: "Nguyễn Văn An",
            phoneNumber: "0912.345.678",
            email: "an.nguyen@thptnth.edu.vn",
            planName: "Edu Premium",
            studentCount: 1200,
            price: 12000000,
            createdAt: "2026-06-20 08:30",
            status: "Quoted",
            activationKey: "",
          },
          {
            id: "REG1002",
            schoolName: "Trường THPT Chuyên Lê Hồng Phong",
            representative: "Trần Thị Bình",
            phoneNumber: "0987.654.321",
            email: "binh.tran@thptlhp.edu.vn",
            planName: "Edu Premium",
            studentCount: 800,
            price: 8000000,
            createdAt: "2026-06-20 10:15",
            status: "Quoted",
            activationKey: "",
          }
        ];
        localStorage.setItem("4s_school_registrations", JSON.stringify(list));
      }

      const targetId = registrationId || "REG1001";
      let matched = list.find((r) => r.id === targetId);

      // If registrationId doesn't exist (custom mock ID), create a simulator item
      if (!matched) {
        matched = {
          id: targetId,
          schoolName: `Trường THPT Quốc Tế (Demo ${targetId})`,
          representative: "Nguyễn Văn An",
          phoneNumber: "0912.345.678",
          email: "contact@school-demo.edu.vn",
          planName: "Edu Premium",
          studentCount: 1000,
          price: 10000000,
          createdAt: new Date().toLocaleString("sv-SE", { hour12: false }).substring(0, 16),
          status: "Quoted",
          activationKey: "",
        };
        list.push(matched);
        localStorage.setItem("4s_school_registrations", JSON.stringify(list));
        window.dispatchEvent(new Event("4s_registrations_updated"));
      }

      setRegData(matched);
    } catch (e) {
      console.error("Error syncing school registration:", e);
    }
  };

  useEffect(() => {
    syncRegistration();
    
    // Poll every 3 seconds & listen to storage/custom events for real-time responsiveness
    const interval = setInterval(syncRegistration, 3000);
    const handleStorageUpdate = () => {
      syncRegistration();
    };
    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("4s_registrations_updated", handleStorageUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("4s_registrations_updated", handleStorageUpdate);
    };
  }, [registrationId]);

  // Handler to simulate status transition in localStorage
  const updateStatus = (newStatus) => {
    try {
      const data = localStorage.getItem("4s_school_registrations");
      if (!data) return;
      const list = JSON.parse(data);
      const targetId = registrationId || "REG1001";
      
      const updated = list.map((r) => {
        if (r.id === targetId) {
          let updatedItem = { ...r, status: newStatus };
          
          // Reset QR generated flag if reset to Pending or Quoted to allow re-testing
          if (newStatus === "Pending") {
            updatedItem.qrGenerated = false;
          } else if (newStatus === "Quoted") {
            updatedItem.qrGenerated = false;
          } else if (newStatus === "Paid" || newStatus === "KeyGenerated") {
            updatedItem.qrGenerated = true;
          }

          if ((newStatus === "Paid" || newStatus === "KeyGenerated") && !r.activationKey) {
            const words = r.schoolName.replace("Trường THPT ", "").replace("THPT ", "").replace("Trường ", "").split(" ");
            let abbr = words.map(w => w.charAt(0)).join("").toUpperCase();
            if (abbr.length < 2) abbr = "SCH";
            const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
            updatedItem.activationKey = `4S-EDU-${abbr}-${randomStr}`;
          }
          return updatedItem;
        }
        return r;
      });

      localStorage.setItem("4s_school_registrations", JSON.stringify(updated));
      window.dispatchEvent(new Event("4s_registrations_updated"));
      
      const matched = updated.find(r => r.id === targetId);
      if (matched) {
        setRegData(matched);
      }
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  if (!regData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-semibold">{isVi ? "Đang tải dữ liệu..." : "Loading invoice..."}</p>
        </div>
      </div>
    );
  }

  const {
    schoolName,
    representative,
    phoneNumber,
    email,
    studentCount,
    price,
    planName,
    id: orderId,
    createdAt,
    status,
    qrGenerated
  } = regData;

  const isPaid = status === "Paid" || status === "KeyGenerated";

  // Calculate pricing values
  const priceBeforeTax = Math.round(price / 1.1);
  const vatAmount = price - priceBeforeTax;
  const unitPrice = Math.round(priceBeforeTax / studentCount);

  const activationKey = regData.activationKey || "4S-EDU-KEY-PENDING";

  const handleGenerateB2BQR = () => {
    try {
      const data = localStorage.getItem("4s_school_registrations");
      if (!data) return;
      const list = JSON.parse(data);
      const targetId = orderId;
      
      const updated = list.map((r) => {
        if (r.id === targetId) {
          return { ...r, qrGenerated: true };
        }
        return r;
      });

      localStorage.setItem("4s_school_registrations", JSON.stringify(updated));
      window.dispatchEvent(new Event("4s_registrations_updated"));
      toast.success(isVi ? "Khởi tạo cổng thanh toán payOS thành công!" : "payOS payment gateway initialized successfully!");
    } catch (e) {
      console.error("Error generating QR:", e);
    }
  };

  const handleCopyKey = () => {
    if (regData.activationKey) {
      navigator.clipboard.writeText(regData.activationKey);
      setCopied(true);
      toast.success(isVi ? "Đã sao chép khóa kích hoạt!" : "Activation Key copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(isVi ? "Chưa có khóa kích hoạt để sao chép!" : "No activation key available to copy!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fmtVND = (val) => {
    return `${Number(val).toLocaleString("vi-VN")} VND`;
  };

  return (
    <main className="min-h-screen bg-slate-50 py-6 px-4 md:px-8 font-sans text-slate-800 print:bg-white print:py-0 print:px-0">
      
      {/* Simulation Control Panel (Hidden on Print) */}
      <section className="mx-auto max-w-6xl mb-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4 print:hidden border border-white/5 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-[40px] pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-sm font-extrabold tracking-wide uppercase text-indigo-400 font-['Sora'] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            {isVi ? "Trình Giả Lập Thanh Toán B2B" : "B2B Payment Simulator"}
          </h2>
          <p className="text-[11px] text-slate-350 mt-1 font-light leading-relaxed">
            {isVi 
              ? "Bấm các nút dưới đây để giả lập quy trình thanh toán của trường học." 
              : "Use the buttons below to mock the payment check process."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 relative z-10 font-sans">
          <button
            onClick={() => {
              updateStatus("Quoted");
              toast.info(isVi ? "Đã reset về trạng thái Chờ thanh toán" : "Reset to Awaiting Payment");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              !isPaid 
                ? "bg-slate-700 text-white shadow-inner" 
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isVi ? "1. Chờ Thanh Toán" : "1. Awaiting Payment"}
          </button>
          <button
            onClick={() => {
              updateStatus("Paid");
              toast.success(isVi ? "Giả lập: Thanh toán thành công!" : "Simulated: Payment completed!");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              isPaid 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30" 
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isVi ? "2. Thanh Toán Thành Công" : "2. Payment Successful"}
          </button>
        </div>
      </section>

      {/* Main Container */}
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

        {/* Content Section */}
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
                  <p className="text-[11px] text-slate-555 mt-1.5 font-bold">4S Career Guidance & AI Solutions</p>
                  <p className="text-[10px] text-slate-450 font-semibold">Hotline: 0912.345.678 • Email: contact@4s.edu.vn</p>
                  <p className="text-[10px] text-slate-400 font-medium">Techcombank: 190367899999 • Hà Nội, Việt Nam</p>
                </div>
                <div className="text-right font-sans">
                  <h2 className="font-black text-base text-indigo-700 leading-none uppercase tracking-wide">
                    {isVi ? "BÁO GIÁ DỊCH VỤ" : "PROPOSAL & INVOICE"}
                  </h2>
                  <p className="text-xs text-slate-900 font-extrabold mt-2 bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                    {orderId}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {isVi ? "Ngày phát hành:" : "Date issued:"} {new Date(createdAt).toLocaleDateString(isVi ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
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
                  <span className="sm:col-span-9 font-extrabold text-slate-900">{schoolName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                  <span className="sm:col-span-3 text-slate-450 font-bold uppercase tracking-wide">{isVi ? "Đại diện:" : "Representative:"}</span>
                  <span className="sm:col-span-9 font-semibold text-slate-800">{representative}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                  <span className="sm:col-span-3 text-slate-450 font-bold uppercase tracking-wide">{isVi ? "Điện thoại:" : "Phone:"}</span>
                  <span className="sm:col-span-9 font-medium text-slate-700">{phoneNumber}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                  <span className="sm:col-span-3 text-slate-450 font-bold uppercase tracking-wide">Email:</span>
                  <span className="sm:col-span-9 font-medium text-slate-700">{email}</span>
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
                        <p className="font-extrabold text-slate-900 text-sm">{planName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          {isVi 
                            ? "Cấp quyền sử dụng hệ thống trắc nghiệm hướng nghiệp thông minh & Trợ lý tư vấn AI chuyên sâu cho học sinh toàn trường." 
                            : "Enterprise licensing for online career guidance quizzes and interactive AI counseling bot for all students."}
                        </p>
                      </td>
                      <td className="px-3 py-3.5 text-right font-bold whitespace-nowrap">{studentCount} {isVi ? "HS" : "users"}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">{fmtVND(unitPrice)}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-bold text-slate-800">{fmtVND(priceBeforeTax)}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-555" colSpan={3}>
                        {isVi ? "Tạm tính (Chưa gồm VAT 10%)" : "Subtotal (Excl. VAT)"}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap font-bold text-slate-750">{fmtVND(priceBeforeTax)}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-555" colSpan={3}>
                        {isVi ? "Thuế GTGT (VAT 10%)" : "Value Added Tax (VAT 10%)"}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap font-bold text-slate-750">{fmtVND(vatAmount)}</td>
                    </tr>
                    <tr className="bg-indigo-50/20">
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900" colSpan={3}>
                        {isVi ? "TỔNG TIỀN PHẢI THANH TOÁN" : "TOTAL AMOUNT PAYABLE"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap font-black text-indigo-700 text-sm">
                        {fmtVND(price)}
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
                {!isPaid ? (
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
                ) : (
                  <>
                    <span className="flex h-3.5 w-3.5">
                      <span className="inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-emerald-700 uppercase tracking-wider">{isVi ? "Thanh toán thành công" : "Order Completed"}</p>
                      <p className="text-2xs text-slate-450 font-semibold mt-0.5">{isVi ? "Bản quyền trường học đã sẵn sàng" : "School subscription license activated"}</p>
                    </div>
                  </>
                )}
              </div>
            </article>

            {/* CONDITIONAL RENDER BASED ON STATUS */}

            {/* 1. STATUS: Quoted / Awaiting Payment */}
            {!isPaid && !qrGenerated && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h4 className="font-['Sora'] font-bold text-slate-900 text-sm tracking-tight">
                    {isVi ? "Cổng thanh toán học đường" : "School Payment Portal"}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    B2B Invoice
                  </span>
                </div>

                <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="text-sm font-bold text-slate-900 font-['Sora']">
                      {isVi ? "Xác nhận & Tạo mã thanh toán" : "Confirm & Initiate Payment"}
                    </h5>
                    <p className="text-2xs text-slate-450 leading-relaxed max-w-xs mx-auto">
                      {isVi 
                        ? "Vui lòng đối chiếu thông tin báo giá chi tiết của trường bên cột trái. Sau đó bấm nút dưới đây để tạo mã QR chuyển khoản payOS tự động."
                        : "Please verify proposal details on the left. Click below to initialize real-time payOS QR code."}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleGenerateB2BQR}
                    className="w-full max-w-xs rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:scale-[1.02] active:scale-95 py-2.5 text-xs font-bold text-white transition shadow-md shadow-indigo-900/20 cursor-pointer"
                  >
                    {isVi ? "Xác nhận thanh toán (payOS)" : "Confirm & Pay via payOS"}
                  </button>
                </div>
              </article>
            )}

            {/* 1b. STATUS: Quoted & QR Generated (Show VietQR) */}
            {!isPaid && qrGenerated && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 animate-fadeIn">
                <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
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
                      src={`https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=${price}&addInfo=${orderId}&accountName=4S%20CORP`}
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
                    <span className="font-black text-indigo-700 text-sm">{orderId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isVi ? "Số tiền chuyển:" : "Amount Payable:"}</span>
                    <span className="font-extrabold text-teal-600">{fmtVND(price)}</span>
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

            {/* 2. STATUS: Paid (Show success screen without key) */}
            {isPaid && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center py-10 space-y-4 animate-fadeIn">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-slate-900 font-['Sora']">
                    {isVi ? "Thanh toán thành công!" : "Payment Successful!"}
                  </h4>
                  <p className="text-xs text-slate-550 max-w-xs mx-auto leading-relaxed">
                    {isVi 
                      ? "Hệ thống đã ghi nhận thanh toán thành công. Giao dịch của nhà trường đã được hoàn tất."
                      : "We have successfully received your payment. The school transaction is now complete."}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4.5 text-xs text-emerald-800 text-left leading-relaxed space-y-2 max-w-sm mx-auto">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isVi ? "Đang chờ bàn giao bản quyền" : "Awaiting License Delivery"}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {isVi 
                      ? "Ban tiếp nhận (Contact) sẽ tiến hành cấp phát khóa kích hoạt và gửi thư bàn giao trực tiếp đến email của người đại diện trong thời gian sớm nhất."
                      : "Our client support team is processing your school license package. The official activation key will be emailed directly to your school representative shortly."}
                  </p>
                </div>
              </article>
            )}

          </section>

        </div>

      </div>

    </main>
  );
}
