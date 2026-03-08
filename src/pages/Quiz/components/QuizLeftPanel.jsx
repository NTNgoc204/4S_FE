function QuizLeftPanel({
  activeIndex,
  answers,
  buildInsight,
  hemisphere,
  insights,
  isDone,
  isThinking,
  listRef,
  locale,
  onSelect,
  questionCount,
  strengths,
  text,
  thinkingQuestionId,
  visibleQuestions,
}) {
  return (
    <div className="flex min-h-0 flex-col border-r border-white/10">
      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_transparent] md:p-6 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/45 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300/55"
      >
        {visibleQuestions.map((question, index) => {
          const selectedOptionId = answers[question.id]
          const selectedOption = question.options.find((option) => option.id === selectedOptionId)
          const progress = Math.round(((index + (selectedOption ? 1 : 0)) / questionCount) * 100)
          const canAnswer = index === activeIndex && !isDone && !isThinking

          return (
            <article key={question.id} className="mb-5">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ecc741]/35 bg-[#ecc741]/12 text-[0.72rem] text-[#f2cb36]">
                  👑
                </span>

                <div className="w-full max-w-[790px] rounded-2xl border border-[#5f7396]/45 bg-gradient-to-b from-[#213a58]/95 to-[#182f4a]/98 p-4 md:p-5">
                  <h3 className="font-['Sora'] text-lg md:text-[1.45rem]">{question.prompt[locale]}</h3>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    {question.options.map((option) => {
                      const isSelected = selectedOptionId === option.id
                      const disabled = Boolean(selectedOptionId) || !canAnswer
                      return (
                        <button
                          key={option.id}
                          className={`rounded-xl border px-4 py-2.5 text-left text-sm transition md:text-base ${
                            isSelected
                              ? 'border-[#ecc741] bg-[#ecc741] text-[#11243b]'
                              : 'border-white/12 bg-white/[0.03] text-slate-200 hover:border-[#ecc741]/40 hover:bg-[#ecc741]/10'
                          } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
                          disabled={disabled}
                          onClick={() => onSelect(question, option)}
                          type="button"
                        >
                          {option.label[locale]}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{text.questionProgress(Math.min(index + 1, questionCount), questionCount)}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-gradient-to-r from-[#f4d040] to-[#e9bf2d]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              {selectedOption ? (
                <div className="mt-3 flex justify-end pr-1">
                  <div className="max-w-[520px] rounded-2xl border border-[#ecc741]/20 bg-gradient-to-br from-[#f4d040] to-[#debd34] px-4 py-2.5 text-sm font-semibold text-[#11243c] md:text-base">
                    {selectedOption.label[locale]}
                  </div>
                </div>
              ) : null}

              {insights[question.id] ? (
                <div className="mt-3 flex max-w-[790px] items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ecc741]/35 bg-[#ecc741]/12 text-[0.72rem] text-[#f2cb36]">
                    👑
                  </span>
                  <p className="rounded-2xl border border-[#0ed8ab]/25 bg-[#0ed8ab]/10 px-4 py-3 text-sm leading-6 text-slate-100 md:text-base">
                    {selectedOption ? buildInsight(selectedOption) : ''}
                  </p>
                </div>
              ) : null}

              {thinkingQuestionId === question.id ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
                  <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-[#ecc741]" />
                  {text.thinking}
                </div>
              ) : null}
            </article>
          )
        })}

        {isDone ? (
          <article className="rounded-2xl border border-[#0ed8ab]/30 bg-gradient-to-br from-[#123552] to-[#102d47] p-5 md:p-6">
            <h3 className="font-['Sora'] text-xl md:text-[1.8rem]">{text.summaryTitle}</h3>
            <p className="mt-2 text-slate-300">{text.summaryDesc}</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {strengths.map((item) => (
                <span key={item.key} className="rounded-full border border-[#0ed8ab]/35 bg-[#0ed8ab]/12 px-3 py-1 text-sm text-[#0fe2a8]">
                  {item.label}
                </span>
              ))}
              <span className="rounded-full border border-[#ecc741]/35 bg-[#ecc741]/12 px-3 py-1 text-sm text-[#f1cb38]">{hemisphere}</span>
            </div>
          </article>
        ) : null}
      </div>

      <footer className="border-t border-white/10 bg-[#1f3857]/90 px-4 py-3 md:px-6">
        <p className="text-sm text-slate-300">{text.helper}</p>
      </footer>
    </div>
  )
}

export default QuizLeftPanel
