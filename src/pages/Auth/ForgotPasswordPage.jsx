import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { forgotPasswordRequest } from "../../feature/auth/authSlice";
import { validateEmail, validateOtp } from "../../validation/authValidation";

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1); // 1: Email input, 2: OTP verification
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", otp: "" });

  const handleSendEmail = (event) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailErr = validateEmail(cleanEmail, t);
    if (emailErr) {
      setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }
    setFieldErrors({ email: "", otp: "" });
    dispatch(
      forgotPasswordRequest({
        email: cleanEmail,
        onSuccess: () => {
          setStep(2);
        },
      })
    );
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    const cleanOtp = otp.trim();
    const otpErr = validateOtp(cleanOtp, t);
    if (otpErr) {
      setFieldErrors((prev) => ({ ...prev, otp: otpErr }));
      return;
    }
    setFieldErrors({ email: "", otp: "" });
    // Redirection to ResetPassword page: we carry email & otp in react-router state
    navigate("/reset-password", {
      state: { email: email.trim().toLowerCase(), otp: cleanOtp },
    });
  };

  const displayError = error;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-74px)] w-[min(1120px,92vw)] items-center justify-center py-10">
      <section className="w-full max-w-[540px] rounded-3xl border border-white/10 bg-gradient-to-b from-[#1e3451]/90 to-[#182c47]/94 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        <div className="mb-5 flex justify-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#ffe16d] to-[#deb320] shadow-[0_10px_24px_rgba(237,196,46,0.28)]">
            <svg className="h-8 w-8 text-[#112542]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h1 className="text-center font-['Sora'] text-3xl font-bold">
          {t("auth:forgotPasswordTitle")}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-300">
          {t("auth:forgotPasswordSubtitle")}
        </p>

        {step === 1 ? (
          <form className="mt-8 space-y-5" onSubmit={handleSendEmail}>
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="email">
                {t("auth:emailLabel")}
              </label>
              <input
                disabled={loading}
                className={`w-full rounded-xl border bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${
                  fieldErrors.email ? "border-rose-500 focus:border-rose-500" : "border-white/15 focus:border-[#ecc741]"
                }`}
                id="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder={t("auth:emailPlaceholder")}
                required
                type="email"
                value={email}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-rose-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <button
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 text-lg font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
            >
              {loading ? t("auth:sendingCode") : t("auth:sendCode")}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleVerifyOtp}>
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="otp">
                {t("auth:otpLabel")}
              </label>
              <input
                disabled={loading}
                maxLength={6}
                className={`w-full rounded-xl border bg-white/8 px-4 py-3 text-center text-xl font-bold tracking-widest text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${
                  fieldErrors.otp ? "border-rose-500 focus:border-rose-500" : "border-white/15 focus:border-[#ecc741]"
                }`}
                id="otp"
                onChange={(event) => {
                  setOtp(event.target.value);
                  setFieldErrors((prev) => ({ ...prev, otp: "" }));
                }}
                placeholder={t("auth:otpPlaceholder")}
                required
                type="text"
                value={otp}
              />
              {fieldErrors.otp && (
                <p className="mt-1 text-xs text-rose-400 text-center">
                  {fieldErrors.otp}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                disabled={loading}
                className="w-1/3 rounded-xl border border-white/15 bg-white/5 py-3 text-base font-semibold text-slate-300 transition hover:bg-white/10"
                onClick={() => {
                  setStep(1);
                  setLocalError("");
                }}
                type="button"
              >
                Back
              </button>
              <button
                disabled={loading}
                className="w-2/3 rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] py-3 text-base font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
              >
                {t("auth:verifyOtp")}
              </button>
            </div>
          </form>
        )}

        {displayError && (
          <p className="mt-4 text-center text-sm font-medium text-rose-300">
            {displayError}
          </p>
        )}

        <div className="mt-7 text-center">
          <button
            className="text-sm font-semibold text-[#ecc741] transition hover:text-[#ffdf69]"
            onClick={() => navigate("/login")}
            type="button"
          >
            Back to Login
          </button>
        </div>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
