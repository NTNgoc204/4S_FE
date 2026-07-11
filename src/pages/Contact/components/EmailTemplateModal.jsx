import React, { useState, useEffect } from "react";

export default function EmailTemplateModal({
  isOpen,
  onClose,
  registration,
  onSendQuote,
  isVi,
  fmtVND,
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isPreparing, setIsPreparing] = useState(true);

  useEffect(() => {
    if (registration) {
      setIsPreparing(true);
      const timer = setTimeout(() => {
        setIsPreparing(false);
      }, 1800); // Simulate payOS link generation delay (1.8s)

      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 14);
      const expDateStr = expDate.toLocaleDateString(isVi ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setSubject(
        isVi
          ? `[4S Career Guidance] Báo giá giải pháp hướng nghiệp & Thông tin thanh toán - ${registration.schoolName}`
          : `[4S Career Guidance] Proposal & Payment Details - ${registration.schoolName}`
      );
      setBody(
        isVi
          ? `Kính gửi thầy/cô đại diện trường ${registration.schoolName},\n\nBan Tiếp Nhận 4S xin gửi lời chào trân trọng nhất.\n\nChúng tôi xin gửi kèm bảng báo giá chi tiết và thông tin chuyển khoản dành cho gói cước "${registration.planName}" đăng ký cho ${registration.studentCount} học sinh của quý trường.\n\nQuý trường có thể quét trực tiếp mã QR chuyển khoản (VietQR) trong file đính kèm hoặc thực hiện chuyển khoản ngân hàng theo thông tin dưới đây:\n- Ngân hàng: MB Bank (Ngân hàng Quân Đội)\n- Số tài khoản: 0912345678\n- Chủ tài khoản: CONG TY CP HUONG NGHIEP 4S\n- Số tiền: ${fmtVND(registration.price)}\n- Nội dung chuyển khoản: ${registration.id}\n\n* Lưu ý: Báo giá này có hiệu lực trong vòng 14 ngày (Hạn thanh toán: trước ngày ${expDateStr}).\n\nSau khi chuyển khoản thành công, hệ thống sẽ đối soát tự động và gửi mã kích hoạt khóa học (Activation Key) cho quý trường qua email này.\n\nTrân trọng,\nBan Tiếp Nhận 4S Career Guidance.`
          : `Dear representative of ${registration.schoolName},\n\n4S Career Guidance Team would like to send you our warmest greetings.\n\nWe would like to send the detailed proposal and payment instructions for the "${registration.planName}" subscription for ${registration.studentCount} students of your school.\n\nYou can scan the payment QR code (VietQR) attached in the invoice PDF or make a bank transfer using the details below:\n- Bank: MB Bank (Military Bank)\n- Account number: 0912345678\n- Account name: CONG TY CP HUONG NGHIEP 4S\n- Total amount: ${fmtVND(registration.price)}\n- Transfer note: ${registration.id}\n\n* Note: This proposal remains valid for 14 days (Payment deadline: before ${expDateStr}).\n\nUpon successful verification, the Activation Key will be sent to you automatically via email.\n\nBest regards,\n4S Career Guidance Team.`
      );

      return () => clearTimeout(timer);
    }
  }, [registration, isVi]);

  if (!isOpen || !registration) return null;

  const todayStr = new Date().toLocaleDateString(isVi ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate unit price before tax (price assumes 10% VAT included, let's pretend unit price is: price / 1.1 / studentCount)
  const totalPrice = Number(registration.price) || 0;
  const priceBeforeTax = Math.round(totalPrice / 1.1);
  const vatAmount = totalPrice - priceBeforeTax;
  const unitPrice = Math.round(priceBeforeTax / registration.studentCount);

  // Generate direct payment QR code for the bank transfer (compact2 includes bank name + account info)
  const qrCodeUrl = `https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=${totalPrice}&addInfo=${encodeURIComponent(registration.id)}&accountName=CONG%20TY%20CP%20HUONG%20NGHIEP%204S`;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendQuote(registration.id, subject, body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-slate-200">
          <h3 className="font-['Sora'] text-lg font-extrabold text-slate-900 tracking-tight">
            {isVi ? `Soạn & Gửi Báo Giá: ${registration.id}` : `Compose & Issue Proposal: ${registration.id}`}
          </h3>
          <button
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body (Two-Column Layout) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Column Left: Email Editor Form */}
          <form className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase tracking-wider">{isVi ? "Người nhận (Email đại diện)" : "Recipient"}</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 font-medium cursor-not-allowed outline-none shadow-3xs"
                  readOnly
                  type="email"
                  value={registration.email}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="subject">{isVi ? "Tiêu đề Email" : "Email Subject"}</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-3xs transition-all"
                  id="subject"
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  type="text"
                  value={subject}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="body">{isVi ? "Nội dung thư mẫu" : "Email Message"}</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-3xs transition-all resize-none min-h-[220px]"
                  id="body"
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={10}
                  value={body}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <div className="flex gap-2">
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                  onClick={onClose}
                  type="button"
                >
                  {isVi ? "Hủy" : "Cancel"}
                </button>
                <button
                  className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition shadow-sm cursor-pointer ${
                    isPreparing
                      ? "bg-indigo-400 cursor-not-allowed opacity-80"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                  type="submit"
                  disabled={isPreparing}
                >
                  {isPreparing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isVi ? "Đang chuẩn bị thông tin báo giá..." : "Preparing quote details..."}
                    </span>
                  ) : (
                    isVi ? "Gửi Email & Báo Giá" : "Send Email & Quote"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Column Right: Email Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between relative min-h-[480px] font-sans">
            {/* Email Watermark Decor */}
            <div className="absolute top-3 right-3 rounded-lg border border-indigo-100 bg-indigo-50/50 px-2 py-0.5 text-[9px] font-bold text-indigo-500 select-none">
              {isVi ? "XEM TRƯỚC EMAIL" : "EMAIL PREVIEW"}
            </div>

            <div className="space-y-4">
              {/* Email Envelope Info Headers */}
              <div className="border-b border-slate-150 pb-3 text-xs space-y-2 text-slate-500 font-medium">
                <div className="flex items-start">
                  <span className="font-bold text-slate-400 uppercase tracking-wider w-16 shrink-0">{isVi ? "Từ:" : "From:"}</span>
                  <span className="text-slate-700 font-semibold">4S Career Guidance &lt;system@4s.vn&gt;</span>
                </div>
                <div className="flex items-start">
                  <span className="font-bold text-slate-400 uppercase tracking-wider w-16 shrink-0">{isVi ? "Đến:" : "To:"}</span>
                  <span className="text-slate-700 font-semibold">{registration.email}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-bold text-slate-400 uppercase tracking-wider w-16 shrink-0">{isVi ? "Tiêu đề:" : "Subject:"}</span>
                  <span className="text-indigo-650 font-bold">{subject}</span>
                </div>
              </div>

              {/* Email Body Template Container */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-3xs overflow-y-auto max-h-[360px] text-slate-800 text-[13px] leading-relaxed">
                {/* Email Title Header */}
                <h4 className="font-bold text-indigo-600 text-sm border-b border-indigo-100 pb-2 mt-0">
                  {isVi ? "Thông Tin Thanh Toán Gói EDU - 4sCompany" : "EDU Subscription Payment Details - 4sCompany"}
                </h4>

                {/* Email content entered by user */}
                <div className="whitespace-pre-line text-slate-700 my-3 font-normal leading-relaxed">
                  {body}
                </div>

                {/* Bank Transfer Box (matches BE generated code) */}
                {isPreparing ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center my-4 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto" />
                    <div className="h-3.5 bg-slate-200 rounded w-2/3 mx-auto" />
                    <div className="h-28 w-28 bg-slate-200 rounded-lg mx-auto" />
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-250 rounded-xl p-5 text-center my-4 space-y-4">
                    <h5 className="font-bold text-slate-700 text-xs mt-0">{isVi ? "Thông tin chuyển khoản" : "Bank Transfer Details"}</h5>
                    
                    <div className="space-y-1 text-slate-650 text-xs">
                      <p><strong>{isVi ? "Số tiền:" : "Amount:"}</strong> <span className="text-rose-500 font-extrabold text-[15px]">{fmtVND(totalPrice)}</span></p>
                      <p><strong>{isVi ? "Nội dung chuyển khoản (Transaction Code):" : "Memo (Transaction Code):"}</strong> <span className="text-blue-600 font-mono font-bold text-xs">{registration.id}</span></p>
                    </div>

                    {/* QR Code image — compact2 template includes bank logo, account name, transfer amount */}
                    <div className="flex justify-center my-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-3xs overflow-hidden">
                        <img
                          alt="Mã QR Chuyển Tiền"
                          className="w-48 h-auto object-contain block mx-auto"
                          src={qrCodeUrl}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Footer */}
                <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 mt-4 text-center font-medium">
                  {isVi 
                    ? "Đây là email tự động từ hệ thống của 4sCompany. Vui lòng không trả lời trực tiếp email này."
                    : "This is an automated email from the 4sCompany system. Please do not reply directly to this email."}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
