import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const UI_TEXT = {
  vi: {
    title: "Danh sách Học sinh & Định hướng Holland",
    subtitle: "Quản lý và tra cứu kết quả làm trắc nghiệm Holland Code (RIASEC) của học sinh.",
    searchPlaceholder: "Tìm học sinh, lớp, email...",
    filterClass: "Khối lớp (Tất cả)",
    filterGrade10: "Khối 10",
    filterGrade11: "Khối 11",
    filterGrade12: "Khối 12",
    filterStatus: "Trạng thái (Tất cả)",
    statusCompleted: "Completed (Đã hoàn thành)",
    statusPending: "Pending (Chưa thực hiện)",
    colId: "Mã HS",
    colName: "Họ và Tên / Lớp",
    colEmail: "Email",
    colStatus: "Trạng thái",
    colHolland: "Nhóm tính cách",
    colMatch: "Trường phù hợp nhất",
    colActions: "Hành động",
    actionReset: "Đặt lại lượt làm",
    actionView: "Xem kết quả",
    noStudents: "Không tìm thấy học sinh nào.",
    resetSuccess: "Đã đặt lại lượt làm bài trắc nghiệm cho học sinh",
    resetConfirm: "Bạn có chắc chắn muốn đặt lại lượt làm trắc nghiệm cho học sinh này? Tất cả kết quả cũ sẽ bị xóa bỏ.",
    modalTitle: "Chi tiết Kết quả Trắc nghiệm Holland",
    modalSubtitle: "Học sinh: ",
    modalCode: "Mã Holland Code: ",
    modalTraitTitle: "Điểm số các nhóm tính cách RIASEC",
    modalInterpretation: "Giải nghĩa tính cách & Định hướng nghề nghiệp",
    modalMajors: "Các ngành học đề xuất",
    modalUnis: "Trường Đại học gợi ý phù hợp",
    btnClose: "Đóng",
    btnResetLabel: "Đặt lại bài làm",
    majorIT: "Khoa học máy tính, Công nghệ phần mềm, Hệ thống thông tin",
    majorArts: "Thiết kế đồ họa, Truyền thông đa phương tiện, Kiến trúc",
    majorSocial: "Tâm lý học, Sư phạm ngoại ngữ, Quan hệ quốc tế",
    majorEngineering: "Kỹ thuật điện, Công nghệ ô tô, Robot và Trí tuệ nhân tạo",
    majorBusiness: "Quản trị kinh doanh, Tài chính doanh nghiệp, Marketing",
    majorMedical: "Y đa khoa, Dược học, Công nghệ sinh học",
  },
  en: {
    title: "Students & Holland Orientations",
    subtitle: "Manage and inspect students' Holland Code (RIASEC) career personality profiles.",
    searchPlaceholder: "Search student, class, email...",
    filterClass: "Grade Level (All)",
    filterGrade10: "Grade 10",
    filterGrade11: "Grade 11",
    filterGrade12: "Grade 12",
    filterStatus: "Status (All)",
    statusCompleted: "Completed",
    statusPending: "Pending",
    colId: "ID",
    colName: "Full Name / Class",
    colEmail: "Email",
    colStatus: "Status",
    colHolland: "Holland Trait",
    colMatch: "Best Matched School",
    colActions: "Actions",
    actionReset: "Reset Test Attempt",
    actionView: "View Results",
    noStudents: "No students found.",
    resetSuccess: "Successfully reset test attempt for student",
    resetConfirm: "Are you sure you want to reset the career test for this student? All previous test scores will be deleted.",
    modalTitle: "Holland Code Career Test Results",
    modalSubtitle: "Student Name: ",
    modalCode: "Holland Code: ",
    modalTraitTitle: "RIASEC Personality Scores",
    modalInterpretation: "Personality Interpretation & Career Direction",
    modalMajors: "Suggested Fields of Study / Majors",
    modalUnis: "Recommended Universities",
    btnClose: "Close",
    btnResetLabel: "Reset Attempt",
    majorIT: "Computer Science, Software Engineering, Information Systems",
    majorArts: "Graphic Design, Multimedia, Architecture",
    majorSocial: "Psychology, Language Education, International Relations",
    majorEngineering: "Electrical Engineering, Automotive Engineering, Robotics & AI",
    majorBusiness: "Business Administration, Corporate Finance, Marketing",
    majorMedical: "General Medicine, Pharmacy, Biotechnology",
  }
};

