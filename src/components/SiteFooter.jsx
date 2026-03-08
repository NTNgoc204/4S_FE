import { useTranslation } from "react-i18next";

function SiteFooter() {
  const { t } = useTranslation();

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
              <a className="transition hover:text-[#f2cb36]" href="mailto:support@careerpathai.com">
                support@careerpathai.com
              </a>
            </li>
            <li>
              <span className="font-medium text-slate-200">{t("common:footer.phoneLabel")}: </span>
              <a className="transition hover:text-[#f2cb36]" href="tel:+84912345678">
                +84 912 345 678
              </a>
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
