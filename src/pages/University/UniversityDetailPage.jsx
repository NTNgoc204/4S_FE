import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import fourSLogo from "../../assets/logo-4s.png";
import sparklesIcon from "../../assets/Sparkles.svg";
import globeIcon from "../../assets/Globe.svg";
import { getUniversityById } from "../../data/universities";
import { fetchUniversityDetailRequest } from "../../feature/university/universitySlice";

const DETAIL_DATA = {
  hcmut: {
    tuitionActual: [18, 19, 20, 21],
    tuitionEstimated: [20, 21, 22, 23],
    trend: [15, 16, 17, 18, 19, 20],
    entrance: [24.5, 25, 25.5, 26, 26.5, 27],
    admission: [
      { key: "overall", value: 85, tone: "teal" },
      { key: "academic", value: 90, tone: "teal" },
      { key: "profile", value: 88, tone: "teal" },
      { key: "competition", value: 75, tone: "amber" },
    ],
    reviews: [
      {
        id: "r1",
        name: "Minh Nguyen",
        program: { en: "Computer Science", vi: "Khoa học máy tính" },
        year: { en: "Year 3", vi: "Năm 3" },
        stars: 5,
        date: { en: "January 2026", vi: "Tháng 1/2026" },
        content: {
          en: "Excellent program with great professors and modern facilities. The curriculum is well-designed and industry-relevant.",
          vi: "Chương trình rất tốt, giảng viên giỏi và cơ sở vật chất hiện đại. Nội dung học bám sát nhu cầu thực tế.",
        },
      },
      {
        id: "r2",
        name: "Thu Ha",
        program: { en: "Software Engineering", vi: "Kỹ thuật phần mềm" },
        year: { en: "Year 2", vi: "Năm 2" },
        stars: 4,
        date: { en: "December 2025", vi: "Tháng 12/2025" },
        content: {
          en: "Supportive community and solid teaching quality. Campus facilities can be better, but overall value is strong.",
          vi: "Môi trường hỗ trợ tốt, chất lượng đào tạo ổn. Cơ sở vật chất có thể cải thiện thêm nhưng nhìn chung rất đáng học.",
        },
      },
      {
        id: "r3",
        name: "Duc Anh",
        program: { en: "Information Technology", vi: "Công nghệ thông tin" },
        year: { en: "Year 4", vi: "Năm 4" },
        stars: 5,
        date: { en: "November 2025", vi: "Tháng 11/2025" },
        content: {
          en: "Great decision for my career path. Internship and industry connections are practical and highly useful.",
          vi: "Đây là lựa chọn đúng cho định hướng nghề nghiệp của mình. Cơ hội thực tập và kết nối doanh nghiệp rất hữu ích.",
        },
      },
    ],
  },
  hust: {
    tuitionActual: [17, 18, 19, 20],
    tuitionEstimated: [19, 20, 21, 22],
    trend: [14, 15, 16, 17, 18, 19],
    entrance: [24, 24.6, 25.2, 25.9, 26.4, 26.9],
    admission: [
      { key: "overall", value: 82, tone: "teal" },
      { key: "academic", value: 87, tone: "teal" },
      { key: "profile", value: 84, tone: "teal" },
      { key: "competition", value: 79, tone: "amber" },
    ],
    reviews: [
      {
        id: "hust-r1",
        name: "Ngoc Anh",
        program: { en: "Mechanical Engineering", vi: "Kỹ thuật cơ khí" },
        year: { en: "Year 3", vi: "Năm 3" },
        stars: 5,
        date: { en: "February 2026", vi: "Tháng 2/2026" },
        content: {
          en: "Lab access is excellent and project-based classes are very practical. I improved a lot in problem-solving.",
          vi: "Phòng lab rất tốt và các môn theo dự án cực kỳ thực tế. Mình tiến bộ rõ về kỹ năng giải quyết vấn đề.",
        },
      },
      {
        id: "hust-r2",
        name: "Hoang Long",
        program: { en: "Electrical Engineering", vi: "Kỹ thuật điện" },
        year: { en: "Year 2", vi: "Năm 2" },
        stars: 4,
        date: { en: "January 2026", vi: "Tháng 1/2026" },
        content: {
          en: "Course load is heavy but worth it. Lecturers are strict and supportive when you ask questions.",
          vi: "Khối lượng học khá nặng nhưng xứng đáng. Giảng viên nghiêm túc và hỗ trợ tốt khi sinh viên chủ động hỏi.",
        },
      },
      {
        id: "hust-r3",
        name: "Mai Phuong",
        program: { en: "Data Science", vi: "Khoa học dữ liệu" },
        year: { en: "Year 4", vi: "Năm 4" },
        stars: 5,
        date: { en: "December 2025", vi: "Tháng 12/2025" },
        content: {
          en: "Strong technical foundation and good internship links. The program prepares students well for industry.",
          vi: "Nền tảng kỹ thuật rất chắc và có liên kết thực tập tốt. Chương trình chuẩn bị khá tốt cho môi trường doanh nghiệp.",
        },
      },
    ],
  },
  ftu: {
    tuitionActual: [14, 15, 16, 17],
    tuitionEstimated: [15, 16, 17, 18],
    trend: [13, 14, 14.8, 15.6, 16.4, 17.1],
    entrance: [25, 25.4, 25.8, 26.2, 26.6, 27],
    admission: [
      { key: "overall", value: 80, tone: "teal" },
      { key: "academic", value: 86, tone: "teal" },
      { key: "profile", value: 82, tone: "teal" },
      { key: "competition", value: 82, tone: "amber" },
    ],
    reviews: [
      {
        id: "ftu-r1",
        name: "Khanh Linh",
        program: { en: "International Business", vi: "Kinh doanh quốc tế" },
        year: { en: "Year 3", vi: "Năm 3" },
        stars: 5,
        date: { en: "February 2026", vi: "Tháng 2/2026" },
        content: {
          en: "Presentation and negotiation training is strong. I feel much more confident in internships.",
          vi: "Phần đào tạo thuyết trình và đàm phán rất mạnh. Mình tự tin hơn nhiều khi đi thực tập.",
        },
      },
      {
        id: "ftu-r2",
        name: "Bao Chau",
        program: { en: "Finance", vi: "Tài chính" },
        year: { en: "Year 2", vi: "Năm 2" },
        stars: 4,
        date: { en: "January 2026", vi: "Tháng 1/2026" },
        content: {
          en: "The pace is fast but teachers provide useful career advice. Club activities are also very active.",
          vi: "Tốc độ học nhanh nhưng giảng viên cho định hướng nghề nghiệp khá sát thực tế. Hoạt động câu lạc bộ cũng rất sôi nổi.",
        },
      },
      {
        id: "ftu-r3",
        name: "Phuc Tran",
        program: { en: "Marketing", vi: "Marketing" },
        year: { en: "Year 4", vi: "Năm 4" },
        stars: 5,
        date: { en: "December 2025", vi: "Tháng 12/2025" },
        content: {
          en: "Great environment for networking and competitions. Many chances to build a strong portfolio before graduation.",
          vi: "Môi trường rất tốt để mở rộng networking và thi học thuật. Có nhiều cơ hội xây portfolio trước khi tốt nghiệp.",
        },
      },
    ],
  },
  rmit: {
    tuitionActual: [70, 75, 80, 85],
    tuitionEstimated: [72, 78, 82, 88],
    trend: [62, 66, 70, 74, 78, 82],
    entrance: [23, 23.4, 23.8, 24.1, 24.5, 24.9],
    admission: [
      { key: "overall", value: 76, tone: "teal" },
      { key: "academic", value: 78, tone: "teal" },
      { key: "profile", value: 80, tone: "teal" },
      { key: "competition", value: 70, tone: "amber" },
    ],
    reviews: [
      {
        id: "rmit-r1",
        name: "Gia Bao",
        program: { en: "Digital Marketing", vi: "Marketing số" },
        year: { en: "Year 2", vi: "Năm 2" },
        stars: 5,
        date: { en: "February 2026", vi: "Tháng 2/2026" },
        content: {
          en: "Learning is modern and project-driven. Industry mentors give feedback that is very practical.",
          vi: "Môi trường học hiện đại và thiên về dự án. Mentor từ doanh nghiệp góp ý rất thực tế.",
        },
      },
      {
        id: "rmit-r2",
        name: "Quynh Nhu",
        program: { en: "Design Studies", vi: "Thiết kế sáng tạo" },
        year: { en: "Year 3", vi: "Năm 3" },
        stars: 4,
        date: { en: "January 2026", vi: "Tháng 1/2026" },
        content: {
          en: "Facilities are top-notch and classes are interactive. Tuition is high but overall experience is strong.",
          vi: "Cơ sở vật chất rất tốt và lớp học tương tác cao. Học phí cao nhưng trải nghiệm tổng thể rất đáng giá.",
        },
      },
      {
        id: "rmit-r3",
        name: "Thanh Dat",
        program: { en: "Information Technology", vi: "Công nghệ thông tin" },
        year: { en: "Year 4", vi: "Năm 4" },
        stars: 5,
        date: { en: "December 2025", vi: "Tháng 12/2025" },
        content: {
          en: "Capstone and internship components are excellent. I got job offers before finishing my final semester.",
          vi: "Phần capstone và thực tập rất chất lượng. Mình đã có offer việc làm trước khi kết thúc học kỳ cuối.",
        },
      },
    ],
  },
};

