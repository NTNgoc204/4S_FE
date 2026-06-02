import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

const UI_TEXT = {
  vi: {
    title: "Báo cáo Tổng quan Hướng nghiệp",
    subtitle: "Xem tiến độ khảo sát nghề nghiệp Holland, số lượng học sinh tham gia và cơ cấu khối ngành quan tâm.",
    kpiTotalStudents: "Quy mô Học sinh",
    kpiTakers: "Tỷ lệ Làm Trắc nghiệm",
    kpiEvents: "Sự kiện Hướng nghiệp",
    kpiSponsors: "Tài khoản Hướng nghiệp VIP",
    studentsSuffix: "học sinh",
    activeSuffix: "sắp diễn ra",
    sponsoredVal: "120 tài khoản",
    sponsoredDesc: "Được tài trợ bởi nhà trường",
    chartClassTitle: "Số lượng làm trắc nghiệm theo khối lớp",
    careerTitle: "Cơ cấu Khối ngành học sinh Quan tâm",
    careerDesc: "Tính dựa trên kết quả Holland Code RIASEC cao nhất của học sinh.",
    uniTitle: "Top Trường Đại học Phù hợp & Phổ biến",
    uniDesc: "Các trường đại học được học sinh của trường quan tâm và khớp nhiều nhất.",
    fieldIT: "Công nghệ thông tin (IT)",
    fieldBusiness: "Kinh tế & Quản trị kinh doanh",
    fieldArt: "Mỹ thuật & Thiết kế sáng tạo",
    fieldMedical: "Y Dược & Chăm sóc sức khỏe",
    fieldSocial: "Khoa học Xã hội & Ngôn ngữ",
    fieldRealistic: "Kỹ thuật & Công nghệ sản xuất",
    completedText: "Đã làm trắc nghiệm",
  },
  en: {
    title: "Career Orientation Dashboard",
    subtitle: "Monitor student survey progress, guided test completions, and career area interest distributions.",
    kpiTotalStudents: "Total Enrolled Students",
    kpiTakers: "Survey Completion Rate",
    kpiEvents: "Orientation Events",
    kpiSponsors: "VIP Student Accounts",
    studentsSuffix: "students",
    activeSuffix: "scheduled",
    sponsoredVal: "120 accounts",
    sponsoredDesc: "Sponsored by school funds",
    chartClassTitle: "Guided test completions by grade levels",
    careerTitle: "Student Career Field Interests",
    careerDesc: "Calculated from students' top Holland Code RIASEC traits.",
    uniTitle: "Top Matched & Popular Universities",
    uniDesc: "Higher education institutions most matched and selected by students.",
    fieldIT: "Information Technology (IT)",
    fieldBusiness: "Business & Administration",
    fieldArt: "Fine Arts & Creative Design",
    fieldMedical: "Healthcare & Pharmacy",
    fieldSocial: "Social Sciences & Languages",
    fieldRealistic: "Engineering & Operations",
    completedText: "Completed Guided Test",
  }
};

