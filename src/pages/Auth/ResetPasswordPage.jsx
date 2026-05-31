import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordRequest } from "../../feature/auth/authSlice";
import { validatePassword } from "../../validation/authValidation";

function ResetPasswordPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ password: "", confirmPassword: "" });

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, otp, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const passErr = validatePassword(password, t);
    let confirmErr = "";
    if (!confirmPassword) {
      confirmErr = t("auth:passwordRequired") || "Password is required";
    } else if (password !== confirmPassword) {
      confirmErr = t("auth:passwordMismatch") || "Passwords do not match";
    }

    if (passErr || confirmErr) {
      setFieldErrors({ password: passErr, confirmPassword: confirmErr });
      return;
    }
    setFieldErrors({ password: "", confirmPassword: "" });
    dispatch(
      resetPasswordRequest({
        email,
        otp,
        password,
        onSuccess: () => {
          navigate("/login", { replace: true });
        },
      })
    );
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
          {t("auth:resetPassword")}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-300">
          {t("auth:resetPasswordSubtitle")}
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="password">
              {t("auth:newPasswordLabel")}
            </label>
            <div className="relative">
              <input
                disabled={loading}
                className={`w-full rounded-xl border bg-white/8 px-4 py-3 pr-12 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${
                  fieldErrors.password ? "border-rose-500 focus:border-rose-500" : "border-white/15 focus:border-[#ecc741]"
                }`}
                id="password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder={t("auth:newPasswordPlaceholder")}
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-rose-400">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="confirmPassword">
              {t("auth:confirmNewPasswordLabel")}
            </label>
            <div className="relative">
              <input
                disabled={loading}
                className={`w-full rounded-xl border bg-white/8 px-4 py-3 pr-12 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${
                  fieldErrors.confirmPassword ? "border-rose-500 focus:border-rose-500" : "border-white/15 focus:border-[#ecc741]"
                }`}
                id="confirmPassword"
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                placeholder={t("auth:confirmNewPasswordPlaceholder")}
                required
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                type="button"
              >
                {showConfirmPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-400">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 text-lg font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
          >
            {loading ? t("auth:updating") : t("auth:resetPassword")}
          </button>
        </form>

        {displayError && (
          <p className="mt-4 text-center text-sm font-medium text-rose-300">
            {displayError}
          </p>
        )}
      </section>
    </main>
  );
}

export default ResetPasswordPage;
