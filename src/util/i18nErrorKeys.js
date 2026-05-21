/**
 * i18n Keys for error messages
 * Use these keys with i18next t() function to get translated error messages
 */

export const I18N_ERROR_KEYS = {
  // Form validation errors
  REQUIRED_FIELD: "signup:errors.required",
  INVALID_EMAIL: "signup:errors.invalidEmail",
  PASSWORD_TOO_SHORT: "signup:errors.passwordTooShort",
  PASSWORD_MISMATCH: "signup:errors.passwordMismatch",

  // Authentication errors
  OTP_REQUIRED: "signup:errors.otpRequired",
  OTP_INVALID: "signup:otpInvalid",
  INVALID_CREDENTIALS: "auth:invalidCredentials",
};
