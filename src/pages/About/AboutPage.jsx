import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";

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

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://4s.vercel.app';

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
      <main className="mx-auto w-[min(1280px,94vw)] pb-14 pt-6">
      <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_24%_18%,rgba(255,207,74,0.14),transparent_34%),radial-gradient(circle_at_76%_22%,rgba(15,226,168,0.14),transparent_34%),linear-gradient(180deg,rgba(8,30,50,0.94)_0%,rgba(4,22,40,0.92)_100%)] px-6 py-16 text-center md:px-12 md:py-20">
        <h1 className="font-['Sora'] text-4xl font-bold leading-tight md:text-6xl">{t("about:hero.title")}</h1>
        <p className="mx-auto mt-5 max-w-4xl text-lg text-slate-300 md:text-2xl">{t("about:hero.subtitle")}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          {!isLoggedIn ? (
            <button
              className="rounded-2xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-7 py-3 text-base font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:brightness-105"
              onClick={() => navigate("/sign-up")}
              type="button"
            >
              {t("about:hero.ctaPrimary")}
            </button>
          ) : null}
          <button
            className="rounded-2xl border border-white/12 bg-white/6 px-7 py-3 text-base font-semibold text-slate-200 transition hover:bg-white/10"
            onClick={() => navigate("/for-schools")}
            type="button"
          >
            {t("about:hero.ctaSecondary")}
          </button>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-white/10 bg-[#142f4b]/72 p-6 md:p-10">
        <h2 className="font-['Sora'] text-3xl font-bold md:text-5xl">{t("about:mission.title")}</h2>
        <p className="mt-4 text-base leading-relaxed text-slate-300 md:text-xl">{t("about:mission.desc1")}</p>
        <p className="mt-3 text-base leading-relaxed text-slate-300 md:text-xl">{t("about:mission.desc2")}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#0f2540]/86 p-5">
            <p className="font-['Sora'] text-4xl font-bold text-[#f2cb36]">10,000+</p>
            <p className="mt-2 text-slate-300">{t("about:stats.students")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0f2540]/86 p-5">
            <p className="font-['Sora'] text-4xl font-bold text-[#0ed8ab]">200+</p>
            <p className="mt-2 text-slate-300">{t("about:stats.universities")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0f2540]/86 p-5">
            <p className="font-['Sora'] text-4xl font-bold text-[#f2cb36]">4.9/5</p>
            <p className="mt-2 text-slate-300">{t("about:stats.rating")}</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-center font-['Sora'] text-3xl font-bold md:text-5xl">{t("about:values.title")}</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {values.map((key) => (
            <article key={key} className="rounded-2xl border border-white/10 bg-[#132d49]/78 p-6">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${key === "students" ? "bg-[#0ed8ab]/18 text-[#0ed8ab]" : "bg-[#f2cb36]/18 text-[#f2cb36]"}`}>
                {VALUE_ICONS[key]}
              </div>
              <h3 className="mt-4 font-['Sora'] text-2xl font-semibold">{t(`about:values.items.${key}.title`)}</h3>
              <p className="mt-3 text-base leading-relaxed text-slate-300">{t(`about:values.items.${key}.desc`)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
    </>
  );
}

export default AboutPage;
