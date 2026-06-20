export const UNIVERSITY_GUIDANCE_MIN_AGE = 1;
export const UNIVERSITY_GUIDANCE_MAX_AGE = 120;

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

export function getUniversityGuidanceBirthDateRange(
  referenceDate = new Date(),
) {
  return {
    minDate: formatDateOnly(
      addDays(
        getDateYearsAgo(UNIVERSITY_GUIDANCE_MAX_AGE + 1, referenceDate),
        1,
      ),
    ),
    maxDate: formatDateOnly(
      getDateYearsAgo(UNIVERSITY_GUIDANCE_MIN_AGE, referenceDate),
    ),
  };
}
