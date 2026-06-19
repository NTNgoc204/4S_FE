import Skeleton from '../../../components/Skeleton'
import { getFormattedPriceParts } from '../util/pricingHelpers'

function PricingCard({
  plan,
  index,
  isPlansLoading,
  isLoggedIn,
  activePlanId,
  onPlanClick,
  t,
}) {
  const { value, currency } = getFormattedPriceParts(plan, t)

  return (
    <article
      className={`relative flex flex-col rounded-[32px] border p-8 transition-all duration-500 hover:scale-[1.02] ${plan.borderClass} ${plan.cardClass} reveal-on-scroll`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Popular / Focus badge */}
      {plan.badge ? (
        <span
          className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider shadow-md ${
            plan.planCode === 'pro'
              ? 'bg-gradient-to-r from-[#ffe06e] to-[#ecc741] text-[#17314b]'
              : 'bg-gradient-to-r from-[#6f7bff] to-[#7f8cff] text-[#ecf0ff]'
          }`}
        >
          {plan.badge}
        </span>
      ) : null}

      {/* Plan Icon */}
      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl text-base font-extrabold shadow-inner ${plan.iconClass}`}>
        {plan.iconLabel}
      </div>

      {/* Plan Name */}
      {isPlansLoading ? (
        <div className="mt-6 mb-2">
          <Skeleton height="1.8rem" width="120px" />
        </div>
      ) : (
        <h2 className="mt-6 font-display text-2xl font-extrabold text-white tracking-tight text-left">{plan.name}</h2>
      )}

      {/* Plan Description */}
      <p className="mt-2 text-xs text-slate-400 text-left leading-relaxed">{plan.description}</p>

      {/* Plan Price */}
      <div className="mt-6 flex items-baseline flex-wrap gap-1.5 border-b border-white/5 pb-6">
        {isPlansLoading ? (
          <Skeleton height="3.2rem" width="160px" />
        ) : (
          <>
            <span className="font-display text-4xl md:text-[2.6rem] font-extrabold leading-none tracking-tight text-white whitespace-nowrap">
              {value}
            </span>
            {currency && (
              <span className="text-lg md:text-xl font-bold text-slate-300">
                {currency}
              </span>
            )}
            {plan.period && (
              <span className="text-xs text-slate-400 font-medium ml-1">
                {plan.period}
              </span>
            )}
          </>
        )}
      </div>

      {/* Plan Features */}
      <ul className="mt-8 space-y-4 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 text-left leading-snug">
            <span className={`mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/5 ${plan.checkClass}`}>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Action Button */}
      <div className="mt-8 pt-6 border-t border-white/5">
        {isPlansLoading ? (
          <Skeleton height="3.25rem" className="w-full" borderRadius="1rem" />
        ) : isLoggedIn && activePlanId === plan.planCode ? (
          <button
            className="w-full cursor-default rounded-2xl bg-emerald-500/10 border border-emerald-500/20 py-4 text-sm font-bold text-[#0fe2a8]"
            disabled
            type="button"
          >
            {t('pricing:currentPlanCta', 'Gói hiện tại của bạn')}
          </button>
        ) : isLoggedIn && (
          (activePlanId === 'pro' && plan.planCode === 'free') ||
          (activePlanId === 'edu' && (plan.planCode === 'free' || plan.planCode === 'pro'))
        ) ? (
          <button
            className="w-full cursor-not-allowed rounded-2xl border border-white/5 bg-white/2 py-4 text-sm font-bold text-slate-500"
            disabled
            type="button"
          >
            {plan.cta}
          </button>
        ) : (
          <button
            className={`w-full rounded-2xl py-4 text-sm font-bold transition-all duration-300 cursor-pointer ${plan.buttonClass}`}
            type="button"
            onClick={() => onPlanClick(plan)}
          >
            {plan.cta}
          </button>
        )}
      </div>
    </article>
  )
}

export default PricingCard
