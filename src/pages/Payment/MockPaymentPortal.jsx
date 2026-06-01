import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { confirmPaymentRequest } from "../../feature/plan/planSlice";

function MockPaymentPortal() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");
  const amount = searchParams.get("amount");
  const plan = searchParams.get("plan");

  const { confirmPaymentLoading, confirmPaymentSuccess, confirmPaymentError } = useSelector(
    (state) => state.plan
  );

  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Amount is in VND
  const vndVal = parseFloat(amount || "0");
  const formattedVnd = vndVal.toLocaleString("vi-VN");

  const handleConfirmTransfer = () => {
    if (!code) return;
    setIsVerifying(true);
    setSimulatedProgress(0);
  };

  // Simulated bank processing animation before actual confirmation dispatch
  useEffect(() => {
    let interval;
    if (isVerifying && simulatedProgress < 100) {
      interval = setInterval(() => {
        setSimulatedProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Dispatch actual confirmation API once simulated progress completes
            dispatch(
              confirmPaymentRequest({
                code,
                onSuccess: () => {
                  setIsVerifying(false);
                },
              })
            );
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isVerifying, simulatedProgress, code, dispatch]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070e17] py-12 px-4 select-none">
      {/* Cổng thanh toán Container */}
      <div className="relative mx-auto w-full max-w-[420px] rounded-3xl border border-white/10 bg-[#0c1827] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col justify-between">

        {/* Decorative Glowing Backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#f2cb36]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#0ed8ab]/10 rounded-full blur-3xl pointer-events-none" />

        {/* SSL Secure Indicator Header */}
        <div className="w-full bg-[#09111c] py-2 px-4 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-medium text-emerald-400">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            SSL 256-bit Secure Connection
          </div>
          <div className="tracking-wider uppercase font-semibold text-slate-500">VietQR • NAPAS</div>
        </div>

        {/* Brand Header */}
        <div className="p-6 text-center border-b border-white/5 bg-gradient-to-b from-[#09111c]/50 to-transparent">
          <div className="flex items-center justify-center gap-3">
            {/* VietQR Styled Logo */}
            <div className="h-9 px-3 rounded-lg bg-white flex items-center justify-center font-extrabold text-[15px] italic text-[#002f6c] shadow-sm">
              Viet<span className="text-[#e01e26]">QR</span>
            </div>
            {/* NAPAS Logo */}
            <div className="h-9 px-3 rounded-lg bg-[#005baa] flex items-center justify-center font-bold text-[12px] text-white shadow-sm italic tracking-tight">
              napas<span className="text-[#f58220] font-extrabold">247</span>
            </div>
          </div>
          <h1 className="mt-4 font-['Sora'] text-base font-bold text-slate-100 uppercase tracking-wide">
            Cổng Xác Thực Thanh Toán
          </h1>
          <p className="text-[11px] text-slate-400 mt-1">Hệ thống xử lý giao dịch điện tử tự động 24/7</p>
        </div>

        {/* Main Interface Content */}
        <div className="p-6 flex-1 flex flex-col justify-center">
          {confirmPaymentSuccess ? (
            /* SUCCESS STATE */
            <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-emerald-400">
                <svg className="h-10 w-10 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-['Sora'] text-lg font-bold text-slate-100 mb-2">
                Giao Dịch Thành Công
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed px-2">
                Hệ thống đã nhận được tiền và xác thực chuyển khoản thành công.
              </p>

              <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 text-left text-xs text-slate-300 space-y-2 max-w-[320px] mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã bút toán:</span>
                  <span className="font-mono font-medium text-emerald-400">{code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span className="font-semibold text-emerald-400">Đã quyết toán (Settled)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-6 px-2 leading-normal">
                Vui lòng quay lại tab trình duyệt máy tính của bạn. Dịch vụ đã được kích hoạt thành công!
              </p>
            </div>
          ) : isVerifying ? (
            /* VERIFYING STATE */
            <div className="text-center py-10 animate-in fade-in duration-300">
              <div className="relative mx-auto mb-6 h-16 w-16 flex items-center justify-center">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-[#f2cb36] animate-spin" />
                {/* Inner padlock icon */}
                <svg className="h-6 w-6 text-[#f2cb36] animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="font-['Sora'] text-sm font-semibold text-slate-200">
                Đang đối soát giao dịch ngân hàng...
              </h2>
              <div className="mt-4 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#ffe16d] to-[#deb320] h-1.5 transition-all duration-150"
                  style={{ width: `${simulatedProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Tiến độ: {simulatedProgress}%</p>
            </div>
          ) : (
            /* TRANSACTION DETAILS SCREEN */
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Alert banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                Đang chờ khớp lệnh chuyển khoản liên ngân hàng. Quý khách vui lòng kiểm tra thông tin giao dịch dưới đây.
              </div>

              {/* Beneficiary details card */}
              <div className="rounded-2xl border border-white/5 bg-[#09111c]/60 p-4.5 space-y-3 text-xs text-slate-300">
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Đơn vị thụ hưởng:</span>
                  <span className="font-semibold text-slate-100">CÔNG TY TNHH GIÁO DỤC 4S CAREER</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Ngân hàng thụ hưởng:</span>
                  <span className="font-semibold text-slate-100">MB Bank (TMCP Quân Đội)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="font-mono font-semibold text-slate-100">4800119283888</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Gói đăng ký nâng cấp:</span>
                  <span className="font-semibold text-[#f2cb36]">{plan ? `${plan} Pack` : "Premium Plan"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">Tổng số tiền thanh toán:</span>
                  <span className="font-bold text-[#ecc741] text-sm">{formattedVnd} VND</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Nội dung chuyển khoản (Memo):</span>
                  <span className="font-mono font-bold text-[#0ed8ab] text-sm">{code || "N/A"}</span>
                </div>
              </div>

              {/* Error messages */}
              {confirmPaymentError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-xs text-rose-400">
                  {confirmPaymentError}
                </div>
              )}

              {/* Secure Notice */}
              <div className="text-center text-[10.5px] text-slate-500 leading-normal px-2">
                * Sau khi hoàn tất chuyển khoản trên ứng dụng ngân hàng di động, quý khách nhấn nút xác nhận bên dưới để gửi lệnh đối soát NAPAS tự động.
              </div>
            </div>
          )}
        </div>

        {/* CTA Verification Trigger */}
        {!confirmPaymentSuccess && !isVerifying && (
          <div className="p-6 pt-0">
            <button
              onClick={handleConfirmTransfer}
              disabled={confirmPaymentLoading || !code}
              className="w-full rounded-2xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] py-4 text-sm font-semibold text-[#112542] hover:brightness-110 disabled:opacity-50 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#ffe16d]/10"
              type="button"
            >
              {confirmPaymentLoading ? "Đang xử lý đối soát..." : "Tôi Đã Chuyển Khoản Thành Công"}
            </button>
          </div>
        )}

        {/* Footer info branding */}
        <div className="py-4 bg-[#09111c] border-t border-white/5 text-center text-[10px] text-slate-500">
          Hệ thống NAPAS247 QuickLink Security Protection • 2026
        </div>

      </div>
    </main>
  );
}

export default MockPaymentPortal;
