import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  formatDateOnly,
  getUniversityGuidanceBirthDateRange,
  parseDateOnly,
} from "../validation/authValidation";

function clampDate(date, minDate, maxDate) {
  if (date < minDate) {
    return minDate;
  }

  if (date > maxDate) {
    return maxDate;
  }

  return date;
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function buildCalendarDays(visibleMonth) {
  const firstDayOfMonth = getMonthStart(visibleMonth);
  const mondayFirstOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const startDate = new Date(
    firstDayOfMonth.getFullYear(),
    firstDayOfMonth.getMonth(),
    1 - mondayFirstOffset,
  );

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7 3v3M17 3v3M4.5 9.25h15M6.75 5h10.5A2.75 2.75 0 0 1 20 7.75v9.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25v-9.5A2.75 2.75 0 0 1 6.75 5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronIcon({ direction }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d={direction === "left" ? "m15 18-6-6 6-6" : "m9 6 6 6-6 6"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function DateOfBirthPicker({
  disabled = false,
  error = "",
  id,
  onBlur,
  onChange,
  placeholder,
  value,
}) {
  const { i18n, t } = useTranslation();
  const pickerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const range = useMemo(() => getUniversityGuidanceBirthDateRange(), []);
  const minDate = useMemo(() => parseDateOnly(range.minDate), [range.minDate]);
  const maxDate = useMemo(() => parseDateOnly(range.maxDate), [range.maxDate]);
  const selectedDate = useMemo(() => parseDateOnly(value), [value]);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthStart(selectedDate ?? maxDate),
  );

  const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, monthIndex) =>
        new Date(2026, monthIndex, 1).toLocaleDateString(locale, {
          month: "long",
        }),
      ),
    [locale],
  );
  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        new Date(2026, 5, 15 + index).toLocaleDateString(locale, {
          weekday: "short",
        }),
      ),
    [locale],
  );
  const yearOptions = useMemo(() => {
    const years = [];

    for (let year = maxDate.getFullYear(); year >= minDate.getFullYear(); year -= 1) {
      years.push(year);
    }

    return years;
  }, [maxDate, minDate]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
        onBlur?.();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        onBlur?.();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onBlur]);

  function updateVisibleMonth(year, month) {
    setVisibleMonth(getMonthStart(clampDate(new Date(year, month, 1), minDate, maxDate)));
  }

  function goToPreviousMonth() {
    updateVisibleMonth(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1);
  }

  function goToNextMonth() {
    updateVisibleMonth(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1);
  }

  function handleSelectDate(date) {
    if (date < minDate || date > maxDate) {
      return;
    }

    setVisibleMonth(getMonthStart(date));
    onChange(formatDateOnly(date));
    setIsOpen(false);
  }

  function handleTogglePicker() {
    if (!isOpen && selectedDate) {
      setVisibleMonth(getMonthStart(clampDate(selectedDate, minDate, maxDate)));
    }

    setIsOpen((current) => !current);
  }

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";
  const canGoPrevious =
    visibleMonth.getFullYear() > minDate.getFullYear() ||
    (visibleMonth.getFullYear() === minDate.getFullYear() &&
      visibleMonth.getMonth() > minDate.getMonth());
  const canGoNext =
    visibleMonth.getFullYear() < maxDate.getFullYear() ||
    (visibleMonth.getFullYear() === maxDate.getFullYear() &&
      visibleMonth.getMonth() < maxDate.getMonth());

  return (
    <div ref={pickerRef} className="relative">
      <button
        aria-describedby={error ? `${id}-error` : undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`flex w-full items-center justify-between rounded-xl border bg-white/8 px-4 py-3 text-left text-base transition focus:outline-none disabled:opacity-50 ${
          error
            ? "border-rose-400 focus:border-rose-300"
            : "border-white/15 focus:border-[#ecc741]"
        } ${displayValue ? "text-slate-100" : "text-slate-400"}`}
        disabled={disabled}
        id={id}
        onClick={handleTogglePicker}
        type="button"
      >
        <span>{displayValue || placeholder}</span>
        <span className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#142947]/80 text-[#f3d24d]">
          <CalendarIcon />
        </span>
      </button>

      {error ? (
        <p className="mt-2 text-sm font-medium text-rose-300" id={`${id}-error`}>
          {error}
        </p>
      ) : null}

      {isOpen ? (
        <div
          aria-label={t("signup:datePicker.label")}
          className="mx-auto mt-3 w-[min(360px,100%)] rounded-2xl border border-white/12 bg-[#10213a] p-3 shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
          role="dialog"
        >
          <div className="mb-3 flex items-center gap-2">
            <button
              aria-label={t("signup:datePicker.previousMonth")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-slate-100 transition hover:border-[#ecc741]/60 hover:text-[#ecc741] disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!canGoPrevious}
              onClick={goToPreviousMonth}
              type="button"
            >
              <ChevronIcon direction="left" />
            </button>

            <select
              aria-label={t("signup:datePicker.month")}
              className="min-w-0 flex-1 rounded-xl border border-white/12 bg-[#172b49] px-3 py-2 text-sm font-semibold text-slate-100 outline-none focus:border-[#ecc741]"
              onChange={(event) =>
                updateVisibleMonth(visibleMonth.getFullYear(), Number(event.target.value))
              }
              value={visibleMonth.getMonth()}
            >
              {monthLabels.map((label, monthIndex) => (
                <option key={label} value={monthIndex}>
                  {label}
                </option>
              ))}
            </select>

            <select
              aria-label={t("signup:datePicker.year")}
              className="w-[94px] rounded-xl border border-white/12 bg-[#172b49] px-3 py-2 text-sm font-semibold text-slate-100 outline-none focus:border-[#ecc741]"
              onChange={(event) =>
                updateVisibleMonth(Number(event.target.value), visibleMonth.getMonth())
              }
              value={visibleMonth.getFullYear()}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <button
              aria-label={t("signup:datePicker.nextMonth")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-slate-100 transition hover:border-[#ecc741]/60 hover:text-[#ecc741] disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!canGoNext}
              onClick={goToNextMonth}
              type="button"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {weekdayLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const isOutsideCurrentMonth = date.getMonth() !== visibleMonth.getMonth();
              const isDisabled = date < minDate || date > maxDate;
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <button
                  className={`h-9 rounded-lg text-sm font-semibold transition ${
                    isSelected
                      ? "bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] text-[#112542] shadow-[0_8px_20px_rgba(238,198,49,0.25)]"
                      : "text-slate-100 hover:bg-white/10"
                  } ${
                    isOutsideCurrentMonth && !isSelected ? "text-slate-600" : ""
                  } ${
                    isDisabled
                      ? "cursor-not-allowed opacity-25 hover:bg-transparent"
                      : ""
                  }`}
                  disabled={isDisabled}
                  key={formatDateOnly(date)}
                  onClick={() => handleSelectDate(date)}
                  type="button"
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DateOfBirthPicker;
