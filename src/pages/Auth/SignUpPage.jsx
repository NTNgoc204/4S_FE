import { useState } from "react";
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
import DateOfBirthPicker from "../../components/DateOfBirthPicker";
import PhoneInput from "../../components/PhoneInput";
import {
  normalizeVietnamesePhoneNumber,
  validateUniversityGuidanceBirthDate,
  validateVietnamesePhoneNumber,
} from "../../validation/authValidation";

function getFieldClassName(error) {
  return `w-full rounded-xl border bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${
    error
      ? "border-rose-400 focus:border-rose-300"
      : "border-white/15 focus:border-[#ecc741]"
  }`;
}

function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-sm font-medium text-rose-300" id={id}>
      {message}
    </p>
  );
}

function validateSignupEmail(value, t) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return t("signup:errors.emailRequired");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
    return t("signup:errors.invalidEmail");
  }

  return "";
}

function validateSignupFullName(value, t) {
  const trimmedValue = value.trim().replace(/\s+/g, " ");

  if (!trimmedValue) {
    return t("signup:errors.fullNameRequired");
  }

  if (trimmedValue.length < 2 || /[0-9!@#$%^&*_=+{}[\]|\\:;"<>?/]/.test(trimmedValue)) {
    return t("signup:errors.fullNameInvalid");
  }

  return "";
}

function validateSignupAddress(value, t) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return t("signup:errors.addressRequired");
  }

  if (trimmedValue.length < 5) {
    return t("signup:errors.addressTooShort");
  }

  return "";
}

function validateSignupOtp(value, t) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return t("signup:errors.otpRequired");
  }

  if (!/^\d{6}$/.test(trimmedValue)) {
    return t("signup:otpInvalid");
  }

  return "";
}

function validateSignupPassword(value, t) {
  if (!value) {
    return t("signup:errors.passwordRequired");
  }

  if (value.length < 6) {
    return t("signup:errors.passwordTooShort");
  }

  return "";
}

function validateSignupConfirmPassword(value, password, t) {
  if (!value) {
    return t("signup:errors.confirmPasswordRequired");
  }

  if (value !== password) {
    return t("signup:errors.passwordMismatch");
  }

  return "";
}

