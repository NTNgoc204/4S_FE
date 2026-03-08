import { useTranslation } from 'react-i18next'
import bookOpenIcon from '../../assets/BookOpen.svg'
import sparklesIcon from '../../assets/Sparkles.svg'

function ConsultationPage() {
  const { t } = useTranslation()

  return (
    <>
      <main className="mx-auto w-[min(1320px,95vw)] pb-16 md:pt-8">
        <section className="text-center">
          <p className="mx-auto mb-7 inline-flex items-center rounded-full border border-[#ecc741]/30 bg-[#ecc741]/12 px-5 py-2 text-lg font-semibold text-[#ecc741]">
            {t('consultation:hero.chip')}
          </p>
          <h2 className="font-['Sora'] text-[2.2rem] tracking-[-0.03em] md:text-[4.1rem]">{t('consultation:hero.title')}</h2>
          <p className="mt-4 text-[1.14rem] text-slate-300 md:text-[1.4rem]">{t('consultation:hero.subtitle')}</p>
        </section>

        <section className="mx-auto mt-12 grid max-w-[800px] grid-cols-1 gap-6 md:grid-cols-2">
          <article className="relative flex h-full flex-col items-center rounded-[18px] border border-[#66789c]/34 bg-gradient-to-b from-[#263f5f]/95 to-[#18314c]/98 p-7 text-center shadow-[0_16px_35px_rgba(236,199,65,0.07)] md:p-8">
            <span className="absolute right-6 top-6 inline-flex items-end gap-1 rounded-lg border border-[#ecc741]/60 bg-[#ecc741]/15 px-3 py-1.5 text-sm font-bold tracking-wide text-[#f4d040]">
              <span className="text-xl leading-none">{'\u{1F451}'}</span>
              <span className="leading-none">{t('consultation:header.proBadge')}</span>
            </span>

            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-[#ecc741]/34 bg-[#ecc741]/14">
              <img alt="Book Open icon" className="h-10 w-10 object-contain" src={bookOpenIcon} />
            </div>

            <h3 className="mt-6 font-['Sora'] text-[2.05rem] tracking-[-0.03em]">{t('consultation:quiz.title')}</h3>
            <p className="mt-3 text-[1.08rem] text-slate-300">{t('consultation:quiz.description')}</p>

            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {[t('consultation:quiz.tag1'), t('consultation:quiz.tag2'), t('consultation:quiz.tag3')].map((tag) => (
                <span key={tag} className="rounded-full border border-[#ecc741]/28 bg-[#ecc741]/12 px-3 py-1 text-sm text-[#ecc741]">
                  {tag}
                </span>
              ))}
            </div>

            <button className="mt-auto w-full rounded-2xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3.5 text-xl font-semibold text-[#112542] transition hover:brightness-110" type="button">
              {t('consultation:quiz.cta')} {'\u2192'}
            </button>
          </article>

          <article className="flex h-full flex-col items-center rounded-[18px] border border-[#1f7f7a]/38 bg-gradient-to-b from-[#223a57]/95 to-[#172d47]/98 p-7 text-center shadow-[0_16px_35px_rgba(15,226,168,0.08)] md:p-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-[#14d6af]/30 bg-[#14d6af]/12">
              <img alt="Sparkles icon" className="h-10 w-10 object-contain" src={sparklesIcon} />
            </div>

            <h3 className="mt-6 font-['Sora'] text-[2.05rem] tracking-[-0.03em]">{t('consultation:chat.title')}</h3>
            <p className="mt-3 text-[1.08rem] text-slate-300">{t('consultation:chat.description')}</p>

            <div className="my-6 flex flex-wrap justify-center gap-2.5">
              {[t('consultation:chat.tag1'), t('consultation:chat.tag2'), t('consultation:chat.tag3')].map((tag) => (
                <span key={tag} className="rounded-full border border-[#18c7a5]/35 bg-[#18c7a5]/14 px-3 py-1 text-sm text-[#0fe2a8]">
                  {tag}
                </span>
              ))}
            </div>

            <button className="mt-auto w-full rounded-2xl bg-gradient-to-br from-[#17d8b2] to-[#0fbc98] px-6 py-3.5 text-xl font-semibold text-[#e8fffa] transition hover:brightness-110" type="button">
              {t('consultation:chat.cta')} {'\u2192'}
            </button>
          </article>
        </section>
      </main>
    </>
  )
}

export default ConsultationPage
