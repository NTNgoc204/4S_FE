import React, { useState } from "react";

export default function ImportStudentEmailsModal({
  isOpen,
  onClose,
  registration,
  onImportSuccess,
  isVi,
}) {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [resultKeys, setResultKeys] = useState([]); // List of { email, activationKey } from BE

  const canSubmit = file !== null && !isSubmitting && !isDone;

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file extension (.docx)
      if (
        selectedFile.name.endsWith(".docx") ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(selectedFile);
      } else {
        alert(
          isVi
            ? "Vui lòng chọn định dạng file Word (.docx)."
            : "Please select a Word file (.docx)."
        );
        setFile(null);
      }
    }
  }

  function handleClose() {
    setFile(null);
    setIsDone(false);
    setResultKeys([]);
    setIsSubmitting(false);
    onClose();
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("file", file);

    // Call success handler which dispatches Redux action
    onImportSuccess(registration.id, formData, (keysList) => {
      setResultKeys(keysList);
      setIsSubmitting(false);
      setIsDone(true);
    });
  }

  if (!isOpen || !registration) return null;

  const maxStudents = registration.studentCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h3 className="font-['Sora'] text-base font-extrabold text-slate-900 tracking-tight">
              {isVi
                ? "Tải lên danh sách học sinh"
                : "Upload Student Email List"}
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
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* How it works banner */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 flex gap-3 text-sm text-indigo-800">
            <svg
              className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="leading-relaxed space-y-1">
              <p className="font-semibold">
                {isVi ? "Cách hoạt động:" : "How it works:"}
              </p>
              <p>
                {isVi
                  ? `1. Chọn file Word (.docx) chứa danh sách email học sinh (tối đa ${maxStudents} HS).`
                  : `1. Select a Word file (.docx) containing student emails (max ${maxStudents} students).`}
              </p>
              <p>
                {isVi
                  ? "2. Hệ thống tự động đọc file và sinh mã kích hoạt (Activation Key) cho từng học sinh."
                  : "2. The system automatically reads the file and generates a unique key for each student."}
              </p>
            </div>
          </div>

          {/* File Upload Selector */}
          {!isDone && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isVi ? "Tệp danh sách học sinh (.docx)" : "Student List File (.docx)"}
              </label>

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-white hover:bg-slate-50/50 transition relative">
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg
                  className="h-10 w-10 text-slate-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-semibold text-slate-700">
                  {file ? file.name : (isVi ? "Nhấp hoặc kéo thả tệp tin vào đây" : "Click or drag file here")}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : (isVi ? "Chỉ chấp nhận tệp định dạng .docx" : "Only .docx files allowed")}
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {isDone && resultKeys.length > 0 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-4">
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-emerald-800 text-sm">
                    {isVi
                      ? `Đã tạo mã kích hoạt cho ${resultKeys.length} học sinh thành công!`
                      : `Successfully generated keys for ${resultKeys.length} students!`}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    {isVi
                      ? "Mỗi học sinh đã được cấp một mã kích hoạt riêng tương ứng với email của họ."
                      : "Each student has been assigned a unique activation key matched to their email."}
                  </p>
                </div>
              </div>

              {/* Display Keys Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-[300px] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-500 text-left uppercase">
                    <tr>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">{isVi ? "Mã kích hoạt" : "Activation Key"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {resultKeys.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium">{item.email}</td>
                        <td className="px-4 py-2.5">
                          <code className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-indigo-700 font-mono font-bold tracking-wider">
                            {item.activationKey}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
              disabled={!canSubmit}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isVi ? "Đang import..." : "Importing..."}
                </>
              ) : (
                <>
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  {isVi ? "Tải lên & Import" : "Upload & Import"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
