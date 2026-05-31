/**
 * Error message constants for consistent error handling
 * Use these constants to avoid hardcoding error messages throughout the app
 */

export const ERROR_MESSAGES = {
  // Form validation errors
  REQUIRED_FIELD: "errors.required",
  INVALID_EMAIL: "errors.invalidEmail",
  PASSWORD_TOO_SHORT: "errors.passwordTooShort",
  PASSWORD_MISMATCH: "errors.passwordMismatch",

  // Authentication errors
  OTP_REQUIRED: "errors.otpRequired",
  OTP_INVALID: "otpInvalid",
  INVALID_CREDENTIALS: "auth:invalidCredentials",
  REGISTRATION_FAILED: "Registration failed",
  LOGIN_FAILED: "Login failed",
  LOGOUT_FAILED: "Logout failed",

  // API errors
  NETWORK_ERROR: "Network error. Please try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNAUTHORIZED: "Unauthorized. Please login again.",
  FORBIDDEN: "You don't have permission to access this resource.",
  NOT_FOUND: "Resource not found.",

  // Generic
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again.",
};

/**
 * Get error message from API response
 * @param {Error} error - The error object from API response
 * @param {string} defaultMessage - Default message if no error message found
 * @returns {string} - The error message
 */
export const getErrorMessage = (
  error,
  defaultMessage = "An error occurred",
) => {
  if (typeof error === "string") {
    return error;
  }

  // Handle Axios timeout error
  if (error?.code === "ECONNABORTED" && error?.message?.toLowerCase().includes("timeout")) {
    return "Timeout exceeded. Please try again.";
  }

  if (error?.response?.data) {
    if (typeof error.response.data === "string") {
      return error.response.data;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
  }

  if (error?.message) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * Map HTTP status codes to user-friendly error messages
 */
export const getErrorByStatusCode = (statusCode) => {
  const errorMap = {
    400: "Bad request. Please check your input.",
    401: ERROR_MESSAGES.UNAUTHORIZED,
    403: ERROR_MESSAGES.FORBIDDEN,
    404: ERROR_MESSAGES.NOT_FOUND,
    409: "This resource already exists.",
    422: "Validation error. Please check your input.",
    500: ERROR_MESSAGES.SERVER_ERROR,
    503: "Service unavailable. Please try again later.",
  };

  return errorMap[statusCode] || ERROR_MESSAGES.SOMETHING_WENT_WRONG;
};
