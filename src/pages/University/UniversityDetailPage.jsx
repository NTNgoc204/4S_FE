import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import fourSLogo from "../../assets/logo-4s.png";
import globeIcon from "../../assets/Globe.svg";
import {
  isUniversityId,
  normalizeMatchScore,
} from "../../util/universityMapper";
import { fetchUniversityDetailRequest } from "../../feature/university/universitySlice";

function BackButton({ label, onClick }) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
      onClick={onClick}
      type="button"
    >
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M15 5 8 12l7 7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
}

function LanguageSwitcher({ locale, onChange, t }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
      <img
        alt=""
        aria-hidden="true"
        className="ml-2 mr-1 h-4 w-4 opacity-70"
        src={globeIcon}
      />
      {(["en", "vi"]).map((language) => (
        <button
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            locale === language
              ? "bg-white/15 text-slate-100"
              : "text-slate-400 hover:text-slate-200"
          }`}
          key={language}
          onClick={() => onChange(language)}
          type="button"
        >
          {t(`common:language.${language}`)}
        </button>
      ))}
    </div>
  );
}

function UniversityMark({ avatar, name }) {
  return (
    <div className="relative inline-flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-white/10 text-slate-200">
      <svg aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 24 24">
        <path
          d="M4 10h16M6 10v7m4-7v7m4-7v7m4-7v7M3 20h18M12 4l9 5H3l9-5Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
      {avatar ? (
        <img
          alt={name}
          className="absolute inset-0 h-full w-full bg-white object-contain p-2"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
          src={avatar}
        />
      ) : null}
    </div>
  );
}

function MatchScore({ label, score }) {
  return (
    <div
      className="relative mx-auto grid h-[120px] w-[120px] place-items-center rounded-full"
      style={{
        background: `conic-gradient(#14d6af ${score * 3.6}deg, rgba(255,255,255,0.16) 0deg)`,
      }}
    >
      <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-[#193550] text-center">
        <div>
          <span className="block text-3xl font-bold leading-none">{score}%</span>
          <span className="mt-1 block text-xs text-slate-300">{label}</span>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#203a59]/90 p-5">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#18d0ac]/12 text-[#18d0ac]">
        {icon}
      </div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 break-words text-lg font-semibold text-slate-100">{value}</p>
    </article>
  );
}

function PageState({ backLabel, message, onBack, type = "error" }) {
  const isLoading = type === "loading";

  return (
    <main className="mx-auto flex h-[calc(100dvh-74px)] w-[min(1360px,96vw)] items-center justify-center py-3">
      <div className={`flex flex-col items-center gap-3 ${isLoading ? "text-slate-300" : "text-red-400"}`}>
        {isLoading ? (
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#18d0ac]/25 border-t-[#18d0ac]" />
        ) : (
          <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        )}
        <span className="max-w-lg text-center text-sm font-medium">{message}</span>
        {!isLoading ? (
          <button
            className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            onClick={onBack}
            type="button"
          >
            {backLabel}
          </button>
        ) : null}
      </div>
    </main>
  );
}

function UniversityDetailPage() {
  const { i18n, t } = useTranslation(["university", "common"]);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { schoolId = "" } = useParams();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const hasValidId = isUniversityId(schoolId);
  const matchScore = normalizeMatchScore(location.state?.matchScore);
  const shouldShowMatchScore =
    location.state?.from === "/chat" && matchScore !== null;
  const {
    requestedUniversityId,
    universityDetail,
    universityLoading,
    universityError,
  } = useSelector((state) => state.university);
  const hasCurrentRequest = requestedUniversityId === schoolId;
  const hasCurrentUniversity =
    universityDetail?.id.toLowerCase() === schoolId.toLowerCase();

  useEffect(() => {
    if (hasValidId) {
      dispatch(fetchUniversityDetailRequest(schoolId));
    }
  }, [dispatch, hasValidId, schoolId]);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    const fallback =
      typeof location.state?.from === "string" ? location.state.from : "/chat";
    navigate(fallback);
  }

  if (!hasValidId) {
    return (
      <PageState
        backLabel={t("back")}
        message={t("invalidId")}
        onBack={handleBack}
      />
    );
  }

  if (!hasCurrentRequest || universityLoading) {
    return <PageState message={t("loading")} type="loading" />;
  }

  if (universityError) {
    return (
      <PageState
        backLabel={t("back")}
        message={universityError}
        onBack={handleBack}
      />
    );
  }

  if (!hasCurrentUniversity) {
    return <PageState message={t("loading")} type="loading" />;
  }

  const displayName =
    locale === "en" && universityDetail.shortName
      ? universityDetail.shortName
      : universityDetail.name;
  const ranking = universityDetail.ranking
    ? `#${Math.round(universityDetail.ranking)}`
    : t("notAvailable");
  const shortName = universityDetail.shortName || t("notAvailable");
  const universityLocation = universityDetail.location || t("notAvailable");

  return (
    <main className="mx-auto min-h-[calc(100dvh-74px)] w-[min(1360px,96vw)] pb-8 pt-3">
      <header className="rounded-t-2xl border border-white/10 bg-[#1d3551] px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <BackButton label={t("back")} onClick={handleBack} />
            <img alt="4S logo" className="h-10 w-10 object-contain" src={fourSLogo} />
            <div className="min-w-0">
              <h1 className="truncate font-['Sora'] text-xl font-semibold leading-tight">
                {t("title")}
              </h1>
              <p className="hidden text-sm text-slate-300 sm:block">{t("subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher
              locale={locale}
              onChange={(language) => i18n.changeLanguage(language)}
              t={t}
            />
            <button
              className="hidden rounded-xl bg-gradient-to-r from-[#18d0ac] to-[#13be9e] px-4 py-2 text-sm font-bold text-[#0c223a] transition hover:brightness-110 md:block"
              onClick={() => navigate("/chat", { state: { resetChat: true } })}
              type="button"
            >
              {t("askAi")}
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-b-2xl border-x border-b border-white/10 bg-[#071a30]/75 p-4 md:p-6">
        <section className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_12%_48%,rgba(17,200,186,0.2),transparent_30%),radial-gradient(circle_at_82%_36%,rgba(247,211,84,0.12),transparent_35%),linear-gradient(160deg,#132c48_0%,#1f3c58_55%,#162d48_100%)] p-5 md:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <UniversityMark avatar={universityDetail.avatar} name={displayName} />
              <div className="min-w-0">
                <h2 className="font-['Sora'] text-2xl font-semibold leading-tight md:text-[2rem]">
                  {displayName}
                </h2>
                {displayName !== universityDetail.name ? (
                  <p className="mt-1 text-slate-300">{universityDetail.name}</p>
                ) : null}
                <p className="mt-2 text-sm text-slate-300">{universityLocation}</p>
              </div>
            </div>

            {shouldShowMatchScore ? (
              <MatchScore label={t("match")} score={matchScore} />
            ) : null}
          </div>
        </section>

        <section className="mt-5">
          <div>
            <h3 className="font-['Sora'] text-2xl font-semibold">{t("informationTitle")}</h3>
            <p className="mt-1 text-sm text-slate-300">{t("informationSubtitle")}</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <DetailCard
              icon={(
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 21s7-5.4 7-12a7 7 0 1 0-14 0c0 6.6 7 12 7 12Z" strokeWidth="1.8" />
                  <circle cx="12" cy="9" r="2.5" strokeWidth="1.8" />
                </svg>
              )}
              label={t("fields.location")}
              value={universityLocation}
            />
            <DetailCard
              icon={(
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" strokeLinejoin="round" strokeWidth="1.7" />
                </svg>
              )}
              label={t("fields.ranking")}
              value={ranking}
            />
            <DetailCard
              icon={(
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              )}
              label={t("fields.shortName")}
              value={shortName}
            />
          </div>

          {/* Description / Introduction (if present) */}
          {universityDetail.description && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <h4 className="font-['Sora'] text-base font-semibold text-slate-200">
                {locale === "vi" ? "Giới thiệu chung" : "Overview & Background"}
              </h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed font-light">
                {universityDetail.description}
              </p>
            </div>
          )}

          {/* Majors Portfolio (if present) */}
          {universityDetail.majors && universityDetail.majors.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <h4 className="font-['Sora'] text-base font-semibold text-slate-200 mb-3">
                {locale === "vi" ? "Ngành nghề đào tạo tuyển sinh" : "Academic Programs & Majors"}
              </h4>
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#132c48]/30">
                <table className="min-w-full text-[11px] text-slate-300">
                  <thead className="bg-[#11273f] text-slate-200 font-bold border-b border-white/10">
                    <tr>
                      <th className="px-4 py-2.5 text-left">{locale === "vi" ? "Tên ngành" : "Major"}</th>
                      <th className="px-3 py-2.5 text-left">{locale === "vi" ? "Mã tuyển sinh" : "Admission Code"}</th>
                      <th className="px-3 py-2.5 text-center">{locale === "vi" ? "Chỉ tiêu" : "Quota"}</th>
                      <th className="px-3 py-2.5 text-right">{locale === "vi" ? "Điểm chuẩn" : "Cut-off"}</th>
                      <th className="px-4 py-2.5 text-right">{locale === "vi" ? "Học phí ước tính" : "Estimated Tuition"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {universityDetail.majors.map((major) => (
                      <tr key={major.id} className="hover:bg-white/5 transition">
                        <td className="px-4 py-2.5">
                          <p className="font-bold text-slate-100">{major.name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="rounded bg-white/10 text-slate-300 px-1 py-0.2 text-[8px] font-semibold border border-white/5">
                              {major.degreeType}
                            </span>
                            <span className="rounded bg-white/5 text-slate-400 px-1 py-0.2 text-[8px] border border-white/5">
                              {major.language}
                            </span>
                            {major.majorDescription && (
                              <span 
                                className="text-slate-450 hover:text-slate-200 text-[8px] cursor-help"
                                title={major.majorDescription}
                              >
                                ℹ️ {locale === "vi" ? "Mô tả ngành" : "Description"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-400">{major.description || "—"}</td>
                        <td className="px-3 py-2.5 text-center text-slate-300">{major.quota || "—"}</td>
                        <td className="px-3 py-2.5 text-right font-extrabold text-[#18d0ac]">{major.score}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-200">
                          {Number(major.tuition).toLocaleString("vi-VN")} VND / {locale === "vi" ? "học kỳ" : "semester"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Scholarships (if present) */}
          {universityDetail.scholarships && universityDetail.scholarships.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <h4 className="font-['Sora'] text-base font-semibold text-slate-200 mb-3">
                {locale === "vi" ? "Thông tin học bổng" : "Scholarships & Financial Aid"}
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {universityDetail.scholarships.map((sch) => (
                  <div key={sch.id} className="bg-[#132c48]/40 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="font-bold text-xs text-slate-200 font-['Sora'] leading-tight">{sch.name}</h5>
                        <span className="rounded bg-[#18d0ac]/15 text-[#18d0ac] border border-[#18d0ac]/25 font-bold text-[10px] px-2 py-0.5">
                          {sch.value}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                        {locale === "vi" ? `Điều kiện: ${sch.requirement}` : `Requirements: ${sch.requirement}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!universityDetail.majors || universityDetail.majors.length === 0) && (
            <div className="mt-4 rounded-2xl border border-[#18d0ac]/20 bg-[#18d0ac]/8 p-4 text-xs text-slate-300">
              {t("limitedDataNotice")}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default UniversityDetailPage;
