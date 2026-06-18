function ChatRecommendationPanel({
  isPro,
  locale,
  onViewDetail,
  recommendations = [],
  summaryText = '',
  systemBadge,
  text,
  onUpgrade,
}) {
  const hasResults = !!summaryText || recommendations.length > 0

  // Màu badge và bar theo % phù hợp
  const getPercentStyle = (percent) => {
    if (percent >= 80) return {
      badge: 'bg-[#ecc741]/20 text-[#ecc741]',
      bar: 'bg-gradient-to-r from-[#ecc741] to-[#f0d060]',
      label: locale === 'vi' ? '⭐ Rất phù hợp' : '⭐ Excellent',
    }
    if (percent >= 60) return {
      badge: 'bg-[#0ed8ab]/15 text-[#0ed8ab]',
      bar: 'bg-gradient-to-r from-[#0fe2a8] to-[#11d1f2]',
      label: locale === 'vi' ? '✓ Phù hợp' : '✓ Good fit',
    }
    return {
      badge: 'bg-slate-400/15 text-slate-300',
      bar: 'bg-gradient-to-r from-slate-400 to-slate-300',
      label: locale === 'vi' ? '~ Tạm ổn' : '~ Decent',
    }
  }

  return (
    <aside className="flex min-h-0 flex-col bg-[#203a59]/93 w-full border-l border-white/10">
      <header className="border-b border-white/10 p-5 bg-[#172c43]">
        <h2 className="font-['Sora'] text-xl font-bold leading-tight text-slate-100">
          {hasResults
            ? (locale === 'vi' ? 'Kết quả Hướng nghiệp' : 'Career Results')
            : (locale === 'vi' ? 'Đánh giá Hướng nghiệp' : 'Career Evaluation')
          }
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {hasResults
            ? (locale === 'vi' ? 'Cập nhật theo từng câu trả lời của bạn' : 'Updates with each of your answers')
            : (locale === 'vi' ? 'Trả lời các câu hỏi để nhận kết quả...' : 'Answer questions to receive results...')
          }
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_transparent] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/45 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300/55">
        {!hasResults ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-4 py-8">
            <span className={`inline-flex h-[58px] w-[58px] items-center justify-center rounded-2xl border text-xl ${systemBadge.className}`}>
              {systemBadge.icon ? (
                <img alt="" aria-hidden="true" className="h-7 w-7 object-contain" src={systemBadge.icon} />
              ) : (
                systemBadge.label
              )}
            </span>
            <p className="mt-4 max-w-[240px] text-sm text-slate-300">
              {locale === 'vi'
                ? 'Hãy trả lời các câu hỏi của Trợ lý AI. Các trường và ngành phù hợp sẽ hiện ra tại đây.'
                : "Answer the AI Assistant's questions. Matching schools and majors will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* Summary — hiện cho cả Free lẫn Pro */}
            {summaryText ? (
              <article className="rounded-2xl border border-[#0ed8ab]/20 bg-[#0c233c]/60 p-4 text-left">
                <h3 className="font-['Sora'] text-sm font-bold text-[#0fe2a8] mb-2">
                  {locale === 'vi' ? '📝 Tổng quan định hướng:' : '📝 Profile Summary:'}
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
                    {text.panelTitle}
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
                        {text.viewDetail}
                      </button>
                    </article>
                  )
                })}
              </div>
            ) : (
              // FREE: CTA nâng cấp
              <article className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
                <span className="text-2xl block mb-2">🔒</span>
                <h4 className="font-['Sora'] text-sm font-bold text-[#ecc741] mb-1">
                  {locale === 'vi' ? 'Xem trường đề xuất' : 'View Recommended Schools'}
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal mb-3">
                  {locale === 'vi'
                    ? 'Nâng cấp tài khoản PRO để mở khóa danh sách đề xuất trường Đại học & Ngành học phù hợp tối ưu nhất.'
                    : 'Upgrade to PRO to unlock personalized university and major recommendations.'}
                </p>
                <button
                  onClick={onUpgrade}
                  className="w-full rounded-xl bg-gradient-to-r from-[#ecc741] to-[#debd34] py-2 text-xs font-bold text-[#11243b] shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
                  type="button"
                >
                  {locale === 'vi' ? 'Nâng cấp PRO ngay ➔' : 'Upgrade to PRO ➔'}
                </button>
              </article>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

export default ChatRecommendationPanel
