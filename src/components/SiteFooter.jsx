import { useTranslation } from "react-i18next";
import { triggerMailWithFallback } from "../util/mailHelper";

function SiteFooter() {
  const { t } = useTranslation();

  const handleEmailClick = (e) => {
    e.preventDefault();
    triggerMailWithFallback(t("common:footer.emailVal"));
  };

  return (
    <footer className="mt-12 border-t border-white/10 bg-[#020d1c]/90 py-10">
      <div className="mx-auto grid w-[min(1120px,92vw)] gap-8 md:grid-cols-2">
        <section>
          <h2 className="font-['Sora'] text-lg font-semibold text-slate-100">
            {t("common:footer.contactTitle")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>
              <span className="font-medium text-slate-200">{t("common:footer.emailLabel")}: </span>
              <a
                className="transition hover:text-[#f2cb36] cursor-pointer"
                href={`mailto:${t("common:footer.emailVal")}`}
                onClick={handleEmailClick}
              >
                {t("common:footer.emailVal")}
              </a>
            </li>
            <li>
              <span className="font-medium text-slate-200">{t("common:footer.phoneLabel")}: </span>
              <span className="text-slate-300">+84 912 345 678</span>
            </li>
            <li>
              <span className="font-medium text-slate-200">{t("common:footer.addressLabel")}: </span>
              Thu Duc, Ho Chi Minh
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-['Sora'] text-lg font-semibold text-slate-100">
            {t("common:footer.socialTitle")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>
              <span className="font-medium text-slate-200">Facebook: </span>
              <a
                className="transition hover:text-[#0ed8ab]"
                href="https://facebook.com/careerpathai"
                rel="noreferrer"
                target="_blank"
              >
                facebook.com/careerpathai
              </a>
            </li>
            <li>
              <span className="font-medium text-slate-200">TikTok: </span>
              <a
                className="transition hover:text-[#0ed8ab]"
                href="https://tiktok.com/@careerpathai"
                rel="noreferrer"
                target="_blank"
              >
                tiktok.com/@careerpathai
              </a>
            </li>
            <li>
              <span className="font-medium text-slate-200">Instagram: </span>
              <a
                className="transition hover:text-[#0ed8ab]"
                href="https://instagram.com/careerpathai"
                rel="noreferrer"
                target="_blank"
              >
                instagram.com/careerpathai
              </a>
            </li>
          </ul>
        </section>
      </div>

      <div className="mx-auto mt-8 w-[min(1120px,92vw)] border-t border-white/10 pt-4 text-center text-xs text-slate-400">
        {t("common:footer.copyright")}
      </div>
    </footer>
  );
}

export default SiteFooter;