const YEARS = ["2020", "2021", "2022", "2023", "2024", "2025"];

const UI_TEXT = {
  en: {
    title: "University Details",
    subtitle: "Comprehensive information and insights",
    saveSchool: "Save School",
    askAi: "Ask AI",
    match: "Match",
    students: "students",
    tuitionTitle: "Actual Tuition Fees",
    tuitionSubtitle: "Real costs reported by current students vs. estimated fees",
    trendTitle: "Tuition Trends",
    trendSubtitle: "Historical tuition fee changes over the past 6 years",
    admissionTitle: "Your Admission Likelihood",
    admissionSubtitle: "Based on your profile and historical admission data",
    admissionTip: "Good Match! Your profile aligns well with this university's requirements.",
    entranceTitle: "Entrance Score History",
    entranceSubtitle: "Minimum entrance scores for Computer Science major",
    reviewsTitle: "Student Reviews",
    outOf: "out of 5",
    loadMore: "Load More Reviews",
    noData: "No review data yet in this demo.",
    yearLabels: ["Year 1", "Year 2", "Year 3", "Year 4"],
    chartLabels: {
      actualFee: "Actual Fee",
      estimatedFee: "Estimated Fee",
      tuitionFee: "Tuition Fee",
      entranceScore: "Entrance Score",
    },
    admissionLabels: {
      overall: "Overall Probability",
      academic: "Academic Score Match",
      profile: "Profile Strength",
      competition: "Competition Level",
    },
  },
  vi: {
    title: "Chi tiết trường đại học",
    subtitle: "Thông tin và phân tích tổng quan",
    saveSchool: "Lưu trường",
    askAi: "Hỏi AI",
    match: "Phù hợp",
    students: "sinh viên",
    tuitionTitle: "Học phí thực tế",
    tuitionSubtitle: "Chi phí từ sinh viên hiện tại so với mức ước tính",
    trendTitle: "Xu hướng học phí",
    trendSubtitle: "Biến động học phí trong 6 năm gần đây",
    admissionTitle: "Khả năng trúng tuyển",
    admissionSubtitle: "Dựa trên hồ sơ của bạn và dữ liệu tuyển sinh lịch sử",
    admissionTip: "Phù hợp tốt! Hồ sơ của bạn khá sát với yêu cầu đầu vào của trường.",
    entranceTitle: "Lịch sử điểm đầu vào",
    entranceSubtitle: "Điểm chuẩn tối thiểu ngành Khoa học máy tính",
    reviewsTitle: "Đánh giá sinh viên",
    outOf: "trên 5",
    loadMore: "Xem thêm đánh giá",
    noData: "Bản demo hiện chưa có dữ liệu đánh giá.",
    yearLabels: ["Năm 1", "Năm 2", "Năm 3", "Năm 4"],
    chartLabels: {
      actualFee: "Học phí thực tế",
      estimatedFee: "Học phí ước tính",
      tuitionFee: "Học phí",
      entranceScore: "Điểm đầu vào",
    },
    admissionLabels: {
      overall: "Xác suất tổng thể",
      academic: "Phù hợp điểm học lực",
      profile: "Độ mạnh hồ sơ",
      competition: "Mức độ cạnh tranh",
    },
  },
};

