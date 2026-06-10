import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import useScrollReveal from "../../hooks/useScrollReveal";

const VALUE_ICONS = {
  data: (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  students: (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M12 5 3 10l9 5 9-5-9-5Zm0 10v5M7.5 12.5V17m9-4.5V17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  ),
  guidance: (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M12 21s7-4.4 7-11V5l-7-2-7 2v5c0 6.6 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9.5 12.5 1.7 1.7 3.3-3.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  ),
};

function AboutPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en';
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const isLoggedIn = Boolean(outletContext?.isLoggedIn);
  const values = ["data", "students", "guidance"];

  const [activeTimelineYear, setActiveTimelineYear] = useState('2026')

  // Trigger scroll reveals
  useScrollReveal()

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://4s.vercel.app';

  const timelineData = [
    {
      year: '2024',
      title: locale === 'vi' ? 'Khởi nguồn Ý tưởng' : 'Concept & Foundation',
      desc: locale === 'vi' ? 'Đội ngũ sáng lập nghiên cứu chuyên sâu về lý thuyết trắc nghiệm nghề nghiệp Holland và thực trạng hướng nghiệp của học sinh THPT Việt Nam.' : 'The founding team conducted deep research on Holland RIASEC model and the career orientation landscape for high schoolers.'
    },
    {
      year: '2025',
      title: locale === 'vi' ? 'Tích hợp AI & Ra mắt Beta' : 'AI Integration & Beta Release',
      desc: locale === 'vi' ? 'Hoàn thiện lõi gợi ý dựa trên AI, xây dựng cấu trúc cơ sở dữ liệu học phí và trường đại học, tiến hành chạy thử nghiệm diện rộng.' : 'Perfected the AI recommendation core, built the university database, and successfully launched a large-scale beta program.'
    },
    {
      year: '2026',
      title: locale === 'vi' ? 'Hệ thống Toàn diện 4S' : 'Full-Scale Platform Launch',
      desc: locale === 'vi' ? 'Chính thức ra mắt cổng thông tin 4S, hỗ trợ đầy đủ VietQR kích hoạt PRO tự động và kết nối giải pháp trường học thông minh.' : 'Official launch of the 4S platform, featuring complete automatic VietQR upgrades and integration options for smart schools.'
    }
  ]

  const activeTimeline = timelineData.find(t => t.year === activeTimelineYear)

  return (
    <>
      <Helmet>
        <title>{locale === 'vi' ? 'Về Chúng Tôi - Định Hướng Nghề Nghiệp 4S' : 'About Us - 4S Career Guidance'}</title>
        <meta name="description" content={locale === 'vi' ? 'Tìm hiểu về sứ mệnh, giá trị cốt lõi và đội ngũ phát triển đằng sau hệ thống định hướng nghề nghiệp thông minh 4S.' : 'Learn about the mission, core values, and development team behind the 4S smart career guidance system.'} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={locale === 'vi' ? 'Về Chúng Tôi - Định Hướng Nghề Nghiệp 4S' : 'About Us - 4S Career Guidance'} />
        <meta property="og:description" content={locale === 'vi' ? 'Tìm hiểu về sứ mệnh, giá trị cốt lõi và đội ngũ phát triển đằng sau hệ thống định hướng nghề nghiệp thông minh 4S.' : 'Learn about the mission, core values, and development team behind the 4S smart career guidance system.'} />
        <meta property="og:url" content={`${siteUrl}/about-us`} />
        <meta property="og:image" content={`${siteUrl}/assets/logo-4s.png`} />
      </Helmet>

      <main className="relative overflow-x-hidden text-slate-100 pb-24 pt-20 md:pt-28">
        {/* Liquid Background Blobs */}
        <div className="glow-blob glow-blob-1 -left-20 top-20 h-[380px] w-[380px]" />
        <div className="glow-blob glow-blob-3 right-10 top-60 h-[350px] w-[350px]" />

        <div className="relative z-10 mx-auto w-[min(1200px,92vw)] space-y-24">
          
          {/* Section 1: Hero Section */}
          <section className="glass-card rounded-[40px] px-6 py-20 text-center md:px-12 md:py-24 border border-white/10 shadow-2xl relative overflow-hidden reveal-on-scroll">
            <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[#0ed8ab]/10 blur-[90px]" />
            <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-[#ecc741]/10 blur-[90px]" />

            <h1 className="font-display text-4xl font-extrabold leading-[1.08] md:text-6xl text-white tracking-tight">
              {t("about:hero.title")}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base md:text-xl text-slate-300 leading-relaxed">
              {t("about:hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {!isLoggedIn ? (
                <button
                  className="rounded-xl bg-gradient-to-r from-[#ffe06e] to-[#ecc741] px-8 py-4 text-base font-bold text-[#0c1e36] shadow-lg shadow-amber-950/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate("/sign-up")}
                  type="button"
                >
                  {t("about:hero.ctaPrimary")}
                </button>
              ) : null}
              <button
                className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:border-white/25 active:scale-95 cursor-pointer"
                onClick={() => navigate("/for-schools")}
                type="button"
              >
                {t("about:hero.ctaSecondary")}
              </button>
            </div>
          </section>

          {/* Section 2: Mission & Staggered Stats (Asymmetrical 2 Columns) */}
          <section className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center reveal-on-scroll">
            {/* Left Column: Mission Description */}
            <div className="lg:col-span-7 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0ed8ab] bg-[#0ed8ab]/10 px-3 py-1 rounded-full border border-[#0ed8ab]/20">
                {locale === 'vi' ? 'Sứ mệnh định hình' : 'Our Mission'}
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight mt-4 sm:text-4xl text-white">
                {t("about:mission.title")}
              </h2>
              <div className="h-1.5 w-16 bg-[#ecc741] my-6 rounded-full" />
              <p className="text-base leading-relaxed text-slate-300 mb-4 font-light">
                {t("about:mission.desc1")}
              </p>
              <p className="text-base leading-relaxed text-slate-300 font-light">
                {t("about:mission.desc2")}
              </p>
            </div>

            {/* Right Column: Staggered Stats Grid */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Students Guided</span>
                <p className="font-display text-4xl font-extrabold text-[#f2cb36]">10,000+</p>
                <p className="mt-2 text-xs text-slate-300 leading-normal">{t("about:stats.students")}</p>
              </div>
              
              <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-lg sm:translate-y-4 transform hover:-translate-y-1 transition-all duration-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Universities</span>
                <p className="font-display text-4xl font-extrabold text-[#0ed8ab]">200+</p>
                <p className="mt-2 text-xs text-slate-300 leading-normal">{t("about:stats.universities")}</p>
              </div>
              
              <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-lg transform hover:-translate-y-1 transition-all duration-300 sm:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Satisfied Rate</span>
                <p className="font-display text-4xl font-extrabold text-[#7e8cff] flex items-baseline gap-2">
                  <span>4.9/5</span>
                  <span className="text-sm font-semibold text-slate-400 font-sans">98% Satisfied</span>
                </p>
                <p className="mt-2 text-xs text-slate-300 leading-normal">{t("about:stats.rating")}</p>
              </div>
            </div>
          </section>

          {/* Section 3: Core Values Grid */}
          <section className="reveal-on-scroll">
            <header className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ecc741] bg-[#ecc741]/10 px-3 py-1 rounded-full border border-[#ecc741]/20">
                {locale === 'vi' ? 'Cam kết chất lượng' : 'Foundational Values'}
              </span>
              <h2 className="font-display text-3xl font-extrabold text-white tracking-tight mt-4">
                {t("about:values.title")}
              </h2>
            </header>
            
            <div className="grid gap-6 md:grid-cols-3">
              {values.map((key, index) => (
                <article 
                  key={key} 
                  className="glass-card glass-card-hover rounded-3xl p-8 border border-white/5 shadow-xl relative overflow-hidden"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-md ${
                    key === "students" ? "bg-[#0ed8ab]/15 text-[#0ed8ab] border border-[#0ed8ab]/20" : "bg-[#f2cb36]/15 text-[#f2cb36] border border-[#f2cb36]/20"
                  }`}>
                    {VALUE_ICONS[key]}
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-white tracking-tight">
                    {t(`about:values.items.${key}.title`)}
                  </h3>
                  <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {t(`about:values.items.${key}.desc`)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Section 4: Developmental Roadmap (Interactive Timeline) */}
          <section className="reveal-on-scroll">
            <header className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7e8cff] bg-[#7e8cff]/10 px-3 py-1 rounded-full border border-[#7e8cff]/20">
                {locale === 'vi' ? 'Chặng đường phát triển' : 'Roadmap'}
              </span>
              <h2 className="font-display text-3xl font-extrabold text-white tracking-tight mt-4">
                {locale === 'vi' ? 'Hành trình 4S' : 'The 4S Journey'}
              </h2>
            </header>

            <div className="max-w-4xl mx-auto glass-card rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-[#7e8cff]/5 blur-[60px]" />
              
              {/* Timeline Switch Tabs */}
              <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-6">
                {timelineData.map(t => (
                  <button
                    key={t.year}
                    onClick={() => setActiveTimelineYear(t.year)}
                    type="button"
                    className={`py-3 rounded-xl font-display font-extrabold text-base transition-all duration-300 cursor-pointer ${
                      activeTimelineYear === t.year 
                        ? 'bg-white/10 text-white shadow-inner scale-[1.02]' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t.year}
                  </button>
                ))}
              </div>

              {/* Display Year Info with Fade-in Animation */}
              <div key={activeTimelineYear} className="mt-8 text-left animate-card-enter">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-2 w-2 rounded-full bg-[#ecc741] animate-ping" />
                  <h4 className="font-display text-lg font-bold text-[#ecc741]">{activeTimeline.title}</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                  {activeTimeline.desc}
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

export default AboutPage;
