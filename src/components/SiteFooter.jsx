import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { triggerMailWithFallback } from "../util/mailHelper";

function SiteFooter() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.resolvedLanguage !== "vi";

  const handleEmailClick = (e) => {
    e.preventDefault();
    triggerMailWithFallback(t("common:footer.emailVal"));
  };

  return (
    <footer className="mt-12 border-t border-white/10 bg-[#020d1c]/90 py-10">
      <style>{`
        @keyframes scan {
          0%, 100% { top: 6px; }
          50% { top: calc(100% - 8px); }
        }
        .animate-scanLine {
          animation: scan 2s linear infinite;
        }
      `}</style>
      <div className="mx-auto grid w-[min(1120px,92vw)] gap-8 md:grid-cols-3">
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

        <section className="glass-card bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-md border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl">
          {/* Accent decoration glow */}
          <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[#ecc741]/10 blur-xl pointer-events-none" />
          
          <div>
            <h2 className="font-['Sora'] text-lg font-semibold text-slate-100 flex items-center gap-2">
              <span>{t("common:footer.downloadTitle")}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0ed8ab] animate-pulse" />
            </h2>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-[280px]">
              {t("common:footer.downloadDesc")}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {/* Custom high-end button design */}
            <a
              href={import.meta.env.VITE_APK_DOWNLOAD_URL || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-slate-200 transition-all duration-300 hover:bg-[#ecc741] hover:text-[#0c1e36] hover:border-transparent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ecc741]/20 cursor-pointer overflow-hidden active:scale-95"
            >
              <span className="absolute inset-0 -z-10 bg-gradient-to-r from-[#ffe06e]/20 to-[#ecc741]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <svg className="h-5 w-5 text-[#ecc741] group-hover:text-[#0c1e36] transition-colors duration-300 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5.277c0-.987.728-1.57 1.583-1.076l14.475 8.358c.854.493.854 1.298 0 1.792L4.583 22.71c-.855.494-1.583-.09-1.583-1.076V5.277z"/>
              </svg>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] uppercase tracking-widest text-slate-400 group-hover:text-[#0c1e36]/75 transition-colors duration-300 font-semibold mb-0.5">
                  {isEnglish ? "GET IT ON" : "TẢI TRÊN"}
                </span>
                <span className="text-xs font-bold tracking-tight">Google Play</span>
              </div>
            </a>

            {/* Scannable QR code with scanning light */}
            <div className="relative group/qr p-1.5 bg-white rounded-xl border border-white/10 shadow-md inline-flex">
              <QRCodeSVG
                value={import.meta.env.VITE_APK_DOWNLOAD_URL || "https://4s.vercel.app"}
                size={54}
                bgColor={"#FFFFFF"}
                fgColor={"#020d1c"}
                level={"L"}
                includeMargin={false}
              />
              <div className="absolute inset-x-1.5 top-1.5 h-0.5 bg-[#0ed8ab] shadow-[0_0_8px_#0ed8ab] opacity-60 animate-scanLine pointer-events-none" />
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto mt-8 w-[min(1120px,92vw)] border-t border-white/10 pt-4 text-center text-xs text-slate-400">
        {t("common:footer.copyright")}
      </div>
    </footer>
  );
}

export default SiteFooter;
