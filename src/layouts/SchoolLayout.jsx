import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import fourSLogo from "../assets/logo-4s.png";

const INITIAL_SCHOOL_INFO = {
  name: "Trường THPT Chuyên Lê Hồng Phong",
  address: "235 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh",
  phone: "028 3839 8506",
  email: "info@thpt-lehongphong-tphcm.edu.vn",
  website: "thpt-lehongphong-tphcm.edu.vn",
  principal: "Phạm Thị Lệ Hằng",
  totalStudents: 1450,
  totalClasses: 36,
  taxCode: "0310298734",
};

const INITIAL_STUDENTS = [
  { id: "STU001", name: "Nguyễn Minh Anh", class: "12 Chuyên Toán", email: "minhanh.lhp@gmail.com", quizStatus: "Completed", mainTrait: "Investigative (Nghiên cứu)", hollandCode: "IAS", matchSchool: "Đại học Bách Khoa TP.HCM (HCMUT)" },
  { id: "STU002", name: "Trần Hoàng Nam", class: "12 Chuyên Lý", email: "hoangnam.lhp@gmail.com", quizStatus: "Completed", mainTrait: "Realistic (Kỹ thuật)", hollandCode: "RIE", matchSchool: "Đại học Sư phạm Kỹ thuật (HCMUTE)" },
  { id: "STU003", name: "Lê Thị Mai Chi", class: "12 Chuyên Anh", email: "maichi.lhp@gmail.com", quizStatus: "Completed", mainTrait: "Social (Xã hội)", hollandCode: "SAE", matchSchool: "Đại học KHXH&NV TP.HCM (USSH)" },
  { id: "STU004", name: "Phạm Đức Minh", class: "12 Tin học", email: "ducminh.lhp@gmail.com", quizStatus: "Completed", mainTrait: "Investigative (Nghiên cứu)", hollandCode: "ISR", matchSchool: "Đại học Khoa học Tự nhiên (HCMUS)" },
  { id: "STU005", name: "Vũ Phương Thảo", class: "12 Song ngữ", email: "phuongthao.lhp@gmail.com", quizStatus: "Pending", mainTrait: "—", hollandCode: "—", matchSchool: "—" },
  { id: "STU006", name: "Đỗ Gia Bảo", class: "11 Chuyên Hóa", email: "giabao.lhp@gmail.com", quizStatus: "Completed", mainTrait: "Enterprising (Quản lý)", hollandCode: "ECS", matchSchool: "Đại học Kinh tế TP.HCM (UEH)" },
  { id: "STU007", name: "Nguyễn Trúc Quỳnh", class: "11 Chuyên Sinh", email: "trucquynh.lhp@gmail.com", quizStatus: "Completed", mainTrait: "Investigative (Nghiên cứu)", hollandCode: "ISA", matchSchool: "Đại học Y Dược TP.HCM (UMP)" },
  { id: "STU008", name: "Lê Huy Hoàng", class: "11 Tin học", email: "huyhoang.lhp@gmail.com", quizStatus: "Pending", mainTrait: "—", hollandCode: "—", matchSchool: "—" },
  { id: "STU009", name: "Hoàng Ngọc Linh", class: "10 Chuyên Văn", email: "ngoclinh.lhp@gmail.com", quizStatus: "Completed", mainTrait: "Artistic (Nghệ thuật)", hollandCode: "AES", matchSchool: "Đại học Mỹ thuật TP.HCM" },
  { id: "STU010", name: "Phạm Hải Đăng", class: "10 Chuyên Tin", email: "haidang.lhp@gmail.com", quizStatus: "Completed", mainTrait: "Investigative (Nghiên cứu)", hollandCode: "IRC", matchSchool: "Đại học Bách Khoa TP.HCM (HCMUT)" },
];