function SchoolDashboardPage() {
  const { students, events, schoolInfo } = useOutletContext();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const text = UI_TEXT[locale];

  // Calculate dynamic stats
  const totalStudentsCount = schoolInfo.totalStudents || 1450;
  const completedQuizCount = useMemo(() => {
    // 78% baseline + any dynamic in-memory modifications
    const inMemoryCompleted = students.filter(s => s.quizStatus === "Completed").length;
    const baseVal = Math.round(totalStudentsCount * 0.78);
    return baseVal + (inMemoryCompleted - 8); // Offset baseline relative to initial sample of 8 completed
  }, [students, totalStudentsCount]);

  const completionPercent = ((completedQuizCount / totalStudentsCount) * 100).toFixed(1);

  const scheduledEventsCount = useMemo(() => {
    return events.filter(e => e.status === "Scheduled").length;
  }, [events]);

  // Holland trait distributions
  const careerData = useMemo(() => {
    return [
      { name: text.fieldIT, percent: 34, colorClass: "bg-teal-500" },
      { name: text.fieldBusiness, percent: 26, colorClass: "bg-indigo-500" },
      { name: text.fieldSocial, percent: 15, colorClass: "bg-amber-500" },
      { name: text.fieldRealistic, percent: 12, colorClass: "bg-rose-500" },
      { name: text.fieldMedical, percent: 8, colorClass: "bg-emerald-500" },
      { name: text.fieldArt, percent: 5, colorClass: "bg-purple-500" },
    ];
  }, [text]);

  // Top Matched Universities
  const popularUniversities = useMemo(() => {
    return [
      { id: "hcmut", name: "Đại học Bách Khoa TP.HCM (HCMUT)", matches: 142, rating: "4.8" },
      { id: "ueh", name: "Đại học Kinh tế TP.HCM (UEH)", matches: 118, rating: "4.7" },
      { id: "hcmus", name: "Đại học Khoa học Tự nhiên (HCMUS)", matches: 95, rating: "4.7" },
      { id: "ussh", name: "Đại học KHXH&NV TP.HCM (USSH)", matches: 74, rating: "4.6" },
    ];
  }, []);

  // Class distributions
  const gradeDistribution = [
    { grade: "Lớp 10 / Grade 10", completed: Math.round(completedQuizCount * 0.22), total: Math.round(totalStudentsCount * 0.33) },
    { grade: "Lớp 11 / Grade 11", completed: Math.round(completedQuizCount * 0.35), total: Math.round(totalStudentsCount * 0.33) },
    { grade: "Lớp 12 / Grade 12", completed: Math.round(completedQuizCount * 0.43), total: Math.round(totalStudentsCount * 0.34) },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">{text.title}</h2>
          <p className="text-sm text-slate-500">{text.subtitle}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{text.kpiTotalStudents}</p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-teal-600">
            {totalStudentsCount.toLocaleString()}
          </p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {schoolInfo.totalClasses} {locale === "vi" ? "lớp học" : "classes"}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{text.kpiTakers}</p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-indigo-600">
            {completionPercent}%
          </p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {completedQuizCount.toLocaleString()} {text.studentsSuffix}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{text.kpiEvents}</p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-amber-600">
            {events.length}
          </p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {scheduledEventsCount} {text.activeSuffix}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{text.kpiSponsors}</p>
          <p className="mt-2 font-['Sora'] text-2xl font-semibold text-emerald-600">
            {text.sponsoredVal}
          </p>
          <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {text.sponsoredDesc}
          </span>
        </div>
      </section>

      {/* Grade levels progress & Top Career Fields */}
      <section className="grid gap-5 lg:grid-cols-2">
        {/* Grade completions bar cards */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">{text.chartClassTitle}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{locale === "vi" ? "Phân tích theo khối lớp 10, 11 và 12" : "Analysis across grades 10, 11, and 12"}</p>
          </div>

          <div className="mt-6 space-y-5">
            {gradeDistribution.map((g) => {
              const ratio = ((g.completed / g.total) * 100).toFixed(0);
              return (
                <div key={g.grade} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex justify-between items-center text-sm font-semibold mb-2">
                    <span className="text-slate-800">{g.grade}</span>
                    <span className="text-teal-600">{g.completed.toLocaleString()} / {g.total.toLocaleString()} ({ratio}%)</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200/60">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600"
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-bold tracking-wider">{text.completedText}</p>
                </div>
              );
            })}
          </div>
        </article>

        {/* Top Career Interests breakdown */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">{text.careerTitle}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{text.careerDesc}</p>

          <div className="mt-6 space-y-4">
            {careerData.map((item) => (
              <div key={item.name}>
                <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-900">{item.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={`block h-full rounded-full ${item.colorClass}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Universities matched list */}
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-['Sora'] text-lg font-semibold text-slate-900">{text.uniTitle}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{text.uniDesc}</p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
              <tr>
                <th className="px-4 py-3">{locale === "vi" ? "Tên trường đại học" : "University Name"}</th>
                <th className="px-4 py-3 text-center">{locale === "vi" ? "Số lượng học sinh khớp" : "Matched Students Count"}</th>
                <th className="px-4 py-3 text-center">{locale === "vi" ? "Đánh giá học viên" : "Student Rating"}</th>
                <th className="px-4 py-3 text-right">{locale === "vi" ? "Hành động" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popularUniversities.map((uni) => (
                <tr className="hover:bg-slate-50/50 transition-colors" key={uni.id}>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    {uni.name}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-teal-600">
                    {uni.matches} {text.studentsSuffix}
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-amber-500 font-mono">
                    ★ {uni.rating}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                      type="button"
                    >
                      {locale === "vi" ? "Xem chi tiết trường" : "View School Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

export default SchoolDashboardPage;
