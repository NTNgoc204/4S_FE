import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className="not-found-stage mx-auto flex min-h-[calc(100vh-74px)] w-[min(1120px,92vw)] items-center justify-center px-4 py-16">
      <section className="not-found-panel relative grid w-full max-w-[920px] overflow-hidden rounded-3xl border border-white/10 bg-[#102944]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.34)] md:grid-cols-[0.95fr_1.05fr] md:p-8 lg:p-10">
        <div className="not-found-route-line not-found-route-line-one" />
        <div className="not-found-route-line not-found-route-line-two" />

        <div className="relative flex min-h-[300px] items-center justify-center">
          <div aria-hidden="true" className="not-found-signal">
            <span className="not-found-ring not-found-ring-one" />
            <span className="not-found-ring not-found-ring-two" />
            <span className="not-found-ring not-found-ring-three" />
            <span className="not-found-sweep" />
          </div>
          <p className="not-found-code relative font-['Sora'] text-[100px] font-black leading-none text-[#ecc741] md:text-[128px] lg:text-[150px]">
            404
          </p>
        </div>

        <div className="relative flex flex-col justify-center py-4 text-center md:py-0 md:text-left">
          <h1 className="font-['Sora'] text-3xl font-bold text-white md:text-4xl">
            {t("notFound:title")}
          </h1>
          <p className="mt-4 max-w-[560px] text-base leading-7 text-slate-300 md:text-lg">
            {t("notFound:description")}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <button
              className="rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)]"
              onClick={() => navigate("/")}
              type="button"
            >
              {t("notFound:goHome")}
            </button>
            <button
              className="rounded-xl border border-white/14 bg-white/5 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
              onClick={() => navigate(-1)}
              type="button"
            >
              {t("notFound:goBack")}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
