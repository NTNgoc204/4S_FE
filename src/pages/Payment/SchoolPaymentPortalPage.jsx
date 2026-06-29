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
      let data = localStorage.getItem("4s_school_registrations");
      let list = [];
      if (data) {
        list = JSON.parse(data);
      } else {
        // Pre-seed mock registrations if empty
        const defaultMocks = [
          {
            id: "REG1001",
            schoolName: "THPT Nguyá»…n ThÆ°á»£ng Hiá»n",
            representative: "Nguyá»…n VÄƒn An",
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
            schoolName: "THPT ChuyÃªn LÃª Há»“ng Phong",
            representative: "Tráº§n Thá»‹ BÃ¬nh",
            phoneNumber: "0987654321",
            email: "binh.tran@thptlhp.edu.vn",
            planName: "Edu Premium",
            studentCount: 800,
            price: 8000000,
            createdAt: "2026-06-20 10:15",
            status: "Quoted",
            activationKey: "",
          }
        ];
        localStorage.setItem("4s_school_registrations", JSON.stringify(defaultMocks));
        list = defaultMocks;
      }

      let matched = list.find((r) => r.id === registrationId);

      // If they use "mock-edu", add it to the registrations list in localStorage so it can be managed by Accountant/Contact
      if (!matched && registrationId === "mock-edu") {
        const mockReg = {
          id: "mock-edu",
          schoolName: "THPT Nguyá»…n ThÆ°á»£ng Hiá»n (Demo)",
          representative: "Nguyá»…n VÄƒn An",
          phoneNumber: "0912.345.678",
          email: "an.nguyen@thptnth.edu.vn",
          planName: "Edu Premium",
          studentCount: 1200,
          price: 12000000,
          createdAt: new Date().toLocaleString("sv-SE", { hour12: false }).substring(0, 16),
          status: "Quoted",
          activationKey: "",
        };
        list.push(mockReg);
        localStorage.setItem("4s_school_registrations", JSON.stringify(list));
        matched = mockReg;
      }

      if (matched) {
        setRegistration(matched);
      } else {
        setRegistration(null);
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
      toast.success(isVi ? "ÄÃ£ sao chÃ©p khÃ³a kÃ­ch hoáº¡t!" : "Activation Key copied to clipboard!");
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
          <p className="text-sm font-semibold">{isVi ? "Äang táº£i hÃ³a Ä‘Æ¡n..." : "Loading invoice details..."}</p>
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
            {isVi ? "KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng" : "Order Not Found"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {isVi 
              ? `MÃ£ Ä‘Æ¡n hÃ ng "${registrationId}" khÃ´ng tá»“n táº¡i trÃªn há»‡ thá»‘ng hoáº·c Ä‘Ã£ bá»‹ há»§y. Vui lÃ²ng kiá»ƒm tra láº¡i Ä‘Æ°á»ng dáº«n.`
              : `Order ID "${registrationId}" does not exist in our system or was cancelled. Please check the URL link.`}
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              {isVi ? "Quay láº¡i Trang chá»§" : "Back to Home"}
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

  // Expiration calculation (14 days limit as BE)
  const getExpirationInfo = () => {
    if (!registration || !registration.createdAt) return null;
    const createdDate = new Date(registration.createdAt.replace(" ", "T"));
    const expiredDate = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const now = new Date();
    const diffTime = expiredDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const formattedDate = expiredDate.toLocaleDateString(isVi ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    return {
      formattedDate,
      diffDays,
      isExpired: diffTime <= 0
    };
  };

  const expInfo = getExpirationInfo();

  // Dynamic VietQR generator link (compact2 includes bank logo, account name, amount label)
  const qrCodeUrl = `https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=${totalPrice}&addInfo=${encodeURIComponent(registration.id)}&accountName=CONG%20TY%20CP%20HUONG%20NGHIEP%204S`;

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
            {isVi ? "In bÃ¡o giÃ¡ / Táº£i PDF" : "Print Invoice / PDF"}
          </button>
        </header>

        {/* Content Portal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:grid-cols-1 print:gap-0">
          
          {/* COLUMN LEFT: Invoice Detail Card (Span 7) */}
          <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm font-serif relative print:border-none print:shadow-none print:p-0">
            
            {/* PDF Watermark decoration (Hidden on Print) */}
            <div className="absolute top-4 right-4 rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-1 text-[10px] font-sans font-bold text-slate-450 select-none print:hidden">
              {isVi ? "Báº¢N IN BÃO GIÃ" : "OFFICIAL PROPOSAL"}
            </div>

            <div className="space-y-6">
              {/* Proposal Header */}
              <div className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
                <div className="font-sans">
                  <h1 className="font-extrabold text-lg text-slate-900 leading-none tracking-tight">4S CAREER GROUP</h1>
                  <p className="text-[11px] text-slate-550 mt-1.5 font-bold">4S Career Guidance & AI Solutions</p>
                  <p className="text-[10px] text-slate-450 font-semibold">Hotline: 0912.345.678 â€¢ Email: contact@4s.edu.vn</p>
                  <p className="text-[10px] text-slate-400 font-medium">Techcombank: 190367899999 â€¢ HÃ  Ná»™i, Viá»‡t Nam</p>
                </div>
                <div className="text-right font-sans">
                  <h2 className="font-black text-base text-indigo-700 leading-none uppercase tracking-wide">
                    {isVi ? "BÃO GIÃ Dá»ŠCH Vá»¤" : "PROPOSAL & INVOICE"}
                  </h2>
                  <p className="text-xs text-slate-900 font-extrabold mt-2 bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                    {registration.id}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {isVi ? "NgÃ y phÃ¡t hÃ nh:" : "Date issued:"} {new Date(registration.createdAt).toLocaleDateString(isVi ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Client Info Section */}
              <div className="text-xs space-y-1.5 font-sans border-b border-slate-150 pb-5">
                <h3 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  {isVi ? "THÃ”NG TIN KHÃCH HÃ€NG" : "CLIENT SPECIFICATIONS"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                  <span className="sm:col-span-3 text-slate-450 font-bold uppercase tracking-wide">{isVi ? "TrÆ°á»ng há»c:" : "School:"}</span>
                  <span className="sm:col-span-9 font-extrabold text-slate-900">{registration.schoolName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                  <span className="sm:col-span-3 text-slate-450 font-bold uppercase tracking-wide">{isVi ? "Äáº¡i diá»‡n:" : "Representative:"}</span>
                  <span className="sm:col-span-9 font-semibold text-slate-800">{registration.representative}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1">
                  <span className="sm:col-span-3 text-slate-450 font-bold uppercase tracking-wide">{isVi ? "Äiá»‡n thoáº¡i:" : "Phone:"}</span>
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
                      <th className="px-4 py-3 text-left">{isVi ? "Háº¡ng má»¥c / GÃ³i cÆ°á»›c" : "Item Description"}</th>
                      <th className="px-3 py-3 text-right">{isVi ? "Sá»‘ lÆ°á»£ng" : "Quantity"}</th>
                      <th className="px-4 py-3 text-right">{isVi ? "ÄÆ¡n giÃ¡" : "Rate"}</th>
                      <th className="px-4 py-3 text-right">{isVi ? "ThÃ nh tiá»n" : "Total (VND)"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700 bg-white font-medium">
                    <tr>
                      <td className="px-4 py-3.5">
                        <p className="font-extrabold text-slate-900 text-sm">{registration.planName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          {isVi 
                            ? "Cáº¥p quyá»n sá»­ dá»¥ng há»‡ thá»‘ng tráº¯c nghiá»‡m hÆ°á»›ng nghiá»‡p thÃ´ng minh & Trá»£ lÃ½ tÆ° váº¥n AI chuyÃªn sÃ¢u cho há»c sinh toÃ n trÆ°á»ng." 
                            : "Enterprise licensing for online career guidance quizzes and interactive AI counseling bot for all students."}
                        </p>
                      </td>
                      <td className="px-3 py-3.5 text-right font-bold whitespace-nowrap">{registration.studentCount} {isVi ? "HS" : "users"}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">{fmtVND(unitPrice)}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-bold text-slate-800">{fmtVND(priceBeforeTax)}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-550" colSpan={3}>
                        {isVi ? "Táº¡m tÃ­nh (ChÆ°a gá»“m VAT 10%)" : "Subtotal (Excl. VAT)"}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap font-bold text-slate-750">{fmtVND(priceBeforeTax)}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-550" colSpan={3}>
                        {isVi ? "Thuáº¿ GTGT (VAT 10%)" : "Value Added Tax (VAT 10%)"}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap font-bold text-slate-750">{fmtVND(vatAmount)}</td>
                    </tr>
                    <tr className="bg-indigo-50/20">
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900" colSpan={3}>
                        {isVi ? "Tá»”NG TIá»€N PHáº¢I THANH TOÃN" : "TOTAL AMOUNT PAYABLE"}
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
                <p className="font-bold text-slate-500 uppercase tracking-wider">{isVi ? "* ÄIá»€U KHOáº¢N BÃO GIÃ:" : "* TERMS & CONDITIONS:"}</p>
                <p>1. {isVi ? `BÃ¡o giÃ¡ cÃ³ hiá»‡u lá»±c trong vÃ²ng 14 ngÃ y ká»ƒ tá»« ngÃ y phÃ¡t hÃ nh (Háº¡n thanh toÃ¡n: ${expInfo?.formattedDate || ""}).` : `This proposal remains valid for 14 days from issue date (Expires: ${expInfo?.formattedDate || ""}).`}</p>
                <p>2. {isVi ? "MÃ£ kÃ­ch hoáº¡t khÃ³a há»c sáº½ Ä‘Æ°á»£c má»Ÿ khÃ³a vÃ  bÃ n giao trá»±c tiáº¿p táº¡i cá»•ng thÃ´ng tin nÃ y sau khi thanh toÃ¡n Ä‘Æ°á»£c há»‡ thá»‘ng xÃ¡c nháº­n." : "The subscription key will be unlocked and rendered directly on this page once payment is successfully verified."}</p>
                <p>3. {isVi ? "Má»i tháº¯c máº¯c vui lÃ²ng liÃªn há»‡ hotline 0912.345.678 Ä‘á»ƒ Ä‘Æ°á»£c há»— trá»£ ká»‹p thá»i." : "For support regarding payments or custom billing, contact our accounts department at finance@4s.edu.vn."}</p>
              </div>
            </div>

          </section>

          {/* COLUMN RIGHT: Payment Details & Expiration Status (Span 5) */}
          <section className="lg:col-span-5 space-y-6 print:hidden">
            
            {/* Status Indicator Card */}
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-['Sora'] font-bold text-slate-900 text-sm tracking-tight">
                {isVi ? "Tráº¡ng thÃ¡i thanh toÃ¡n" : "Payment Status"}
              </h3>
              
              <div className="flex items-center gap-3">
                {/* Blinking/Static status badge */}
                {(registration.status === "Pending" || registration.status === "Quoted") && (
                  <>
                    <span className="flex h-3.5 w-3.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-blue-700 uppercase tracking-wider">{isVi ? "Chá» chuyá»ƒn khoáº£n" : "Awaiting Transfer"}</p>
                      <p className="text-2xs text-slate-450 font-semibold mt-0.5">{isVi ? "Vui lÃ²ng quÃ©t mÃ£ QR thanh toÃ¡n phÃ­a dÆ°á»›i" : "Please scan the payment QR code below"}</p>
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
                      <p className="text-sm font-extrabold text-teal-700 uppercase tracking-wider">{isVi ? "ÄÃ£ nháº­n tiá»n thÃ nh cÃ´ng" : "Payment Received"}</p>
                      <p className="text-2xs text-slate-450 font-semibold mt-0.5">{isVi ? "Äang chá» cáº¥p khÃ³a kÃ­ch hoáº¡t há»c Ä‘Æ°á»ng..." : "Waiting for key generation..."}</p>
                    </div>
                  </>
                )}
                {registration.status === "Completed" && (
                  <>
                    <span className="flex h-3.5 w-3.5">
                      <span className="inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-emerald-700 uppercase tracking-wider">{isVi ? "ÄÃ£ hoÃ n thÃ nh cáº¥p Key" : "Order Completed"}</p>
                      <p className="text-2xs text-slate-450 font-semibold mt-0.5">{isVi ? "Báº£n quyá»n trÆ°á»ng há»c Ä‘Ã£ sáºµn sÃ ng" : "School subscription license activated"}</p>
                    </div>
                  </>
                )}
              </div>
            </article>

            {/* CONDITIONAL RENDER BASED ON STATUS */}

            {/* 1 & 2. STATUS: Pending or Quoted (Show VietQR immediately) */}
            {(registration.status === "Pending" || registration.status === "Quoted") && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 animate-fadeIn">
                <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
                  <h4 className="font-['Sora'] font-bold text-slate-900 text-sm tracking-tight">
                    {isVi ? "Thanh toÃ¡n quÃ©t mÃ£ QR" : "Scan to pay with VietQR"}
                  </h4>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                    payOS Active
                  </span>
                </div>

                <div className="flex flex-col items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  {/* QR Image */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs overflow-hidden">
                    <img
                      alt="VietQR code"
                      className="w-56 h-auto object-contain block"
                      src={qrCodeUrl}
                    />
                  </div>
                  <p className="text-3xs text-slate-400 font-medium text-center">
                    {isVi 
                      ? "* KhuyÃªn dÃ¹ng: QuÃ©t mÃ£ QR trÃªn báº±ng á»©ng dá»¥ng ngÃ¢n hÃ ng Ä‘á»ƒ tá»± Ä‘á»™ng nháº­p Ä‘áº§y Ä‘á»§ Sá»‘ tiá»n & Ná»™i dung chuyá»ƒn khoáº£n."
                      : "* Recommended: Scan QR above using banking app to auto-fill amount, account, and transfer notes."}
                  </p>
                </div>

                {/* Bank account credentials */}
                <div className="text-xs space-y-2.5 font-medium text-slate-700 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isVi ? "NgÃ¢n hÃ ng:" : "Bank:"}</span>
                    <span className="font-bold text-slate-800">MB Bank (QuÃ¢n Äá»™i)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isVi ? "Sá»‘ tÃ i khoáº£n:" : "Account Number:"}</span>
                    <span className="font-extrabold text-slate-900 text-sm">0912345678</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isVi ? "TÃªn tÃ i khoáº£n:" : "Account Owner:"}</span>
                    <span className="font-bold text-slate-800">CONG TY CP HUONG NGHIEP 4S</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-150/50 pt-2.5">
                    <span className="text-slate-400">{isVi ? "Ná»™i dung chuyá»ƒn khoáº£n:" : "Transfer Note:"}</span>
                    <span className="font-black text-indigo-700 text-sm">{registration.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isVi ? "Sá»‘ tiá»n chuyá»ƒn:" : "Amount Payable:"}</span>
                    <span className="font-extrabold text-teal-600">{fmtVND(totalPrice)}</span>
                  </div>
                  {expInfo && (
                    <div className="flex justify-between items-center border-t border-slate-150/50 pt-2 text-2xs">
                      <span className="text-slate-400">{isVi ? "Háº¡n thanh toÃ¡n:" : "Payment Expiry:"}</span>
                      {expInfo.isExpired ? (
                        <span className="font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                          {isVi ? "Háº¿t háº¡n (ÄÃ£ tá»± Ä‘á»™ng gia háº¡n)" : "Expired (Auto-renewed)"}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-600">
                          {expInfo.formattedDate}{" "}
                          <span className="text-indigo-650 font-bold">
                            ({isVi ? `CÃ²n ${expInfo.diffDays} ngÃ y` : `${expInfo.diffDays} days left`})
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-blue-150 bg-blue-50/30 p-3 flex items-start gap-2.5 text-2xs text-blue-700 leading-relaxed">
                  <svg className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>
                    {isVi 
                      ? "Há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng phÃª duyá»‡t ngay láº­p tá»©c sau khi nháº­n Ä‘Æ°á»£c Ä‘Ãºng sá»‘ tiá»n vÃ  ná»™i dung chuyá»ƒn khoáº£n qua payOS."
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
                  <h4 className="text-lg font-black text-slate-900 font-['Sora']">{isVi ? "XÃ¡c nháº­n nháº­n tiá»n thÃ nh cÃ´ng!" : "Payment Confirmed!"}</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    {isVi 
                      ? `Há»‡ thá»‘ng Ä‘Ã£ ghi nháº­n sá»‘ tiá»n thanh toÃ¡n ${fmtVND(totalPrice)} cá»§a Ä‘Æ¡n ${registration.id}.`
                      : `We have successfully received payment of ${fmtVND(totalPrice)} for invoice ${registration.id}.`}
                  </p>
                </div>

                <div className="rounded-2xl border border-teal-100 bg-teal-50/20 p-4.5 text-xs text-teal-800 text-left leading-relaxed space-y-2 max-w-sm mx-auto">
                  <p className="font-bold flex items-center gap-1.5 text-teal-900">
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                    {isVi ? "Äang chá» sinh Activation Key..." : "Preparing Activation Key..."}
                  </p>
                  <p className="text-slate-550 text-[11px]">
                    {isVi 
                      ? "Ban tiáº¿p nháº­n (Contact) Ä‘ang thá»±c hiá»‡n thá»§ tá»¥c cáº¥p phÃ¡t key báº£n quyá»n vÃ  gá»­i thÆ° bÃ n giao. MÃ£ Activation Key sáº½ tá»± Ä‘á»™ng hiá»ƒn thá»‹ táº¡i trang nÃ y ngay khi hoÃ n táº¥t."
                      : "The accounts team is registering your license package. Your activation credentials will render on this screen immediately once processed."}
                  </p>
                </div>
              </article>
            )}

            {/* 4. STATUS: KeyGenerated (Show Key + instructions) */}
            {registration.status === "Completed" && (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="text-center py-3 space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-base font-black text-slate-900 font-['Sora']">{isVi ? "HoÃ n táº¥t bÃ n giao!" : "Licensing Ready!"}</h4>
                  <p className="text-2xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {isVi 
                      ? "Thanh toÃ¡n Ä‘Ã£ Ä‘Æ°á»£c Ä‘á»‘i chiáº¿u & Key báº£n quyá»n trÆ°á»ng há»c Ä‘Ã£ kÃ­ch hoáº¡t thÃ nh cÃ´ng."
                      : "Your school portal package key has been generated and validated."}
                  </p>
                </div>

                {/* Code Card */}
                <div className="bg-slate-550/5 border border-slate-200/80 rounded-2xl p-5 text-center space-y-2 relative overflow-hidden">
                  <span className="text-[9px] font-bold text-slate-450 tracking-wider uppercase block">{isVi ? "MÃƒ KÃCH HOáº T Há»ŒC ÄÆ¯á»œNG" : "SCHOOL ACTIVATION KEY"}</span>
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
                    {copied ? (isVi ? "ÄÃ£ chÃ©p" : "Copied") : (isVi ? "Sao chÃ©p mÃ£" : "Copy key")}
                  </button>
                </div>

                {/* Instructions */}
                <div className="rounded-xl border border-slate-150 bg-slate-50 p-4 text-2xs text-slate-600 leading-relaxed space-y-2">
                  <p className="font-extrabold text-slate-800 text-2xs">{isVi ? "HÆ¯á»šNG DáºªN KÃCH HOáº T:" : "ACTIVATION GUIDE:"}</p>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>
                      {isVi 
                        ? "Äáº¡i diá»‡n ban quáº£n lÃ½ nhÃ  trÆ°á»ng truy cáº­p trang Ä‘Äƒng kÃ½ tÃ i khoáº£n (Sign-up)."
                        : "Go to Sign-up portal to create a School Manager profile."}
                    </li>
                    <li>
                      {isVi 
                        ? "Chá»n hÃ¬nh thá»©c tÃ i khoáº£n 'Quáº£n lÃ½ TrÆ°á»ng há»c' (School Manager)."
                        : "Select 'School Manager' registration role options."}
                    </li>
                    <li>
                      {isVi 
                        ? "Nháº­p mÃ£ Activation Key á»Ÿ trÃªn vÃ o Ã´ Ä‘Äƒng kÃ½ Ä‘á»ƒ liÃªn káº¿t báº£n quyá»n gÃ³i cÆ°á»›c."
                        : "Enter the Activation Key above to link and activate school credits."}
                    </li>
                    <li>
                      {isVi 
                        ? "Sau khi kÃ­ch hoáº¡t, báº¡n cÃ³ thá»ƒ nháº­p danh sÃ¡ch há»c sinh Ä‘á»ƒ cáº¥p tÃ i khoáº£n VIP miá»…n phÃ­."
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

