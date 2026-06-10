import React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { triggerMailWithFallback } from "../../util/mailHelper";
import useScrollReveal from "../../hooks/useScrollReveal";

const BENEFIT_ICONS = {
  reach: (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M16 11a4 4 0 1 0-8 0m11 7a7 7 0 0 0-14 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M19 8h2m-1-1v2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  ),
  quality: (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M7 4h10v16H7z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 8h5m-5 4h5m-5 4h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  ),
  transparent: (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9.5 12.5 1.7 1.7 3.3-3.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  ),
};

const STEP_ICONS = {
  info: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M7 4h10v16H7z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 9h5m-5 4h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  ),
  review: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9.5 12.5 1.7 1.7 3.3-3.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  ),
  track: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M4 18v-5m5 5V9m5 9v-3m5 3V7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  ),
  maintain: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M20 7v5h-5M4 17v-5h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M7.5 9A6 6 0 0 1 18 10m-1.5 5A6 6 0 0 1 6 14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  ),
};

function ForSchoolsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en';
  const benefits = ["reach", "quality", "transparent"];
  const steps = ["info", "review", "track", "maintain"];

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://4s.vercel.app';

  // Trigger scroll reveals
  useScrollReveal();

  const handleEmailClick = (e) => {
    e.preventDefault();
    triggerMailWithFallback(t("forSchools:cta.email"));
  };

  return (
    <>
      <Helmet>
        <title>{locale === 'vi' ? 'Hợp Tác Tuyển Sinh & Hướng Nghiệp Cho Nhà Trường - 4S' : 'School Partnerships & Career Guidance - 4S'}</title>
        <meta name="description" content={locale === 'vi' ? 'Đồng hành cùng các trường THPT và Đại học để mang lại giải pháp hướng nghiệp bằng AI, tăng cơ hội kết nối học sinh chất lượng.' : 'Partner with high schools and universities to deliver AI-driven career guidance, increasing student outreach and enrollment.'} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={locale === 'vi' ? 'Hợp Tác Tuyển Sinh & Hướng Nghiệp Cho Nhà Trường - 4S' : 'School Partnerships & Career Guidance - 4S'} />
        <meta property="og:description" content={locale === 'vi' ? 'Đồng hành cùng các trường THPT và Đại học để mang lại giải pháp hướng nghiệp bằng AI, tăng cơ hội kết nối học sinh chất lượng.' : 'Partner with high schools and universities to deliver AI-driven career guidance, increasing student outreach and enrollment.'} />
        <meta property="og:url" content={`${siteUrl}/for-schools`} />
        <meta property="og:image" content={`${siteUrl}/assets/logo-4s.png`} />
      </Helmet>
      
      <main className="relative overflow-x-hidden text-slate-100 pb-24 pt-20 md:pt-28">
        {/* Ambient background glow blobs */}
        <div className="glow-blob glow-blob-1 -left-20 top-20 h-[350px] w-[350px]" />
        <div className="glow-blob glow-blob-2 right-10 top-40 h-[380px] w-[380px]" />

        <div className="relative z-10 mx-auto w-[min(1200px,92vw)] space-y-20">
          
          {/* Section 1: Hero Banner */}
          <section className="glass-card rounded-[40px] px-6 py-16 text-center md:px-12 md:py-24 border border-white/10 shadow-2xl relative overflow-hidden reveal-on-scroll">
            <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[#0ed8ab]/10 blur-[90px]" />
            <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-[#ecc741]/10 blur-[90px]" />

            <span className="inline-flex rounded-full border border-[#ecc741]/30 bg-[#ecc741]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#f3d459] mb-6">
              {t("forSchools:hero.badge")}
            </span>
            
            <h1 className="mx-auto max-w-4xl font-display text-3xl font-extrabold leading-[1.1] md:text-5xl text-white tracking-tight">
              {t("forSchools:hero.title")}
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-light">
              {t("forSchools:hero.subtitle")}
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                className="rounded-xl bg-gradient-to-r from-[#ffe06e] to-[#ecc741] px-8 py-4 text-sm font-bold text-[#0c1e36] shadow-lg shadow-amber-950/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                href="#for-schools-contact"
              >
                {t("forSchools:hero.getStarted")}
              </a>
              <a
                className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-4 text-sm font-bold text-white transition-all duration-300 hover:border-white/25 active:scale-95"
                href="#for-schools-process"
              >
                {t("forSchools:hero.learnMore")}
              </a>
            </div>
          </section>

          {/* Section 2: Benefits Section */}
          <section className="glass-card rounded-3xl border border-white/5 p-8 md:p-12 relative overflow-hidden reveal-on-scroll">
            <header className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0ed8ab] bg-[#0ed8ab]/10 px-3 py-1 rounded-full border border-[#0ed8ab]/20">
                {locale === 'vi' ? 'Lợi ích hợp tác' : 'Partnership Benefits'}
              </span>
              <h2 className="font-display text-2xl font-extrabold text-white tracking-tight mt-4 sm:text-3xl md:text-4xl">
                {t("forSchools:why.title")}
              </h2>
              <div className="h-1.5 w-16 bg-[#ecc741] mx-auto mt-5 rounded-full" />
              <p className="mt-6 text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light">
                {t("forSchools:why.subtitle")}
              </p>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
              {benefits.map((key, index) => (
                <article 
                  key={key} 
                  className="rounded-2xl border border-white/5 bg-[#091526]/50 p-6 flex flex-col justify-between transition hover:border-[#ecc741]/20 hover:bg-[#091526]/80 transform hover:-translate-y-1 duration-300"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ${
                      key === "quality" ? "bg-[#11d6ae]/15 text-[#11d6ae] border border-[#11d6ae]/20" : "bg-[#ecc741]/15 text-[#ecc741] border border-[#ecc741]/20"
                    }`}>
                      {BENEFIT_ICONS[key]}
                    </div>
                    <h3 className="mt-5 font-display text-base sm:text-lg font-bold text-white tracking-tight">{t(`forSchools:benefits.${key}.title`)}</h3>
                    <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">{t(`forSchools:benefits.${key}.desc`)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Section 3: Process Timeline */}
          <section id="for-schools-process" className="space-y-12 reveal-on-scroll">
            <header className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7e8cff] bg-[#7e8cff]/10 px-3 py-1 rounded-full border border-[#7e8cff]/20">
                {locale === 'vi' ? 'Quy trình triển khai' : 'Implementation Process'}
              </span>
              <h2 className="font-display text-2xl font-extrabold text-white tracking-tight mt-4 sm:text-3xl">
                {t("forSchools:process.title")}
              </h2>
              <p className="mt-4 text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light">
                {t("forSchools:process.subtitle")}
              </p>
            </header>

            <div className="space-y-4 max-w-4xl mx-auto">
              {steps.map((key, index) => {
                const stepNumber = String(index + 1).padStart(2, "0");
                const isTeal = index % 2 === 1;
                return (
                  <article 
                    key={key} 
                    className="rounded-2xl border border-white/5 bg-[#122238]/40 hover:bg-[#122238]/60 transition-all duration-300 p-6"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start">
                      <span className={`inline-flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border text-xl font-bold font-display shadow-md ${
                        isTeal 
                          ? "border-[#0ed8ab]/30 bg-[#0ed8ab]/10 text-[#0ed8ab]" 
                          : "border-[#ecc741]/30 bg-[#ecc741]/10 text-[#ecc741]"
                      }`}>
                        {stepNumber}
                      </span>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                            isTeal ? "bg-[#0ed8ab]/10 text-[#0ed8ab]" : "bg-[#ecc741]/10 text-[#ecc741]"
                          }`}>
                            {STEP_ICONS[key]}
                          </span>
                          <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
                            {t(`forSchools:process.steps.${key}.title`)}
                          </h3>
                        </div>
                        <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                          {t(`forSchools:process.steps.${key}.desc`)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Section 4: Contact & CTA */}
          <section
            className="rounded-[32px] border border-white/10 bg-gradient-to-r from-[#172c44]/80 to-[#122238]/90 px-6 py-12 text-center md:px-12 md:py-16 relative overflow-hidden reveal-on-scroll shadow-2xl"
            id="for-schools-contact"
          >
            <div className="glow-blob glow-blob-3 right-0 bottom-0 h-48 w-48 opacity-20" />
            
            <h2 className="font-display text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
              {t("forSchools:cta.title")}
            </h2>
            
            <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-light">
              {t("forSchools:cta.subtitle")}
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
              <a
                className="rounded-xl bg-gradient-to-r from-[#ffe06e] to-[#ecc741] px-8 py-3.5 text-sm font-bold text-[#102745] transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-md hover:shadow-[#ecc741]/15"
                href={`mailto:${t("forSchools:cta.email")}`}
                onClick={handleEmailClick}
              >
                {t("forSchools:cta.email")}
              </a>
              <span className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-slate-200 select-all shadow-inner">
                {t("forSchools:cta.phone")}
              </span>
            </div>
            
            <p className="mt-6 text-[11px] text-slate-400 font-light italic">
              {t("forSchools:cta.note")}
            </p>
          </section>

        </div>
      </main>
    </>
  );
}

export default ForSchoolsPage;