const INITIAL_EVENTS = [
  { id: 1, name: "Hội thảo Định hướng và Lựa chọn Ngành học 2026", date: "2026-06-15", host: "Đại học Bách Khoa TP.HCM", location: "Hội trường A", target: "Học sinh khối 12", status: "Scheduled" },
  { id: 2, name: "Tư vấn Trực tiếp: Khám phá tiềm năng cùng Holland Code", date: "2026-06-20", host: "Hệ thống Tư vấn 4S", location: "Phòng truyền thống", target: "Toàn bộ học sinh", status: "Scheduled" },
  { id: 3, name: "Ngày hội thông tin Tuyển sinh Đại học Quốc gia 2026", date: "2026-05-18", host: "Đại học Quốc gia TP.HCM", location: "Sân trường lớn", target: "Học sinh khối 11, 12", status: "Completed" },
  { id: 4, name: "Chia sẻ Kinh nghiệm Học tập & Săn học bổng Du học", date: "2026-06-28", host: "Hội cựu học sinh Lê Hồng Phong", location: "Phòng Đa năng C2", target: "Học sinh có nhu cầu", status: "Scheduled" },
];

function SchoolLayout({ onLogout = () => {} }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === "vi";
  const isEnglish = i18n.resolvedLanguage !== "vi";

  // Shared in-memory states
  const [schoolInfo, setSchoolInfo] = useState(INITIAL_SCHOOL_INFO);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [events, setEvents] = useState(INITIAL_EVENTS);

  function handleLanguageChange(lang) {
    i18n.changeLanguage(lang);
  }

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  const NAV_ITEMS = [
    { label: isVi ? "Dashboard & Tổng quan" : "Dashboard & Overview", to: "/school/dashboard" },
    { label: isVi ? "Danh sách Học sinh" : "Student Directory", to: "/school/students" },
    { label: isVi ? "Sự kiện Hướng nghiệp" : "Career Events", to: "/school/events" },
    { label: isVi ? "Thông tin Trường học" : "School Profile", to: "/school/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* Sidebar – Desktop */}
        <aside className="hidden min-h-screen w-[290px] shrink-0 border-r border-slate-200/80 bg-white px-5 py-6 lg:flex lg:flex-col shadow-sm">
          <button
            className="flex items-center gap-3 px-1 py-1 text-left transition hover:opacity-90 focus:outline-none"
            onClick={() => navigate("/school/dashboard")}
            type="button"
          >
            <img alt="4S logo" className="h-16 w-16 object-contain" src={fourSLogo} />
            <span className="font-['Sora'] text-lg font-bold text-slate-900 leading-tight">4S School Portal</span>
          </button>

          <div className="mt-3 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {isVi ? "Trường quản lý" : "Managed School"}
            </p>
            <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">{schoolInfo.name}</p>
          </div>

          <nav aria-label="School navigation" className="mt-7 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "border-teal-500 bg-teal-50/70 text-teal-700 shadow-sm"
                      : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-2">
            <button
              className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
              onClick={handleLogout}
              type="button"
            >
              {isVi ? "Đăng xuất" : "Logout"}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white px-4 py-4 backdrop-blur-xl md:px-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-medium">
                  {isVi ? "Ban Giám Hiệu" : "School Management"}
                </p>
                <h1 className="font-['Sora'] text-xl font-semibold text-slate-900">
                  {isVi ? "Cổng Thông Tin Học Đường 4S" : "4S School Management Console"}
                </h1>
              </div>

              {/* Language Switcher */}
              <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                <button
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    isEnglish
                      ? "bg-white text-teal-700 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => handleLanguageChange("en")}
                  type="button"
                >
                  EN
                </button>
                <button
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    isEnglish
                      ? "text-slate-500 hover:text-slate-800"
                      : "bg-white text-teal-700 shadow-sm border border-slate-100"
                  }`}
                  onClick={() => handleLanguageChange("vi")}
                  type="button"
                >
                  VI
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav aria-label="School mobile navigation" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) =>
                    `rounded-xl border px-3 py-2 text-center text-sm font-semibold transition ${
                      isActive
                        ? "border-teal-500 bg-teal-50/70 text-teal-700 shadow-sm"
                        : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"
                    }`
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                onClick={handleLogout}
                type="button"
              >
                {isVi ? "Đăng xuất" : "Logout"}
              </button>
            </nav>
          </header>

          <main className="w-full flex-1 px-4 py-5 md:px-6 md:py-6">
            <Outlet context={{ schoolInfo, setSchoolInfo, students, setStudents, events, setEvents }} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default SchoolLayout;