function Stars({ count = 5 }) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className="text-[#e8c53a]">
          {"\u2605"}
        </span>
      ))}
    </div>
  );
}

function ChartTooltip({ active, label, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/15 bg-[#173451]/95 px-3 py-2 text-xs text-slate-100 shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name ?? entry.dataKey}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function UniversityDetailPage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { schoolId = "" } = useParams();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const text = UI_TEXT[locale];

  const { universityDetail, universityLoading, universityError } = useSelector(
    (state) => state.university
  );

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(schoolId);

  useEffect(() => {
    if (schoolId && isUuid) {
      dispatch(fetchUniversityDetailRequest(schoolId));
    }
  }, [schoolId, isUuid, dispatch]);

  const stateScore = Number(location.state?.matchScore);
  const shouldShowMatchScore = location.state?.from === "/chat";
  const displayMatchScore = useMemo(() => {
    if (Number.isFinite(stateScore)) {
      return Math.max(0, Math.min(100, Math.round(stateScore)));
    }
    if (isUuid) {
      return 80;
    }
    return getUniversityById(schoolId)?.stats?.match ?? 80;
  }, [isUuid, stateScore, schoolId]);

  const school = useMemo(() => {
    if (isUuid && universityDetail) {
      const localFallback = getUniversityById(universityDetail.shortName?.toLowerCase()) || getUniversityById("hcmut");

      return {
        id: universityDetail.universityId,
        name: { vi: universityDetail.name, en: universityDetail.shortName || universityDetail.name },
        major: localFallback?.major || { vi: "Khối ngành Công nghệ - Kỹ thuật", en: "Technology & Engineering" },
        place: { vi: universityDetail.location, en: universityDetail.location },
        tuition: localFallback?.tuition || { vi: "15-25M VNĐ/học kỳ", en: "15-25M VND/semester" },
        avatar: universityDetail.avatar || localFallback?.avatar || null,
        stats: {
          students: localFallback?.stats?.students || { vi: "20,000+ sinh viên", en: "20,000+ students" },
          rank: {
            vi: `Top ${Math.round(universityDetail.ranking) || 5} tại Việt Nam`,
            en: `Top ${Math.round(universityDetail.ranking) || 5} in Vietnam`,
          },
          match: displayMatchScore,
        },
      };
    }

    const fallbackSchool = getUniversityById(schoolId) || getUniversityById("hcmut");
    return {
      ...fallbackSchool,
      stats: {
        ...fallbackSchool.stats,
        match: displayMatchScore,
      },
    };
  }, [isUuid, universityDetail, schoolId, displayMatchScore]);

  const details = useMemo(() => {
    if (isUuid && universityDetail) {
      const shortNameLower = (universityDetail.shortName || "").toLowerCase();
      if (DETAIL_DATA[shortNameLower]) {
        return DETAIL_DATA[shortNameLower];
      }
    }
    return DETAIL_DATA[school?.id] || DETAIL_DATA.hcmut;
  }, [isUuid, universityDetail, school?.id]);

  const avgRating = useMemo(() => {
    if (!details.reviews.length) {
      return 4.7;
    }
    const sum = details.reviews.reduce((acc, item) => acc + item.stars, 0);
    return Number((sum / details.reviews.length).toFixed(1));
  }, [details.reviews]);

  const matchData = useMemo(
    () => [{ name: "match", value: displayMatchScore }],
    [displayMatchScore],
  );

  const tuitionChartData = useMemo(
    () =>
      text.yearLabels.map((year, index) => ({
        year,
        actual: details.tuitionActual[index],
        estimated: details.tuitionEstimated[index],
      })),
    [details.tuitionActual, details.tuitionEstimated, text.yearLabels],
  );

  const trendChartData = useMemo(
    () =>
      YEARS.map((year, index) => ({
        year,
        value: details.trend[index],
      })),
    [details.trend],
  );

  const entranceChartData = useMemo(
    () =>
      YEARS.map((year, index) => ({
        year,
        score: details.entrance[index],
      })),
    [details.entrance],
  );

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const fallback = typeof location.state?.from === "string" ? location.state.from : "/chat";
    navigate(fallback);
  }

  function handleLanguageChange(language) {
    i18n.changeLanguage(language);
  }

  if (isUuid && (universityLoading || !universityDetail)) {
    return (
      <main className="mx-auto flex h-[calc(100dvh-74px)] w-[min(1360px,96vw)] items-center justify-center py-3">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <svg className="h-8 w-8 animate-spin text-[#18d0ac]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium">
            {locale === "vi" ? "Đang tải thông tin trường đại học..." : "Loading university details..."}
          </span>
        </div>
      </main>
    );
  }

  if (isUuid && universityError) {
    return (
      <main className="mx-auto flex h-[calc(100dvh-74px)] w-[min(1360px,96vw)] items-center justify-center py-3">
        <div className="flex flex-col items-center gap-3 text-red-400">
          <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-medium">{universityError}</span>
          <button
            onClick={handleBack}
            className="mt-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            type="button"
          >
            {locale === "vi" ? "Quay lại" : "Back"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100dvh-74px)] w-[min(1360px,96vw)] pb-8 pt-3">
      <header className="rounded-t-2xl border border-white/10 bg-[#1d3551] px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
              onClick={handleBack}
              type="button"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="M15 5 8 12l7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
            <img alt="4S logo" className="h-10 w-10 object-contain" src={fourSLogo} />
            <div>
              <h1 className="font-['Sora'] text-xl font-semibold leading-tight">{text.title}</h1>
              <p className="text-sm text-slate-300">{text.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
              <img
                alt=""
                aria-hidden="true"
                className="ml-2 mr-1 h-4 w-4 opacity-70"
                src={globeIcon}
              />
              <button
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  locale === "en"
                    ? "bg-white/15 text-slate-100"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => handleLanguageChange("en")}
                type="button"
              >
                {t("common:language.en")}
              </button>
              <button
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  locale === "vi"
                    ? "bg-white/15 text-slate-100"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => handleLanguageChange("vi")}
                type="button"
              >
                {t("common:language.vi")}
              </button>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                className="rounded-xl bg-gradient-to-r from-[#18d0ac] to-[#13be9e] px-4 py-2 text-sm font-bold text-[#0c223a] transition hover:brightness-110"
                onClick={() => navigate("/chat", { state: { resetChat: true } })}
                type="button"
              >
                {text.askAi}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-b-2xl border-x border-b border-white/10 bg-[#071a30]/75 p-4 md:p-6">
        <section className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_12%_48%,rgba(17,200,186,0.2),transparent_30%),radial-gradient(circle_at_82%_36%,rgba(247,211,84,0.12),transparent_35%),linear-gradient(160deg,#132c48_0%,#1f3c58_55%,#162d48_100%)] p-4 md:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-slate-200">
                <svg aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 24 24">
                  <path d="M4 10h16M6 10v7m4-7v7m4-7v7m4-7v7M3 20h18M12 4l9 5H3l9-5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                </svg>
              </div>
              <div>
                <h2 className="font-['Sora'] text-2xl font-semibold leading-tight md:text-[2rem]">{school?.name[locale]}</h2>
                <p className="mt-1 text-slate-200">{school?.major[locale]}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {school?.place[locale]} - {school?.tuition[locale]}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {school?.stats?.students[locale]} {text.students} - {school?.stats?.rank[locale]}
                </p>
              </div>
            </div>

            {shouldShowMatchScore && (
              <div className="mx-auto h-[120px] w-[120px]">
                <ResponsiveContainer height="100%" width="100%">
                  <RadialBarChart cx="50%" cy="50%" data={matchData} endAngle={-270} innerRadius="72%" outerRadius="100%" startAngle={90}>
                    <PolarAngleAxis domain={[0, 100]} tick={false} type="number" />
                    <RadialBar background={{ fill: "rgba(255,255,255,0.16)" }} cornerRadius={999} dataKey="value" fill="#14d6af" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="-mt-[74px] flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold leading-none">{displayMatchScore}%</span>
                  <span className="text-xs text-slate-300">{text.match}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-[#203a59]/90 p-5">
            <h3 className="flex items-center gap-2 font-['Sora'] text-2xl font-semibold">
              <span className="text-[#18d0ac]">$</span>
              {text.tuitionTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-300">{text.tuitionSubtitle}</p>
            <div className="mt-5 h-[230px]">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart barGap={6} data={tuitionChartData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.22)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" stroke="#8fa6c1" tick={{ fill: "#8fa6c1", fontSize: 12 }} />
                  <YAxis stroke="#8fa6c1" tick={{ fill: "#8fa6c1", fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="actual" fill="#15cfae" name={text.chartLabels.actualFee} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="estimated" fill="#2f4c68" name={text.chartLabels.estimatedFee} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/90 p-5">
            <h3 className="flex items-center gap-2 font-['Sora'] text-2xl font-semibold">
              <span className="text-[#18d0ac]">/</span>
              {text.trendTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-300">{text.trendSubtitle}</p>
            <div className="mt-5 h-[230px] rounded-xl border border-white/8 bg-[#1c344f]/70 p-3">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.22)" strokeDasharray="3 3" />
                  <XAxis dataKey="year" stroke="#8fa6c1" tick={{ fill: "#8fa6c1", fontSize: 12 }} />
                  <YAxis stroke="#8fa6c1" tick={{ fill: "#8fa6c1", fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line dataKey="value" dot={{ fill: "#16d2b0", r: 3.5 }} name={text.chartLabels.tuitionFee} stroke="#16d2b0" strokeWidth={2.5} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/90 p-5">
            <h3 className="flex items-center gap-2 font-['Sora'] text-2xl font-semibold">
              <img alt="" aria-hidden="true" className="h-5 w-5 object-contain" src={sparklesIcon} />
              {text.admissionTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-300">{text.admissionSubtitle}</p>
            <div className="mt-5 space-y-4">
              {details.admission.map((item) => {
                const barClass = item.tone === "amber" ? "from-[#f5ac45] to-[#f97d1a]" : "from-[#17d3b1] to-[#13c9a8]";
                const valueColor = item.tone === "amber" ? "text-[#f6b35b]" : "text-[#19d8b4]";
                return (
                  <div key={item.key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{text.admissionLabels[item.key]}</span>
                      <span className={`font-semibold ${valueColor}`}>{item.value}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <span className={`block h-full rounded-full bg-gradient-to-r ${barClass}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 rounded-xl border border-[#18d0ac]/25 bg-[#16d2b014] p-4 text-sm text-slate-100">{text.admissionTip}</div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/90 p-5">
            <h3 className="flex items-center gap-2 font-['Sora'] text-2xl font-semibold">
              <span className="text-[#e8c53a]">o</span>
              {text.entranceTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-300">{text.entranceSubtitle}</p>
            <div className="mt-5 h-[230px] rounded-xl border border-white/8 bg-[#1c344f]/70 p-3">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={entranceChartData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.22)" strokeDasharray="3 3" />
                  <XAxis dataKey="year" stroke="#8fa6c1" tick={{ fill: "#8fa6c1", fontSize: 12 }} />
                  <YAxis stroke="#8fa6c1" tick={{ fill: "#8fa6c1", fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line dataKey="score" dot={{ fill: "#e8c53a", r: 3.5 }} name={text.chartLabels.entranceScore} stroke="#e8c53a" strokeWidth={2.5} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-[#203a59]/90 p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h3 className="flex items-center gap-2 font-['Sora'] text-2xl font-semibold">
              <span className="text-[#e8c53a]">{"\u2605"}</span>
              {text.reviewsTitle}
            </h3>
            <div className="text-right">
              <p className="text-5xl font-bold leading-none">{avgRating}</p>
              <p className="mt-1 text-xs text-slate-300">{text.outOf}</p>
              <Stars count={5} />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(details.reviews.length ? details.reviews : [null]).map((review) =>
              review ? (
                <article key={review.id} className="rounded-xl border border-white/10 bg-[#2a4460]/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <p className="text-sm text-slate-300">
                        {review.program[locale]} - {review.year[locale]}
                      </p>
                    </div>
                    <div className="text-right">
                      <Stars count={review.stars} />
                      <p className="text-xs text-slate-400">{review.date[locale]}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-slate-200">{review.content[locale]}</p>
                </article>
              ) : (
                <article key="no-data" className="rounded-xl border border-white/10 bg-[#2a4460]/80 p-4 text-slate-300">
                  {text.noData}
                </article>
              ),
            )}
          </div>

          <button className="mt-4 w-full rounded-xl border border-white/12 bg-white/5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10" type="button">
            {text.loadMore}
          </button>
        </section>
      </section>
    </main>
  );
}

export default UniversityDetailPage;
