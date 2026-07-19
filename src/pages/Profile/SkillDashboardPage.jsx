import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import fourSLogo from "../../assets/logo-4s.png";
import globeIcon from "../../assets/Globe.svg";

const SKILL_VALUES = {
  mathematics: 85,
  logic: 90,
  creativity: 75,
  communication: 80,
  problemSolving: 95,
  leadership: 70,
};

function SkillDashboardPage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const reduxPlan = useSelector((state) => state.auth.plan);
  const currentPlan = String(reduxPlan ?? "").toLowerCase();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";

  // Data từ quiz navigate state (aiRecommendations từ backend)
  const aiRecommendations = location.state?.aiRecommendations ?? [];
  const displayRecommendations = aiRecommendations.slice(0, 4);
  const displayCompare = aiRecommendations.slice(0, 3);

  const radarData = useMemo(
    () =>
      Object.entries(SKILL_VALUES).map(([key, value]) => ({
        key,
        label: t(`profile:dashboard.skills.${key}`),
        value,
      })),
    [t],
  );

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
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
              onClick={() => navigate("/profile")}
              type="button"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="M15 5 8 12l7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
            <img alt="4S logo" className="h-18 w-18 object-contain" src={fourSLogo} />
            <div>
              <h1 className="font-['Sora'] text-xl font-semibold">{t("profile:dashboard.title")}</h1>
              <p className="text-sm text-slate-300">{t("profile:dashboard.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
              <img alt="" aria-hidden="true" className="lang-globe-icon ml-2 mr-1 h-4 w-4 opacity-70" src={globeIcon} />
              <button
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${locale === "en" ? "bg-white/15 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
                onClick={() => handleLanguageChange("en")}
                type="button"
              >
                EN
              </button>
              <button
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${locale === "vi" ? "bg-white/15 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
                onClick={() => handleLanguageChange("vi")}
                type="button"
              >
                VI
              </button>
            </div>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#ffe06e] to-[#e2bb28] text-[#09213f]"
              onClick={() => navigate("/profile")}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
            </button>
            <button
              className="rounded-xl bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-4 py-2 text-sm font-bold text-[#082339] transition hover:brightness-110"
              onClick={handleNewConsultation}
              type="button"
            >
              {t("profile:dashboard.newConsultation")}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto w-[min(1360px,96vw)] py-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5">
              <h2 className="font-['Sora'] text-2xl font-semibold">{t("profile:dashboard.skillProfile")}</h2>
              <p className="mt-1 text-sm text-slate-300">{t("profile:dashboard.skillSubtitle")}</p>
              <div className="mt-5 h-[280px]">
                <ResponsiveContainer height="100%" width="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(148,163,184,0.3)" />
                    <PolarAngleAxis dataKey="label" stroke="#aab8cb" tick={{ fill: "#9fb2ca", fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#4b617d" tick={{ fill: "#7892b0", fontSize: 10 }} />
                    <Radar dataKey="value" fill="#11d8ae" fillOpacity={0.35} stroke="#11d8ae" strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label={t("profile:dashboard.skills.mathematics")} value={SKILL_VALUES.mathematics} />
                <MetricCard label={t("profile:dashboard.skills.logic")} value={SKILL_VALUES.logic} />
                <MetricCard label={t("profile:dashboard.skills.creativity")} value={SKILL_VALUES.creativity} />
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5">
              <h2 className="font-['Sora'] text-2xl font-semibold">{t("profile:dashboard.topRecommended")}</h2>
              <p className="mt-1 text-sm text-slate-300">{t("profile:dashboard.topRecommendedSubtitle")}</p>

              <div className="mt-4 space-y-3">
                {displayRecommendations.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-4 text-center">
                    {locale === 'vi' ? 'Chưa có dữ liệu gợi ý. Hãy hoàn thành bài trắc nghiệm trước.' : 'No recommendations yet. Please complete the quiz first.'}
                  </p>
                ) : (
                  displayRecommendations.map((school) => (
                    <article key={school.id} className={`rounded-xl border p-4 ${
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
                          className="rounded-lg bg-[#13cfa8] px-3 py-1.5 text-sm font-semibold text-[#082339] transition hover:brightness-110"
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

            <article className="rounded-2xl border border-[#12d2ab]/25 bg-[radial-gradient(circle_at_20%_10%,rgba(255,207,74,0.12),transparent_36%),linear-gradient(180deg,rgba(19,61,78,0.86),rgba(12,48,69,0.9))] p-5">
              <h2 className="font-['Sora'] text-2xl font-semibold">{t("profile:dashboard.quickCompare")}</h2>
              <p className="mt-1 text-sm text-slate-300">{t("profile:dashboard.quickCompareSubtitle")}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {displayCompare.length === 0 ? (
                  <p className="text-sm text-slate-400 italic col-span-3">
                    {locale === 'vi' ? 'Chưa có trường để so sánh.' : 'No schools to compare yet.'}
                  </p>
                ) : (
                  displayCompare.map((school) => (
                    <div key={school.id} className="rounded-xl border border-white/12 bg-white/8 p-3">
                      <p className="font-semibold text-slate-100 text-sm leading-snug">{school.name[locale]}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{school.place[locale]}</p>
                      <p className={`text-sm font-semibold mt-1 ${
                        school.tier === 'top3' ? 'text-[#ecc741]' : 'text-[#0ed8ab]'
                      }`}>
                        {school.tier === 'top3' ? (locale === 'vi' ? '⭐ Top Gợi Ý' : '⭐ Top Pick') : (locale === 'vi' ? '✔ Phù Hợp' : '✔ Good Fit')}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#16d2ac] to-[#10bb98] px-4 py-3 font-semibold text-[#062a3f] transition hover:brightness-110" type="button">
                {t("profile:dashboard.startComparison")}
              </button>
            </article>
          </div>

          <aside className="space-y-5">
            <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-4">
              <h2 className="font-['Sora'] text-xl font-semibold">{t("profile:dashboard.savedSchools")}</h2>
              <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-400">
                {t("profile:dashboard.noSavedSchools")}
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-4">
              <h2 className="font-['Sora'] text-xl font-semibold">{t("profile:dashboard.recentConsultations")}</h2>
              <div className="mt-4 space-y-2.5">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-sm font-medium text-slate-100">{t(`profile:dashboard.history.h${index}`)}</p>
                    <p className="mt-1 text-xs text-slate-400">{t(`profile:dashboard.history.t${index}`)}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-lg border border-[#0ed8ab]/30 bg-[#0ed8ab]/12 py-2 text-sm font-semibold text-[#0ed8ab] transition hover:bg-[#0ed8ab]/20" type="button">
                {t("profile:dashboard.viewAllHistory")}
              </button>
            </article>

            <article className="rounded-2xl border border-[#f0cf47]/22 bg-[radial-gradient(circle_at_22%_20%,rgba(240,207,71,0.2),transparent_42%),linear-gradient(180deg,rgba(35,57,76,0.8),rgba(21,39,57,0.92))] p-4">
              <h2 className="font-['Sora'] text-xl font-semibold">{t("profile:dashboard.journey")}</h2>
              <div className="mt-4 space-y-3">
                <JourneyItem label={t("profile:dashboard.journeyItems.explored")} value={12} />
                <JourneyItem label={t("profile:dashboard.journeyItems.saved")} value={3} />
                <JourneyItem label={t("profile:dashboard.journeyItems.consultations")} value={8} />
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="text-4xl font-bold text-[#10deb3]">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{label}</p>
    </div>
  );
}

function JourneyItem({ label, value }) {
  return (
    <div>
      <p className="text-4xl font-bold text-[#f2cb36]">{value}</p>
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}

export default SkillDashboardPage;
