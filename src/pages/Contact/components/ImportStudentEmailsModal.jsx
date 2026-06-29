import React, { useState, useMemo } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateEduKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "EDU-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function ImportStudentEmailsModal({
  isOpen,
  onClose,
  registration,
  onImportSuccess,
  isVi,
}) {
  const [rawInput, setRawInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [result, setResult] = useState(null); // { key, count }

  // Parse and validate emails from textarea
  const parsedEmails = useMemo(() => {
    if (!rawInput.trim()) return [];
    const lines = rawInput
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const seen = new Set();
    return lines.map((email) => {
      const isValid = EMAIL_REGEX.test(email);
      const isDuplicate = seen.has(email);
      if (isValid && !isDuplicate) seen.add(email);
      return { email, isValid, isDuplicate };
    });
  }, [rawInput]);

  const validEmails = parsedEmails.filter((e) => e.isValid && !e.isDuplicate);
  const invalidCount = parsedEmails.filter((e) => !e.isValid).length;
  const duplicateCount = parsedEmails.filter((e) => e.isValid && e.isDuplicate).length;
  const maxStudents = registration?.studentCount || 0;
  const isOverLimit = validEmails.length > maxStudents;

  const canSubmit = validEmails.length > 0 && !isOverLimit && !isSubmitting && !isDone;

  function handleClose() {
    setRawInput("");
    setIsDone(false);
    setResult(null);
    setIsSubmitting(false);
    onClose();
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);

    // Simulate async: generate 1 shared key, "send" to all students (1.5s)
    setTimeout(() => {
      const sharedKey = generateEduKey();
      const emailList = validEmails.map((e) => e.email);

      setResult({ key: sharedKey, count: emailList.length });
      setIsSubmitting(false);
      setIsDone(true);

      // Pass up: 1 shared key + full email list
      onImportSuccess(registration.id, sharedKey, emailList);
    }, 1500);
  }

  if (!isOpen || !registration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h3 className="font-['Sora'] text-base font-extrabold text-slate-900 tracking-tight">
              {isVi ? "Nhập danh sách email học sinh" : "Import Student Emails"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {registration.schoolName} — {registration.id}
            </p>
          </div>
          <button
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            onClick={handleClose}
            type="button"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* How it works banner */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 flex gap-3 text-sm text-indigo-800">
            <svg className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="leading-relaxed space-y-1">
              <p className="font-semibold">
                {isVi ? "Cách hoạt động:" : "How it works:"}
              </p>
              <p>
                {isVi
                  ? `1. Nhập danh sách email học sinh (tối đa ${maxStudents} HS theo đơn)`
                  : `1. Enter student emails (max ${maxStudents} per this order)`}
              </p>
              <p>
                {isVi
                  ? "2. Hệ thống tạo 1 mã kích hoạt dùng chung cho cả trường"
                  : "2. System generates 1 shared activation key for the whole school"}
              </p>
              <p>
                {isVi
                  ? "3. Gửi cùng 1 mã đó đến tất cả học sinh trong danh sách qua email"
                  : "3. Sends that same key to all students in the list via email"}
              </p>
            </div>
          </div>

          {/* Email textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isVi ? "Danh sách email học sinh" : "Student Email List"}
              </label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                isOverLimit
                  ? "bg-rose-50 text-rose-600"
                  : validEmails.length > 0
                  ? "bg-teal-50 text-teal-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {validEmails.length}/{maxStudents} {isVi ? "học sinh" : "students"}
              </span>
            </div>
            <textarea
              className={`w-full rounded-xl border px-4 py-3 text-sm font-mono text-slate-700 focus:outline-none shadow-3xs resize-none transition-all ${
                isOverLimit
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
                  : "border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              }`}
              disabled={isDone || isSubmitting}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={
                isVi
                  ? "student1@school.edu.vn\nstudent2@school.edu.vn\nstudent3@school.edu.vn"
                  : "student1@school.edu\nstudent2@school.edu\nstudent3@school.edu"
              }
              rows={10}
              value={rawInput}
            />

            {/* Validation pills */}
            {parsedEmails.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2 text-2xs font-semibold">
                <span className="bg-teal-50 text-teal-700 border border-teal-200 rounded-lg px-2 py-0.5">
                  ✓ {validEmails.length} {isVi ? "hợp lệ" : "valid"}
                </span>
                {invalidCount > 0 && (
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 rounded-lg px-2 py-0.5">
                    ✗ {invalidCount} {isVi ? "sai định dạng" : "invalid format"}
                  </span>
                )}
                {duplicateCount > 0 && (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2 py-0.5">
                    ⚠ {duplicateCount} {isVi ? "trùng lặp (bỏ qua)" : "duplicate (skipped)"}
                  </span>
                )}
                {isOverLimit && (
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 rounded-lg px-2 py-0.5">
                    ✗ {isVi ? `Vượt quá giới hạn ${maxStudents} HS` : `Exceeds ${maxStudents} student limit`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Success State */}
          {isDone && result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-emerald-800 text-sm">
                    {isVi
                      ? `Đã tạo mã kích hoạt và gửi đến ${result.count} học sinh!`
                      : `Activation key created and sent to ${result.count} students!`}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    {isVi
                      ? "Tất cả học sinh trong danh sách đã nhận cùng 1 mã bên dưới. Học sinh dùng mã này để kích hoạt gói trường khi đăng ký."
                      : "All students received the same key below. They use this key at sign-up or in their profile to activate the school plan."}
                  </p>
                </div>
              </div>

              {/* The generated key */}
              <div className="bg-white border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    {isVi ? "Mã kích hoạt (gửi cho tất cả HS)" : "Activation Key (sent to all students)"}
                  </p>
                  <code className="text-xl font-mono font-extrabold text-slate-800 tracking-widest select-all">
                    {result.key}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(result.key);
                  }}
                  className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 transition cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {isVi ? "Sao chép" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-end gap-3">
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
            onClick={handleClose}
            type="button"
          >
            {isDone ? (isVi ? "Đóng" : "Close") : (isVi ? "Hủy" : "Cancel")}
          </button>

          {!isDone && (
            <button
              className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition shadow-sm cursor-pointer flex items-center gap-2 ${
                canSubmit
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
              disabled={!canSubmit}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isVi ? "Đang tạo mã & gửi email..." : "Creating key & sending emails..."}
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  {isVi
                    ? `Tạo key & gửi đến ${validEmails.length} HS`
                    : `Generate key & send to ${validEmails.length} students`}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
