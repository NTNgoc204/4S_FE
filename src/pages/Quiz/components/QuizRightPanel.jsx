import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import sparklesIcon from '../../../assets/Sparkles.svg'
import Skeleton from '../../../components/Skeleton'

function QuizRightPanel({ 
  answeredCount, 
  isCategoryThinking,
  isDone, 
  isOverallLoading,
  locale, 
  questionCount, 
  recommendations, 
  text, 
  answers = {}, 
  questions = [],
  insights = {},
}) {
  const navigate = useNavigate()
  const { t } = useTranslation('quiz')

  const plan = useSelector((state) => state.auth.plan)
  const currentPlan = String(plan ?? '').toLowerCase()
  const isProAccount = currentPlan !== 'free' && currentPlan !== ''

  const systemBadge = currentPlan === 'edu'
    ? {
        label: '🎓',
        className: 'border-teal-500/45 bg-teal-500/12 text-teal-400',
      }
    : isProAccount
    ? {
        label: '👑',
        className: 'border-[#ecc741]/35 bg-[#ecc741]/12 text-[#f2cb36]',
      }
    : {
        icon: sparklesIcon,
        className: 'border-emerald-300/40 bg-emerald-400/12 text-emerald-300',
      }

  // Dynamically build categories from questions list
  const quizCategories = useMemo(() => {
    if (!questions || questions.length === 0) {
      return [];
    }
    
    const groups = {};
    questions.forEach((q, index) => {
      if (!q.categoryId) return;
      if (!groups[q.categoryId]) {
        groups[q.categoryId] = {
          id: q.categoryId,
          name: {
            vi: q.categoryName || `Nhóm ${Object.keys(groups).length + 1}`,
            en: q.categoryName || `Category ${Object.keys(groups).length + 1}`,
          },
          questionIndices: [],
        };
      }
      groups[q.categoryId].questionIndices.push(index);
    });
    
    return Object.values(groups).sort((a, b) => a.questionIndices[0] - b.questionIndices[0]);
  }, [questions]);

  // Check category status
  const getCategoryStatus = (category) => {
    const answeredCount = category.questionIndices.filter(idx => {
      const q = questions[idx];
      return q && Boolean(answers[q.id]);
    }).length;

    const total = category.questionIndices.length;

    if (answeredCount === total) return { status: 'done', count: answeredCount, total };
    if (answeredCount > 0) return { status: 'active', count: answeredCount, total };
    return { status: 'locked', count: 0, total };
  };



  return (
    <aside className="flex min-h-0 flex-col bg-[#203a59]/93">
      <header className="border-b border-white/10 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-['Sora'] text-[1.45rem] leading-tight">
            {t('rightPanel.title')}
          </h2>
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
            <div className={`inline-flex h-[58px] w-[58px] items-center justify-center rounded-2xl border text-xl ${systemBadge.className}`}>
              {systemBadge.icon ? (
                <img alt="" aria-hidden="true" className="h-7 w-7 object-contain" src={systemBadge.icon} />
              ) : (
                systemBadge.label
              )}
            </div>
            <p className="mt-4 max-w-[240px] text-base text-slate-300">{text.panelIdle}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Category Cards */}
            <div className="space-y-4">
              {quizCategories.map((category) => {
                const { status, count, total } = getCategoryStatus(category);
                const isCategoryActive = status === 'active';
                const isCategoryDone = status === 'done';
                const isCategoryLocked = status === 'locked';

                const lastIndex = category.questionIndices[category.questionIndices.length - 1];
                const lastQuestion = questions[lastIndex];
                const aiEval = lastQuestion ? insights[lastQuestion.id] : null;
                const isGenerating = isCategoryDone && !aiEval;

                return (
                  <article
                    key={category.id}
                    className={`rounded-2xl border p-4 transition-all duration-200 ${
                      isCategoryDone
                        ? 'border-emerald-500/35 bg-gradient-to-b from-[#0f2d47]/95 to-[#0b2135]/98 shadow-md shadow-emerald-950/20'
                        : isCategoryActive
                        ? 'border-[#ecc741]/35 bg-[#172d47]/90'
                        : 'border-white/5 bg-[#122238]/60 opacity-60'
                    }`}
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-semibold tracking-wide ${isCategoryLocked ? 'text-slate-400' : 'text-slate-100'}`}>
                        {category.name[locale]}
                      </h3>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          isCategoryDone
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : isCategoryActive
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-slate-500/15 text-slate-400'
                        }`}
                      >
                        {isCategoryDone
                          ? t('rightPanel.statusDone')
                          : isCategoryActive
                          ? `${count}/${total}`
                          : t('rightPanel.statusLocked')}
                      </span>
                    </div>

                    {/* Recommendation / Help Text */}
                     {isCategoryDone ? (
                       isGenerating ? (
                         <div className="mt-3 space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 animate-pulse-subtle">
                           <div className="flex items-center gap-2 mb-2">
                             <svg className="animate-spin h-3.5 w-3.5 text-[#ecc741]" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                             </svg>
                             <span className="text-[10px] font-semibold text-slate-400">
                               {t('rightPanel.aiAnalyzing')}
                             </span>
                           </div>
                           <Skeleton height="0.7rem" className="w-full" />
                           <Skeleton height="0.7rem" className="w-[85%]" />
                         </div>
                       ) : (
                        <div className="mt-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
                          <p className="text-xs leading-relaxed text-slate-200 italic whitespace-pre-line">
                            "{aiEval || t('rightPanel.noAiEvaluation')}"
                          </p>
                        </div>
                      )
                    ) : isCategoryActive ? (
                      <div className="mt-3">
                        <p className="text-xs text-slate-300">
                          {t('rightPanel.completeCategoryToUnlock')}
                        </p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <span
                            className="block h-full rounded-full bg-[#ecc741]"
                            style={{ width: `${(count / total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">
                        {t('rightPanel.completePreviousToUnlock')}
                      </p>
                    )}
                  </article>
                );
              })}

              {!isDone && (
                /* Waiting helper */
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center text-xs text-slate-400 leading-normal">
                  💡 {t('rightPanel.waitingHelper', { count: quizCategories.length })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isDone && !isCategoryThinking && (isOverallLoading || recommendations.length > 0) && (
        <footer className="border-t border-white/10 p-4">
          {isOverallLoading ? (
            <div aria-label={t('leftPanel.aiCompilingProfile')} role="status">
              <Skeleton height="2.75rem" className="w-full" borderRadius="12px" />
            </div>
          ) : (
            <button
              onClick={() => navigate('/dashboard', { state: { aiRecommendations: recommendations } })}
              className="w-full rounded-xl bg-gradient-to-br from-[#14d6af] to-[#0fbc98] text-[#e8fffa] hover:brightness-110 px-4 py-3 text-sm font-semibold transition cursor-pointer active:scale-95"
              type="button"
            >
              {text.compareButton(recommendations.length)}
            </button>
          )}
        </footer>
      )}
    </aside>
  )
}

export default QuizRightPanel
