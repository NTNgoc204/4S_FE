import React from 'react'
import { useTranslation } from 'react-i18next'
import Skeleton from '../../../components/Skeleton'

function ChatRecommendationPanel({
  isPro,
  onViewDetail,
  recommendations = [],
  summaryText = '',
  systemBadge,
  onUpgrade,
  isLoading = false,
}) {
  const { t, i18n } = useTranslation('chat')
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'
  const hasResults = !!summaryText || recommendations.length > 0

  // Màu badge và bar theo % phù hợp
  const getPercentStyle = (percent) => {
    if (percent >= 80) return {
      badge: 'bg-[#ecc741]/20 text-[#ecc741]',
      bar: 'bg-gradient-to-r from-[#ecc741] to-[#f0d060]',
      label: t('excellentMatch'),
    }
    if (percent >= 60) return {
      badge: 'bg-[#0ed8ab]/15 text-[#0ed8ab]',
      bar: 'bg-gradient-to-r from-[#0fe2a8] to-[#11d1f2]',
      label: t('goodMatch'),
    }
    return {
      badge: 'bg-slate-400/15 text-slate-300',
      bar: 'bg-gradient-to-r from-slate-400 to-slate-300',
      label: t('decentMatch'),
    }
  }

  return (
    <aside className="flex min-h-0 flex-col bg-[#203a59]/93 w-full border-l border-white/10 h-full">
      <header className="border-b border-white/10 p-5 bg-[#172c43]">
        <h2 className="font-['Sora'] text-xl font-bold leading-tight text-slate-100">
          {isLoading ? t('loadingSession') : (hasResults ? t('resultsTitle') : t('evaluationTitle'))}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {isLoading ? t('answerToReceiveResults') : (hasResults ? t('updatesWithAnswers') : t('answerToReceiveResults'))}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_transparent] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/45 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300/55">
        {isLoading ? (
          <div className="space-y-4">
            {/* Summary card skeleton */}
            <div className="rounded-2xl border border-[#0ed8ab]/15 bg-[#0c233c]/35 p-4 space-y-3">
              <Skeleton className="bg-[#0fe2a8]/25" width="33%" height="14px" />
              <div className="space-y-2">
                <Skeleton width="100%" height="10px" />
                <Skeleton width="83%" height="10px" />
                <Skeleton width="66%" height="10px" />
              </div>
            </div>

            {isPro ? (
              // Pro user suggestions skeleton
              <div className="space-y-3">
                <Skeleton className="px-0.5" width="25%" height="12px" />
                {[1, 2].map((idx) => (
                  <div key={idx} className="rounded-xl border border-white/5 bg-[#142c46]/30 p-3.5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <Skeleton width="75%" height="14px" />
                        <Skeleton width="50%" height="10px" />
                      </div>
                      <Skeleton width="40px" height="18px" className="shrink-0" />
                    </div>
                    <Skeleton width="33%" height="10px" />
                    <div className="space-y-1.5">
                      <Skeleton width="100%" height="6px" className="rounded-full bg-slate-700/50" />
                      <Skeleton width="25%" height="8px" />
                    </div>
                    <Skeleton className="bg-[#0ed8ab]/5 border border-[#0ed8ab]/10" width="100%" height="32px" borderRadius="8px" />
                  </div>
                ))}
              </div>
            ) : (
              // Free user upgrade CTA skeleton
              <div className="rounded-2xl border border-[#ecc741]/10 bg-[#1b2d47]/30 p-5 flex flex-col items-center space-y-3">
                <Skeleton variant="circle" width="40px" height="40px" className="border border-[#ecc741]/15" />
                <Skeleton width="50%" height="14px" />
                <Skeleton width="66%" height="10px" />
                <Skeleton width="100%" height="32px" borderRadius="12px" />
              </div>
            )}
          </div>
        ) : !hasResults ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-4 py-8">
            <span className={`inline-flex h-[58px] w-[58px] items-center justify-center rounded-2xl border text-xl ${systemBadge.className}`}>
              {systemBadge.icon ? (
                <img alt="" aria-hidden="true" className="h-7 w-7 object-contain" src={systemBadge.icon} />
              ) : (
                systemBadge.label
              )}
            </span>
            <p className="mt-4 max-w-[240px] text-sm text-slate-300">
              {t('emptyEvaluationDesc')}
            </p>
          </div>
        ) : (
          <>
            {/* Summary — hiện cho cả Free lẫn Pro */}
            {summaryText ? (
              <article className="rounded-2xl border border-[#0ed8ab]/20 bg-[#0c233c]/60 p-4 text-left">
                <h3 className="font-['Sora'] text-sm font-bold text-[#0fe2a8] mb-2">
                  {t('orientationOverview')}
                </h3>
                <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                  {summaryText}
                </p>
              </article>
            ) : null}

            {isPro ? (
              // PRO: Danh sách trường với % phù hợp
              <div className="space-y-3">
                {recommendations.length > 0 && (
                  <h3 className="font-['Sora'] text-sm font-bold text-slate-200 px-0.5">
                    {t('panelTitle')}
                  </h3>
                )}
                {recommendations.map((school) => {
                  const percent = school.matchPercent ?? 0
                  const style = getPercentStyle(percent)
                  return (
                    <article key={school.id} className="rounded-xl border border-white/10 bg-[#142c46]/60 p-3.5 flex flex-col justify-between transition text-left hover:border-[#0ed8ab]/30">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-semibold leading-tight text-slate-100 font-['Sora']">
                              {school.name[locale]}
                            </h4>
                            <p className="mt-1 text-[11px] text-slate-300 font-medium leading-snug">
                              {school.major[locale]}
                            </p>
                          </div>
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${style.badge}`}>
                            {percent}%
                          </span>
                        </div>

                        <p className="mt-2 text-[10px] text-slate-400">
                          📍 {school.place[locale]}
                        </p>

                        {/* Progress bar theo % */}
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <span
                            className={`block h-full rounded-full ${style.bar}`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-slate-500">{style.label}</p>
                      </div>

                      <button
                        className="mt-3 w-full rounded-lg border border-[#0ed8ab]/30 bg-[#0ed8ab]/12 py-1.5 text-xs font-semibold text-[#0fe2a8] transition hover:bg-[#0ed8ab]/20 cursor-pointer"
                        onClick={() => onViewDetail?.(school)}
                        type="button"
                      >
                        {t('viewDetail')}
                      </button>
                    </article>
                  )
                })}
              </div>
            ) : (
              // FREE: CTA nâng cấp
              <article className="relative overflow-hidden rounded-2xl border border-[#ecc741]/25 bg-gradient-to-b from-[#1b2d47]/90 to-[#0f1d31]/98 p-5 text-center shadow-[0_0_20px_rgba(236,199,65,0.05)]">
                {/* Decorative abstract glow */}
                <div className="absolute -left-12 -top-12 h-24 w-24 rounded-full bg-[#ecc741]/5 blur-2xl" />
                <div className="absolute -right-12 -bottom-12 h-24 w-24 rounded-full bg-[#ecc741]/5 blur-2xl" />

                <div className="relative z-10 flex flex-col items-center">
                  {/* Premium Lock Icon with Gold Glow */}
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#ecc741]/35 bg-gradient-to-br from-[#ecc741]/20 to-[#ecc741]/5 text-[#fcd34d] shadow-[0_0_12px_rgba(236,199,65,0.15)]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  <h4 className="font-['Sora'] text-sm font-extrabold bg-gradient-to-r from-[#ffea9f] via-[#ecc741] to-[#cca625] bg-clip-text text-transparent mb-1.5">
                    {t('viewProposedSchools')}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-300/90 mb-4 px-1">
                    {t('upgradeToProToUnlock')}
                  </p>
                  <button
                    onClick={onUpgrade}
                    className="group relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#ffe072] to-[#debd34] py-2.5 text-xs font-bold text-[#0c1b2f] shadow-[0_4px_15px_rgba(236,199,65,0.2)] transition-all duration-300 hover:shadow-[0_6px_18px_rgba(236,199,65,0.35)] hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                    type="button"
                  >
                    {/* Shiny gloss effect on hover */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                    
                    {/* Crown Icon */}
                    <svg className="h-3.5 w-3.5 shrink-0 text-[#0c1b2f] transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2 22h20v-2H2v2zm1-3h18l-2-7-4 3-3-8-3 8-4-3-2 7z" />
                    </svg>
                    <span>{t('upgradeProNow')}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">➔</span>
                  </button>
                </div>
              </article>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

export default ChatRecommendationPanel
