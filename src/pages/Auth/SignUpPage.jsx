import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  registerStep1Request,
  verifyOtpRequest,
  registerStep3Request,
} from "../../feature/auth/authSlice";
import { I18N_ERROR_KEYS } from "../../util/i18nErrorKeys";
import loginIcon from "../../assets/Login.svg";

function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    loading,
    error: reduxError,
    verifyToken,
    registerStep1Success,
  } = useSelector((state) => state.auth);

  // Step 1: Personal Information
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Step 2: OTP & Password
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State management
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 or 2

  // Move to step 2 after step 1 success
  useEffect(() => {
    if (registerStep1Success) {
      setStep(2);
      setError("");
    }
  }, [registerStep1Success]);

  // Set otpVerified when verifyToken is received
  useEffect(() => {
    if (verifyToken) {
      setOtpVerified(true);
      setOtpError("");
    }
  }, [verifyToken]);

  // Validate step 1 form
  function validateStep1() {
    if (
      !email.trim() ||
      !fullName.trim() ||
      !dateOfBirth.trim() ||
      !address.trim() ||
      !phoneNumber.trim()
    ) {
      setError(t(I18N_ERROR_KEYS.REQUIRED_FIELD));
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t(I18N_ERROR_KEYS.INVALID_EMAIL));
      return false;
    }

    setError("");
    return true;
  }

  // Handle step 1 submission
  function handleStep1Submit(event) {
    event.preventDefault();
    if (!validateStep1()) {
      return;
    }

    dispatch(
      registerStep1Request({
        email: email.trim(),
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth,
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
      }),
    );
  }

  // Handle OTP verification
  function handleOtpCheck() {
    setOtpError("");

    if (!otp.trim()) {
      setOtpError(t(I18N_ERROR_KEYS.REQUIRED_FIELD));
      return;
    }

    dispatch(
      verifyOtpRequest({
        email: email.trim(),
        otp: otp.trim(),
      }),
    );
  }

  // Handle step 2 submission (final)
  function handleStep2Submit(event) {
    event.preventDefault();

    if (!otpVerified) {
      setError(t(I18N_ERROR_KEYS.OTP_REQUIRED));
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setError(t(I18N_ERROR_KEYS.REQUIRED_FIELD));
      return;
    }

    if (password.length < 6) {
      setError(t(I18N_ERROR_KEYS.PASSWORD_TOO_SHORT));
      return;
    }

    if (password !== confirmPassword) {
      setError(t(I18N_ERROR_KEYS.PASSWORD_MISMATCH));
      return;
    }

    dispatch(
      registerStep3Request({
        verifyToken: verifyToken,
        password: password,
        onSuccess: () => navigate("/login", { replace: true }),
      }),
    );
  }

  function handleBackToStep1() {
    setStep(1);
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setOtpVerified(false);
    setOtpError("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  // Use Redux error if available, otherwise use local error
  const displayError = reduxError || error;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-74px)] w-[min(1120px,92vw)] items-center justify-center py-10">
      <section className="w-full max-w-[620px] rounded-3xl border border-white/10 bg-gradient-to-b from-[#1e3451]/90 to-[#182c47]/94 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        <div className="mb-5 flex justify-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#ffe16d] to-[#deb320] shadow-[0_10px_24px_rgba(237,196,46,0.28)]">
            <img
              alt="Sign up icon"
              className="h-8 w-8 object-contain"
              src={loginIcon}
            />
          </div>
        </div>

        <h1 className="text-center font-['Sora'] text-4xl font-bold">
          {t("signup:title")}
        </h1>
        <p className="mt-2 text-center text-lg text-slate-300">
          {step === 1 ? t("signup:step1Title") : t("signup:step2Title")}
        </p>

        {step === 1 ? (
          // STEP 1: Personal Information
          <form className="mt-8 space-y-5" onSubmit={handleStep1Submit}>
            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="email"
              >
                {t("signup:emailLabel")}
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none disabled:opacity-50"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("signup:emailPlaceholder")}
                type="email"
                value={email}
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="fullName"
              >
                {t("signup:fullNameLabel")}
              </label>
              <input
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none disabled:opacity-50"
                id="fullName"
                onChange={(event) => setFullName(event.target.value)}
                placeholder={t("signup:fullNamePlaceholder")}
                type="text"
                value={fullName}
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="dateOfBirth"
              >
                {t("signup:dateOfBirthLabel")}
              </label>
              <input
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none disabled:opacity-50"
                id="dateOfBirth"
                onChange={(event) => setDateOfBirth(event.target.value)}
                placeholder={t("signup:dateOfBirthPlaceholder")}
                type="date"
                value={dateOfBirth}
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="address"
              >
                {t("signup:addressLabel")}
              </label>
              <input
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none disabled:opacity-50"
                id="address"
                onChange={(event) => setAddress(event.target.value)}
                placeholder={t("signup:addressPlaceholder")}
                type="text"
                value={address}
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="phoneNumber"
              >
                {t("signup:phoneNumberLabel")}
              </label>
              <input
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none disabled:opacity-50"
                id="phoneNumber"
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder={t("signup:phoneNumberPlaceholder")}
                type="tel"
                value={phoneNumber}
                disabled={loading}
              />
            </div>

            {displayError ? (
              <p className="text-sm font-medium text-rose-300">
                {displayError}
              </p>
            ) : null}

            <button
              className="w-full rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 text-xl font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Loading..." : t("signup:nextStep")}
            </button>

            <p className="text-center text-base text-slate-300">
              {t("signup:alreadyHaveAccount")}{" "}
              <button
                className="font-semibold text-[#ecc741] transition hover:text-[#ffdf69] disabled:opacity-50"
                onClick={() => navigate("/login")}
                type="button"
                disabled={loading}
              >
                {t("signup:loginNow")}
              </button>
            </p>
          </form>
        ) : (
          // STEP 2: OTP Verification & Password
          <form className="mt-8 space-y-5" onSubmit={handleStep2Submit}>
            <div className="rounded-xl border border-[#0ed8ab]/30 bg-[#0ed8ab]/5 p-4">
              <p className="text-sm text-slate-300">
                {t("signup:otpSent")}:{" "}
                <span className="font-semibold">{email}</span>
              </p>
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="otp"
              >
                {t("signup:otpLabel")}
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none disabled:opacity-50"
                  id="otp"
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder={t("signup:otpPlaceholder")}
                  type="text"
                  value={otp}
                  maxLength="6"
                  disabled={loading || otpVerified}
                />
                <button
                  className={`rounded-xl px-6 py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    otpVerified
                      ? "bg-[#0ed8ab] text-[#112542] hover:brightness-110"
                      : "bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] text-[#112542] hover:-translate-y-0.5"
                  }`}
                  onClick={handleOtpCheck}
                  type="button"
                  disabled={loading || otpVerified}
                >
                  {otpVerified
                    ? "✓ " + t("signup:otpVerified")
                    : loading
                      ? "Verifying..."
                      : t("signup:checkOtpButton")}
                </button>
              </div>
              {otpError ? (
                <p className="mt-2 text-sm font-medium text-rose-300">
                  {otpError}
                </p>
              ) : null}
              {otpVerified && (
                <p className="mt-2 text-sm font-medium text-[#0ed8ab]">
                  ✓ {t("signup:otpVerified")}
                </p>
              )}

              {/* Demo note */}
              <p className="mt-2 text-xs text-slate-400">
                Demo: Use OTP "123456"
              </p>
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="password"
              >
                {t("signup:passwordLabel")}
              </label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${
                    otpVerified
                      ? "border-white/15 bg-white/8 focus:border-[#ecc741]"
                      : "border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
                  }`}
                  disabled={!otpVerified || loading}
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t("signup:passwordPlaceholder")}
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                {otpVerified && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition disabled:opacity-50"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    disabled={loading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="confirmPassword"
              >
                {t("signup:confirmPasswordLabel")}
              </label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${
                    otpVerified
                      ? "border-white/15 bg-white/8 focus:border-[#ecc741]"
                      : "border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
                  }`}
                  disabled={!otpVerified || loading}
                  id="confirmPassword"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={t("signup:confirmPasswordPlaceholder")}
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                />
                {otpVerified && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition disabled:opacity-50"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                    disabled={loading}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                )}
              </div>
            </div>

            {displayError ? (
              <p className="text-sm font-medium text-rose-300">
                {displayError}
              </p>
            ) : null}

            <button
              className="w-full rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 text-xl font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : t("signup:submit")}
            </button>

            <button
              className="w-full rounded-xl border border-white/14 bg-white/5 px-6 py-3 text-base font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleBackToStep1}
              type="button"
              disabled={loading}
            >
              Back to Personal Info
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default SignUpPage;
