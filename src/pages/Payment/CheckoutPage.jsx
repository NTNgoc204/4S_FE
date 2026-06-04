import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPlansRequest, createPaymentRequest, resetPaymentState } from "../../feature/plan/planSlice";
import Skeleton from "../../components/Skeleton";

function CheckoutPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");

  // Redux state
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { plans, paymentInfo, createPaymentLoading, createPaymentError, loading: plansLoading } = useSelector((state) => state.plan);

  // Component states
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Fetch plans if empty & reset payment state on mount
  useEffect(() => {
    dispatch(resetPaymentState());
    if (plans.length === 0) {
      dispatch(getPlansRequest());
    }
  }, [dispatch]);

  // Find selected plan details
  useEffect(() => {
    if (plans.length > 0 && planId) {
      const found = plans.find((p) => p.id === planId || p.name?.toLowerCase() === planId?.toLowerCase());
      if (found) {
        setSelectedPlan(found);
      }
    }
  }, [plans, planId]);

  // Redirect to QR payment page once transaction is created
  useEffect(() => {
    if (paymentInfo) {
      navigate("/payment-qr");
    }
  }, [paymentInfo, navigate]);

  const handleConfirmRegistration = () => {
    if (selectedPlan) {
      dispatch(createPaymentRequest({ planId: selectedPlan.id }));
    }
  };

  const showUserSkeleton = authLoading && !user;
  const showPlanSkeleton = plansLoading && !selectedPlan;

  const planDisplayName = showPlanSkeleton ? "..." : selectedPlan?.name === "PRO" ? "Pro Pack" : selectedPlan?.name === "EDU" ? "Edu Pack" : selectedPlan?.name || "...";

  return (
    <main className="mx-auto w-[min(650px,95vw)] pb-24 pt-10">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#1b314f]/80 to-[#102138]/90 p-8 shadow-2xl backdrop-blur-xl">
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
              <div className="flex items-center justify-between pt-2 border-t border-white/5 h-7">
                <span className="text-slate-400 font-semibold">{t("checkout:planInfo.total", "Tổng tiền")}:</span>
                <span className="text-lg font-bold text-slate-100">
                  {showPlanSkeleton ? (
                    <Skeleton className="h-5 w-28" />
                  ) : selectedPlan?.price === 0 ? (
                    t('pricing:plans.edu.price', 'Liên hệ')
                  ) : selectedPlan?.price ? (
                    `${selectedPlan.price.toLocaleString('vi-VN')} VND`
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
      </div>
    </main>
  );
}

export default CheckoutPage;