function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    loading,
    error: reduxError,
    verifyToken,
  } = useSelector((state) => state.auth);

  // Step 1: Personal Information
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfBirthError, setDateOfBirthError] = useState("");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [gender, setGender] = useState("");
  const [genderError, setGenderError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Step 2: OTP & Password
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State management
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 or 2

  // EDU Activation Key (optional — for school plan students)
  const [showEduKeyField, setShowEduKeyField] = useState(false);
  const [eduActivationKey, setEduActivationKey] = useState("");
  const [eduKeyError, setEduKeyError] = useState("");

  // Validate step 1 form
  function validateStep1() {
    const nextEmailError = validateSignupEmail(email, t);
    const nextFullNameError = validateSignupFullName(fullName, t);
    const nextDateOfBirthError = validateUniversityGuidanceBirthDate(dateOfBirth, t);
    const nextAddressError = validateSignupAddress(address, t);
    const nextGenderError = !gender ? t("signup:errors.genderRequired") : "";
    const nextPhoneError = validateVietnamesePhoneNumber(phoneNumber, t);
    setEmailError(nextEmailError);
    setFullNameError(nextFullNameError);
    setDateOfBirthError(nextDateOfBirthError);
    setAddressError(nextAddressError);
    setGenderError(nextGenderError);
    setPhoneError(nextPhoneError);

    if (
      nextEmailError ||
      nextFullNameError ||
      nextDateOfBirthError ||
      nextAddressError ||
      nextGenderError ||
      nextPhoneError
    ) {
      setError("");
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
        gender: gender,
        phoneNumber: normalizeVietnamesePhoneNumber(phoneNumber),
        onSuccess: () => {
          setStep(2);
          setError("");
        },
      }),
    );
  }

  // Handle OTP verification
  function handleOtpCheck() {
    const nextOtpError = validateSignupOtp(otp, t);
    setOtpError(nextOtpError);

    if (nextOtpError) {
      return;
    }

    dispatch(
      verifyOtpRequest({
        email: email.trim(),
        otp: otp.trim(),
        onSuccess: () => {
          setOtpVerified(true);
          setOtpError("");
          setError("");
        },
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

    const nextPasswordError = validateSignupPassword(password, t);
    const nextConfirmPasswordError = validateSignupConfirmPassword(
      confirmPassword,
      password,
      t,
    );
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);

    if (nextPasswordError || nextConfirmPasswordError) {
      setError("");
      return;
    }

    dispatch(
      registerStep3Request({
        verifyToken: verifyToken,
        password: password,
        onSuccess: () => {
          if (eduActivationKey && eduActivationKey.trim()) {
            sessionStorage.setItem(
              "pending_edu_activation_key",
              eduActivationKey.trim()
            );
          }
          navigate("/login", { replace: true });
        },
      }),
    );
  }

  function handleBackToStep1() {
    setStep(1);
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setConfirmPasswordError("");
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
          <form className="mt-8 space-y-5" noValidate onSubmit={handleStep1Submit}>
            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="email"
              >
                {t("signup:emailLabel")} <span className="text-rose-300">*</span>
              </label>
              <input
                aria-describedby={emailError ? "email-error" : undefined}
                aria-invalid={Boolean(emailError)}
                autoComplete="email"
                className={getFieldClassName(emailError)}
                id="email"
                onBlur={() => setEmailError(validateSignupEmail(email, t))}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) {
                    setEmailError(validateSignupEmail(event.target.value, t));
                  }
                }}
                placeholder={t("signup:emailPlaceholder")}
                required
                type="email"
                value={email}
                disabled={loading}
              />
              <FieldError id="email-error" message={emailError} />
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="fullName"
              >
                {t("signup:fullNameLabel")} <span className="text-rose-300">*</span>
              </label>
              <input
                aria-describedby={fullNameError ? "fullName-error" : undefined}
                aria-invalid={Boolean(fullNameError)}
                className={getFieldClassName(fullNameError)}
                id="fullName"
                onBlur={() => setFullNameError(validateSignupFullName(fullName, t))}
                onChange={(event) => {
                  setFullName(event.target.value);
                  if (fullNameError) {
                    setFullNameError(validateSignupFullName(event.target.value, t));
                  }
                }}
                placeholder={t("signup:fullNamePlaceholder")}
                required
                type="text"
                value={fullName}
                disabled={loading}
              />
              <FieldError id="fullName-error" message={fullNameError} />
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="dateOfBirth"
              >
                {t("signup:dateOfBirthLabel")} <span className="text-rose-300">*</span>
              </label>
              <DateOfBirthPicker
                disabled={loading}
                error={dateOfBirthError}
                id="dateOfBirth"
                onBlur={() =>
                  setDateOfBirthError(validateUniversityGuidanceBirthDate(dateOfBirth, t))
                }
                onChange={(nextDateOfBirth) => {
                  setDateOfBirth(nextDateOfBirth);
                  if (dateOfBirthError) {
                    setDateOfBirthError(
                      validateUniversityGuidanceBirthDate(nextDateOfBirth, t),
                    );
                  }
                }}
                placeholder={t("signup:dateOfBirthPlaceholder")}
                value={dateOfBirth}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="address"
              >
                {t("signup:addressLabel")} <span className="text-rose-300">*</span>
              </label>
              <input
                aria-describedby={addressError ? "address-error" : undefined}
                aria-invalid={Boolean(addressError)}
                className={getFieldClassName(addressError)}
                id="address"
                onBlur={() => setAddressError(validateSignupAddress(address, t))}
                onChange={(event) => {
                  setAddress(event.target.value);
                  if (addressError) {
                    setAddressError(validateSignupAddress(event.target.value, t));
                  }
                }}
                placeholder={t("signup:addressPlaceholder")}
                required
                type="text"
                value={address}
                disabled={loading}
              />
              <FieldError id="address-error" message={addressError} />
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="gender"
              >
                {t("signup:genderLabel")} <span className="text-rose-300">*</span>
              </label>
              <select
                aria-describedby={genderError ? "gender-error" : undefined}
                aria-invalid={Boolean(genderError)}
                className={getFieldClassName(genderError)}
                id="gender"
                onChange={(event) => {
                  setGender(event.target.value);
                  if (genderError) {
                    setGenderError("");
                  }
                }}
                required
                value={gender}
                disabled={loading}
              >
                <option value="" disabled className="bg-[#1e3451] text-slate-400">
                  {t("signup:genderPlaceholder")}
                </option>
                <option value="Male" className="bg-[#1e3451] text-slate-100">
                  {t("signup:genderMale")}
                </option>
                <option value="Female" className="bg-[#1e3451] text-slate-100">
                  {t("signup:genderFemale")}
                </option>
                <option value="Other" className="bg-[#1e3451] text-slate-100">
                  {t("signup:genderOther")}
                </option>
              </select>
              <FieldError id="gender-error" message={genderError} />
            </div>

            <PhoneInput
              disabled={loading}
              error={phoneError}
              id="phoneNumber"
              label={t("signup:phoneNumberLabel")}
              onBlur={() => setPhoneError(validateVietnamesePhoneNumber(phoneNumber, t))}
              onChange={(value) => {
                setPhoneNumber(value);
                if (phoneError) {
                  setPhoneError(validateVietnamesePhoneNumber(value, t));
                }
              }}
              placeholder={t("signup:phoneNumberPlaceholder")}
              required
              value={phoneNumber}
            />

            {/* EDU Activation Key (optional) */}
            <div className="border-t border-white/10 pt-4">
              {!showEduKeyField ? (
                <button
                  type="button"
                  onClick={() => setShowEduKeyField(true)}
                  className="flex items-center gap-1.5 text-sm text-[#ecc741]/80 hover:text-[#ecc741] transition font-medium"
                  disabled={loading}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  {"Tôi có mã kích hoạt từ trường (Activation Key)"}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-200" htmlFor="eduActivationKey">
                      Mã kích hoạt học đường{" "}
                      <span className="text-slate-400 font-normal text-xs">(không bắt buộc)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setShowEduKeyField(false); setEduActivationKey(""); setEduKeyError(""); }}
                      className="text-xs text-slate-500 hover:text-slate-300 transition"
                      disabled={loading}
                    >
                      Bỏ qua
                    </button>
                  </div>
                  <input
                    id="eduActivationKey"
                    type="text"
                    value={eduActivationKey}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setEduActivationKey(val);
                      if (eduKeyError) setEduKeyError("");
                    }}
                    placeholder="EDU-XXXXXXXX"
                    maxLength={12}
                    disabled={loading}
                    className={`w-full rounded-xl border bg-white/8 px-4 py-3 text-base font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50 tracking-wider ${
                      eduKeyError
                        ? "border-rose-400 focus:border-rose-300"
                        : "border-white/15 focus:border-[#ecc741]"
                    }`}
                  />
                  {eduKeyError && (
                    <p className="text-sm font-medium text-rose-300">{eduKeyError}</p>
                  )}
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Nhập mã được gửi qua email từ nhà trường. Tài khoản sẽ được kích hoạt gói trường sau khi đăng ký thành công.
                  </p>
                </div>
              )}
            </div>

            {displayError ? (
              <p className="text-sm font-medium text-rose-300">{displayError}</p>
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
          <form className="mt-8 space-y-5" noValidate onSubmit={handleStep2Submit}>
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
                {t("signup:otpLabel")} <span className="text-rose-300">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  aria-describedby={otpError ? "otp-error" : undefined}
                  aria-invalid={Boolean(otpError)}
                  className={`flex-1 rounded-xl border bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${
                    otpError
                      ? "border-rose-400 focus:border-rose-300"
                      : "border-white/15 focus:border-[#ecc741]"
                  }`}
                  id="otp"
                  onBlur={() => setOtpError(validateSignupOtp(otp, t))}
                  onChange={(event) => {
                    const nextOtp = event.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(nextOtp);
                    if (otpError) {
                      setOtpError(validateSignupOtp(nextOtp, t));
                    }
                  }}
                  placeholder={t("signup:otpPlaceholder")}
                  required
                  type="text"
                  value={otp}
                  maxLength={6}
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
                <p className="mt-2 text-sm font-medium text-rose-300" id="otp-error">
                  {otpError}
                </p>
              ) : null}
              {otpVerified && (
                <p className="mt-2 text-sm font-medium text-[#0ed8ab]">
                  ✓ {t("signup:otpVerified")}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="password"
              >
                {t("signup:passwordLabel")} <span className="text-rose-300">*</span>
              </label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${
                    passwordError
                      ? "border-rose-400 bg-white/8 focus:border-rose-300"
                      : otpVerified
                      ? "border-white/15 bg-white/8 focus:border-[#ecc741]"
                      : "border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
                  }`}
                  disabled={!otpVerified || loading}
                  id="password"
                  aria-describedby={passwordError ? "password-error" : undefined}
                  aria-invalid={Boolean(passwordError)}
                  onBlur={() => setPasswordError(validateSignupPassword(password, t))}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (passwordError) {
                      setPasswordError(validateSignupPassword(event.target.value, t));
                    }
                    if (confirmPasswordError) {
                      setConfirmPasswordError(
                        validateSignupConfirmPassword(
                          confirmPassword,
                          event.target.value,
                          t,
                        ),
                      );
                    }
                  }}
                  placeholder={t("signup:passwordPlaceholder")}
                  required
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
              <FieldError id="password-error" message={passwordError} />
            </div>

            <div>
              <label
                className="mb-2 block text-base font-semibold text-slate-200"
                htmlFor="confirmPassword"
              >
                {t("signup:confirmPasswordLabel")} <span className="text-rose-300">*</span>
              </label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 ${
                    confirmPasswordError
                      ? "border-rose-400 bg-white/8 focus:border-rose-300"
                      : otpVerified
                      ? "border-white/15 bg-white/8 focus:border-[#ecc741]"
                      : "border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
                  }`}
                  disabled={!otpVerified || loading}
                  id="confirmPassword"
                  aria-describedby={
                    confirmPasswordError ? "confirmPassword-error" : undefined
                  }
                  aria-invalid={Boolean(confirmPasswordError)}
                  onBlur={() =>
                    setConfirmPasswordError(
                      validateSignupConfirmPassword(confirmPassword, password, t),
                    )
                  }
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (confirmPasswordError) {
                      setConfirmPasswordError(
                        validateSignupConfirmPassword(event.target.value, password, t),
                      );
                    }
                  }}
                  placeholder={t("signup:confirmPasswordPlaceholder")}
                  required
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
              <FieldError id="confirmPassword-error" message={confirmPasswordError} />
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
