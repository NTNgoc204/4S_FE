import { useTranslation } from 'react-i18next'

function PricingPage({ isLoggedIn = false, currentPlan = '' }) {
  const { t } = useTranslation()
  const activePlanId = String(currentPlan).toLowerCase()

  function getFeatures(key) {
    const features = t(key, { returnObjects: true })
    return Array.isArray(features) ? features : []
  }

  const plans = [
    {
      id: 'free',
      badge: '',
      name: t('pricing:plans.free.name'),
      description: t('pricing:plans.free.description'),
      price: t('pricing:plans.free.price'),
      period: t('pricing:plans.free.period'),
      cta: t('pricing:plans.free.cta'),
      features: getFeatures('pricing:plans.free.features'),
      iconLabel: 'AI',
      iconClass: 'bg-gradient-to-br from-[#1be6b4] to-[#00bb8f] text-[#e8fff7]',
      borderClass: 'border-white/10',
      cardClass: 'bg-gradient-to-b from-[#1e3552]/92 to-[#162c45]/94',
      checkClass: 'text-[#0fe2a8]',
      buttonClass: 'bg-[#184c56] text-[#0fe2a8] hover:bg-[#1c5a66]',
    },
    {
      id: 'pro',
      badge: t('pricing:plans.pro.badge'),
      name: t('pricing:plans.pro.name'),
      description: t('pricing:plans.pro.description'),
      price: t('pricing:plans.pro.price'),
      period: t('pricing:plans.pro.period'),
      cta: t('pricing:plans.pro.cta'),
      features: getFeatures('pricing:plans.pro.features'),
      iconLabel: 'PRO',
      iconClass: 'bg-gradient-to-br from-[#ffe16d] to-[#deb320] text-[#0f2d4a]',
      borderClass: 'border-[#ecc741]/45 shadow-[0_18px_40px_rgba(236,199,65,0.16)]',
      cardClass: 'bg-gradient-to-b from-[#1f3654]/94 to-[#162d47]/96',
      checkClass: 'text-[#ecc741]',
      buttonClass:
        'bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] text-[#112542] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(238,198,49,0.3)]',
    },
    {
      id: 'edu',
      badge: t('pricing:plans.edu.badge'),
      name: t('pricing:plans.edu.name'),
      description: t('pricing:plans.edu.description'),
      price: t('pricing:plans.edu.price'),
      period: t('pricing:plans.edu.period'),
      cta: t('pricing:plans.edu.cta'),
      features: getFeatures('pricing:plans.edu.features'),
      iconLabel: 'EDU',
      iconClass: 'bg-gradient-to-br from-[#7e8cff] to-[#6373f7] text-[#eef2ff]',
      borderClass: 'border-[#7f8cff]/45 shadow-[0_18px_40px_rgba(127,140,255,0.18)]',
      cardClass: 'bg-gradient-to-b from-[#1f3553]/92 to-[#172d47]/94',
      checkClass: 'text-[#8b99ff]',
      buttonClass: 'bg-gradient-to-br from-[#6f7bff] to-[#7f8cff] text-[#eff2ff] hover:brightness-110',
    },
  ]

  return (
    <>
      <main className="mx-auto w-[min(1320px,95vw)] pb-16 pt-14 md:pt-20">
        <section className="text-center">
          <p className="mx-auto mb-7 inline-flex items-center rounded-full border border-[#ecc741]/30 bg-[#ecc741]/12 px-5 py-2 text-lg font-semibold text-[#ecc741]">
            {t('pricing:hero.chip')}
          </p>
          <h1 className="font-['Sora'] text-[2.3rem] tracking-[-0.03em] md:text-[4.1rem]">{t('pricing:hero.title')}</h1>
          <p className="mt-4 text-[1.18rem] text-slate-300 md:text-[1.45rem]">{t('pricing:hero.subtitle')}</p>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex h-full flex-col rounded-[22px] border p-7 md:p-8 ${plan.borderClass} ${plan.cardClass}`}
            >
              {plan.badge ? (
                <span
                  className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-1.5 text-sm font-bold ${
                    plan.id === 'pro'
                      ? 'bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] text-[#17314b]'
                      : 'bg-gradient-to-br from-[#6f7bff] to-[#7f8cff] text-[#ecf0ff]'
                  }`}
                >
                  {plan.badge}
                </span>
              ) : null}

              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-extrabold ${plan.iconClass}`}>
                {plan.iconLabel}
              </div>

              <h2 className="mt-5 font-['Sora'] text-[2.15rem] tracking-[-0.03em]">{plan.name}</h2>
              <p className="mt-1 min-h-[56px] text-[1.02rem] text-slate-300">{plan.description}</p>

              <div className="mt-4 flex items-end gap-1">
                <p className="font-['Sora'] text-[3.35rem] leading-none tracking-[-0.03em]">{plan.price}</p>
                {plan.period ? <p className="pb-1 text-[1.06rem] text-slate-400">{plan.period}</p> : null}
              </div>

              <ul className="mt-7 space-y-3.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-[1.05rem] text-slate-200">
                    <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center ${plan.checkClass}`}>
                      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 20 20">
                        <path d="m4.5 10.5 3.2 3.2L15.5 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                {isLoggedIn && activePlanId === plan.id ? (
                  <button
                    className="w-full cursor-default rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-xl font-semibold text-slate-200"
                    disabled
                    type="button"
                  >
                    {t('pricing:currentPlanCta')}
                  </button>
                ) : (
                  <button className={`w-full rounded-2xl px-6 py-3.5 text-xl font-semibold transition ${plan.buttonClass}`} type="button">
                    {plan.cta}
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>

        <p className="mt-10 text-center text-lg text-slate-400">{t('pricing:note')}</p>

        <section className="mt-10 rounded-[22px] border border-white/10 bg-gradient-to-b from-[#233a59]/90 to-[#1b304d]/95 px-6 py-10 text-center md:px-10">
          <h2 className="font-['Sora'] text-[2.15rem] tracking-[-0.03em]">{t('pricing:questions.title')}</h2>
          <p className="mt-2 text-[1.15rem] text-slate-300">{t('pricing:questions.subtitle')}</p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <button
              className="rounded-2xl border border-white/15 bg-white/8 px-7 py-3 text-lg font-semibold text-slate-200 transition hover:bg-white/15"
              type="button"
            >
              {t('pricing:questions.contact')}
            </button>
            <button
              className="rounded-2xl border border-[#7f8cff]/45 bg-[#7f8cff]/18 px-7 py-3 text-lg font-semibold text-[#b9c1ff] transition hover:bg-[#7f8cff]/30"
              type="button"
            >
              {t('pricing:questions.partnership')}
            </button>
          </div>
        </section>
      </main>
    </>
  )
}

export default PricingPage
