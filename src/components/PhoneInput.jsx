import { useTranslation } from "react-i18next";
import {
  getVietnameseMobileCarrier,
  isValidVietnameseMobileNumber,
  sanitizeVietnamesePhoneInput,
} from "../validation/authValidation";

const CARRIER_COLORS = {
  viettel: "#ef617e",
  vinaphone: "#5eb9f5",
  mobifone: "#69b4ed",
  vietnamobile: "#f3a15a",
  gmobile: "#eec25c",
  itel: "#ee696e",
  wintel: "#ea70b1",
};

function PhoneInput({
  disabled = false,
  error = "",
  id,
  label,
  onBlur,
  onChange,
  placeholder,
  required = false,
  size = "md",
  value,
}) {
  const { t } = useTranslation();
  const carrier = getVietnameseMobileCarrier(value);
  const isValid = isValidVietnameseMobileNumber(value);
  const descriptionId = `${id}-description`;
  const sizeClass = size === "sm" ? "px-3 py-2.5 text-sm" : "px-4 py-3 text-base";
  const labelClass =
    size === "sm"
      ? "text-sm font-normal text-slate-300"
      : "text-base font-semibold text-slate-200";

  return (
    <div>
      <div className="mb-2 flex min-h-6 items-center justify-between gap-3">
        <label className={labelClass} htmlFor={id}>
          {label}
          {required ? <span className="ml-1 text-rose-300">*</span> : null}
        </label>

        {carrier ? (
          <span
            aria-live="polite"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400"
            role="status"
            title={t("signup:carrierHint")}
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: CARRIER_COLORS[carrier.id] }}
            />
            <span className="font-medium text-slate-300">{carrier.name}</span>
            {isValid ? (
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            ) : null}
          </span>
        ) : null}
      </div>

      <div>
        <input
          aria-describedby={descriptionId}
          aria-invalid={Boolean(error)}
          autoComplete="tel"
          className={`w-full rounded-xl border bg-white/6 ${sizeClass} text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-60 ${
            error
              ? "border-rose-400/70 focus:border-rose-400"
              : "border-white/12 focus:border-[#ecc741]"
          }`}
          disabled={disabled}
          id={id}
          inputMode="tel"
          onBlur={onBlur}
          onChange={(event) => onChange(sanitizeVietnamesePhoneInput(event.target.value))}
          placeholder={placeholder}
          required={required}
          type="tel"
          value={value}
        />
      </div>

      <div id={descriptionId}>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-rose-300">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

export default PhoneInput;
