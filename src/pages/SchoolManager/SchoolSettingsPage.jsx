import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const UI_TEXT = {
  vi: {
    title: "Hồ sơ Trường học & Thông tin liên hệ",
    subtitle: "Xem thông tin chi tiết về cơ sở giáo dục do bạn quản trị.",
    cardTitle: "Thông tin Chi tiết Cơ sở",
    labelName: "Tên trường học",
    labelAddress: "Địa chỉ trụ sở chính",
    labelPhone: "Số điện thoại liên hệ",
    labelEmail: "Email đại diện trường",
    labelWebsite: "Website trường",
    labelPrincipal: "Hiệu trưởng / Đại diện pháp luật",
    labelTotalStudents: "Quy mô Học sinh",
    labelTotalClasses: "Tổng số lớp học",
    labelTaxCode: "Mã số thuế trường (MST)",
  },
  en: {
    title: "School Profile & Contact Details",
    subtitle: "View details about the educational institution under your management.",
    cardTitle: "Institution Details",
    labelName: "School Name",
    labelAddress: "Registered Address",
    labelPhone: "Contact Phone Number",
    labelEmail: "School Email Address",
    labelWebsite: "Official Website",
    labelPrincipal: "Principal / Legal Representative",
    labelTotalStudents: "Total Enrolled Students",
    labelTotalClasses: "Total Classrooms Count",
    labelTaxCode: "Institutional Tax Identification",
  }
};

function SchoolSettingsPage() {
  const { schoolInfo, setSchoolInfo } = useOutletContext();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const text = UI_TEXT[locale];

  const [form, setForm] = useState({
    name: schoolInfo.name,
    address: schoolInfo.address,
    phone: schoolInfo.phone,
    email: schoolInfo.email,
    website: schoolInfo.website,
    principal: schoolInfo.principal,
    totalStudents: String(schoolInfo.totalStudents),
    totalClasses: String(schoolInfo.totalClasses),
    taxCode: schoolInfo.taxCode,
  });

  function handleSave(e) {
    e.preventDefault();
    const studentsNum = parseInt(form.totalStudents);
    const classesNum = parseInt(form.totalClasses);

    setSchoolInfo({
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      principal: form.principal.trim(),
      totalStudents: isNaN(studentsNum) ? schoolInfo.totalStudents : studentsNum,
      totalClasses: isNaN(classesNum) ? schoolInfo.totalClasses : classesNum,
      taxCode: form.taxCode.trim(),
    });

    toast.success(text.toastSuccess);
  }

  function handleReset() {
    setForm({
      name: schoolInfo.name,
      address: schoolInfo.address,
      phone: schoolInfo.phone,
      email: schoolInfo.email,
      website: schoolInfo.website,
      principal: schoolInfo.principal,
      totalStudents: String(schoolInfo.totalStudents),
      totalClasses: String(schoolInfo.totalClasses),
      taxCode: schoolInfo.taxCode,
    });
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">{text.title}</h2>
          <p className="text-sm text-slate-500">{text.subtitle}</p>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        <h3 className="font-['Sora'] text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-5">
          {text.cardTitle}
        </h3>

        <div className="space-y-4 text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 font-medium text-slate-600">{text.labelName}</p>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 shadow-sm font-semibold"
                disabled
                type="text"
                value={form.name}
              />
            </div>
            <div>
              <p className="mb-1.5 font-medium text-slate-600">{text.labelPrincipal}</p>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 shadow-sm"
                disabled
                type="text"
                value={form.principal}
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 font-medium text-slate-600">{text.labelAddress}</p>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 shadow-sm"
              disabled
              type="text"
              value={form.address}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1.5 font-medium text-slate-600">{text.labelPhone}</p>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 shadow-sm font-mono"
                disabled
                type="text"
                value={form.phone}
              />
            </div>
            <div>
              <p className="mb-1.5 font-medium text-slate-600">{text.labelEmail}</p>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 shadow-sm"
                disabled
                type="email"
                value={form.email}
              />
            </div>
            <div>
              <p className="mb-1.5 font-medium text-slate-600">{text.labelWebsite}</p>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 shadow-sm font-mono"
                disabled
                type="text"
                value={form.website}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1.5 font-medium text-slate-600">{text.labelTotalStudents}</p>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 shadow-sm"
                disabled
                type="number"
                value={form.totalStudents}
              />
            </div>
            <div>
              <p className="mb-1.5 font-medium text-slate-600">{text.labelTotalClasses}</p>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 shadow-sm"
                disabled
                type="number"
                value={form.totalClasses}
              />
            </div>
            <div>
              <p className="mb-1.5 font-medium text-slate-600">{text.labelTaxCode}</p>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 shadow-sm font-mono"
                disabled
                type="text"
                value={form.taxCode}
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default SchoolSettingsPage;
