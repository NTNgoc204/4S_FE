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
import spinnerIcon from "../../assets/spinner.svg";
import PaymentQRReceiptTemplate from "./components/PaymentQRReceiptTemplate";
import PaymentQRDetails from "./components/PaymentQRDetails";
import PaymentQRCounter from "./components/PaymentQRCounter";

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
      if (!paymentEnded.current) {
        toast.warning(
          t(
            "checkout:errors.noPaymentInfo",
            "Không tìm thấy thông tin giao dịch thanh toán!",
          ),
        );
        navigate("/pricing");
      }
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
            
            {/* Hidden Receipt Template for Print/Canvas */}
            <PaymentQRReceiptTemplate paymentInfo={paymentInfo} t={t} />
          </div>

          {/* Countdown timer */}
          <PaymentQRCounter timeLeft={timeLeft} t={t} />

          {/* Payment detail stats */}
          <PaymentQRDetails paymentInfo={paymentInfo} t={t} />

          <div className="mt-6 flex justify-center text-xs text-slate-500 animate-pulse">
            <img
              src={spinnerIcon}
              alt=""
              className="animate-spin -ml-1 mr-2 h-4 w-4"
            />
            {t("checkout:polling.status", "Đang chờ thanh toán trực tuyến...")}
          </div>
        </div>
      </div>
    </main>
  );
}

export default PaymentQRPage;
