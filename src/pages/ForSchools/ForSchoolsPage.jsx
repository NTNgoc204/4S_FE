import { useTranslation } from "react-i18next";
import { triggerMailWithFallback } from "../../util/mailHelper";


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
      <path d="M7.5 9A6 6 0 0 1 18 10m-1.5 5A6 6 0 0 1 6 14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  ),
};

function ForSchoolsPage() {
  const { t } = useTranslation();
  const benefits = ["reach", "quality", "transparent"];
  const steps = ["info", "review", "track", "maintain"];

  const handleEmailClick = (e) => {
    e.preventDefault();
    triggerMailWithFallback(t("forSchools:cta.email"));
  };


  return (
    <main className="mx-auto w-[min(1360px,96vw)] pb-14 pt-6">
      <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_22%_14%,rgba(255,207,74,0.15),transparent_34%),radial-gradient(circle_at_75%_22%,rgba(15,226,168,0.16),transparent_36%),linear-gradient(180deg,rgba(3,24,43,0.92)_0%,rgba(5,25,44,0.86)_100%)] px-6 py-16 text-center md:px-12 md:py-24">
        <span className="inline-flex rounded-full border border-[#ecc741]/30 bg-[#ecc741]/10 px-4 py-2 text-sm font-semibold text-[#f3d459]">
          {t("forSchools:hero.badge")}
        </span>
        <h1 className="mx-auto mt-6 max-w-5xl font-['Sora'] text-4xl font-bold leading-tight md:text-7xl">
          {t("forSchools:hero.title")}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-xl text-slate-300 md:text-4xl">
          {t("forSchools:hero.subtitle")}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            className="rounded-2xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-8 py-4 text-lg font-semibold text-[#0e2543] shadow-[0_16px_30px_rgba(238,198,49,0.28)] transition hover:-translate-y-0.5 hover:brightness-105"
            href="#for-schools-contact"
          >
            {t("forSchools:hero.getStarted")}
          </a>
          <a
            className="rounded-2xl border border-white/12 bg-white/5 px-8 py-4 text-lg font-semibold text-slate-200 transition hover:bg-white/10"
            href="#for-schools-process"
          >
            {t("forSchools:hero.learnMore")}
          </a>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-white/8 bg-[#132d49]/65 px-6 py-12 md:px-10">
        <h2 className="text-center font-['Sora'] text-4xl font-bold md:text-6xl">{t("forSchools:why.title")}</h2>
        <p className="mt-3 text-center text-lg text-slate-300 md:text-3xl">{t("forSchools:why.subtitle")}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {benefits.map((key) => (
            <article key={key} className="rounded-2xl border border-white/10 bg-[#0d233c]/92 p-6">
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${key === "quality" ? "bg-[#11d6ae] text-[#06253f]" : "bg-[#ecc741] text-[#06253f]"}`}>
                {BENEFIT_ICONS[key]}
              </div>
              <h3 className="mt-5 font-['Sora'] text-3xl font-semibold">{t(`forSchools:benefits.${key}.title`)}</h3>
              <p className="mt-3 text-lg leading-relaxed text-slate-300 md:text-2xl">{t(`forSchools:benefits.${key}.desc`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="for-schools-process" className="mt-12">
        <h2 className="text-center font-['Sora'] text-4xl font-bold md:text-6xl">{t("forSchools:process.title")}</h2>
        <p className="mt-3 text-center text-lg text-slate-300 md:text-3xl">{t("forSchools:process.subtitle")}</p>
        <div className="mt-8 space-y-4">
          {steps.map((key, index) => {
            const stepNumber = String(index + 1).padStart(2, "0");
            const teal = index % 2 === 1;
            return (
              <article key={key} className="rounded-2xl border border-white/10 bg-[#1f3858]/88 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <span className={`inline-flex h-14 w-20 items-center justify-center rounded-2xl border text-3xl font-bold ${teal ? "border-[#0ed8ab]/45 bg-[#0ed8ab]/12 text-[#0ed8ab]" : "border-[#ecc741]/45 bg-[#ecc741]/12 text-[#ecc741]"}`}>
                    {stepNumber}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${teal ? "bg-[#0ed8ab]/20 text-[#0ed8ab]" : "bg-[#ecc741]/20 text-[#ecc741]"}`}>
                        {STEP_ICONS[key]}
                      </span>
                      <h3 className="font-['Sora'] text-3xl font-semibold">{t(`forSchools:process.steps.${key}.title`)}</h3>
                    </div>
                    <p className="mt-3 text-lg leading-relaxed text-slate-300 md:text-2xl">{t(`forSchools:process.steps.${key}.desc`)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="mt-12 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(255,207,74,0.14),transparent_36%),radial-gradient(circle_at_78%_22%,rgba(15,226,168,0.16),transparent_35%),linear-gradient(180deg,rgba(19,45,73,0.92)_0%,rgba(9,30,51,0.94)_100%)] px-6 py-12 text-center md:px-10 md:py-16"
        id="for-schools-contact"
      >
        <h2 className="font-['Sora'] text-4xl font-bold md:text-6xl">{t("forSchools:cta.title")}</h2>
        <p className="mx-auto mt-4 max-w-4xl text-lg text-slate-300 md:text-3xl">{t("forSchools:cta.subtitle")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            className="rounded-2xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-8 py-4 text-lg font-semibold text-[#102745] transition hover:brightness-105 cursor-pointer"
            href={`mailto:${t("forSchools:cta.email")}`}
            onClick={handleEmailClick}
          >
            {t("forSchools:cta.email")}
          </a>
          <span className="rounded-2xl border border-white/14 bg-white/6 px-8 py-4 text-lg font-semibold text-slate-200 select-all">
            {t("forSchools:cta.phone")}
          </span>
        </div>
        <p className="mt-6 text-sm text-slate-400">{t("forSchools:cta.note")}</p>
      </section>
    </main>
  );
}

export default ForSchoolsPage;
