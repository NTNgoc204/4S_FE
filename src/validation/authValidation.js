export const validateEmail = (email, t) => {
  if (!email || !email.trim()) {
    return t("auth:emailRequired") || "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return t("auth:emailInvalid") || "Invalid email format";
  }
  return "";
};

export const validateOtp = (otp, t) => {
  if (!otp || !otp.trim()) {
    return t("auth:otpRequired") || "OTP is required";
  }
  if (otp.trim().length !== 6 || isNaN(otp.trim())) {
    return t("auth:otpInvalid") || "OTP must be a 6-digit number";
  }
  return "";
};

export const validatePassword = (password, t) => {
  if (!password) {
    return t("auth:passwordRequired") || "Password is required";
  }
  if (password.length < 8) {
    return t("auth:passwordTooShort") || "Password must be at least 8 characters long";
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return t("auth:passwordNoUppercase") || "Password must contain at least one uppercase letter";
  }
  const hasDigit = /[0-9]/.test(password);
  if (!hasDigit) {
    return t("auth:passwordNoDigit") || "Password must contain at least one number";
  }
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasSpecialChar) {
    return t("auth:passwordNoSpecial") || "Password must contain at least one special character";
  }
  return "";
};