const HOLLAND_DESCRIPTIONS = {
  IAS: {
    traits: [
      { key: "Realistic (R)", score: 45, colorClass: "bg-rose-500" },
      { key: "Investigative (I)", score: 90, colorClass: "bg-teal-500" },
      { key: "Artistic (A)", score: 85, colorClass: "bg-purple-500" },
      { key: "Social (S)", score: 75, colorClass: "bg-indigo-500" },
      { key: "Enterprising (E)", score: 30, colorClass: "bg-amber-500" },
      { key: "Conventional (C)", score: 25, colorClass: "bg-emerald-500" },
    ],
    vi: {
      interpret: "Kiểu người IAS thích nghiên cứu, tìm tòi và sáng tạo nghệ thuật trong khi vẫn hướng tới việc giúp đỡ cộng đồng. Họ có xu hướng độc lập, tò mò và giàu trí tưởng tượng, thường thích hợp trong việc phát minh và truyền đạt các giải pháp mới.",
      majors: "Khoa học máy tính, Công nghệ truyền thông, Thiết kế tương tác (UI/UX), Công nghệ giáo dục.",
      unis: "Đại học Bách Khoa TP.HCM (HCMUT), Đại học Khoa học Tự nhiên (HCMUS), Đại học FPT."
    },
    en: {
      interpret: "An IAS personality profile describes an analytical explorer who values creative expression and helping others. They are curious, imaginative, and independent, thriving in environments that require designing innovative solutions.",
      majors: "Computer Science, UX/UI Interaction Design, Media Technology, Educational Technology.",
      unis: "VNU-HCM University of Technology (HCMUT), University of Science (HCMUS), FPT University."
    }
  },
  RIE: {
    traits: [
      { key: "Realistic (R)", score: 95, colorClass: "bg-rose-500" },
      { key: "Investigative (I)", score: 80, colorClass: "bg-teal-500" },
      { key: "Artistic (A)", score: 20, colorClass: "bg-purple-500" },
      { key: "Social (S)", score: 30, colorClass: "bg-indigo-500" },
      { key: "Enterprising (E)", score: 70, colorClass: "bg-amber-500" },
      { key: "Conventional (C)", score: 50, colorClass: "bg-emerald-500" },
    ],
    vi: {
      interpret: "Kiểu người RIE tập trung vào kỹ thuật thực tiễn và tư duy logic. Họ thích làm việc với máy móc, công nghệ cơ điện tử, tự động hóa và có năng lực quản lý các dự án kỹ thuật quy mô lớn.",
      majors: "Kỹ thuật ô tô, Điện - Điện tử, Robot và Trí tuệ nhân tạo, Quản lý công nghiệp.",
      unis: "Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE), Đại học Bách Khoa TP.HCM (HCMUT)."
    },
    en: {
      interpret: "RIE individuals are highly practical, hands-on mechanical thinkers. They enjoy working with machines, electronics, and mechanical designs, and possess strong traits for managing tech-driven projects.",
      majors: "Automotive Engineering, Robotics & AI, Electrical & Electronics Engineering, Industrial Management.",
      unis: "HCM City University of Technology and Education (HCMUTE), VNU-HCM University of Technology (HCMUT)."
    }
  },
  SAE: {
    traits: [
      { key: "Realistic (R)", score: 15, colorClass: "bg-rose-500" },
      { key: "Investigative (I)", score: 65, colorClass: "bg-teal-500" },
      { key: "Artistic (A)", score: 80, colorClass: "bg-purple-500" },
      { key: "Social (S)", score: 95, colorClass: "bg-indigo-500" },
      { key: "Enterprising (E)", score: 75, colorClass: "bg-amber-500" },
      { key: "Conventional (C)", score: 40, colorClass: "bg-emerald-500" },
    ],
    vi: {
      interpret: "Kiểu người SAE hướng ngoại, có khiếu giao tiếp xã hội và đam mê nghệ thuật. Họ thích giảng dạy, kết nối, tổ chức sự kiện và có khả năng thuyết phục tốt để truyền tải các thông điệp nhân văn.",
      majors: "Tâm lý học học đường, Quan hệ công chúng (PR), Sư phạm Ngoại ngữ, Quản trị dịch vụ giải trí.",
      unis: "Đại học Khoa học Xã hội và Nhân văn TP.HCM (USSH), Đại học Sư phạm TP.HCM (HCMUE)."
    },
    en: {
      interpret: "SAE profiles combine outstanding empathy, social orientation, and creative artistic flares. They excel at communicating, teaching, guiding public relations, and connecting with people on a human level.",
      majors: "Psychology, Public Relations (PR), Foreign Language Education, Hospitality & Tourism Management.",
      unis: "VNU-HCM University of Social Sciences and Humanities (USSH), HCM City University of Education."
    }
  },
  ISR: {
    traits: [
      { key: "Realistic (R)", score: 60, colorClass: "bg-rose-500" },
      { key: "Investigative (I)", score: 95, colorClass: "bg-teal-500" },
      { key: "Artistic (A)", score: 40, colorClass: "bg-purple-500" },
      { key: "Social (S)", score: 70, colorClass: "bg-indigo-500" },
      { key: "Enterprising (E)", score: 35, colorClass: "bg-amber-500" },
      { key: "Conventional (C)", score: 55, colorClass: "bg-emerald-500" },
    ],
    vi: {
      interpret: "Kiểu người ISR yêu thích nghiên cứu khoa học, khám phá công nghệ mới kết hợp với việc phục vụ các lợi ích của xã hội như y tế hay bảo vệ môi trường sinh thái.",
      majors: "Công nghệ sinh học, Dược học, Kỹ thuật y sinh, Khoa học dữ liệu.",
      unis: "Đại học Khoa học Tự nhiên TP.HCM (HCMUS), Đại học Y Dược TP.HCM (UMP)."
    },
    en: {
      interpret: "ISR profiles are driven by scientific inquiry and technology applications geared towards public benefits, healthcare, environmental protection, and biological improvements.",
      majors: "Biotechnology, Pharmacy, Biomedical Engineering, Data Science.",
      unis: "VNU-HCM University of Science (HCMUS), HCM City University of Medicine and Pharmacy (UMP)."
    }
  },
  ECS: {
    traits: [
      { key: "Realistic (R)", score: 30, colorClass: "bg-rose-500" },
      { key: "Investigative (I)", score: 50, colorClass: "bg-teal-500" },
      { key: "Artistic (A)", score: 40, colorClass: "bg-purple-500" },
      { key: "Social (S)", score: 80, colorClass: "bg-indigo-500" },
      { key: "Enterprising (E)", score: 95, colorClass: "bg-amber-500" },
      { key: "Conventional (C)", score: 70, colorClass: "bg-emerald-500" },
    ],
    vi: {
      interpret: "Kiểu người ECS có tư duy quản lý kinh doanh, nhạy bén với cơ hội thị trường và có kỹ năng tổ chức hành chính tốt. Họ thích lãnh đạo đội ngũ, vận hành quy trình kinh doanh trơn tru.",
      majors: "Quản trị kinh doanh, Tài chính ngân hàng, Quản trị nguồn nhân lực, Quản lý dự án.",
      unis: "Đại học Kinh tế TP.HCM (UEH), Đại học Ngoại thương Cơ sở 2 (FTU2)."
    },
    en: {
      interpret: "ECS profiles possess business-driven minds, leadership potential, and administrative organizing capabilities. They thrive in starting new ventures, optimizing workflows, and managing organizational teams.",
      majors: "Business Administration, Banking & Finance, Human Resource Management, Project Management.",
      unis: "University of Economics Ho Chi Minh City (UEH), Foreign Trade University HCMC Campus (FTU2)."
    }
  },
  ISA: {
    traits: [
      { key: "Realistic (R)", score: 30, colorClass: "bg-rose-500" },
      { key: "Investigative (I)", score: 95, colorClass: "bg-teal-500" },
      { key: "Artistic (A)", score: 75, colorClass: "bg-purple-500" },
      { key: "Social (S)", score: 80, colorClass: "bg-indigo-500" },
      { key: "Enterprising (E)", score: 40, colorClass: "bg-amber-500" },
      { key: "Conventional (C)", score: 35, colorClass: "bg-emerald-500" },
    ],
    vi: {
      interpret: "Kiểu người ISA đam mê nghiên cứu lý thuyết khoa học chuyên sâu và ứng dụng thực tiễn trong ngành chăm sóc sức khỏe hoặc các ngành sáng tạo độc đáo.",
      majors: "Y đa khoa, Nha khoa, Nghiên cứu dược lý, Công nghệ sinh học y học.",
      unis: "Đại học Y Dược TP.HCM (UMP), Khoa Y Đại học Quốc gia TP.HCM."
    },
    en: {
      interpret: "ISA profiles are deeply committed to advanced scientific research, medical applications, pharmacology studies, and unique creative implementations in healthcare fields.",
      majors: "General Medicine, Dentistry, Pharmacology Research, Medical Biotechnology.",
      unis: "Ho Chi Minh City University of Medicine and Pharmacy (UMP), VNU-HCM School of Medicine."
    }
  },
  AES: {
    traits: [
      { key: "Realistic (R)", score: 20, colorClass: "bg-rose-500" },
      { key: "Investigative (I)", score: 60, colorClass: "bg-teal-500" },
      { key: "Artistic (A)", score: 95, colorClass: "bg-purple-500" },
      { key: "Social (S)", score: 80, colorClass: "bg-indigo-500" },
      { key: "Enterprising (E)", score: 70, colorClass: "bg-amber-500" },
      { key: "Conventional (C)", score: 40, colorClass: "bg-emerald-500" },
    ],
    vi: {
      interpret: "Kiểu người AES cực kỳ sáng tạo, nhạy cảm với cái đẹp và có xu hướng tự do thể hiện bản thân qua hội họa, văn học, thiết kế hoặc kiến trúc.",
      majors: "Thiết kế đồ họa, Kiến trúc cảnh quan, Thiết kế thời trang, Truyền thông đa phương tiện.",
      unis: "Đại học Mỹ thuật TP.HCM, Đại học Kiến trúc TP.HCM (UAH), Đại học Tôn Đức Thắng (TDTU)."
    },
    en: {
      interpret: "AES individuals are highly creative, aesthetic, and imaginative. They seek self-expression through painting, graphic arts, literature, industrial design, or architecture.",
      majors: "Graphic Design, Multimedia Arts, Fashion Design, Landscape Architecture.",
      unis: "HCMC University of Fine Arts, HCMC University of Architecture (UAH), Ton Duc Thang University."
    }
  },
  IRC: {
    traits: [
      { key: "Realistic (R)", score: 85, colorClass: "bg-rose-500" },
      { key: "Investigative (I)", score: 95, colorClass: "bg-teal-500" },
      { key: "Artistic (A)", score: 30, colorClass: "bg-purple-500" },
      { key: "Social (S)", score: 35, colorClass: "bg-indigo-500" },
      { key: "Enterprising (E)", score: 40, colorClass: "bg-amber-500" },
      { key: "Conventional (C)", score: 80, colorClass: "bg-emerald-500" },
    ],
    vi: {
      interpret: "Kiểu người IRC có năng lực tuyệt vời trong việc giải quyết vấn đề kỹ thuật phức tạp thông qua phân tích dữ liệu chính xác và quy trình làm việc chuẩn hóa.",
      majors: "Kỹ thuật phần mềm, Cơ điện tử, Khoa học máy tính, Mạng máy tính và Truyền thông.",
      unis: "Đại học Bách Khoa TP.HCM (HCMUT), Đại học CNTT (UIT), Đại học FPT."
    },
    en: {
      interpret: "IRC profiles display exceptional skill in solving complex technical problems through logical analytical calculations and structured system execution guidelines.",
      majors: "Software Engineering, Mechatronics, Computer Science, Computer Networking.",
      unis: "VNU-HCM University of Technology (HCMUT), VNU-HCM University of Information Technology (UIT), FPT University."
    }
  }
};

