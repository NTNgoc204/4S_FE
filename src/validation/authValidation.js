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

export const UNIVERSITY_GUIDANCE_MIN_AGE = 16;
export const UNIVERSITY_GUIDANCE_MAX_AGE = 35;

export function parseDateOnly(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatDateOnly(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateYearsAgo(years, referenceDate = new Date()) {
  const date = new Date(
    referenceDate.getFullYear() - years,
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  if (date.getMonth() !== referenceDate.getMonth()) {
    date.setDate(0);
  }

  return date;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function getAgeFromBirthDate(birthDate, referenceDate = new Date()) {
  const date = birthDate instanceof Date ? birthDate : parseDateOnly(birthDate);

  if (!date) {
    return null;
  }

  let age = referenceDate.getFullYear() - date.getFullYear();
  const hasBirthdayPassed =
    referenceDate.getMonth() > date.getMonth() ||
    (referenceDate.getMonth() === date.getMonth() &&
      referenceDate.getDate() >= date.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

export function getUniversityGuidanceBirthDateRange(referenceDate = new Date()) {
  return {
    minDate: formatDateOnly(addDays(getDateYearsAgo(UNIVERSITY_GUIDANCE_MAX_AGE + 1, referenceDate), 1)),
    maxDate: formatDateOnly(getDateYearsAgo(UNIVERSITY_GUIDANCE_MIN_AGE, referenceDate)),
  };
}

export function validateUniversityGuidanceBirthDate(value, t, options = {}) {
  const { required = true, referenceDate = new Date() } = options;

  if (!value) {
    return required
      ? t("signup:errors.dateOfBirthRequired") || "Date of birth is required"
      : "";
  }

  const birthDate = parseDateOnly(value);

  if (!birthDate) {
    return t("signup:errors.dateOfBirthInvalid") || "Invalid date of birth";
  }

  const age = getAgeFromBirthDate(birthDate, referenceDate);

  if (age < UNIVERSITY_GUIDANCE_MIN_AGE) {
    return t("signup:errors.dateOfBirthTooYoung", {
      minAge: UNIVERSITY_GUIDANCE_MIN_AGE,
    }) || `You must be at least ${UNIVERSITY_GUIDANCE_MIN_AGE} years old`;
  }

  if (age > UNIVERSITY_GUIDANCE_MAX_AGE) {
    return t("signup:errors.dateOfBirthTooOld", {
      maxAge: UNIVERSITY_GUIDANCE_MAX_AGE,
    }) || `Age must be ${UNIVERSITY_GUIDANCE_MAX_AGE} or younger`;
  }

  return "";
}

export const VIETNAMESE_MOBILE_CARRIERS = Object.freeze([
  {
    id: "viettel",
    name: "Viettel",
    prefixes: ["032", "033", "034", "035", "036", "037", "038", "039", "086", "096", "097", "098"],
  },
  {
    id: "vinaphone",
    name: "VinaPhone",
    prefixes: ["081", "082", "083", "084", "085", "088", "091", "094"],
  },
  {
    id: "mobifone",
    name: "MobiFone",
    prefixes: ["070", "076", "077", "078", "079", "089", "090", "093"],
  },
  {
    id: "vietnamobile",
    name: "Vietnamobile",
    prefixes: ["052", "056", "058", "092"],
  },
  {
    id: "gmobile",
    name: "Gmobile",
    prefixes: ["059", "099"],
  },
  {
    id: "itel",
    name: "iTel",
    prefixes: ["087"],
  },
  {
    id: "wintel",
    name: "Wintel",
    prefixes: ["055"],
  },
]);

const CARRIER_BY_PREFIX = new Map(
  VIETNAMESE_MOBILE_CARRIERS.flatMap((carrier) =>
    carrier.prefixes.map((prefix) => [prefix, carrier]),
  ),
);

function compactPhoneNumber(value) {
  return String(value ?? "")
    .trim()
    .replace(/[\s().-]/g, "");
}

export function sanitizeVietnamesePhoneInput(value) {
  const rawValue = String(value ?? "");
  const hasInternationalPrefix = rawValue.trimStart().startsWith("+");
  const digits = rawValue.replace(/\D/g, "");

  if (hasInternationalPrefix) {
    return `+${digits.slice(0, 11)}`;
  }

  return digits.slice(0, 11);
}

export function normalizeVietnamesePhoneNumber(value) {
  const compactValue = compactPhoneNumber(value);

  if (compactValue.startsWith("+84")) {
    return `0${compactValue.slice(3)}`;
  }

  if (compactValue.startsWith("84")) {
    return `0${compactValue.slice(2)}`;
  }

  return compactValue;
}

export function getVietnameseMobileCarrier(value) {
  const normalizedPhone = normalizeVietnamesePhoneNumber(value);
  return CARRIER_BY_PREFIX.get(normalizedPhone.slice(0, 3)) ?? null;
}

export function isValidVietnameseMobileNumber(value) {
  const normalizedPhone = normalizeVietnamesePhoneNumber(value);
  return /^0\d{9}$/.test(normalizedPhone) && Boolean(getVietnameseMobileCarrier(normalizedPhone));
}

export function validateVietnamesePhoneNumber(value, t, options = {}) {
  const { required = true } = options;
  const compactValue = compactPhoneNumber(value);

  if (!compactValue) {
    return required
      ? t("signup:errors.phoneRequired") || "Phone number is required"
      : "";
  }

  if (!/^(?:0|84|\+84)\d+$/.test(compactValue)) {
    return t("signup:errors.phoneInvalid") || "Invalid Vietnamese phone number";
  }

  const normalizedPhone = normalizeVietnamesePhoneNumber(compactValue);

  if (!/^0\d{9}$/.test(normalizedPhone)) {
    return t("signup:errors.phoneInvalid") || "Invalid Vietnamese phone number";
  }

  if (!getVietnameseMobileCarrier(normalizedPhone)) {
    return t("signup:errors.phoneCarrierUnknown") || "Unsupported Vietnamese mobile prefix";
  }

  return "";
}
