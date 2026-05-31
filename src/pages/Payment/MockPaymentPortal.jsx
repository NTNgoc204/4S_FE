import { useState } from "react";
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

  const handleConfirmTransfer = () => {
    if (code) {
      dispatch(
        confirmPaymentRequest({
          code,
          onSuccess: () => {
            // Callback handled inside Saga
          },
        })
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#040d1a] py-10 px-4">
      {/* Mobile Frame Simulator */}
      <div className="relative mx-auto w-[min(380px,100%)] min-h-[620px] rounded-[40px] border-8 border-slate-800 bg-[#0b192e] p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-slate-800 rounded-b-2xl z-10" />

        {/* Top Header */}
        <div className="pt-4 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffe16d] to-[#deb320] text-[#0f2d4a] font-extrabold text-sm shadow-md">
            MBANK
          </div>
          <h1 className="mt-3 font-['Sora'] text-lg font-bold text-slate-100">
            Mock Mobile Gateway
          </h1>
          <p className="text-xs text-slate-400">Secure Simulated Payment Portal</p>
        </div>

        {/* Success State */}
        {confirmPaymentSuccess ? (
          <div className="my-auto text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400">
              <svg aria-hidden="true" className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
            <h2 className="font-['Sora'] text-base font-bold text-slate-100 mb-2">
              Transfer Confirmed
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed px-4">
              Thành thanh toán thành công trên điện thoại!
            </p>
            <p className="text-[11px] text-slate-400 mt-4 px-2 leading-relaxed">
              Yêu cầu đã được xác thực bởi Backend. Vui lòng quay lại trình duyệt máy tính để xem kết quả kích hoạt dịch vụ.
            </p>
          </div>
        ) : (
          /* Transaction info */
          <div className="my-auto space-y-5">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4.5 space-y-3.5 text-xs text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Đơn vị thụ hưởng:</span>
                <span className="font-semibold text-slate-100">4S Career Service</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Gói đăng ký:</span>
                <span className="font-semibold text-[#f2cb36]">{plan || "Premium Plan"}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Số tiền:</span>
                <span className="font-bold text-slate-100">${amount || "0.00"} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mã giao dịch (Nội dung):</span>
                <span className="font-mono font-semibold text-[#0ed8ab]">{code || "N/A"}</span>
              </div>
            </div>

            {confirmPaymentError && (
              <p className="text-center text-xs text-rose-400 leading-relaxed">
                {confirmPaymentError}
              </p>
            )}

            <p className="text-[11px] text-slate-400 text-center leading-relaxed px-2">
              Bằng cách click nút dưới đây, bạn mô phỏng quá trình thực hiện chuyển khoản thành công từ tài khoản ngân hàng di động của bạn.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        {!confirmPaymentSuccess && (
          <div className="pb-2">
            <button
              onClick={handleConfirmTransfer}
              disabled={confirmPaymentLoading || !code}
              className="w-full rounded-2xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] py-3.5 text-sm font-semibold text-[#112542] hover:brightness-110 disabled:opacity-50 transition shadow-lg"
              type="button"
            >
              {confirmPaymentLoading ? "Processing Transfer..." : "Xác nhận Đã Chuyển Tiền"}
            </button>
          </div>
        )}

        {confirmPaymentSuccess && (
          <div className="pb-2 text-center text-[10px] text-slate-500">
            MBank System • Powered by 4S Career
          </div>
        )}

      </div>
    </main>
  );
}

export default MockPaymentPortal;
