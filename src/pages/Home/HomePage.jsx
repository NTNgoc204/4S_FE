import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import fourSLogo from '../../assets/logo-4s.png'

function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const outletContext = useOutletContext()
  const isLoggedIn = outletContext?.isLoggedIn ?? false

  const featureCards = [
    {
      icon: 'AI',
      title: t('home:features.chatbot.title'),
      description: t('home:features.chatbot.description'),
    },
    {
      icon: '$',
      title: t('home:features.tuition.title'),
      description: t('home:features.tuition.description'),
    },
    {
      icon: 'MS',
      title: t('home:features.match.title'),
      description: t('home:features.match.description'),
    },
  ]

  const journeySteps = [
    {
      id: '1',
      title: t('home:steps.step1.title'),
      description: t('home:steps.step1.description'),
    },
    {
      id: '2',
      title: t('home:steps.step2.title'),
      description: t('home:steps.step2.description'),
    },
    {
      id: '3',
      title: t('home:steps.step3.title'),
      description: t('home:steps.step3.description'),
    },
  ]

  const statItems = [
    { value: '10,000+', label: t('home:stats.students') },
    { value: '200+', label: t('home:stats.universities') },
    { value: '98%', label: t('home:stats.satisfaction') },
    { value: '4.9/5', label: t('home:stats.averageRating') },
  ]

  const primaryBtnClass =
    'rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)]'

  function handleStartConsultationClick() {
    navigate(isLoggedIn ? '/consultation' : '/login')
  }

  return (
    <>
      <main>
        <section className="relative pb-22 pt-20 md:pb-24 md:pt-26">
          <div className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,207,74,0.2),transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-20 -right-40 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(13,223,177,0.18),transparent_72%)]" />
          <div className="relative z-10 mx-auto w-[min(1120px,92vw)] text-center">
            <p className="mx-auto mb-6 w-fit rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200">
              {t('home:hero.chip')}
            </p>
            <h1 className="font-['Sora'] text-[2.25rem] leading-[1.08] tracking-[-0.03em] text-transparent md:text-[4.3rem] bg-gradient-to-br from-[#fff4b7] via-[#edca48] to-[#0bd7a7] bg-clip-text">
              {t('home:hero.titleLine1')} <br />
              {t('home:hero.titleLine2')}
            </h1>
            <p className="mx-auto mt-7 w-[min(760px,94%)] text-[1.05rem] leading-8 text-slate-300 md:text-[1.12rem]">
              {t('home:hero.description')}
            </p>
            <button className={`${primaryBtnClass} mt-8 px-9 py-4`} onClick={handleStartConsultationClick} type="button">
              {t('common:actions.startConsultation')}
            </button>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex">
                  {['AL', 'TH', 'HN', 'PV'].map((name, index) => (
                    <span
                      key={name}
                      className={`${
                        index === 0 ? 'ml-0' : '-ml-2'
                      } inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#081226] bg-gradient-to-br from-[#ffe170] to-[#e4b41f] text-[0.62rem] font-bold text-[#162840]`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-300">{t('home:hero.studentsGuided')}</p>
              </div>

              <p className="text-sm text-slate-300">
                <span className="mr-1 text-[#ecc741]">*****</span> {t('home:hero.rating')}
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-gradient-to-b from-[#203552]/92 to-[#1d324e]/90">
          <div className="mx-auto grid min-h-[150px] w-[min(1120px,92vw)] grid-cols-1 items-center gap-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item, index) => (
              <article key={item.label} className="text-center">
                <h3
                  className={`font-['Sora'] text-4xl tracking-[-0.02em] md:text-[2.7rem] ${
                    index === 1 || index === 3 ? 'text-[#0fe2a8]' : 'text-[#f4d040]'
                  }`}
                >
                  {item.value}
                </h3>
                <p className="mt-1 text-sm text-slate-300">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-18 md:py-22">
          <div className="mx-auto w-[min(1120px,92vw)]">
            <header className="text-center">
              <h2 className="font-['Sora'] text-[2rem] tracking-[-0.03em] md:text-[3.2rem]">{t('home:why.title')}</h2>
              <p className="mx-auto mt-4 w-[min(640px,96%)] text-slate-300">{t('home:why.subtitle')}</p>
            </header>

            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature, index) => (
                <article
                  key={feature.title}
                  className="rounded-[18px] border border-white/10 bg-gradient-to-b from-[#1c3553]/88 to-[#14273f]/94 p-6"
                >
                  <div
                    className={`inline-flex h-[52px] w-[52px] items-center justify-center rounded-[14px] text-sm font-extrabold tracking-wide ${
                      index === 1
                        ? 'bg-gradient-to-br from-[#1be6b4] to-[#00bb8f] text-[#e8fff7]'
                        : 'bg-gradient-to-br from-[#ffe06e] to-[#e2bb28] text-[#09213f]'
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mt-5 font-['Sora'] text-2xl tracking-[-0.03em]">{feature.title}</h3>
                  <p className="mt-3 text-[0.95rem] text-slate-300">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[radial-gradient(circle_at_20%_10%,rgba(255,205,58,0.08),transparent_40%),radial-gradient(circle_at_80%_85%,rgba(0,210,160,0.09),transparent_40%),linear-gradient(180deg,rgba(26,45,71,0.85),rgba(14,28,46,0.84))] py-18 md:py-22">
          <div className="mx-auto w-[min(1120px,92vw)]">
            <header className="text-center">
              <h2 className="font-['Sora'] text-[2rem] tracking-[-0.03em] md:text-[3.2rem]">{t('home:how.title')}</h2>
              <p className="mx-auto mt-4 w-[min(640px,96%)] text-slate-300">{t('home:how.subtitle')}</p>
            </header>

            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {journeySteps.map((step, index) => (
                <article key={step.id} className="relative px-3 text-center">
                  <span
                    className={`mx-auto mb-5 inline-flex h-[70px] w-[70px] items-center justify-center rounded-2xl font-['Sora'] text-3xl ${
                      index === 1
                        ? 'bg-gradient-to-br from-[#13e6ba] to-[#03b88f] text-[#e9fffb]'
                        : 'bg-gradient-to-br from-[#ffe26f] to-[#e4be2d] text-[#06223e]'
                    }`}
                  >
                    {step.id}
                  </span>
                  <h3 className="font-['Sora'] text-[1.65rem] tracking-[-0.03em]">{step.title}</h3>
                  <p className="mt-2 text-slate-300">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-18 md:py-22">
          <div className="pointer-events-none absolute inset-x-[18%] top-[18%] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(255,206,55,0.14),transparent_64%)]" />
          <div className="relative z-10 mx-auto w-[min(1120px,92vw)]">
            <header className="text-center">
              <h2 className="font-['Sora'] text-[2rem] tracking-[-0.03em] md:text-[3.2rem]">{t('home:testimonial.title')}</h2>
              <p className="mx-auto mt-4 w-[min(640px,96%)] text-slate-300">{t('home:testimonial.subtitle')}</p>
            </header>

            <article className="mt-12 rounded-[22px] border border-white/10 bg-gradient-to-b from-[#1e3451]/90 to-[#182c47]/94 p-8">
              <div className="mb-3 flex items-center gap-3">
                <p aria-label={t('home:testimonial.ratingAria')} className="flex items-center gap-1 leading-none text-[#ecc741]">
                  {[0, 1, 2, 3, 4].map((starIndex) => (
                    <span key={starIndex} className="text-[1.85rem] md:text-[2.1rem]">
                      {'\u2605'}
                    </span>
                  ))}
                </p>
                <p className="text-sm font-semibold text-amber-200 md:text-base">{t('home:testimonial.ratingText')}</p>
              </div>
              <blockquote className="my-4 text-[1.08rem] leading-8 text-slate-200">{t('home:testimonial.quote')}</blockquote>
              <div className="flex items-center gap-4">
                <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gradient-to-br from-[#ffde63] to-[#e2b824] text-xs font-bold text-[#0c2440]">
                  TH
                </span>
                <div>
                  <h3 className="font-['Sora'] text-base">{t('home:testimonial.name')}</h3>
                  <p className="text-sm text-slate-300">{t('home:testimonial.role')}</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-gradient-to-b from-[#233b5c]/85 to-[#182d4a]/95 py-18 md:py-22">
          <div className="mx-auto w-[min(1120px,92vw)] text-center">
            <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#ffe16d] to-[#deb320] text-lg font-extrabold tracking-widest text-[#0f2d4a] shadow-[0_10px_24px_rgba(237,196,46,0.28)]">
              UP
            </div>
            <h2 className="font-['Sora'] text-[2rem] tracking-[-0.03em] md:text-[3.3rem]">{t('home:cta.title')}</h2>
            <p className="mx-auto mt-4 w-[min(750px,96%)] text-[1rem] text-slate-300 md:text-[1.1rem]">{t('home:cta.subtitle')}</p>
            <button className={`${primaryBtnClass} mt-8 px-9 py-4`} onClick={handleStartConsultationClick} type="button">
              {t('common:actions.startConsultation')}
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#020d1c]/90 py-8">
        <div className="mx-auto w-[min(1120px,92vw)] text-center">
          <Link className="mb-3 inline-flex items-center justify-center gap-3 text-[#ecc741] no-underline" to="/">
            <img alt="4S logo" className="h-[70px] w-[70px] object-contain" src={fourSLogo} />
            <span className="font-['Sora'] text-2xl font-bold text-[#29d39c]">4S</span>
          </Link>
          <p className="text-sm text-slate-400">{t('common:footer.copyright')}</p>
        </div>
      </footer>
    </>
  )
}

export default HomePage
