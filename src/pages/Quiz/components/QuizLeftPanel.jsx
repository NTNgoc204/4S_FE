import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import sparklesIcon from '../../../assets/Sparkles.svg'
import Skeleton from '../../../components/Skeleton'
import { isOptionActuallyOther } from '../util/quizHelpers'

function QuizLeftPanel({
  activeIndex,
  answers,
  insights,
  isCategoryThinking,
  isDone,
  isThinking,
  isOverallLoading,
  listRef,
  locale,
  onSelect,
  questionCount,
  text,
  thinkingQuestionId,
  visibleQuestions,
  recommendations = [],
  onViewDetail,
  submitLoading = false,
  onContinue,
  overallSummary = '',
  onRedoQuiz,
}) {
  const { t } = useTranslation('quiz')
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false)
  const [customAnswers, setCustomAnswers] = useState({})
  const [activeCustomQuestionId, setActiveCustomQuestionId] = useState('')
  const [selectedCustomOption, setSelectedCustomOption] = useState(null)

  const handleCustomSubmit = (question) => {
    const customText = customAnswers[question.id]?.trim()
    if (!customText) return

    onSelect(question, selectedCustomOption, customText)
    setActiveCustomQuestionId('')
    setSelectedCustomOption(null)
  }

  return (
    <div className="flex min-h-0 flex-col border-r border-white/10">
      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_transparent] md:p-6 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/45 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300/55"
      >
        {visibleQuestions.map((question, index) => {
          const selectedOptionId = answers[question.id]
          const selectedOption = question.options.find((option) => option.id === selectedOptionId)
          const progress = Math.round(((index + (selectedOptionId ? 1 : 0)) / questionCount) * 100)

          const activeQuestion = visibleQuestions[activeIndex];
          const activeCategory = activeQuestion ? activeQuestion.categoryId : null;
          const questionCategory = question.categoryId;
          const isSameCategory = activeCategory && questionCategory === activeCategory;
          const canAnswer = isSameCategory && !isDone && !isThinking;
          const isLocked = isDone || !isSameCategory;

          return (
            <article key={question.id} className="mb-5">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ecc741]/35 bg-[#ecc741]/12 text-[0.72rem] text-[#f2cb36]">
                  {'\u{1F451}'}
                </span>

                <div className={`w-full max-w-[790px] rounded-2xl border p-4 md:p-5 transition-all duration-300 ${
                  isLocked 
                    ? 'border-white/5 bg-[#122237]/60 opacity-80' 
                    : 'border-[#5f7396]/45 bg-gradient-to-b from-[#213a58]/95 to-[#182f4a]/98'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-['Sora'] text-lg md:text-[1.45rem]">{question.prompt?.[locale] || question.content}</h3>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    {question.options.map((option) => {
                      const isCustomOption = isOptionActuallyOther(option);

                      const isSelected = selectedOptionId === option.id ||
                        (isCustomOption && selectedOptionId && !question.options.some(o => o.id === selectedOptionId)) ||
                        (isCustomOption && activeCustomQuestionId === question.id && selectedCustomOption?.id === option.id)

                      const disabled = !canAnswer
                      return (
                        <button
                          key={option.id}
                          className={`rounded-xl border px-4 py-2.5 text-left text-sm transition md:text-base ${isSelected
                              ? 'border-[#ecc741] bg-[#ecc741] text-[#11243b]'
                              : 'border-white/12 bg-white/[0.03] text-slate-200 hover:border-[#ecc741]/40 hover:bg-[#ecc741]/10'
                            } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
                          disabled={disabled}
                          onClick={() => {
                            if (isCustomOption) {
                              setSelectedCustomOption(option)
                              setActiveCustomQuestionId(question.id)
                            } else {
                              onSelect(question, option)
                            }
                          }}
                          type="button"
                        >
                          {option.label?.[locale] || option.content}
                        </button>
                      )
                    })}
                  </div>

                  {/* Render custom input text field if active */}
                  {activeCustomQuestionId === question.id && (
                    <div className="mt-4 flex gap-2 items-center w-full">
                      <input
                        type="text"
                        className="flex-1 rounded-xl border border-[#ecc741]/40 bg-[#081a30]/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#ecc741] transition"
                        placeholder={t('customAnswer.placeholder')}
                        value={customAnswers[question.id] || ''}
                        onChange={(e) => setCustomAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCustomSubmit(question)
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleCustomSubmit(question)}
                        className="rounded-xl bg-gradient-to-r from-[#ecc741] to-[#debd34] px-4 py-2.5 text-sm font-bold text-[#11243b] transition hover:brightness-110"
                        type="button"
                      >
                        {t('customAnswer.confirm')}
                      </button>
                      <button
                        onClick={() => {
                          setActiveCustomQuestionId('')
                          setSelectedCustomOption(null)
                        }}
                        className="rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10"
                        type="button"
                      >
                        {t('customAnswer.cancel')}
                      </button>
                    </div>
                  )}

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
              ) : selectedOptionId ? (
                <div className="mt-3 flex justify-end pr-1">
                  <div className="max-w-[520px] rounded-2xl border border-[#ecc741]/20 bg-gradient-to-br from-[#f4d040] to-[#debd34] px-4 py-2.5 text-sm font-semibold text-[#11243c] md:text-base">
                    {selectedOptionId}
                  </div>
                </div>
              ) : null}

              {insights[question.id] ? (
                <div className="mt-3 flex max-w-[790px] items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ecc741]/35 bg-[#ecc741]/12 text-[0.72rem] text-[#f2cb36]">
                    {'\u{1F451}'}
                  </span>
                  <div className="flex-1">
                    <p className="rounded-2xl border border-[#0ed8ab]/25 bg-[#0ed8ab]/10 px-4 py-3 text-sm leading-6 text-slate-100 md:text-base whitespace-pre-line">
                      {insights[question.id]}
                    </p>

                    {/* Render "Tiếp tục" button if this is the active index and it is not the last question */}
                    {index === activeIndex && index < questionCount - 1 && (
                      <button
                        onClick={onContinue}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ecc741] to-[#debd34] px-5 py-2.5 text-sm font-bold text-[#11243b] shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
                        type="button"
                      >
                        {t('leftPanel.continueNext')}
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {thinkingQuestionId === question.id ? (
                <div className="mt-3 flex max-w-[790px] items-start gap-3 animate-pulse-subtle">
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ecc741]/35 bg-[#ecc741]/12 text-[0.72rem] text-[#f2cb36]">
                    👑
                  </span>
                  <div className="flex-1 w-full rounded-2xl border border-[#0ed8ab]/25 bg-[#0ed8ab]/5 px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="animate-spin h-3.5 w-3.5 text-[#0ed8ab]" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs font-semibold text-[#0ed8ab] tracking-wider uppercase">
                        {t('leftPanel.aiAnalyzing')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Skeleton height="0.85rem" className="w-full" />
                      <Skeleton height="0.85rem" className="w-[92%]" />
                      <Skeleton height="0.85rem" className="w-[85%]" />
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          )
        })}

        {isDone && !isCategoryThinking ? (
          <div className="space-y-6">
            {submitLoading && (
              <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-4 flex items-center justify-center gap-3 text-[#0fe2a8]">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-semibold text-sm">
                  {t('leftPanel.saving')}
                </span>
              </div>
            )}
            {/* Profile snapshot - hiển thị từ overallSummary của backend */}
            <article className={`rounded-2xl border border-[#0ed8ab]/30 bg-gradient-to-br from-[#123552] to-[#102d47] ${
              overallSummary ? 'p-5 md:p-6' : 'p-4 md:p-5'
            } ${
              isOverallLoading ? 'animate-pulse-subtle' : ''
            }`}>
              <h3 className={`font-['Sora'] ${overallSummary ? 'text-xl md:text-[1.8rem]' : 'text-lg md:text-xl'}`}>
                {text.summaryTitle}
              </h3>
              {overallSummary ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-200 whitespace-pre-line">
                  {overallSummary}
                </p>
              ) : isOverallLoading ? (
                <div className="mt-3 space-y-2 animate-pulse-subtle" role="status">
                  <div className="mb-2 flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-[#ecc741]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs font-semibold text-[#ecc741] tracking-wider uppercase">
                      {t('leftPanel.aiCompilingProfile')}
                    </span>
                  </div>
                  <Skeleton height="0.7rem" className="w-[96%]" />
                  <Skeleton height="0.7rem" className="w-[86%]" />
                  <Skeleton height="0.7rem" className="w-[55%]" />
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  {t('leftPanel.summaryUnavailable')}
                </p>
              )}
            </article>

            {/* Recommendations & Redo CTA buttons */}
            {isOverallLoading ? (
              <div
                aria-label={t('leftPanel.aiCompilingProfile')}
                className="mt-6 flex flex-wrap justify-center gap-4 pb-2"
                role="status"
              >
                <Skeleton height="3rem" width="230px" borderRadius="12px" />
                <Skeleton height="3rem" width="190px" borderRadius="12px" />
              </div>
            ) : (
            <div className="mt-6 flex flex-wrap gap-4 justify-center pb-2">
              <button
                onClick={() => setShowRecommendationsModal(true)}
                disabled={recommendations.length === 0}
                className={`inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#ecc741] to-[#debd34] px-6 py-3.5 text-base font-bold text-[#11243b] shadow-lg shadow-amber-950/20 hover:brightness-110 active:scale-95 transition cursor-pointer ${
                  recommendations.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                type="button"
              >
                <img alt="Sparkles icon" className="h-5 w-5 object-contain" src={sparklesIcon} />
                {t('leftPanel.viewRecommendedSchools')}
              </button>

              {onRedoQuiz && (
                <button
                  onClick={onRedoQuiz}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 px-6 py-3.5 text-base font-bold text-rose-300 transition cursor-pointer"
                  type="button"
                >
                  🔄 {t('leftPanel.redoQuiz')}
                </button>
              )}
            </div>
            )}

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
                          {t('leftPanel.modalHeaderTitle')}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {t('leftPanel.modalHeaderSubtitle')}
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
                    {recommendations.length === 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="animate-spin h-4 w-4 text-[#ecc741]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-400">
                            {t('leftPanel.modalAiCompiling')}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-2xl border border-white/5 bg-[#142c46]/40 p-4 flex flex-col justify-between h-40">
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 space-y-2">
                                    <Skeleton height="1.2rem" className="w-4/5" />
                                    <Skeleton height="0.95rem" className="w-2/3" />
                                  </div>
                                  <Skeleton height="1.5rem" width="80px" borderRadius="6px" />
                                </div>
                                <div className="mt-4">
                                  <Skeleton height="0.8rem" className="w-1/2" />
                                </div>
                                <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                  <Skeleton height="100%" className="w-4/5" />
                                </div>
                              </div>
                              <Skeleton height="2.25rem" className="w-full mt-4" borderRadius="8px" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.map((school) => {
                          const isTop3 = school.tier === 'top3'
                          return (
                            <article key={school.id} className={`rounded-2xl border p-4 flex flex-col justify-between transition text-left ${
                              isTop3
                                ? 'border-[#ecc741]/30 bg-gradient-to-b from-[#1a3352]/90 to-[#142c46]/90 hover:border-[#ecc741]/55'
                                : 'border-white/10 bg-[#142c46]/60 hover:border-[#0ed8ab]/30'
                            }`}>
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-semibold leading-5 text-slate-100 font-['Sora']">{school.name[locale]}</h4>
                                    <p className="mt-1.5 text-sm text-slate-300 font-medium">{school.major[locale]}</p>
                                  </div>
                                  <span className={`rounded-md px-2 py-1 text-xs font-bold shrink-0 ${
                                    isTop3
                                      ? 'bg-[#ecc741]/20 text-[#ecc741]'
                                      : 'bg-[#0ed8ab]/15 text-[#0ed8ab]'
                                  }`}>
                                    {isTop3
                                      ? t('leftPanel.tagTopPick')
                                      : t('leftPanel.tagGoodFit')}
                                  </span>
                                </div>

                                <p className="mt-3 text-xs text-slate-400">
                                  📍 {school.place[locale]}
                                </p>

                                {/* Tier indicator bar */}
                                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                  <span className={`block h-full rounded-full ${
                                    isTop3
                                      ? 'bg-gradient-to-r from-[#ecc741] to-[#f0d060] w-full'
                                      : 'bg-gradient-to-r from-[#0fe2a8] to-[#11d1f2] w-4/5'
                                  }`} />
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
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <footer className="border-t border-white/10 p-4 bg-[#091b32] flex justify-end">
                    <button
                      onClick={() => setShowRecommendationsModal(false)}
                      className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition cursor-pointer"
                      type="button"
                    >
                      {t('leftPanel.modalClose')}
                    </button>
                  </footer>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <footer className="border-t border-white/10 bg-[#1f3857]/90 px-4 py-3 md:px-6">
        <p className="text-sm text-slate-300">
          {isDone
            ? isCategoryThinking
              ? t('leftPanel.aiAnalyzing')
              : isOverallLoading
                ? t('leftPanel.aiCompilingProfile')
                : t('leftPanel.completed')
            : text.helper}
        </p>
      </footer>
    </div>
  )
}

export default QuizLeftPanel


