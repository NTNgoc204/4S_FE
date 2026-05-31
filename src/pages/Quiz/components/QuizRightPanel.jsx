import sparklesIcon from '../../../assets/Sparkles.svg'

const CATEGORY_PROFILES = {
  personality: {
    analytical: {
      vi: "Bạn có xu hướng tư duy logic, phân tích tốt và ngăn nắp. Bạn thích làm việc với dữ liệu và tìm kiếm giải pháp có cấu trúc.",
      en: "You tend to be analytical, logical, and structured. You enjoy working with data and looking for methodical solutions."
    },
    creative: {
      vi: "Bạn là người bay bổng, có tính sáng tạo cao và nhạy cảm nghệ thuật. Bạn thích các công việc cho phép tự do thể hiện ý tưởng độc đáo.",
      en: "You are imaginative, highly creative, and artistically sensitive. You enjoy tasks that allow free expression of unique ideas."
    },
    social: {
      vi: "Bạn là người hướng ngoại, hòa đồng và thích giao tiếp. Bạn có năng lực kết nối con người và phát huy tối đa sức mạnh tập thể.",
      en: "You are outgoing, friendly, and communicative. You excel at connecting people and maximizing group synergy."
    },
    practical: {
      vi: "Bạn là người có tư duy thực tế, rõ ràng và kiên định. Bạn yêu thích các công việc thực hành và giải quyết các bài toán cụ thể đời thực.",
      en: "You are practical, clear-headed, and steady. You love hands-on work and solving real-world concrete problems."
    },
    action: {
      vi: "Bạn là người quyết đoán, linh hoạt và định hướng hành động nhanh. Bạn thích thử nghiệm cái mới và rút kinh nghiệm trực tiếp.",
      en: "You are decisive, flexible, and action-oriented. You enjoy experimenting with new ideas and learning by doing."
    },
    balanced: {
      vi: "Bạn có tính cách cân bằng, kết hợp tốt giữa lý trí sắc bén và trực giác nhạy bén. Bạn linh hoạt ứng biến trong nhiều hoàn cảnh.",
      en: "You have a balanced personality, blending sharp logic with keen intuition. You adapt flexibly to various situations."
    }
  },
  learning: {
    analytical: {
      vi: "Phong cách học tập của bạn rất quy củ. Bạn tiếp thu tốt nhất qua sách vở, tài liệu chi tiết và các hệ thống lý thuyết khoa học.",
      en: "Your learning style is highly methodical. You absorb information best through detailed documents and scientific theories."
    },
    creative: {
      vi: "Bạn học hỏi nhanh nhất qua hình ảnh, ví dụ trực quan sinh động và liên tưởng sáng tạo chứ không thích các tài liệu khô khan.",
      en: "You learn fastest through visuals, vivid illustrations, and creative associations rather than dry text."
    },
    social: {
      vi: "Bạn tiếp thu kiến thức tốt nhất khi tham gia thảo luận nhóm, trao đổi ý kiến và học cùng với bạn bè đồng hành.",
      en: "You acquire knowledge best when participating in group discussions, sharing ideas, and learning with peers."
    },
    practical: {
      vi: "Bạn học bằng cách bắt tay vào làm. Việc tự học qua thực hành trực tiếp và chỉ dẫn thực tế giúp bạn nhớ lâu hơn.",
      en: "You learn by doing. Self-study through direct practice and hands-on guidance helps you retain knowledge longer."
    },
    action: {
      vi: "Bạn thích học qua các dự án thực tế, hành động nhanh và sửa sai liên tục để hoàn thiện kỹ năng một cách nhanh chóng.",
      en: "You prefer learning through real projects, taking swift action, and iterating quickly to refine your skills."
    },
    balanced: {
      vi: "Bạn có phương pháp tự học linh hoạt, cân bằng giữa việc đọc hiểu lý thuyết và dành thời gian thực hành củng cố.",
      en: "You have a flexible self-learning method, balancing theoretical reading with hands-on practice."
    }
  },
  decision: {
    analytical: {
      vi: "Khi ra quyết định, bạn luôn phân tích kỹ lưỡng, cân nhắc số liệu và dùng logic thay vì cảm xúc nhất thời.",
      en: "When making decisions, you always analyze carefully, weigh the data, and rely on logic rather than temporary emotions."
    },
    creative: {
      vi: "Bạn đưa ra lựa chọn dựa nhiều trên cảm xúc, trực giác và cảm hứng sáng tạo để tìm hướng đi độc đáo nhất.",
      en: "You make choices based on emotions, intuition, and creative inspiration to find the most unique path."
    },
    social: {
      vi: "Bạn coi trọng ý kiến tập thể và tác động xã hội khi đưa ra lựa chọn, luôn cố gắng đạt được sự đồng thuận cao.",
      en: "You value collective opinions and social impact when making choices, always striving for consensus."
    },
    practical: {
      vi: "Lựa chọn của bạn dựa trên trải nghiệm thực tế và tính khả thi cao, ưu tiên các giải pháp giải quyết trực tiếp vấn đề.",
      en: "Your choices are based on practical experience and high feasibility, prioritizing direct problem-solving."
    },
    action: {
      vi: "Bạn là người ra quyết định nhanh chóng, sẵn sàng hành động và linh hoạt điều chỉnh khi có tình huống mới phát sinh.",
      en: "You are a quick decision maker, ready to act and adapt flexibly when new situations arise."
    },
    balanced: {
      vi: "Bạn có tư duy ra quyết định chín chắn, cân nhắc hài hòa giữa phân tích logic và cảm quan trực giác cá nhân.",
      en: "You have a mature decision-making style, harmonizing logical analysis with personal intuition."
    }
  }
}

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
  locale, 
  onViewDetail, 
  questionCount, 
  recommendations, 
  text, 
  answers = {}, 
  questions = [] 
}) {

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

  // Find dominant profile for a category
  const getDominantProfileForCategory = (category) => {
    const counts = {};
    category.questionIndices.forEach(idx => {
      const q = questions[idx];
      if (q) {
        const ansId = answers[q.id];
        if (ansId) {
          const option = q.options.find(o => o.id === ansId);
          if (option?.profile) {
            counts[option.profile] = (counts[option.profile] || 0) + 1;
          }
        }
      }
    });

    let dominant = 'balanced';
    let max = 0;
    Object.entries(counts).forEach(([profile, count]) => {
      if (count > max) {
        max = count;
        dominant = profile;
      }
    });
    return dominant;
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
              {CATEGORIES.map((category) => {
                const { status, count, total } = getCategoryStatus(category);
                const isCategoryActive = status === 'active';
                const isCategoryDone = status === 'done';
                const isCategoryLocked = status === 'locked';

                let dominantProfile = 'balanced';
                let recommendationText = '';
                if (isCategoryDone) {
                  dominantProfile = getDominantProfileForCategory(category);
                  recommendationText = CATEGORY_PROFILES[category.id]?.[dominantProfile]?.[locale] || '';
                }

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
                      <div className="mt-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
                        <p className="text-xs leading-relaxed text-slate-200 italic">
                          "{recommendationText}"
                        </p>
                      </div>
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
