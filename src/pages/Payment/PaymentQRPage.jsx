import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  cancelPaymentRequest,
  resetPaymentState,
} from "../../feature/plan/planSlice";
import { getMeRequest } from "../../feature/auth/authSlice";
import { addNotificationRequest } from "../../feature/notification/notificationSlice";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/apiClient";
import { QRCodeSVG } from "qrcode.react";
import vietQrFrame from "../../assets/Gemini_Generated_Image_cxxynrcxxynrcxxy.png";

function PaymentQRPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { plan: currentUserPlan } = useSelector((state) => state.auth);
  const { paymentInfo } = useSelector((state) => state.plan);

  // Component states
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (PayOS link expiry)

  // Refs for tracking intervals and timeouts
  const countdownIntervalRef = useRef(null);
  const paymentEnded = useRef(false);
  const initialPlanRef = useRef(null);

  // Redirect back if paymentInfo is not present
  useEffect(() => {
    if (!paymentInfo) {
      toast.warning(
        t(
          "checkout:errors.noPaymentInfo",
          "Không tìm thấy thông tin giao dịch thanh toán!",
        ),
      );
      navigate("/pricing");
    } else {
      paymentEnded.current = false;
    }
  }, [paymentInfo, navigate, t]);

  // Capture initial plan if it loads late without rerendering the QR page.
  useEffect(() => {
    if (paymentInfo && currentUserPlan && initialPlanRef.current === null) {
      initialPlanRef.current = currentUserPlan;
    }
  }, [paymentInfo, currentUserPlan]);

  // 1. Countdown Timer
  useEffect(() => {
    if (paymentInfo) {
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            if (!paymentEnded.current) {
              paymentEnded.current = true;

              if (paymentInfo?.transactionCode) {
                dispatch(
                  cancelPaymentRequest({ code: paymentInfo.transactionCode }),
                );
                dispatch(
                  addNotificationRequest({
                    titleKey: "notifications:payment.expired.title",
                    titleDefault: "Thanh toán hết hạn",
                    messageKey: "notifications:payment.expired.message",
                    messageDefault:
                      "Phiên thanh toán cho gói {{plan}} đã hết hạn và bị hủy bỏ.",
                    messageParams: { plan: paymentInfo.planName },
                    type: "warning",
                  }),
                );
              }
              toast.error(
                t("checkout:expired.toast", "Giao dịch thanh toán đã hết hạn!"),
              );
              dispatch(resetPaymentState());
              navigate("/");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [paymentInfo, dispatch, navigate, t]);

  // 2. Check if plan has changed from another source.
  useEffect(() => {
    const initialPlan = initialPlanRef.current;

    if (paymentInfo && initialPlan) {
      const hasPlanUpgraded =
        currentUserPlan !== initialPlan &&
        currentUserPlan !== "" &&
        currentUserPlan?.toUpperCase() !== "FREE";

      if (hasPlanUpgraded && !paymentEnded.current) {
        paymentEnded.current = true;

        // Stop timer
        if (countdownIntervalRef.current)
          clearInterval(countdownIntervalRef.current);

        dispatch(
          addNotificationRequest({
            titleKey: "notifications:payment.success.title",
            titleDefault: "Thanh toán thành công",
            messageKey: "notifications:payment.success.message",
            messageDefault:
              "Gói {{plan}} của bạn đã được kích hoạt thành công!",
            messageParams: { plan: paymentInfo.planName },
            type: "success",
          }),
        );

        toast.success(t("checkout:success.toast", "Thanh toán thành công!"));
        dispatch(resetPaymentState());
        navigate("/");
      }
    }
  }, [currentUserPlan, paymentInfo, dispatch, navigate, t]);

  // 3. SignalR Hub connection for instant real-time notifications
  useEffect(() => {
    if (!paymentInfo) return undefined;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/payment-hub`)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("Connected to payment hub successfully.");
        connection
          .invoke("JoinPaymentGroup", paymentInfo.transactionCode)
          .catch((err) =>
            console.error("Error joining SignalR payment group:", err),
          );
      })
      .catch((err) => console.error("SignalR connection failed:", err));

    connection.on("PaymentConfirmed", () => {
      if (!paymentEnded.current) {
        paymentEnded.current = true;

        // Stop timer
        if (countdownIntervalRef.current)
          clearInterval(countdownIntervalRef.current);

        dispatch(
          addNotificationRequest({
            titleKey: "notifications:payment.success.title",
            titleDefault: "Thanh toán thành công",
            messageKey: "notifications:payment.success.message",
            messageDefault:
              "Gói {{plan}} của bạn đã được kích hoạt thành công!",
            messageParams: { plan: paymentInfo.planName },
            type: "success",
          }),
        );

        toast.success(t("checkout:success.toast", "Thanh toán thành công!"));
        dispatch(getMeRequest());
        dispatch(resetPaymentState());
        navigate("/");
      }
    });

    connection.on("PaymentFailed", (data) => {
      if (!paymentEnded.current) {
        paymentEnded.current = true;

        // Stop timer
        if (countdownIntervalRef.current)
          clearInterval(countdownIntervalRef.current);

        dispatch(
          addNotificationRequest({
            titleKey: "notifications:payment.expired.title",
            titleDefault: "Thanh toán thất bại",
            messageKey: "notifications:payment.expired.message",
            messageDefault:
              "Giao dịch thanh toán cho gói {{plan}} đã bị hủy hoặc hết hạn.",
            messageParams: { plan: paymentInfo.planName },
            type: "warning",
          }),
        );

        toast.error(
          data?.message ||
            t("checkout:expired.toast", "Giao dịch thanh toán đã hết hạn!"),
        );
        dispatch(resetPaymentState());
        navigate("/");
      }
    });

    return () => {
      connection
        .stop()
        .then(() => console.log("SignalR connection stopped."))
        .catch((err) =>
          console.error("Error stopping SignalR connection:", err),
        );
    };
  }, [paymentInfo, dispatch, navigate, t]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} đã được sao chép vào bộ nhớ tạm!`);
  };

  if (!paymentInfo) {
    return null;
  }

  return (
    <main className="mx-auto w-[min(650px,95vw)] pb-24 pt-10">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#1b314f]/80 to-[#102138]/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <h1 className="font-['Sora'] text-2xl font-bold text-slate-100 mb-2">
            {t("checkout:qrcode.title", "Quét mã QR để Thanh toán")}
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            {t(
              "checkout:qrcode.subtitle",
              "Vui lòng mở ứng dụng ngân hàng hoặc ví điện tử để thanh toán.",
            )}
          </p>

          {/* QR Card */}
          <div className="relative mx-auto mb-7 aspect-[960/1079] w-[min(430px,92vw)] overflow-hidden rounded-[24px] shadow-[0_34px_90px_rgba(0,0,0,0.55)]">
            <img
              src={vietQrFrame}
              alt="VietQR payment frame"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute left-[20.8%] top-[20%] flex aspect-square w-[59%] items-center justify-center bg-[#F0EFEA] p-[3%] rounded-[24px]">
              {paymentInfo.qrCode ? (
                <QRCodeSVG
                  value={paymentInfo.qrCode}
                  size={260}
                  level="H"
                  includeMargin={false}
                  className="h-full w-full bg-white"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white px-4 text-center text-sm text-slate-400">
                  {t("checkout:qrcode.generating", "Äang táº£i mÃ£ QR...")}
                </div>
              )}
            </div>
            <div className="hidden">
              <div className="pointer-events-none absolute inset-2 rounded-[24px] border border-[#f6d878]/60" />
              <div className="pointer-events-none absolute inset-4 rounded-[20px] border border-[#f6d878]/25" />
              <div className="pointer-events-none absolute left-5 top-5 h-16 w-16 rounded-tl-[18px] border-l-2 border-t-2 border-[#f6d878]/80" />
              <div className="pointer-events-none absolute right-5 top-5 h-16 w-16 rounded-tr-[18px] border-r-2 border-t-2 border-[#f6d878]/80" />
              <div className="pointer-events-none absolute bottom-5 left-5 h-16 w-16 rounded-bl-[18px] border-b-2 border-l-2 border-[#f6d878]/80" />
              <div className="pointer-events-none absolute bottom-5 right-5 h-16 w-16 rounded-br-[18px] border-b-2 border-r-2 border-[#f6d878]/80" />
              <div className="pointer-events-none absolute -left-12 top-28 h-44 w-44 rounded-full border border-[#f6d878]/20" />
              <div className="pointer-events-none absolute -right-12 top-28 h-44 w-44 rounded-full border border-[#f6d878]/20" />
              <svg
                className="pointer-events-none absolute left-5 top-5 h-32 w-32 text-[#dec47c]"
                viewBox="0 0 120 120"
                fill="none"
              >
                <path d="M10 106V14h92" stroke="currentColor" strokeWidth="3" />
                <path
                  d="M20 96V24h72"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity=".75"
                />
                <path
                  d="M24 88C40 67 55 44 96 28"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity=".85"
                />
                <path
                  d="M24 74c26-5 44-18 58-42M36 92c10-24 25-41 47-55"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  opacity=".65"
                />
                <path
                  d="M31 31c11 5 18 12 22 24-18-3-27-10-22-24Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M58 24c9 9 12 20 9 32-13-8-17-18-9-32Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
              <svg
                className="pointer-events-none absolute right-5 top-5 h-32 w-32 scale-x-[-1] text-[#dec47c]"
                viewBox="0 0 120 120"
                fill="none"
              >
                <path d="M10 106V14h92" stroke="currentColor" strokeWidth="3" />
                <path
                  d="M20 96V24h72"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity=".75"
                />
                <path
                  d="M24 88C40 67 55 44 96 28"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity=".85"
                />
                <path
                  d="M24 74c26-5 44-18 58-42M36 92c10-24 25-41 47-55"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  opacity=".65"
                />
                <path
                  d="M31 31c11 5 18 12 22 24-18-3-27-10-22-24Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M58 24c9 9 12 20 9 32-13-8-17-18-9-32Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
              <div className="pointer-events-none absolute left-8 top-[178px] h-52 w-24 rounded-l-full border-y border-l border-[#dec47c]/55" />
              <div className="pointer-events-none absolute right-8 top-[178px] h-52 w-24 rounded-r-full border-y border-r border-[#dec47c]/55" />
              <svg
                className="pointer-events-none absolute left-8 top-[180px] h-56 w-24 text-[#dec47c]"
                viewBox="0 0 90 210"
                fill="none"
              >
                <path
                  d="M82 8C42 48 20 94 9 202"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity=".65"
                />
                <path
                  d="M78 36 20 86M74 63 15 116M68 95 12 150M58 128 10 180"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  opacity=".55"
                />
                <path
                  d="M82 8 58 54 40 25 25 82 10 52"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  opacity=".7"
                />
                <path
                  d="M71 164 42 126 24 172 11 142"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  opacity=".7"
                />
              </svg>
              <svg
                className="pointer-events-none absolute right-8 top-[180px] h-56 w-24 scale-x-[-1] text-[#dec47c]"
                viewBox="0 0 90 210"
                fill="none"
              >
                <path
                  d="M82 8C42 48 20 94 9 202"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity=".65"
                />
                <path
                  d="M78 36 20 86M74 63 15 116M68 95 12 150M58 128 10 180"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  opacity=".55"
                />
                <path
                  d="M82 8 58 54 40 25 25 82 10 52"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  opacity=".7"
                />
                <path
                  d="M71 164 42 126 24 172 11 142"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  opacity=".7"
                />
              </svg>
              <svg
                className="pointer-events-none absolute bottom-7 left-7 h-28 w-32 scale-y-[-1] text-[#dec47c]"
                viewBox="0 0 120 100"
                fill="none"
              >
                <path d="M8 90V15h95" stroke="currentColor" strokeWidth="3" />
                <path
                  d="M18 80V25h78"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity=".75"
                />
                <path
                  d="M20 73C39 54 63 36 100 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity=".75"
                />
                <path
                  d="M31 78c14-25 32-41 62-53M19 48c20 4 36 0 48-16"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  opacity=".58"
                />
                <path
                  d="M24 27c11 4 18 11 20 23-15-3-23-10-20-23Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
              <svg
                className="pointer-events-none absolute bottom-7 right-7 h-28 w-32 scale-[-1] text-[#dec47c]"
                viewBox="0 0 120 100"
                fill="none"
              >
                <path d="M8 90V15h95" stroke="currentColor" strokeWidth="3" />
                <path
                  d="M18 80V25h78"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity=".75"
                />
                <path
                  d="M20 73C39 54 63 36 100 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity=".75"
                />
                <path
                  d="M31 78c14-25 32-41 62-53M19 48c20 4 36 0 48-16"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  opacity=".58"
                />
                <path
                  d="M24 27c11 4 18 11 20 23-15-3-23-10-20-23Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>

              <div className="relative pb-3 pt-2 text-center">
                <div className="mx-auto mb-2 h-px w-44 bg-gradient-to-r from-transparent via-[#f6d878]/80 to-transparent" />
                <div className="font-serif text-[44px] font-black italic leading-none tracking-tight text-[#dfc173] drop-shadow-[0_4px_0_rgba(0,0,0,0.38)]">
                  Viet<span className="not-italic text-slate-100">QR</span>
                </div>
                <div className="mx-auto mt-2 h-px w-52 bg-gradient-to-r from-transparent via-[#f6d878]/70 to-transparent" />
              </div>

              <div className="relative mx-auto mt-6 w-[82%] rounded-[32px] border-2 border-[#d7b763] bg-[#f8f6ef] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8),0_18px_32px_rgba(0,0,0,0.38)]">
                {paymentInfo.qrCode ? (
                  <QRCodeSVG
                    value={paymentInfo.qrCode}
                    size={260}
                    level="H"
                    includeMargin={false}
                    className="mx-auto h-auto w-full max-w-[260px] bg-white"
                  />
                ) : (
                  <div className="mx-auto flex h-[260px] w-[260px] items-center justify-center bg-white text-sm text-slate-400">
                    {t("checkout:qrcode.generating", "Đang tải mã QR...")}
                  </div>
                )}
              </div>

              <svg
                className="pointer-events-none relative -mt-3 mx-auto h-8 w-28 text-[#dec47c]"
                viewBox="0 0 120 36"
                fill="none"
              >
                <path
                  d="M60 34C53 21 42 12 23 8c17-4 30-1 37 12C67 7 80 4 97 8 78 12 67 21 60 34Z"
                  fill="currentColor"
                  opacity=".34"
                />
                <path
                  d="M8 15h44M68 15h44"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity=".75"
                />
                <path
                  d="M60 31C55 19 48 12 35 8M60 31C65 19 72 12 85 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity=".8"
                />
              </svg>

              <div className="relative mt-3 grid grid-cols-[1fr_auto_1fr] items-center px-16 pb-3">
                <div className="text-right">
                  <p className="text-[34px] font-black italic leading-none tracking-tight text-[#c9ab62] drop-shadow-[0_3px_0_rgba(0,0,0,0.45)]">
                    napas
                  </p>
                </div>
                <div className="mx-8 flex h-9 w-9 items-center justify-center text-[#c9ab62] drop-shadow-[0_3px_0_rgba(0,0,0,0.45)]">
                  <span className="text-4xl font-black leading-none">*</span>
                </div>
                <div className="text-left">
                  <p className="text-[34px] font-black italic leading-none tracking-tight text-[#c9ab62] drop-shadow-[0_3px_0_rgba(0,0,0,0.45)]">
                    VISA
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-5 left-1/2 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#dec47c]/80 to-transparent" />
            </div>
          </div>

          {/* Countdown timer */}
          <div className="mb-6">
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              {t("checkout:timer.label", "Thời gian còn lại")}
            </p>
            <p className="text-2xl font-mono font-bold text-rose-400 mt-1">
              {formatTime(timeLeft)}
            </p>
          </div>

          {/* Payment detail stats */}
          <div className="text-left rounded-xl bg-white/5 p-5 border border-white/5 space-y-3.5 mb-6 text-sm">
            {(paymentInfo.bankName || paymentInfo.bank) && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">
                  {t("checkout:paymentDetails.bankName", "Ngân hàng")}:
                </span>
                <span className="font-semibold text-slate-200 uppercase">
                  {paymentInfo.bankName || paymentInfo.bank}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">
                {t("checkout:paymentDetails.accountNumber", "Số tài khoản")}:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-slate-200">
                  {paymentInfo.accountNumber}
                </span>
                <button
                  onClick={() =>
                    handleCopyText(
                      paymentInfo.accountNumber,
                      t("checkout:labels.accountNumber", "Số tài khoản"),
                    )
                  }
                  className="p-1 rounded bg-white/10 text-slate-300 hover:bg-white/20 transition cursor-pointer"
                  title={t("checkout:actions.copy", "Sao chép")}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">
                {t("checkout:paymentDetails.accountName", "Chủ tài khoản")}:
              </span>
              <span className="font-semibold text-slate-200 uppercase">
                {paymentInfo.accountName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">
                {t("checkout:paymentDetails.amount", "Số tiền")}:
              </span>
              <span className="font-semibold text-slate-200">
                {paymentInfo.amount
                  ? `${paymentInfo.amount.toLocaleString("vi-VN")} VND`
                  : ""}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">
                {t("checkout:paymentDetails.code", "Nội dung chuyển khoản")}:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-[#ecc741]">
                  {paymentInfo.description || paymentInfo.transactionCode}
                </span>
                <button
                  onClick={() =>
                    handleCopyText(
                      paymentInfo.description || paymentInfo.transactionCode,
                      t("checkout:labels.description", "Nội dung chuyển khoản"),
                    )
                  }
                  className="p-1 rounded bg-white/10 text-slate-300 hover:bg-white/20 transition cursor-pointer"
                  title={t("checkout:actions.copy", "Sao chép")}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center text-xs text-slate-500 animate-pulse">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t("checkout:polling.status", "Đang chờ thanh toán trực tuyến...")}
          </div>
        </div>
      </div>
    </main>
  );
}

export default PaymentQRPage;
