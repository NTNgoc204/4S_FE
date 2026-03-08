import sparklesIcon from '../../../assets/Sparkles.svg'

function QuizRightPanel({ answeredCount, isDone, locale, onViewDetail, questionCount, recommendations, text }) {
  return (
    <aside className="flex min-h-0 flex-col bg-[#203a59]/93">
      <header className="border-b border-white/10 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-['Sora'] text-[1.45rem] leading-tight">{text.panelTitle}</h2>
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#0ed8ab] px-2 text-xs font-bold text-[#082339]">
            {answeredCount}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-300">
          {answeredCount > 0 ? text.panelActive(answeredCount, questionCount) : text.panelIdle}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_transparent] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/45 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300/55">
        {answeredCount === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="inline-flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-[#ecc741]/30 bg-[#ecc741]/12">
              <img alt="Sparkles icon" className="h-7 w-7 object-contain" src={sparklesIcon} />
            </div>
            <p className="mt-4 max-w-[240px] text-base text-slate-300">{text.panelIdle}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((school) => (
              <article key={school.id} className="rounded-xl border border-white/10 bg-[#142c46]/96 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold leading-5 text-slate-100">{school.name[locale]}</h3>
                    <p className="mt-1 text-xs text-slate-300">{school.major[locale]}</p>
                  </div>
                  <span className="rounded-md bg-[#ecc741]/20 px-2 py-1 text-xs font-bold text-[#ecc741]">{school.score}%</span>
                </div>

                <p className="mt-2 text-[11px] text-slate-400">
                  {school.place[locale]} - {school.tuition[locale]}
                </p>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-gradient-to-r from-[#0fe2a8] to-[#11d1f2]" style={{ width: `${school.score}%` }} />
                </div>

                <button
                  className="mt-2.5 w-full rounded-lg border border-[#0ed8ab]/30 bg-[#0ed8ab]/12 py-1.5 text-xs font-semibold text-[#0fe2a8] transition hover:bg-[#0ed8ab]/20"
                  onClick={() => onViewDetail?.(school)}
                  type="button"
                >
                  {text.viewDetail}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-white/10 p-4">
        <button
          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
            isDone
              ? 'bg-gradient-to-br from-[#14d6af] to-[#0fbc98] text-[#e8fffa] hover:brightness-110'
              : 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-500'
          }`}
          disabled={!isDone}
          type="button"
        >
          {text.compareButton}
        </button>
      </footer>
    </aside>
  )
}

export default QuizRightPanel

