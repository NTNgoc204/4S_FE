import { useState } from 'react'
import sparklesIcon from '../../../assets/Sparkles.svg'

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
  recommendations = [],
  onViewDetail,
  submitLoading = false,
}) {
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false)

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
                  {'\u{1F451}'}
                </span>

                <div className="w-full max-w-[790px] rounded-2xl border border-[#5f7396]/45 bg-gradient-to-b from-[#213a58]/95 to-[#182f4a]/98 p-4 md:p-5">
                  <h3 className="font-['Sora'] text-lg md:text-[1.45rem]">{question.prompt?.[locale] || question.content}</h3>

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
                          {option.label?.[locale] || option.content}
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
                    {selectedOption.label?.[locale] || selectedOption.content}
                  </div>
                </div>
              ) : null}

              {insights[question.id] ? (
                <div className="mt-3 flex max-w-[790px] items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ecc741]/35 bg-[#ecc741]/12 text-[0.72rem] text-[#f2cb36]">
                    {'\u{1F451}'}
                  </span>
                  <p className="rounded-2xl border border-[#0ed8ab]/25 bg-[#0ed8ab]/10 px-4 py-3 text-sm leading-6 text-slate-100 md:text-base">
                    {selectedOption ? buildInsight(selectedOption, index) : ''}
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
          <div className="space-y-6">
            {submitLoading && (
              <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-4 flex items-center justify-center gap-3 text-[#0fe2a8]">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-semibold text-sm">
                  {locale === 'vi' ? 'Đang lưu kết quả bài làm lên server...' : 'Saving your test results to server...'}
                </span>
              </div>
            )}
            {/* Profile snapshot */}
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

            {/* Recommendations CTA button */}
            <div className="mt-6 flex justify-center pb-2">
              <button
                onClick={() => setShowRecommendationsModal(true)}
                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#ecc741] to-[#debd34] px-6 py-3.5 text-base font-bold text-[#11243b] shadow-lg shadow-amber-950/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
                type="button"
              >
                <img alt="Sparkles icon" className="h-5 w-5 object-contain" src={sparklesIcon} />
                {locale === 'vi' ? 'Xem Danh Sách Trường Gợi Ý' : 'View Recommended Schools'}
              </button>
            </div>

            {/* Modal Overlay */}
            {showRecommendationsModal && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
                onClick={() => setShowRecommendationsModal(false)}
              >
                <div 
                  className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl border border-white/10 bg-[#081a30]/98 shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <header className="flex items-center justify-between border-b border-white/10 p-5 bg-[#0b223c]">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-[#ecc741]/30 bg-[#ecc741]/12">
                        <img alt="Sparkles icon" className="h-5 w-5 object-contain" src={sparklesIcon} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-['Sora'] text-lg md:text-xl font-bold text-[#ecc741]">
                          {locale === 'vi' ? 'Đề xuất Trường & Ngành học' : 'Recommended Schools & Majors'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {locale === 'vi' ? 'Dựa trên kết quả trắc nghiệm định hướng của bạn' : 'Based on your orientation quiz results'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowRecommendationsModal(false)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer text-sm font-semibold"
                      type="button"
                    >
                      ✕
                    </button>
                  </header>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-5 md:p-6 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_transparent] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/45 [&::-webkit-scrollbar-track]:bg-transparent">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.map((school) => (
                        <article key={school.id} className="rounded-2xl border border-white/10 bg-[#142c46]/60 p-4 flex flex-col justify-between transition hover:border-[#ecc741]/35 hover:bg-[#142c46]/90 text-left">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-base font-semibold leading-5 text-slate-100 font-['Sora']">{school.name[locale]}</h4>
                                <p className="mt-1.5 text-sm text-slate-300 font-medium">{school.major[locale]}</p>
                              </div>
                              <span className="rounded-md bg-[#ecc741]/20 px-2 py-1 text-xs font-bold text-[#ecc741] shrink-0">{school.score}%</span>
                            </div>

                            <p className="mt-3 text-xs text-slate-400">
                              📍 {school.place[locale]} — 💵 {school.tuition[locale]}
                            </p>

                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <span className="block h-full rounded-full bg-gradient-to-r from-[#0fe2a8] to-[#11d1f2]" style={{ width: `${school.score}%` }} />
                            </div>
                          </div>

                          <button
                            className="mt-4 w-full rounded-lg border border-[#0ed8ab]/30 bg-[#0ed8ab]/12 py-2 text-sm font-semibold text-[#0fe2a8] transition hover:bg-[#0ed8ab]/20 cursor-pointer"
                            onClick={() => {
                              setShowRecommendationsModal(false);
                              onViewDetail?.(school);
                            }}
                            type="button"
                          >
                            {text.viewDetail}
                          </button>
                        </article>
                      ))}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <footer className="border-t border-white/10 p-4 bg-[#091b32] flex justify-end">
                    <button
                      onClick={() => setShowRecommendationsModal(false)}
                      className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition cursor-pointer"
                      type="button"
                    >
                      {locale === 'vi' ? 'Đóng' : 'Close'}
                    </button>
                  </footer>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <footer className="border-t border-white/10 bg-[#1f3857]/90 px-4 py-3 md:px-6">
        <p className="text-sm text-slate-300">{text.helper}</p>
      </footer>
    </div>
  )
}

export default QuizLeftPanel


