function PricingContact({ t, onContactClick }) {
  return (
    <section id="contact-section" className="mt-20 rounded-[32px] border border-white/10 bg-gradient-to-r from-[#172c44]/80 to-[#122238]/90 px-8 py-12 text-center md:px-12 relative overflow-hidden reveal-on-scroll shadow-2xl">
      <div className="glow-blob glow-blob-3 right-0 bottom-0 h-48 w-48 opacity-20" />
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{t('pricing:questions.title')}</h2>
      <p className="mt-3 text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">{t('pricing:questions.subtitle')}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href="mailto:support@4s.edu.vn?subject=Cooperation%20Inquiry%20-%204S%20Career%20Guidance"
          className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02] inline-block"
        >
          {t('pricing:questions.contact')}
        </a>
        <button
          className="rounded-xl border border-[#7f8cff]/30 bg-[#7f8cff]/10 hover:bg-[#7f8cff]/20 px-8 py-3.5 text-sm font-bold text-[#b9c1ff] transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02]"
          type="button"
          onClick={onContactClick}
        >
          {t('pricing:questions.partnership')}
        </button>
      </div>
    </section>
  )
}

export default PricingContact
