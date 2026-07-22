import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import fourSLogo from "../../assets/logo-4s.png";
import globeIcon from "../../assets/Globe.svg";
import { authAPI } from "../../feature/auth/authAPI";
import ThemeSettingsToggle from "../../components/ThemeSettingsToggle";

function SkillDashboardPage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth?.user);
  const reduxPlan = useSelector((state) => state.auth.plan);
  const currentPlan = String(reduxPlan ?? "").toLowerCase();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";

  const [aiSummaryData, setAiSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.avatarUrl]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  useEffect(() => {
    setLoadingSummary(true);
    authAPI
      .getOverallSummary()
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setAiSummaryData(res.data.data);
        }
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          console.warn("Could not fetch AI summary:", err);
        }
      })
      .finally(() => {
        setLoadingSummary(false);
      });
  }, []);

  // Data từ quiz navigate state hoặc từ GET /api/UserAiSummaries
  const aiRecommendations = location.state?.aiRecommendations ?? [];
  
  const displayRecommendations = useMemo(() => {
    if (aiRecommendations.length > 0) return aiRecommendations.slice(0, 4);
    if (!aiSummaryData) return [];
    
    const top3 = (aiSummaryData.top3Universities || []).map((u) => ({
      id: u.universityId,
      name: { vi: u.name, en: u.shortName || u.name },
      tier: "top3",
      major: { vi: u.suitableMajors?.[0]?.name || "Chuyên ngành định hướng", en: u.suitableMajors?.[0]?.name || "Suitable Major" },
      place: { vi: u.location || "Việt Nam", en: u.location || "Vietnam" },
    }));
    
    const next5 = (aiSummaryData.next5Universities || []).map((u) => ({
      id: u.universityId,
      name: { vi: u.name, en: u.shortName || u.name },
      tier: "next5",
      major: { vi: u.suitableMajors?.[0]?.name || "Chuyên ngành định hướng", en: u.suitableMajors?.[0]?.name || "Suitable Major" },
      place: { vi: u.location || "Việt Nam", en: u.location || "Vietnam" },
    }));
    
    return [...top3, ...next5].slice(0, 4);
  }, [aiRecommendations, aiSummaryData]);

  const displayCompare = useMemo(() => {
    if (aiRecommendations.length > 0) return aiRecommendations.slice(0, 3);
    return displayRecommendations.slice(0, 3);
  }, [aiRecommendations, displayRecommendations]);

  function handleNewConsultation() {
    const isPaidPlan = currentPlan !== "free" && currentPlan !== "";
    navigate(isPaidPlan ? "/consultation" : "/chat");
  }

  function handleLanguageChange(language) {
    i18n.changeLanguage(language);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_22%_16%,rgba(255,201,58,0.09),transparent_34%),radial-gradient(circle_at_75%_28%,rgba(15,226,168,0.1),transparent_35%),linear-gradient(160deg,#031124_0%,#071a35_40%,#041224_100%)] text-[#eaf2ff]">
      <header className="border-b border-white/10 bg-[#1d3551]/95">
        <div className="mx-auto flex w-[min(1360px,96vw)] items-center justify-between gap-4 px-1 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="cursor-pointer transition hover:opacity-90 flex items-center">
              <img alt="4S logo" className="h-18 w-18 object-contain" src={fourSLogo} />
            </Link>
            <div>
              <h1 className="font-['Sora'] text-xl font-semibold">{t("profile:dashboard.title")}</h1>
              <p className="text-sm text-slate-300">{t("profile:dashboard.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative inline-flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 text-[10px] select-none shadow-inner">
              <button
                onClick={() => handleLanguageChange("vi")}
                type="button"
                className={`relative z-10 px-3 py-1.5 rounded-full font-bold transition-all duration-300 cursor-pointer ${
                  locale === "vi" 
                    ? "text-[#0c1e36] bg-[#ecc741] shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                VI
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                type="button"
                className={`relative z-10 px-3 py-1.5 rounded-full font-bold transition-all duration-300 cursor-pointer ${
                  locale === "en" 
                    ? "text-[#0c1e36] bg-[#ecc741] shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                EN
              </button>
            </div>

            {/* 1. Nút Home */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 hover:scale-105 cursor-pointer shadow-sm"
              onClick={() => navigate("/")}
              type="button"
              title={locale === "vi" ? "Trang chủ" : "Home"}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>

            {/* 2. Nút Hồ sơ cá nhân / Avatar */}
            <button
              aria-label="User profile"
              className="relative overflow-hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#ffe06e] to-[#e2bb28] text-[#09213f] transition hover:scale-105 cursor-pointer shadow-sm"
              onClick={() => navigate("/profile")}
              type="button"
              title={locale === "vi" ? "Hồ sơ cá nhân" : "User Profile"}
            >
              {user?.avatarUrl && !imgError ? (
                <img
                  src={user.avatarUrl}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="font-display text-xs font-bold">
                  {getInitials(user?.username)}
                </span>
              )}
            </button>

            {/* 3. Nút Tư vấn mới (Icon) */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#0ed8ab]/35 bg-[#0ed8ab]/15 text-[#0ed8ab] transition hover:bg-[#0ed8ab]/25 hover:scale-105 cursor-pointer shadow-sm"
              onClick={handleNewConsultation}
              type="button"
              title={t("profile:dashboard.newConsultation")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
              </svg>
            </button>

            {/* 4. Nút Đổi chủ đề (Luôn ở cuối) */}
            <ThemeSettingsToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto w-[min(1120px,94vw)] py-6">
        <div className="space-y-5">
          {aiSummaryData?.summaryText && (
            <article className="rounded-2xl border border-[#0ed8ab]/35 bg-[#203a59]/88 p-5 md:p-6 shadow-lg">
              <h2 className="font-['Sora'] text-xl font-semibold text-[#0ed8ab] flex items-center gap-2">
                <span>✨</span> {locale === "vi" ? "Nhận Xét & Đánh Giá Tổng Quan Từ AI" : "Overall AI Advice & Evaluation"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-200 whitespace-pre-line">
                {aiSummaryData.summaryText}
              </p>
            </article>
          )}

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6 shadow-md">
            <h2 className="font-['Sora'] text-2xl font-semibold">{t("profile:dashboard.topRecommended")}</h2>
            <p className="mt-1 text-sm text-slate-300">{t("profile:dashboard.topRecommendedSubtitle")}</p>

            <div className="mt-4 space-y-3">
              {displayRecommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-[#0ed8ab]/15 flex items-center justify-center text-[#0ed8ab] mb-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-300 font-medium">
                    {locale === 'vi' ? 'Chưa có dữ liệu gợi ý cho tài khoản của bạn.' : 'No recommendations available for your account yet.'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    {locale === 'vi' 
                      ? 'Hãy làm bài trắc nghiệm tư vấn định hướng cùng AI để hệ thống phân tích và đề xuất danh sách trường Đại học phù hợp nhất!'
                      : 'Complete an AI guidance quiz so the system can analyze and recommend the best universities for you!'}
                  </p>
                  <button
                    className="mt-4 rounded-xl bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-5 py-2.5 text-sm font-bold text-[#082339] shadow-lg transition hover:brightness-110 cursor-pointer"
                    onClick={handleNewConsultation}
                    type="button"
                  >
                    🚀 {locale === 'vi' ? 'Bắt đầu tư vấn trắc nghiệm AI' : 'Start AI Quiz & Consultation'}
                  </button>
                </div>
              ) : (
                displayRecommendations.map((school) => (
                  <article key={school.id} className={`rounded-xl border p-4 transition hover:border-white/20 ${
                    school.tier === 'top3' ? 'border-[#ecc741]/25 bg-[#1a3352]/90' : 'border-white/10 bg-[#142c46]/95'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-100 truncate">
                            {school.name[locale]}
                          </h3>
                          {school.tier === 'top3' && (
                            <span className="shrink-0 rounded-full bg-[#ecc741]/20 px-2 py-0.5 text-xs font-semibold text-[#ecc741]">⭐ Top Gợi Ý</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mt-0.5">
                          {t("profile:dashboard.recommended")}:{" "}
                          <span className="font-semibold text-[#10deb3]">{school.major[locale]}</span>
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                        school.tier === 'top3' ? 'bg-[#ecc741]/15 text-[#ecc741]' : 'bg-[#0ed8ab]/15 text-[#0ed8ab]'
                      }`}>
                        {school.tier === 'top3' ? (locale === 'vi' ? 'Rất phù hợp' : 'Best Fit') : (locale === 'vi' ? 'Phù hợp' : 'Good Fit')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      📍 {school.place[locale]}
                    </p>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        className="rounded-lg bg-[#13cfa8] px-3.5 py-1.5 text-sm font-semibold text-[#082339] transition hover:brightness-110"
                        onClick={() => navigate(`/university/${school.id}`, { state: { from: '/dashboard' } })}
                        type="button"
                      >
                        {t("profile:dashboard.details")} {"->"}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>

          {displayCompare.length > 0 && (
            <article className="rounded-2xl border border-[#12d2ab]/25 bg-[#203a59]/88 p-5 md:p-6 shadow-md">
              <h2 className="font-['Sora'] text-2xl font-semibold">{t("profile:dashboard.quickCompare")}</h2>
              <p className="mt-1 text-sm text-slate-300">{t("profile:dashboard.quickCompareSubtitle")}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {displayCompare.map((school) => (
                  <div key={school.id} className="rounded-xl border border-white/12 bg-white/8 p-3.5">
                    <p className="font-semibold text-slate-100 text-sm leading-snug">{school.name[locale]}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{school.place[locale]}</p>
                    <p className={`text-sm font-semibold mt-1.5 ${
                      school.tier === 'top3' ? 'text-[#ecc741]' : 'text-[#0ed8ab]'
                    }`}>
                      {school.tier === 'top3' ? (locale === 'vi' ? '⭐ Top Gợi Ý' : '⭐ Top Pick') : (locale === 'vi' ? '✔ Phù Hợp' : '✔ Good Fit')}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}

export default SkillDashboardPage;
