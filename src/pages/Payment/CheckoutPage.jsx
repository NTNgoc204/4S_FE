import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPlansRequest, createPaymentRequest, cancelPaymentRequest, resetPaymentState } from "../../feature/plan/planSlice";
import { getMeRequest } from "../../feature/auth/authSlice";
import { addNotificationRequest } from "../../feature/notification/notificationSlice";
import Skeleton from "../../components/Skeleton";

function CheckoutPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");

  // Redux state
  const { user, plan: currentUserPlan, loading: authLoading } = useSelector((state) => state.auth);
  const { plans, paymentInfo, createPaymentLoading, createPaymentError, loading: plansLoading } = useSelector((state) => state.plan);

  // Component states
  const [step, setStep] = useState("details"); // details, qrcode, success, expired
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [redirectCount, setRedirectCount] = useState(3);

  // Refs for tracking intervals and timeouts
  const pollingIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const initialPlanRef = useRef(currentUserPlan);

  // Fetch plans if empty
  useEffect(() => {
    if (plans.length === 0) {
      dispatch(getPlansRequest());
    }
  }, [dispatch, plans.length]);

  // Find selected plan details
  useEffect(() => {
    if (plans.length > 0 && planId) {
      const found = plans.find((p) => p.id === planId || p.name?.toLowerCase() === planId?.toLowerCase());
      if (found) {
        setSelectedPlan(found);
      }
    }
  }, [plans, planId]);

  // Track paymentInfo to advance step
  useEffect(() => {
    if (paymentInfo) {
      setStep("qrcode");
      setTimeLeft(600); // Reset timer to 10 mins
    }
  }, [paymentInfo]);

  // Handle countdown timer & polling for qrcode step
  useEffect(() => {
    if (step === "qrcode" && paymentInfo) {
      // 1. Countdown Timer
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            if (paymentInfo?.transactionCode) {
              dispatch(cancelPaymentRequest({ code: paymentInfo.transactionCode }));
              dispatch(
                addNotificationRequest({
                  titleKey: "notifications:payment.expired.title",
                  titleDefault: "Thanh toán hết hạn",
                  messageKey: "notifications:payment.expired.message",
                  messageDefault: "Phiên thanh toán cho gói {{plan}} đã hết hạn và bị hủy bỏ.",
                  messageParams: { plan: paymentInfo.planName },
                  type: "warning",
                })
              );
            }
            setStep("expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Record initial plan before polling
      initialPlanRef.current = currentUserPlan;

      // 2. Real-time Polling
      pollingIntervalRef.current = setInterval(() => {
        dispatch(getMeRequest());
      }, 3000);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [step, paymentInfo, dispatch]);

  // Check if plan has changed to success state
  useEffect(() => {
    if (step === "qrcode" && paymentInfo) {
      const hasPlanUpgraded = 
        currentUserPlan !== initialPlanRef.current && 
        currentUserPlan !== "" && 
        currentUserPlan?.toUpperCase() !== "FREE";

      if (hasPlanUpgraded) {
        // Stop polling and timer
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        // Add to notification system
        dispatch(
          addNotificationRequest({
            titleKey: "notifications:payment.success.title",
            titleDefault: "Thanh toán thành công",
            messageKey: "notifications:payment.success.message",
            messageDefault: "Gói {{plan}} của bạn đã được kích hoạt thành công!",
            messageParams: { plan: paymentInfo.planName },
            type: "success",
          })
        );

        setStep("success");
        dispatch(resetPaymentState());
      }
    }
  }, [currentUserPlan, step, paymentInfo, dispatch, t]);

  // Countdown redirect on success
  useEffect(() => {
    let redirectTimer;
    if (step === "success") {
      redirectTimer = setInterval(() => {
        setRedirectCount((prev) => {
          if (prev <= 1) {
            clearInterval(redirectTimer);
            navigate("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (redirectTimer) clearInterval(redirectTimer);
    };
  }, [step, navigate]);

  // Clean up payment status on unmount
  useEffect(() => {
    return () => {
      dispatch(resetPaymentState());
    };
  }, [dispatch]);

  const handleConfirmRegistration = () => {
    if (selectedPlan) {
      dispatch(createPaymentRequest({ planId: selectedPlan.id }));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // UI mappings
  const showUserSkeleton = authLoading && !user;
  const showPlanSkeleton = plansLoading && !selectedPlan;

  const planDisplayName = showPlanSkeleton ? "..." : selectedPlan?.name === "PRO" ? "Pro Pack" : selectedPlan?.name === "EDU" ? "Edu Pack" : selectedPlan?.name || "...";

  return (
    <main className="mx-auto w-[min(650px,95vw)] pb-24 pt-10">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#1b314f]/80 to-[#102138]/90 p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Step 1: Details */}
        {step === "details" && (
          <div>
            <h1 className="font-['Sora'] text-2xl font-bold text-slate-100 text-center mb-6">
              {t("checkout:title", "Xác nhận Thông tin Đăng ký")}
            </h1>

            {/* User Info card */}
            <div className="mb-6 rounded-2xl border border-white/5 bg-white/5 p-5">
              <h2 className="text-sm font-semibold text-[#f2cb36] uppercase tracking-wider mb-3">
                {t("checkout:userInfo.title", "Thông tin khách hàng")}
              </h2>
              <div className="space-y-2.5 text-sm text-slate-200">
                <div className="flex items-center justify-between h-5">
                  <span className="text-slate-400">{t("checkout:userInfo.name", "Họ và tên")}:</span>
                  <span className="font-medium text-slate-200">
                    {showUserSkeleton ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      user?.username || user?.email?.split('@')[0]
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between h-5">
                  <span className="text-slate-400">{t("checkout:userInfo.email", "Email")}:</span>
                  <span className="font-medium text-slate-200">
                    {showUserSkeleton ? (
                      <Skeleton className="h-4 w-48" />
                    ) : (
                      user?.email
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Info card */}
            <div className="mb-8 rounded-2xl border border-white/5 bg-white/5 p-5">
              <h2 className="text-sm font-semibold text-[#f2cb36] uppercase tracking-wider mb-3">
                {t("checkout:planInfo.title", "Thông tin gói dịch vụ")}
              </h2>
              <div className="space-y-2.5 text-sm text-slate-200">
                <div className="flex items-center justify-between h-5">
                  <span className="text-slate-400">{t("checkout:planInfo.name", "Gói đăng ký")}:</span>
                  <span className="font-semibold text-[#ecc741]">
                    {showPlanSkeleton ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      planDisplayName
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between h-5">
                  <span className="text-slate-400">{t("checkout:planInfo.price", "Đơn giá")}:</span>
                  <span className="font-medium text-slate-200">
                    {showPlanSkeleton ? (
                      <Skeleton className="h-4 w-36" />
                    ) : selectedPlan?.price === 0 ? (
                      t('pricing:plans.edu.price', 'Liên hệ')
                    ) : selectedPlan?.price ? (
                      `${selectedPlan.price.toLocaleString('vi-VN')} VND${selectedPlan.name?.toLowerCase() === 'pro' ? " / tháng" : ""}`
                    ) : (
                      "Custom"
                    )}
                  </span>
                </div>
                {/* VAT row — only when there is a real numeric price */}
                {!showPlanSkeleton && selectedPlan?.price > 0 && (
                  <div className="flex items-center justify-between h-5">
                    <span className="text-slate-400">
                      {t("checkout:planInfo.vat", "VAT (10%)")}:
                    </span>
                    <span className="font-medium text-slate-300">
                      {`+${Math.round(selectedPlan.price * 0.1).toLocaleString('vi-VN')} VND`}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 h-7">
                  <span className="text-slate-400 font-semibold">{t("checkout:planInfo.total", "Tổng tiền")}:</span>
                  <span className="text-lg font-bold text-slate-100">
                    {showPlanSkeleton ? (
                      <Skeleton className="h-5 w-28" />
                    ) : selectedPlan?.price === 0 ? (
                      t('pricing:plans.edu.price', 'Liên hệ')
                    ) : selectedPlan?.price ? (
                      `${Math.round(selectedPlan.price * 1.1).toLocaleString('vi-VN')} VND`
                    ) : (
                      "Custom"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            {createPaymentError && (
              <p className="text-center text-sm text-rose-400 mb-4">{createPaymentError}</p>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/pricing")}
                className="flex-1 rounded-xl border border-white/10 bg-transparent px-5 py-3 font-semibold text-slate-300 hover:bg-white/5 transition"
                type="button"
              >
                {t("checkout:actions.back", "Quay lại")}
              </button>
              <button
                onClick={handleConfirmRegistration}
                disabled={createPaymentLoading || showPlanSkeleton || !selectedPlan}
                className="flex-1 rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-5 py-3 font-semibold text-[#112542] hover:brightness-110 disabled:opacity-50 transition shadow-lg flex items-center justify-center h-12"
                type="button"
              >
                {createPaymentLoading ? (
                  t("checkout:actions.loading", "Đang xử lý...")
                ) : showPlanSkeleton ? (
                  <Skeleton className="h-4 w-32 bg-[#112542]/20" />
                ) : (
                  t("checkout:actions.confirm", "Xác nhận đăng ký")
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: QR Code Scan */}
        {step === "qrcode" && paymentInfo && (
          <div className="text-center">
            <h1 className="font-['Sora'] text-2xl font-bold text-slate-100 mb-2">
              {t("checkout:qrcode.title", "Quét mã QR để Thanh toán")}
            </h1>
            <p className="text-sm text-slate-400 mb-6">
              {t("checkout:qrcode.subtitle", "Vui lòng mở ứng dụng ngân hàng hoặc ví điện tử để thanh toán.")}
            </p>

            {/* QR Card */}
            <div className="inline-block rounded-2xl bg-white p-4 mb-6 shadow-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `${window.location.origin}/mock-payment-portal?code=${paymentInfo.transactionCode}&amount=${paymentInfo.amount}&plan=${paymentInfo.planName}`
                )}`}
                alt="Payment QR Code"
                className="h-48 w-48 mx-auto object-contain"
              />
            </div>

            {/* Countdown timer */}
            <div className="mb-6">
              <p className="text-xs text-slate-400 uppercase tracking-widest">{t("checkout:timer.label", "Thời gian còn lại")}</p>
              <p className="text-2xl font-mono font-bold text-rose-400 mt-1">{formatTime(timeLeft)}</p>
            </div>

            {/* Payment detail stats */}
            <div className="text-left rounded-xl bg-white/5 p-4 border border-white/5 space-y-2 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">{t("checkout:paymentDetails.amount", "Số tiền")}:</span>
                <span className="font-semibold text-slate-200">{paymentInfo.amount ? `${paymentInfo.amount.toLocaleString('vi-VN')} VND` : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t("checkout:paymentDetails.code", "Nội dung chuyển khoản")}:</span>
                <span className="font-mono font-semibold text-[#ecc741]">{paymentInfo.transactionCode}</span>
              </div>
            </div>

            {/* Simulate scan link */}
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-slate-400 mb-3">
                {t("checkout:simulation.helper", "Bạn đang test trên máy tính? Hãy click nút dưới đây để giả lập quét mã QR trên điện thoại:")}
              </p>
              <button
                onClick={() =>
                  window.open(
                    `/mock-payment-portal?code=${paymentInfo.transactionCode}&amount=${paymentInfo.amount}&plan=${paymentInfo.planName}`,
                    "_blank"
                  )
                }
                className="rounded-xl border border-[#ecc741]/40 bg-[#ecc741]/12 px-6 py-2.5 text-sm font-semibold text-[#f2cb36] hover:bg-[#ecc741]/25 transition"
                type="button"
              >
                {t("checkout:simulation.action", "Giả lập Quét QR (Mở portal)")}
              </button>
            </div>

            <div className="mt-6 flex justify-center text-xs text-slate-500 animate-pulse">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t("checkout:polling.status", "Đang chờ thanh toán trực tuyến...")}
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === "success" && (
          <div className="text-center py-6">
            {/* Animated Checkmark */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 animate-bounce">
              <svg aria-hidden="true" className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>

            <h1 className="font-['Sora'] text-2xl font-bold text-slate-100 mb-2">
              {t("checkout:success.title", "Đăng ký Gói Thành công!")}
            </h1>
            <p className="text-slate-300 mb-8 max-w-md mx-auto">
              {t("checkout:success.description", "Tài khoản của bạn đã được nâng cấp. Chào mừng bạn đến với trải nghiệm VIP.")}
            </p>

            <p className="text-sm text-slate-400">
              {t("checkout:success.redirect", "Đang tự động chuyển hướng về Trang chủ sau {{count}} giây...", { count: redirectCount })}
            </p>
          </div>
        )}

        {/* Step 4: Expired Screen */}
        {step === "expired" && (
          <div className="text-center py-6">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400">
              <svg aria-hidden="true" className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>

            <h1 className="font-['Sora'] text-2xl font-bold text-slate-100 mb-2">
              {t("checkout:expired.title", "Đơn hàng đã Hết hạn")}
            </h1>
            <p className="text-slate-300 mb-8">
              {t("checkout:expired.description", "Giao dịch thanh toán đã quá hạn 10 phút. Vui lòng tạo lại yêu cầu mới.")}
            </p>

            <button
              onClick={() => {
                setStep("details");
                dispatch(resetPaymentState());
              }}
              className="w-full rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-5 py-3 font-semibold text-[#112542] hover:brightness-110 transition"
              type="button"
            >
              {t("checkout:actions.retry", "Thử lại")}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

export default CheckoutPage;