function SchoolStudentsPage() {
  const { students, setStudents } = useOutletContext();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const text = UI_TEXT[locale];

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected student for details modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);

      let matchesClass = true;
      if (classFilter !== "all") {
        const gradeStr = classFilter === "10" ? "10" : classFilter === "11" ? "11" : "12";
        matchesClass = s.class.startsWith(gradeStr);
      }

      const matchesStatus = statusFilter === "all" || s.quizStatus === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  function handleResetTest(id, name) {
    if (window.confirm(`${text.resetConfirm}\n(${name})`)) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, quizStatus: "Pending", mainTrait: "—", hollandCode: "—", matchSchool: "—" }
            : s
        )
      );
      toast.info(`${text.resetSuccess}: ${name}`);
    }
  }

  // Retrieve Holland profile details for selected student
  const hollandDetail = useMemo(() => {
    if (!selectedStudent || selectedStudent.hollandCode === "—") return null;
    return HOLLAND_DESCRIPTIONS[selectedStudent.hollandCode] || null;
  }, [selectedStudent]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-['Sora'] text-xl font-semibold text-slate-900">{text.title}</h2>
          <p className="text-sm text-slate-500">{text.subtitle}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 flex-1 max-w-3xl">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.searchPlaceholder}
              type="text"
              value={searchQuery}
            />
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setClassFilter(e.target.value)}
              value={classFilter}
            >
              <option value="all">{text.filterClass}</option>
              <option value="10">{text.filterGrade10}</option>
              <option value="11">{text.filterGrade11}</option>
              <option value="12">{text.filterGrade12}</option>
            </select>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="all">{text.filterStatus}</option>
              <option value="Completed">{text.statusCompleted}</option>
              <option value="Pending">{text.statusPending}</option>
            </select>
          </div>
        </div>
      </article>

      {/* Desktop Table View */}
      <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
              <tr>
                <th className="px-4 py-3">{text.colId}</th>
                <th className="px-4 py-3">{text.colName}</th>
                <th className="px-4 py-3">{text.colEmail}</th>
                <th className="px-4 py-3">{text.colStatus}</th>
                <th className="px-4 py-3">{text.colHolland}</th>
                <th className="px-4 py-3">{text.colMatch}</th>
                <th className="px-4 py-3 text-right">{text.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={7}>
                    {text.noStudents}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((item) => (
                  <tr className="hover:bg-slate-50/50 transition-colors" key={item.id}>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.class}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {item.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                          item.quizStatus === "Completed"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.quizStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-800 font-medium whitespace-nowrap">
                      {item.mainTrait}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 max-w-[180px] truncate" title={item.matchSchool}>
                      {item.matchSchool}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {item.quizStatus === "Completed" && (
                          <button
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 shadow-sm"
                            onClick={() => setSelectedStudent(item)}
                            type="button"
                          >
                            {text.actionView}
                          </button>
                        )}
                        <button
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 shadow-sm"
                          onClick={() => handleResetTest(item.id, item.name)}
                          type="button"
                        >
                          {text.actionReset}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* Mobile Card List View */}
      <section className="space-y-3 md:hidden">
        {filteredStudents.length === 0 ? (
          <p className="text-center py-6 text-sm text-slate-400">{text.noStudents}</p>
        ) : (
          filteredStudents.map((item) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5" key={item.id}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">{item.id}</span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                    item.quizStatus === "Completed"
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {item.quizStatus}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{item.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                <p className="text-xs text-slate-700 font-semibold mt-1">Lớp / Class: {item.class}</p>
                {item.quizStatus === "Completed" && (
                  <p className="text-xs text-teal-600 font-semibold mt-1">Tính cách: {item.mainTrait}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
                {item.quizStatus === "Completed" && (
                  <button
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => setSelectedStudent(item)}
                    type="button"
                  >
                    {text.actionView}
                  </button>
                )}
                <button
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  onClick={() => handleResetTest(item.id, item.name)}
                  type="button"
                >
                  {text.actionReset}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* STUDENT HOLLAND RESULTS DETAILS MODAL */}
      {selectedStudent && hollandDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <article className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-['Sora'] text-lg font-bold text-slate-900">
                  {text.modalTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {text.modalSubtitle} <span className="font-bold text-slate-800">{selectedStudent.name}</span> ({selectedStudent.class})
                </p>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold focus:outline-none"
                onClick={() => setSelectedStudent(null)}
                type="button"
              >
                &times;
              </button>
            </header>

            {/* Content Sheet */}
            <div className="space-y-5 text-sm text-slate-800">
              {/* Holland Code Badge */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    {text.modalCode}
                  </span>
                  <p className="text-2xl font-bold font-mono text-teal-700 tracking-widest mt-1">
                    {selectedStudent.hollandCode}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">
                    {locale === "vi" ? "Tính cách nổi bật" : "Primary Archetype"}
                  </span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedStudent.mainTrait}</p>
                </div>
              </div>

              {/* Traits Breakdown Charts list */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">{text.modalTraitTitle}</h4>
                <div className="space-y-2.5">
                  {hollandDetail.traits.map((t) => (
                    <div key={t.key}>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">{t.key}</span>
                        <span className="text-slate-900">{t.score}/100</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className={`block h-full rounded-full ${t.colorClass}`}
                          style={{ width: `${t.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Interpretation paragraph */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">{text.modalInterpretation}</h4>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {hollandDetail[locale].interpret}
                </p>
              </div>

              {/* Majors and Universities lists */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-slate-150 bg-slate-50/40 p-4">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                    {text.modalMajors}
                  </h5>
                  <p className="text-slate-700 leading-relaxed">
                    {hollandDetail[locale].majors}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-150 bg-slate-50/40 p-4">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                    {text.modalUnis}
                  </h5>
                  <p className="text-slate-700 leading-relaxed">
                    {hollandDetail[locale].unis}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <footer className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                onClick={() => setSelectedStudent(null)}
                type="button"
              >
                {text.btnClose}
              </button>
            </footer>
          </article>
        </div>
      )}
    </div>
  );
}

export default SchoolStudentsPage;
