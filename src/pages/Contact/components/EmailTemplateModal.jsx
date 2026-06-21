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

  useEffect(() => {
    if (registration) {
      setSubject(
        isVi
          ? `[4S Career Guidance] Báo giá giải pháp hướng nghiệp - ${registration.schoolName}`
          : `[4S Career Guidance] Career Guidance Proposal - ${registration.schoolName}`
      );
      setBody(
        isVi
          ? `Kính gửi thầy/cô đại diện trường ${registration.schoolName},\n\nBan Tiếp Nhận 4S xin gửi lời chào trân trọng nhất.\n\nChúng tôi xin gửi kèm bảng báo giá chi tiết và thông tin chuyển khoản dành cho gói cước "${registration.planName}" đăng ký cho ${registration.studentCount} học sinh của quý trường.\n\nQuý trường có thể xem báo giá và thanh toán trực tuyến qua mã QR tại Cổng thanh toán trường học: ${window.location.origin}/school-payment/${registration.id}\n\nThông tin thanh toán chuyển khoản thủ công:\n- Số tài khoản: 190367899999\n- Ngân hàng: Techcombank\n- Chủ tài khoản: CONG TY CP HUONG NGHIEP 4S\n- Số tiền: ${fmtVND(registration.price)}\n- Nội dung chuyển khoản: ${registration.id}\n\nSau khi chuyển khoản thành công hoặc xác nhận từ cổng thanh toán, mã kích hoạt khóa học (Activation Key) sẽ được gửi lại cho quý trường qua email này.\n\nTrân trọng,\nBan Tiếp Nhận 4S Career Guidance.`
          : `Dear representative of ${registration.schoolName},\n\n4S Career Guidance Team would like to send you our warmest greetings.\n\nWe would like to send the detailed proposal and payment instructions for the "${registration.planName}" subscription for ${registration.studentCount} students of your school.\n\nYou can review the detailed proposal and make payment online via QR code at our School Payment Portal: ${window.location.origin}/school-payment/${registration.id}\n\nBank transfer details for manual payments:\n- Account number: 190367899999\n- Bank: Techcombank\n- Account name: 4S HUONG NGHIEP CORP\n- Total amount: ${fmtVND(registration.price)}\n- Transfer note: ${registration.id}\n\nUpon successful verification, the Activation Key will be generated and sent to you automatically.\n\nBest regards,\n4S Career Guidance Team.`
      );
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

  // Generate QR code for B2B School Payment Portal link
  const portalUrl = `${window.location.origin}/school-payment/${registration.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(portalUrl)}`;

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
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                  type="submit"
                >
                  {isVi ? "Gửi Email & Báo Giá" : "Send Email & Quote"}
                </button>
              </div>
            </div>
          </form>

          {/* Column Right: PDF Quote Preview */}
          <div className="bg-white rounded-2xl border border-slate-250 p-6.5 shadow-2xs font-serif flex flex-col justify-between relative min-h-[460px]">
            {/* Paper Watermark Decor */}
            <div className="absolute top-2 right-2 rounded-lg border border-slate-100 bg-slate-50/50 px-2 py-0.5 text-[9px] font-sans font-bold text-slate-400 select-none">
              PDF PREVIEW
            </div>

            <div className="space-y-5">
              {/* PDF Header */}
              <div className="flex items-start justify-between gap-3 border-b-2 border-slate-900 pb-3">
                <div className="font-sans">
                  <h4 className="font-extrabold text-sm text-slate-900 leading-none">4S CAREER GROUP</h4>
                  <p className="text-[9px] text-slate-500 mt-1 font-semibold">4S Career Guidance & AI Solutions</p>
                  <p className="text-[9px] text-slate-400 font-medium">Techcombank: 190367899999 • Hà Nội</p>
                </div>
                <div className="text-right font-sans">
                  <h4 className="font-extrabold text-sm text-indigo-750 leading-none">{isVi ? "BÁO GIÁ DỊCH VỤ" : "PROPOSAL QUOTE"}</h4>
                  <p className="text-[10px] text-slate-900 font-bold mt-1.5">{registration.id}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{todayStr}</p>
                </div>
              </div>

              {/* School Client Info */}
              <div className="text-xs space-y-1 font-sans">
                <div className="flex"><span className="w-24 text-slate-450 font-bold uppercase tracking-wider">{isVi ? "Khách hàng:" : "Client:"}</span><span className="font-bold text-slate-950">{registration.schoolName}</span></div>
                <div className="flex"><span className="w-24 text-slate-450 font-bold uppercase tracking-wider">{isVi ? "Đại diện:" : "Rep:"}</span><span className="font-semibold text-slate-800">{registration.representative} ({registration.phoneNumber})</span></div>
                <div className="flex"><span className="w-24 text-slate-450 font-bold uppercase tracking-wider">Email:</span><span className="font-medium text-slate-700">{registration.email}</span></div>
              </div>

              {/* Items Table */}
              <div className="overflow-hidden border border-slate-200 rounded-lg font-sans">
                <table className="min-w-full text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="px-3 py-2 text-left">{isVi ? "Hạng mục / Gói cước" : "Item / Service"}</th>
                      <th className="px-2 py-2 text-right">{isVi ? "Số lượng" : "Qty"}</th>
                      <th className="px-3 py-2 text-right">{isVi ? "Đơn giá" : "Rate"}</th>
                      <th className="px-3 py-2 text-right">{isVi ? "Thành tiền" : "Amount"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700 bg-white font-medium">
                    <tr>
                      <td className="px-3 py-2.5">
                        <p className="font-bold text-slate-900">{registration.planName}</p>
                        <p className="text-[9px] text-slate-400 font-medium">Hệ thống trắc nghiệm hướng nghiệp & AI</p>
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold">{registration.studentCount} HS</td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">{fmtVND(unitPrice)}</td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap font-semibold">{fmtVND(priceBeforeTax)}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-3 py-2 text-right font-bold text-slate-500" colSpan={3}>Tạm tính (Chưa VAT 10%)</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap font-bold text-slate-650">{fmtVND(priceBeforeTax)}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-3 py-2 text-right font-bold text-slate-500" colSpan={3}>Thuế GTGT (VAT 10%)</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap font-bold text-slate-650">{fmtVND(vatAmount)}</td>
                    </tr>
                    <tr className="bg-indigo-50/30">
                      <td className="px-3 py-2 text-right font-extrabold text-slate-900" colSpan={3}>{isVi ? "TỔNG THÀNH TIỀN" : "TOTAL AMOUNT"}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap font-black text-indigo-700">{fmtVND(totalPrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* QR Payment info */}
            <div className="mt-5 border-t border-dashed border-slate-300 pt-4 flex items-center justify-between gap-5 font-sans bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <div className="space-y-1 text-3xs min-w-0 flex-1 leading-relaxed">
                <h5 className="font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 leading-none text-2xs mb-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  {isVi ? "CỔNG THANH TOÁN TRƯỜNG HỌC" : "SCHOOL PAYMENT PORTAL"}
                </h5>
                <p className="text-indigo-650 font-bold mt-1 truncate">
                  Link: 4s.vn/school-payment/{registration.id}
                </p>
              </div>

              {/* Portal Link QR preview image */}
              <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs">
                <img
                  alt="Portal Link QR"
                  className="h-20 w-20 object-contain block"
                  src={qrCodeUrl}
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
