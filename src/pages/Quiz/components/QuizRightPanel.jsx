import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import sparklesIcon from '../../../assets/Sparkles.svg'



const CATEGORIES = [
  {
    id: 'personality',
    name: {
      en: '1. Personality & Interests',
      vi: '1. Tính cách & Sở thích'
    },
    questionIndices: [0, 1, 2, 3, 4] // Q1-5
  },
  {
    id: 'learning',
    name: {
      en: '2. Learning & Focus Style',
      vi: '2. Phong cách Học tập'
    },
    questionIndices: [5, 6, 7, 8, 9] // Q6-10
  },
  {
    id: 'decision',
    name: {
      en: '3. Thinking & Choice Method',
      vi: '3. Tư duy & Quyết định'
    },
    questionIndices: [10, 11, 12, 13, 14] // Q11-15
  }
]

function QuizRightPanel({ 
  answeredCount, 
  isDone, 
  isThinking = false,
  locale, 
  onViewDetail, 
  questionCount, 
  recommendations, 
  text, 
  answers = {}, 
  questions = [],
  insights = {},
  isAiAnalyzing = false
}) {
  const navigate = useNavigate()

  // Dynamically build categories from questions list if available
  const quizCategories = useMemo(() => {
    if (!questions || questions.length === 0 || !questions[0]?.categoryId) {
      return CATEGORIES;
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
            {locale === 'vi' ? 'Định hướng Từng Nhóm' : 'Category Insights'}
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
            <div className="inline-flex h-[58px] w-[58px] items-center justify-center rounded-2xl border border-[#ecc741]/30 bg-[#ecc741]/12">
              <img alt="Sparkles icon" className="h-7 w-7 object-contain" src={sparklesIcon} />
            </div>
            <p className="mt-4 max-w-[240px] text-base text-slate-300">{text.panelIdle}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Category Cards */}
            <div className="space-y-4">
              {quizCategories.map((category, index) => {
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
                          ? (locale === 'vi' ? 'Đã xong' : 'Done')
                          : isCategoryActive
                          ? `${count}/${total}`
                          : (locale === 'vi' ? 'Chưa mở' : 'Locked')}
                      </span>
                    </div>

                    {/* Recommendation / Help Text */}
                    {isCategoryDone ? (
                      isGenerating ? (
                        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-xs text-slate-400">
                          <svg className="animate-spin h-3.5 w-3.5 text-[#ecc741]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>{locale === 'vi' ? 'AI đang phân tích...' : 'AI is analyzing...'}</span>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
                          <p className="text-xs leading-relaxed text-slate-200 italic whitespace-pre-line">
                            "{aiEval || (locale === 'vi' ? 'Không có đánh giá từ AI.' : 'No AI evaluation available.')}"
                          </p>
                        </div>
                      )
                    ) : isCategoryActive ? (
                      <div className="mt-3">
                        <p className="text-xs text-slate-300">
                          {locale === 'vi' ? 'Hoàn thành nhóm này để xem đánh giá cá nhân.' : 'Complete this category to unlock evaluation.'}
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
                        {locale === 'vi' ? 'Hoàn thành các nhóm trước để mở khóa.' : 'Complete previous categories to unlock.'}
                      </p>
                    )}
                  </article>
                );
              })}

              {!isDone && (
                /* Waiting helper */
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-center text-xs text-slate-400 leading-normal">
                  💡 {locale === 'vi'
                    ? 'Hãy hoàn thành tất cả 3 nhóm câu hỏi để nhận danh sách trường Đại học và Ngành học gợi ý tối ưu nhất.'
                    : 'Please answer all 3 categories of questions to receive the optimized University and Major recommendations.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isDone && !isAiAnalyzing && (
        <footer className="border-t border-white/10 p-4">
          <button
            onClick={() => navigate('/dashboard', { state: { aiRecommendations: recommendations } })}
            className="w-full rounded-xl bg-gradient-to-br from-[#14d6af] to-[#0fbc98] text-[#e8fffa] hover:brightness-110 px-4 py-3 text-sm font-semibold transition cursor-pointer active:scale-95"
            type="button"
          >
            {text.compareButton}
          </button>
        </footer>
      )}
    </aside>
  )
}

export default QuizRightPanel
