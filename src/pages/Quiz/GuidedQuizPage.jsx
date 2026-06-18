import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { toast } from 'react-toastify'

import QuizLeftPanel from './components/QuizLeftPanel'
import QuizRightPanel from './components/QuizRightPanel'
import ConfirmModal from '../../components/ConfirmModal'
import { fetchQuestionsRequest, submitAnswersRequest } from '../../feature/question/questionSlice'
import { questionAPI } from '../../feature/question/questionAPI'


const UI_TEXT = {
  en: {
    thinking: 'AI is analyzing your latest answer...',
    helper: 'Choose one answer above to continue.',
    helperThinking: 'Please wait a moment. AI is generating your insight before the next question.',
    changeMode: 'Change mode',
    questionProgress: (current, total) => `Question ${current}/${total}`,
    panelTitle: 'Recommended Universities',
    panelIdle: 'Share your interests and preferences in the chat, and AI will show the best matches here.',
    panelActive: (current, total) => `${current}/${total} answers analyzed`,
    viewDetail: 'View details',
    compareButton: 'Compare 4 universities ->',
    summaryTitle: 'Your profile snapshot',
    summaryDesc: 'Based on your answers, these are your strongest tendencies:',
    brainLeft: 'Left-brain dominant',
    brainRight: 'Right-brain dominant',
    brainBalanced: 'Balanced left-right brain profile',
    strengths: {
      tech: 'Technology orientation',
      business: 'Business mindset',
      engineering: 'Engineering thinking',
      creative: 'Creative expression',
      social: 'People and communication',
    },
  },
  vi: {
    thinking: 'AI đang phân tích câu trả lời gần nhất của bạn...',
    helper: 'Hãy chọn một đáp án ở trên để tiếp tục.',
    helperThinking: 'Vui lòng chờ một chút, AI đang tạo gợi ý trước khi qua câu tiếp theo.',
    changeMode: 'Đổi chế độ',
    questionProgress: (current, total) => `Câu hỏi ${current}/${total}`,
    panelTitle: 'Trường đại học gợi ý',
    panelIdle: 'Hãy chia sẻ sở thích và định hướng của bạn, AI sẽ hiển thị các trường phù hợp ở đây.',
    panelActive: (current, total) => `Đã phân tích ${current}/${total} câu`,
    viewDetail: 'Xem chi tiết',
    compareButton: 'So sánh 4 trường ->',
    summaryTitle: 'Tổng quan hồ sơ của bạn',
    summaryDesc: 'Từ các câu trả lời, đây là những xu hướng nổi bật nhất:',
    brainLeft: 'Thiên về bán cầu não trái',
    brainRight: 'Thiên về bán cầu não phải',
    brainBalanced: 'Cân bằng hai bán cầu não',
    strengths: {
      tech: 'Định hướng công nghệ',
      business: 'Tư duy kinh doanh',
      engineering: 'Tư duy kỹ thuật',
      creative: 'Khuynh hướng sáng tạo',
      social: 'Thiên hướng giao tiếp - xã hội',
    },
  },
}

const QUIZ_STATE_KEY = 'guided_quiz_state_v1'

function readQuizState() {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.sessionStorage.getItem(QUIZ_STATE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

const INSIGHT_PROFILES = {
  analytical: {
    personality: {
      en: 'analytical, structured, and logic-driven',
      vi: 'phân tích tốt, có cấu trúc và thiên về logic',
    },
    interest: {
      en: 'clear frameworks, data, and measurable outcomes',
      vi: 'khung kiến thức rõ ràng, dữ liệu và kết quả đo lường được',
    },
    brain: {
      en: 'left-brain dominant',
      vi: 'thiên về bán cầu não trái',
    },
  },
  creative: {
    personality: {
      en: 'creative, intuitive, and expressive',
      vi: 'sáng tạo, trực giác tốt và giàu biểu đạt',
    },
    interest: {
      en: 'ideas, visuals, and new perspectives',
      vi: 'ý tưởng mới, trực quan và góc nhìn khác biệt',
    },
    brain: {
      en: 'right-brain dominant',
      vi: 'thiên về bán cầu não phải',
    },
  },
  social: {
    personality: {
      en: 'social, collaborative, and people-oriented',
      vi: 'hướng ngoại, hợp tác tốt và thiên về con người',
    },
    interest: {
      en: 'communication, teamwork, and collective growth',
      vi: 'giao tiếp, phối hợp và phát triển tập thể',
    },
    brain: {
      en: 'right-brain social tendency',
      vi: 'xu hướng xã hội thiên về bán cầu não phải',
    },
  },
  practical: {
    personality: {
      en: 'practical, grounded, and execution-focused',
      vi: 'thực tế, rõ ràng và tập trung thực thi',
    },
    interest: {
      en: 'hands-on application and solving real problems',
      vi: 'ứng dụng thực hành và xử lý vấn đề thực tế',
    },
    brain: {
      en: 'slightly left-brain oriented',
      vi: 'hơi nghiêng về bán cầu não trái',
    },
  },
  balanced: {
    personality: {
      en: 'balanced between logic and intuition',
      vi: 'cân bằng giữa lý trí và trực giác',
    },
    interest: {
      en: 'combining analysis with flexibility',
      vi: 'kết hợp phân tích với sự linh hoạt',
    },
    brain: {
      en: 'balanced left-right brain profile',
      vi: 'cân bằng giữa hai bán cầu não',
    },
  },
  action: {
    personality: {
      en: 'decisive, adaptive, and action-oriented',
      vi: 'quyết đoán, linh hoạt và thiên hành động',
    },
    interest: {
      en: 'quick execution and rapid experimentation',
      vi: 'thực thi nhanh và thử nghiệm liên tục',
    },
    brain: {
      en: 'flexible left-right usage',
      vi: 'sử dụng linh hoạt hai bán cầu não',
    },
  },
}

const QUESTIONS = [
  {
    id: 'q01_activity',
    prompt: {
      en: 'Which activity do you enjoy more?',
      vi: 'Bạn thích tham gia hoạt động nào hơn?',
    },
    options: [
      {
        id: 'academic_research',
        label: { en: 'Academic research', vi: 'Nghiên cứu học thuật' },
        profile: 'analytical',
        vector: { tech: 2, engineering: 2, leftBrain: 2 },
      },
      {
        id: 'art_performance',
        label: { en: 'Art performance', vi: 'Biểu diễn nghệ thuật' },
        profile: 'creative',
        vector: { creative: 3, social: 1, rightBrain: 2 },
      },
      {
        id: 'social_activity',
        label: { en: 'Social activities', vi: 'Hoạt động xã hội' },
        profile: 'social',
        vector: { social: 3, business: 1, rightBrain: 2 },
      },
      {
        id: 'technical_practice',
        label: { en: 'Technical hands-on practice', vi: 'Thực hành kỹ thuật' },
        profile: 'practical',
        vector: { engineering: 3, tech: 1, leftBrain: 2 },
      },
    ],
  },
  {
    id: 'q02_learning_method',
    prompt: {
      en: 'How do you usually learn most effectively?',
      vi: 'Bạn thường học hiệu quả nhất bằng cách nào?',
    },
    options: [
      {
        id: 'read_detailed_docs',
        label: { en: 'Read detailed documents', vi: 'Đọc tài liệu chi tiết' },
        profile: 'analytical',
        vector: { tech: 1, engineering: 1, leftBrain: 2 },
      },
      {
        id: 'visual_examples',
        label: { en: 'Watch visual examples', vi: 'Xem ví dụ minh họa' },
        profile: 'creative',
        vector: { creative: 2, social: 1, rightBrain: 2 },
      },
      {
        id: 'direct_practice',
        label: { en: 'Direct practice', vi: 'Thực hành trực tiếp' },
        profile: 'practical',
        vector: { engineering: 2, tech: 1, leftBrain: 1, rightBrain: 1 },
      },
      {
        id: 'group_discussion',
        label: { en: 'Group discussion', vi: 'Thảo luận nhóm' },
        profile: 'social',
        vector: { social: 2, business: 1, rightBrain: 2 },
      },
    ],
  },
  {
    id: 'q03_person_type',
    prompt: {
      en: 'What type of person are you closer to?',
      vi: 'Bạn thiên về kiểu người nào?',
    },
    options: [
      {
        id: 'calm_thinker',
        label: { en: 'Calm and thoughtful', vi: 'Trầm tĩnh, hay suy nghĩ' },
        profile: 'analytical',
        vector: { tech: 1, business: 1, leftBrain: 2 },
      },
      {
        id: 'dreamy_creative',
        label: { en: 'Dreamy and creative', vi: 'Bay bổng, sáng tạo' },
        profile: 'creative',
        vector: { creative: 3, rightBrain: 2 },
      },
      {
        id: 'outgoing_social',
        label: { en: 'Friendly and outgoing', vi: 'Hòa đồng, hướng ngoại' },
        profile: 'social',
        vector: { social: 3, business: 1, rightBrain: 2 },
      },
      {
        id: 'practical_clear',
        label: { en: 'Practical and clear', vi: 'Thực tế, rõ ràng' },
        profile: 'practical',
        vector: { engineering: 2, business: 1, leftBrain: 2 },
      },
    ],
  },
  {
    id: 'q04_tendency',
    prompt: {
      en: 'When doing something, what is your natural tendency?',
      vi: 'Khi làm điều gì đó, bạn có xu hướng như thế nào?',
    },
    options: [
      {
        id: 'think_before_do',
        label: { en: 'Think before doing', vi: 'Suy nghĩ trước khi làm' },
        profile: 'analytical',
        vector: { tech: 1, business: 1, leftBrain: 2 },
      },
      {
        id: 'follow_inspiration',
        label: { en: 'Act by inspiration', vi: 'Làm theo cảm hứng' },
        profile: 'creative',
        vector: { creative: 2, rightBrain: 2 },
      },
      {
        id: 'ask_others',
        label: { en: 'Ask others for input', vi: 'Hỏi ý kiến người khác' },
        profile: 'social',
        vector: { social: 2, business: 1, rightBrain: 2 },
      },
      {
        id: 'act_immediately',
        label: { en: 'Take action right away', vi: 'Hành động ngay' },
        profile: 'action',
        vector: { engineering: 2, business: 1, leftBrain: 1, rightBrain: 1 },
      },
    ],
  },
  {
    id: 'q05_subject_strength',
    prompt: {
      en: 'Which subject group do you feel stronger in?',
      vi: 'Bạn cảm thấy mình nổi trội hơn ở nhóm môn nào?',
    },
    options: [
      {
        id: 'calculation_analysis',
        label: { en: 'Calculation and data analysis', vi: 'Các môn tính toán và phân tích số liệu' },
        profile: 'analytical',
        vector: { tech: 2, engineering: 2, leftBrain: 2 },
      },
      {
        id: 'writing_argument_social',
        label: { en: 'Writing, argument, and social topics', vi: 'Các môn viết, lập luận và xã hội' },
        profile: 'social',
        vector: { social: 2, business: 2, rightBrain: 1, leftBrain: 1 },
      },
      {
        id: 'balanced_both',
        label: { en: 'Quite balanced between both groups', vi: 'Cả hai nhóm khá cân bằng' },
        profile: 'balanced',
        vector: { tech: 1, business: 1, engineering: 1, social: 1, leftBrain: 1, rightBrain: 1 },
      },
      {
        id: 'other_arts',
        label: { en: 'Other group (arts, ...)', vi: 'Nhóm môn khác (nghệ thuật,...)' },
        profile: 'creative',
        vector: { creative: 3, rightBrain: 2 },
      },
    ],
  },
  {
    id: 'q06_long_focus',
    prompt: {
      en: 'Can you focus for a long duration easily?',
      vi: 'Bạn có dễ tập trung trong thời gian dài không?',
    },
    options: [
      {
        id: 'mental_work',
        label: { en: 'Very easy in cognitive work', vi: 'Rất dễ khi làm việc trí óc' },
        profile: 'analytical',
        vector: { tech: 1, engineering: 1, leftBrain: 2 },
      },
      {
        id: 'interesting_content',
        label: { en: 'Easy when the content is interesting', vi: 'Dễ khi nội dung thú vị' },
        profile: 'creative',
        vector: { creative: 2, rightBrain: 2 },
      },
      {
        id: 'physical_activity',
        label: { en: 'Easy with hands-on activity', vi: 'Dễ khi có hoạt động tay chân' },
        profile: 'practical',
        vector: { engineering: 2, tech: 1, leftBrain: 1 },
      },
      {
        id: 'interactive_context',
        label: { en: 'Easy with interaction', vi: 'Dễ khi có người tương tác' },
        profile: 'social',
        vector: { social: 2, business: 1, rightBrain: 2 },
      },
    ],
  },
  {
    id: 'q07_self_study',
    prompt: {
      en: 'How good are you at self-learning?',
      vi: 'Bạn có khả năng tự học tốt không?',
    },
    options: [
      {
        id: 'very_good_disciplined',
        label: { en: 'Very good and disciplined', vi: 'Rất tốt và kỷ luật' },
        profile: 'analytical',
        vector: { tech: 1, business: 1, leftBrain: 2 },
      },
      {
        id: 'good_when_interested',
        label: { en: 'Good when interested', vi: 'Tốt khi có hứng thú' },
        profile: 'creative',
        vector: { creative: 2, rightBrain: 2 },
      },
      {
        id: 'good_with_practical_mentor',
        label: { en: 'Good with practical guidance', vi: 'Tốt khi có người hướng dẫn thực tế' },
        profile: 'practical',
        vector: { engineering: 2, social: 1, leftBrain: 1 },
      },
      {
        id: 'good_with_partner',
        label: { en: 'Good with a learning partner', vi: 'Tốt khi có bạn đồng hành' },
        profile: 'social',
        vector: { social: 2, rightBrain: 2 },
      },
    ],
  },
  {
    id: 'q08_planning_style',
    prompt: {
      en: 'How do you usually plan?',
      vi: 'Bạn thường lập kế hoạch như thế nào?',
    },
    options: [
      {
        id: 'very_detailed_plan',
        label: { en: 'Very detailed plan', vi: 'Lập rất chi tiết' },
        profile: 'analytical',
        vector: { business: 2, engineering: 1, leftBrain: 2 },
      },
      {
        id: 'main_framework_plan',
        label: { en: 'Plan by main framework', vi: 'Lập khung chính' },
        profile: 'balanced',
        vector: { business: 2, leftBrain: 1, rightBrain: 1 },
      },
      {
        id: 'plan_as_you_go',
        label: { en: 'Figure out while doing', vi: 'Làm đến đâu tính đến đó' },
        profile: 'action',
        vector: { engineering: 1, creative: 1, leftBrain: 1, rightBrain: 1 },
      },
      {
        id: 'group_planning',
        label: { en: 'Plan with the team', vi: 'Lập cùng nhóm' },
        profile: 'social',
        vector: { social: 2, business: 1, rightBrain: 2 },
      },
    ],
  },
  {
    id: 'q09_content_preference',
    prompt: {
      en: 'What type of content do you enjoy reading most?',
      vi: 'Bạn thích đọc nội dung nào nhất?',
    },
    options: [
      {
        id: 'science_tech',
        label: { en: 'Science and technology', vi: 'Khoa học và công nghệ' },
        profile: 'analytical',
        vector: { tech: 2, engineering: 1, leftBrain: 2 },
      },
      {
        id: 'culture_arts',
        label: { en: 'Culture and arts', vi: 'Văn hóa và nghệ thuật' },
        profile: 'creative',
        vector: { creative: 2, social: 1, rightBrain: 2 },
      },
      {
        id: 'health_lifestyle',
        label: { en: 'Health and lifestyle', vi: 'Sức khỏe và đời sống' },
        profile: 'balanced',
        vector: { social: 1, creative: 1, business: 1, leftBrain: 1, rightBrain: 1 },
      },
      {
        id: 'business_society',
        label: { en: 'Business and society', vi: 'Kinh doanh và xã hội' },
        profile: 'social',
        vector: { business: 3, social: 2, rightBrain: 1, leftBrain: 1 },
      },
    ],
  },
  {
    id: 'q10_fastest_learning',
    prompt: {
      en: 'When do you learn fastest?',
      vi: 'Bạn học nhanh nhất khi nào?',
    },
    options: [
      {
        id: 'clear_formula',
        label: { en: 'When there is a clear formula', vi: 'Khi có công thức rõ ràng' },
        profile: 'analytical',
        vector: { tech: 1, engineering: 1, leftBrain: 2 },
      },
      {
        id: 'illustrated_example',
        label: { en: 'When there are illustrated examples', vi: 'Khi có ví dụ minh họa' },
        profile: 'creative',
        vector: { creative: 2, rightBrain: 2 },
      },
      {
        id: 'through_practice',
        label: { en: 'When practicing directly', vi: 'Khi được thực hành' },
        profile: 'practical',
        vector: { engineering: 2, tech: 1, leftBrain: 1 },
      },
      {
        id: 'through_discussion',
        label: { en: 'When discussing with others', vi: 'Khi được thảo luận' },
        profile: 'social',
        vector: { social: 2, rightBrain: 2 },
      },
    ],
  },
  {
    id: 'q11_decision_basis',
    prompt: {
      en: 'What do you rely on when making decisions?',
      vi: 'Khi ra quyết định, bạn dựa vào điều gì?',
    },
    options: [
      {
        id: 'logic_basis',
        label: { en: 'Logic', vi: 'Logic' },
        profile: 'analytical',
        vector: { tech: 1, business: 1, leftBrain: 2 },
      },
      {
        id: 'emotion_basis',
        label: { en: 'Emotion', vi: 'Cảm xúc' },
        profile: 'creative',
        vector: { creative: 2, social: 1, rightBrain: 2 },
      },
      {
        id: 'experience_basis',
        label: { en: 'Experience', vi: 'Trải nghiệm' },
        profile: 'practical',
        vector: { engineering: 1, business: 1, leftBrain: 1, rightBrain: 1 },
      },
      {
        id: 'collective_basis',
        label: { en: 'Collective opinion', vi: 'Tập thể' },
        profile: 'social',
        vector: { social: 3, rightBrain: 2 },
      },
    ],
  },
  {
    id: 'q12_confident_subject',
    prompt: {
      en: 'Which subject makes you most confident in surprise tests?',
      vi: 'Môn nào khiến bạn tự tin khi kiểm tra đột xuất?',
    },
    options: [
      {
        id: 'natural_subjects',
        label: { en: 'Natural sciences', vi: 'Các môn tự nhiên' },
        profile: 'analytical',
        vector: { tech: 2, engineering: 1, leftBrain: 2 },
      },
      {
        id: 'social_subjects',
        label: { en: 'Social subjects', vi: 'Các môn xã hội' },
        profile: 'social',
        vector: { social: 2, business: 1, rightBrain: 2 },
      },
      {
        id: 'practical_subjects',
        label: { en: 'Practice-based subjects', vi: 'Môn có thực hành' },
        profile: 'practical',
        vector: { engineering: 2, tech: 1, leftBrain: 1 },
      },
      {
        id: 'other_language',
        label: { en: 'Other foreign languages (e.g., Japanese, ...)', vi: 'Môn ngoại ngữ khác (Tiếng Nhật,...)' },
        profile: 'balanced',
        vector: { social: 1, creative: 1, business: 1, leftBrain: 1, rightBrain: 1 },
      },
    ],
  },
  {
    id: 'q13_concentration_pattern',
    prompt: {
      en: 'How does your concentration usually work?',
      vi: 'Bạn có khả năng tập trung như thế nào?',
    },
    options: [
      {
        id: 'many_hours',
        label: { en: 'Many continuous hours', vi: 'Nhiều giờ liên tục' },
        profile: 'analytical',
        vector: { tech: 1, engineering: 1, leftBrain: 2 },
      },
      {
        id: 'when_interested',
        label: { en: 'When I am interested', vi: 'Khi có hứng thú' },
        profile: 'creative',
        vector: { creative: 2, rightBrain: 2 },
      },
      {
        id: 'with_specific_goal',
        label: { en: 'When I have a specific goal', vi: 'Khi có mục tiêu cụ thể' },
        profile: 'practical',
        vector: { business: 2, engineering: 1, leftBrain: 2 },
      },
      {
        id: 'with_other_people',
        label: { en: 'When working with others', vi: 'Khi làm cùng người khác' },
        profile: 'social',
        vector: { social: 2, rightBrain: 2 },
      },
    ],
  },
  {
    id: 'q14_long_text_strategy',
    prompt: {
      en: 'When facing a very long text, what do you do first?',
      vi: 'Gặp một bài dài ngoằng nhìn muốn xỉu, bạn sẽ làm gì?',
    },
    options: [
      {
        id: 'highlight_analyze',
        label: { en: 'Highlight then analyze each point', vi: 'Highlight rồi phân tích từng ý' },
        profile: 'analytical',
        vector: { tech: 1, business: 1, leftBrain: 2 },
      },
      {
        id: 'read_then_summarize',
        label: {
          en: 'Read all first then summarize in my own words',
          vi: 'Đọc xong hết rồi tự tóm tắt lại theo cách hiểu',
        },
        profile: 'balanced',
        vector: { business: 1, creative: 1, leftBrain: 1, rightBrain: 1 },
      },
      {
        id: 'find_apply_first',
        label: {
          en: 'Pick usable info first and apply immediately',
          vi: 'Tìm thông tin nào trước thì áp dụng làm trước',
        },
        profile: 'practical',
        vector: { engineering: 2, business: 1, leftBrain: 1 },
      },
      {
        id: 'discuss_with_others',
        label: { en: 'Ask others to discuss and reduce overload', vi: 'Rủ người khác bàn cho đỡ ngợp' },
        profile: 'social',
        vector: { social: 2, rightBrain: 2 },
      },
    ],
  },
  {
    id: 'q15_many_tasks',
    prompt: {
      en: 'When too many tasks come at once, what do you do?',
      vi: 'Khi có quá nhiều việc cùng lúc, bạn sẽ làm gì?',
    },
    options: [
      {
        id: 'prioritize',
        label: { en: 'Prioritize by importance', vi: 'Sắp xếp theo mức ưu tiên' },
        profile: 'analytical',
        vector: { business: 2, leftBrain: 2 },
      },
      {
        id: 'do_favorite_first',
        label: { en: 'Do what I like first', vi: 'Làm cái mình thích trước' },
        profile: 'creative',
        vector: { creative: 2, rightBrain: 2 },
      },
      {
        id: 'do_easy_first',
        label: { en: 'Do the easiest task first', vi: 'Làm cái dễ trước' },
        profile: 'action',
        vector: { engineering: 1, business: 1, leftBrain: 1, rightBrain: 1 },
      },
      {
        id: 'ask_for_support',
        label: { en: 'Ask others for support', vi: 'Hỏi người khác hỗ trợ mình' },
        profile: 'social',
        vector: { social: 3, rightBrain: 2 },
      },
    ],
  },
]

function createEmptyProfile() {
  return {
    tech: 0,
    business: 0,
    engineering: 0,
    creative: 0,
    social: 0,
    leftBrain: 0,
    rightBrain: 0,
  }
}

const getVectorFromScoreTag = (scoreTag) => {
  const tag = (scoreTag || '').toLowerCase();
  const vector = {
    tech: 0,
    business: 0,
    engineering: 0,
    creative: 0,
    social: 0,
    leftBrain: 0,
    rightBrain: 0,
  };

  if (tag === 'tech') {
    vector.tech = 3;
    vector.leftBrain = 2;
  } else if (tag === 'engineering' || tag === 'practical' || tag === 'realistic' || tag === 'kỹ thuật' || tag === 'thực tế') {
    vector.engineering = 3;
    vector.leftBrain = 2;
  } else if (tag === 'creative' || tag === 'artistic' || tag === 'nghệ thuật') {
    vector.creative = 3;
    vector.rightBrain = 2;
  } else if (tag === 'social' || tag === 'xã hội') {
    vector.social = 3;
    vector.rightBrain = 2;
  } else if (tag === 'business' || tag === 'enterprising' || tag === 'quản lý' || tag === 'doanh nhân') {
    vector.business = 3;
    vector.leftBrain = 1;
    vector.rightBrain = 1;
  } else if (tag === 'analytical' || tag === 'investigative' || tag === 'nghiên cứu') {
    vector.tech = 2;
    vector.engineering = 2;
    vector.leftBrain = 2;
  } else if (tag === 'conventional' || tag === 'nghiệp vụ') {
    vector.business = 2;
    vector.leftBrain = 2;
  } else if (tag === 'leftbrain') {
    vector.leftBrain = 3;
  } else if (tag === 'rightbrain') {
    vector.rightBrain = 3;
  }
  return vector;
};

const getProfileFromScoreTag = (scoreTag) => {
  const tag = (scoreTag || '').toLowerCase();
  if (tag === 'tech' || tag === 'investigative' || tag === 'analytical' || tag === 'nghiên cứu') return 'analytical';
  if (tag === 'creative' || tag === 'artistic' || tag === 'nghệ thuật') return 'creative';
  if (tag === 'social' || tag === 'xã hội') return 'social';
  if (tag === 'engineering' || tag === 'practical' || tag === 'realistic' || tag === 'kỹ thuật' || tag === 'thực tế') return 'practical';
  if (tag === 'business' || tag === 'enterprising' || tag === 'conventional' || tag === 'quản lý' || tag === 'doanh nhân' || tag === 'nghiệp vụ') return 'balanced';
  return 'balanced';
};

export const isOptionActuallyOther = (option) => {
  if (!option) return false;

  if (option.label) {
    const vi = (option.label.vi || '').trim().toLowerCase();
    const en = (option.label.en || '').trim().toLowerCase();
    const otherKeywords = [
      'khác', 'other', 'khác...', 'other...',
      'ý kiến khác', 'lựa chọn khác', 'câu trả lời khác',
      'khác (vui lòng ghi rõ)', 'other (please specify)',
      'vui lòng ghi rõ', 'please specify'
    ];
    if (otherKeywords.includes(vi) || otherKeywords.includes(en) || vi.startsWith('vui lòng nhập') || en.startsWith('please enter')) {
      return true;
    }
  }

  const content = (option.content || '').trim().toLowerCase();
  const contentKeywords = [
    'khác', 'other', 'khác...', 'other...',
    'ý kiến khác', 'lựa chọn khác', 'câu trả lời khác',
    'khác (vui lòng ghi rõ)', 'other (please specify)',
    'vui lòng ghi rõ', 'please specify'
  ];
  if (contentKeywords.includes(content) || content.startsWith('vui lòng nhập') || content.startsWith('please enter')) {
    return true;
  }

  const optId = (option.id || '').toLowerCase();
  if (optId.startsWith('custom_other_') || optId === 'other' || optId === 'khác') {
    return true;
  }

  return false;
};

const mapBackendRecommendations = (data) => {
  if (!data) return []
  const top3 = data.top3Universities || data.Top3Universities || []
  const next5 = data.next5Universities || data.Next5Universities || []

  const mapUni = (uni, tier) => {
    if (!uni) return null
    const uniId = uni.universityId || uni.UniversityId
    const uniName = uni.name || uni.Name
    const uniShortName = uni.shortName || uni.ShortName || uniName
    const uniLocation = uni.location || uni.Location
    const uniRanking = uni.ranking ?? uni.Ranking ?? null
    const uniAvatar = uni.avatar || uni.Avatar || null
    const suitableMajors = uni.suitableMajors || uni.SuitableMajors || []

    const majorVi = suitableMajors.map((m) => m.name || m.Name).join(', ') || ''
    const majorEn = suitableMajors.map((m) => m.name || m.Name).join(', ') || ''

    return {
      id: uniId,
      name: { vi: uniName, en: uniShortName },
      major: { vi: majorVi, en: majorEn },
      ranking: uniRanking,
      tier,            // 'top3' | 'next5'
      place: { vi: uniLocation, en: uniLocation },
      avatar: uniAvatar,
    }
  }

  const mappedTop3 = top3.map((uni) => mapUni(uni, 'top3')).filter(Boolean)
  const mappedNext5 = next5.map((uni) => mapUni(uni, 'next5')).filter(Boolean)

  return [...mappedTop3, ...mappedNext5]
}

function GuidedQuizPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'
  const text = UI_TEXT[locale]

  const cachedState = readQuizState()

  // Load backend questions if available
  const dynamicQuestions = useSelector((state) => state.question.questions)
  const { submitLoading, submitSuccess } = useSelector((state) => state.question)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchQuestionsRequest())
  }, [dispatch])

  const quizQuestions = useMemo(() => {
    const rawQuestions = dynamicQuestions && dynamicQuestions.length > 0 ? dynamicQuestions : QUESTIONS
    
    // Filter out chatbot category to only show Holland questions
    const hollandQuestions = rawQuestions.filter(q => 
      q.categoryId !== 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' && 
      q.categoryName !== 'Trò chuyện hướng nghiệp AI'
    );

    return hollandQuestions.map((q) => {
      const hasOther = q.options?.some(isOptionActuallyOther)

      if (hasOther) return q

      const customOtherOption = {
        id: `custom_other_${q.id}`,
        content: 'Khác',
        label: { vi: 'Khác', en: 'Other' },
        scoreTag: 'balanced',
        vector: { leftBrain: 0, rightBrain: 0 },
      }

      return {
        ...q,
        options: [...(q.options || []), customOtherOption],
      }
    })
  }, [dynamicQuestions])

  const [answers, setAnswers] = useState(cachedState?.answers ?? {})
  const [insights, setInsights] = useState(cachedState?.insights ?? {})
  const [profile, setProfile] = useState(cachedState?.profile ?? createEmptyProfile())
  const [activeIndex, setActiveIndex] = useState(cachedState?.activeIndex ?? 0)
  const [thinkingQuestionId, setThinkingQuestionId] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isQuizLoading, setIsQuizLoading] = useState(false)
  const [syncingAnswers, setSyncingAnswers] = useState({})
  const [syncedQuestions, setSyncedQuestions] = useState({})
  const [overallSummary, setOverallSummary] = useState(cachedState?.overallSummary ?? '')
  const [aiRecommendations, setAiRecommendations] = useState(cachedState?.aiRecommendations ?? [])
  const [isOverallLoading, setIsOverallLoading] = useState(false)
  const [isRedoConfirmOpen, setIsRedoConfirmOpen] = useState(false)

  const listRef = useRef(null)
  const timeoutRef = useRef([])

  const answeredCount = Object.keys(answers).length
  const isDone = answeredCount === quizQuestions.length
  const visibleQuestions = useMemo(() => {
    return quizQuestions.slice(0, Math.min(activeIndex + 1, quizQuestions.length))
  }, [quizQuestions, activeIndex])

  const isAiAnalyzing = useMemo(() => {
    if (isThinking) return true
    if (isOverallLoading) return true
    if (isDone) return false

    const categories = {}
    quizQuestions.forEach((q) => {
      if (q.categoryId) {
        if (!categories[q.categoryId]) {
          categories[q.categoryId] = []
        }
        categories[q.categoryId].push(q)
      }
    })

    for (const [catId, qList] of Object.entries(categories)) {
      const isCompleted = qList.every((q) => answers[q.id])
      if (isCompleted) {
        const lastQuestion = qList[qList.length - 1]
        if (!insights[lastQuestion.id]) {
          return true
        }
      }
    }

    return false
  }, [isThinking, isOverallLoading, isDone, quizQuestions, answers, insights])

  console.log("GuidedQuizPage State Debug:", {
    isDone,
    answeredCount,
    quizQuestionsLength: quizQuestions.length,
    isAiAnalyzing,
    isThinking,
    isOverallLoading,
    insightsKeys: Object.keys(insights),
    insightsValues: Object.values(insights),
    answers
  });

  // finalRecommendations: chỉ dùng data từ backend, không fallback hardcode
  const finalRecommendations = aiRecommendations

  // Load progress from database if user is authenticated and dynamic questions are loaded
  useEffect(() => {
    if (!user || quizQuestions.length === 0 || quizQuestions === QUESTIONS) {
      return
    }

    const loadUserProgress = async () => {
      setIsQuizLoading(true)
      try {
        // 1. Fetch user answers
        const answersRes = await questionAPI.getAllUserAnswers()
        const dbAnswers = answersRes.data?.data || []

        // Submit dummy answers for any unanswered chatbot questions in the background
        const chatbotQuestions = (dynamicQuestions || []).filter(q => 
          q.categoryId === 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' || 
          q.categoryName === 'Trò chuyện hướng nghiệp AI'
        );
        const unansweredChatbotQuestions = chatbotQuestions.filter(q => {
          const qId = q.id;
          return !dbAnswers.some(ans => (ans.questionId || ans.QuestionId) === qId);
        });

        if (unansweredChatbotQuestions.length > 0) {
          console.log(`Submitting dummy answers for ${unansweredChatbotQuestions.length} chatbot questions...`);
          unansweredChatbotQuestions.forEach(async (q) => {
            try {
              await questionAPI.submitUserAnswer({
                questionId: q.id,
                answer: "Không"
              });
            } catch (err) {
              console.warn("Failed to auto-submit dummy answer for chatbot question:", q.id, err);
            }
          });
        }

        // 2. Map backend answers back to option IDs
        const restoredAnswers = {}
        const restoredSynced = {}
        dbAnswers.forEach((ans) => {
          const qId = ans.questionId || ans.QuestionId
          const ansVal = ans.answer || ans.Answer
          const q = quizQuestions.find((item) => item.id === qId)
          if (q) {
            const opt = q.options?.find((o) =>
              o.code === ansVal ||
              o.id === ansVal ||
              o.label?.vi === ansVal ||
              o.label?.en === ansVal ||
              o.content === ansVal
            )
            if (opt) {
              const isCustomId = opt.id?.startsWith('custom_other_')
              if (isCustomId) {
                restoredAnswers[q.id] = ansVal
              } else {
                restoredAnswers[q.id] = opt.id
              }
              restoredSynced[q.id] = true
            } else {
              restoredAnswers[q.id] = ansVal
              restoredSynced[q.id] = true
            }
          }
        })

        // 3. Compute profile score vector from answers
        const restoredProfile = createEmptyProfile()
        Object.entries(restoredAnswers).forEach(([qId, optId]) => {
          const q = quizQuestions.find((item) => item.id === qId)
          const option = q?.options?.find((o) => o.id === optId)
          if (option) {
            const optionVector = option.vector || getVectorFromScoreTag(option.scoreTag)
            Object.entries(optionVector).forEach(([key, value]) => {
              restoredProfile[key] = (restoredProfile[key] ?? 0) + value
            })
          }
        })

        // 4. Determine activeIndex (first unanswered question)
        let firstUnansweredIndex = quizQuestions.findIndex((q) => !restoredAnswers[q.id])
        if (firstUnansweredIndex === -1) {
          firstUnansweredIndex = quizQuestions.length - 1
        }

        // Update states
        setAnswers(restoredAnswers)
        setSyncedQuestions(restoredSynced)
        setProfile(restoredProfile)
        setActiveIndex(firstUnansweredIndex)

        // 5. Fetch existing evaluations for completed categories to prevent duplicate generation calls
        const categories = {}
        quizQuestions.forEach((q) => {
          if (q.categoryId) {
            if (!categories[q.categoryId]) {
              categories[q.categoryId] = []
            }
            categories[q.categoryId].push(q)
          }
        })

        const evaluationPromises = Object.entries(categories).map(async ([catId, qList]) => {
          const isCompleted = qList.every((q) => restoredAnswers[q.id])
          if (isCompleted) {
            try {
              // Try to GET existing evaluation
              const evalRes = await questionAPI.getEvaluation(catId)
              if (evalRes.data?.success && evalRes.data?.data) {
                const lastQuestion = qList[qList.length - 1]
                const evalData = evalRes.data.data
                const textVal = typeof evalData === 'string'
                  ? evalData
                  : (evalData.evaluationText || '')
                return {
                  questionId: lastQuestion.id,
                  text: textVal,
                }
              }
            } catch (err) {
              // If not found in DB, trigger evaluate to create it dynamically
              try {
                const genRes = await questionAPI.evaluateCategory(catId)
                if (genRes.data?.success && genRes.data?.data) {
                  const lastQuestion = qList[qList.length - 1]
                  return {
                    questionId: lastQuestion.id,
                    text: genRes.data.data,
                  }
                }
              } catch (genErr) {
                console.error("Failed to auto-generate missing AI evaluation on mount:", genErr)
                const lastQuestion = qList[qList.length - 1]
                return {
                  questionId: lastQuestion.id,
                  text: locale === 'vi'
                    ? "Đã có lỗi xảy ra khi gọi AI phân tích chuyên mục này. Vui lòng thử lại sau."
                    : "An error occurred while generating AI analysis. Please try again later.",
                }
              }
            }
          }
          return null
        })

        const evaluationResults = await Promise.all(evaluationPromises)
        const restoredInsights = {}
        evaluationResults.forEach((res) => {
          if (res) {
            restoredInsights[res.questionId] = res.text
          }
        })

        setInsights(restoredInsights)

        const isAllDone = quizQuestions.length > 0 && quizQuestions.every((q) => restoredAnswers[q.id])
        if (isAllDone) {
          setIsOverallLoading(true)
          try {
            const overallRes = await questionAPI.getOverallSummary()
            if (overallRes.data?.success && overallRes.data?.data) {
              const summaryData = overallRes.data.data
              setOverallSummary(summaryData.summaryText || summaryData.SummaryText || '')
              const mapped = mapBackendRecommendations(summaryData)
              setAiRecommendations(mapped)
            }
          } catch (err) {
            // If overall summary is not found, trigger overall evaluation
            try {
              const genOverallRes = await questionAPI.evaluateOverall()
              if (genOverallRes.data?.success && genOverallRes.data?.data) {
                const summaryData = genOverallRes.data.data
                setOverallSummary(summaryData.summaryText || summaryData.SummaryText || '')
                const mapped = mapBackendRecommendations(summaryData)
                setAiRecommendations(mapped)
              }
            } catch (genErr) {
              console.error("Failed to auto-generate overall AI summary on mount:", genErr)
            }
          } finally {
            setIsOverallLoading(false)
          }
        }
      } catch (error) {
        console.error("Failed to load user quiz progress from database:", error)
      } finally {
        setIsQuizLoading(false)
      }
    }

    loadUserProgress()
  }, [user, quizQuestions])

  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((id) => window.clearTimeout(id))
      timeoutRef.current = []
    }
  }, [])

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  useEffect(() => {
    if (!listRef.current) {
      return
    }
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [answers, insights, activeIndex])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const nextState = {
      answers,
      insights,
      profile,
      activeIndex,
      overallSummary,
      aiRecommendations,
    }
    window.sessionStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(nextState))
  }, [activeIndex, answers, insights, profile, overallSummary, aiRecommendations])


  // Submit answers to server when quiz is completed (only for any unsynced answers)
  useEffect(() => {
    if (isDone && user) {
      const alreadySubmitted = sessionStorage.getItem("quiz_answers_submitted") === "true";
      if (!alreadySubmitted && !submitLoading && !submitSuccess) {
        const userId = user.userId || user.id;

        // Filter answers that are not yet synced to database
        const unsyncedEntries = Object.entries(answers).filter(([qId]) => !syncedQuestions[qId]);

        const answersArray = unsyncedEntries.map(([qId, optId]) => {
          const q = quizQuestions.find((item) => item.id === qId);
          const opt = q?.options?.find((o) => o.id === optId);
          const answerValue = opt ? (opt.label?.[locale] || opt.content || opt.code || opt.id) : optId;

          return {
            questionId: qId,
            answer: answerValue,
          };
        });

        if (answersArray.length > 0) {
          dispatch(
            submitAnswersRequest({
              userId,
              answers: answersArray,
              onSuccess: () => {
                sessionStorage.setItem("quiz_answers_submitted", "true");
                setSyncedQuestions((prev) => {
                  const next = { ...prev };
                  answersArray.forEach((ans) => {
                    next[ans.questionId] = true;
                  });
                  return next;
                });
              },
            })
          );
        } else {
          // All answers are already synced to DB incrementally
          sessionStorage.setItem("quiz_answers_submitted", "true");
        }
      }
    }
  }, [isDone, user, answers, quizQuestions, dispatch, submitLoading, submitSuccess, syncedQuestions]);

  const getDominantProfileForCategory = (categoryId) => {
    // Dynamic grouping based on categoryId
    const catQuestions = quizQuestions.filter(q => q.categoryId === categoryId);
    if (catQuestions.length === 0) {
      // Fallback to static indices if it's static questions
      const questionIndices = categoryId === 'personality'
        ? [0, 1, 2, 3, 4]
        : categoryId === 'learning'
          ? [5, 6, 7, 8, 9]
          : [10, 11, 12, 13, 14];

      const counts = {};
      questionIndices.forEach(idx => {
        const q = quizQuestions[idx];
        if (q) {
          const ansId = answers[q.id];
          if (ansId) {
            const option = q.options.find(o => o.id === ansId);
            const optionProfile = option?.profile || getProfileFromScoreTag(option?.scoreTag);
            if (optionProfile) {
              counts[optionProfile] = (counts[optionProfile] || 0) + 1;
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
    }

    const counts = {};
    catQuestions.forEach(q => {
      const ansId = answers[q.id];
      if (ansId) {
        const option = q.options.find(o => o.id === ansId);
        const optionProfile = option?.profile || getProfileFromScoreTag(option?.scoreTag);
        if (optionProfile) {
          counts[optionProfile] = (counts[optionProfile] || 0) + 1;
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

  function buildInsight(option, qIndex) {
    let dominantProfile = option?.profile || getProfileFromScoreTag(option?.scoreTag) || 'balanced';

    // Use the category's dominant profile if it's the end of a category
    if (qIndex === 4 || (quizQuestions[qIndex] && isEndOfCategoryIndex(qIndex, 'personality'))) {
      dominantProfile = getDominantProfileForCategory(quizQuestions[qIndex]?.categoryId || 'personality');
    } else if (qIndex === 9 || (quizQuestions[qIndex] && isEndOfCategoryIndex(qIndex, 'learning'))) {
      dominantProfile = getDominantProfileForCategory(quizQuestions[qIndex]?.categoryId || 'learning');
    } else if (qIndex === 14 || (quizQuestions[qIndex] && isEndOfCategoryIndex(qIndex, 'decision'))) {
      dominantProfile = getDominantProfileForCategory(quizQuestions[qIndex]?.categoryId || 'decision');
    }

    const profile = INSIGHT_PROFILES[dominantProfile] ?? INSIGHT_PROFILES.balanced;
    if (locale === 'vi') {
      return `Bạn có xu hướng ${profile.personality.vi}. Bạn phù hợp với ${profile.interest.vi}, và hiện tại ${profile.brain.vi}.`
    }
    return `You are ${profile.personality.en}. You show strong interest in ${profile.interest.en}, and currently look ${profile.brain.en}.`
  }

  // Helper to match category names or indices for static questions
  const isEndOfCategoryIndex = (index, catKey) => {
    if (quizQuestions === QUESTIONS) {
      if (catKey === 'personality') return index === 4;
      if (catKey === 'learning') return index === 9;
      if (catKey === 'decision') return index === 14;
      return false;
    }
    const q = quizQuestions[index];
    if (!q) return false;

    // Group categories
    const categories = [];
    quizQuestions.forEach(item => {
      if (item.categoryId && !categories.includes(item.categoryId)) {
        categories.push(item.categoryId);
      }
    });
    const catIndex = categories.indexOf(q.categoryId);
    if (catKey === 'personality') return catIndex === 0 && (index === quizQuestions.length - 1 || quizQuestions[index + 1].categoryId !== q.categoryId);
    if (catKey === 'learning') return catIndex === 1 && (index === quizQuestions.length - 1 || quizQuestions[index + 1].categoryId !== q.categoryId);
    if (catKey === 'decision') return catIndex === 2 && (index === quizQuestions.length - 1 || quizQuestions[index + 1].categoryId !== q.categoryId);
    return false;
  };

  async function onSelect(question, option, customText) {
    if (isThinking || syncingAnswers[question.id]) {
      return
    }

    const qIndex = quizQuestions.findIndex((q) => q.id === question.id)
    if (qIndex === -1) return

    const getQuestionCategory = (q, idx) => {
      if (q.categoryId) return q.categoryId;
      if (idx <= 4) return 'cat1';
      if (idx <= 9) return 'cat2';
      return 'cat3';
    };

    const activeQuestion = quizQuestions[activeIndex]
    const isSameCategory = activeQuestion && getQuestionCategory(question, qIndex) === getQuestionCategory(activeQuestion, activeIndex)

    if (isDone || !isSameCategory) {
      return
    }

    const isEditingPrevious = qIndex < activeIndex
    const isEndOfCategory = qIndex === quizQuestions.length - 1 ||
      (quizQuestions[qIndex + 1] && quizQuestions[qIndex].categoryId !== quizQuestions[qIndex + 1].categoryId);

    const isAlreadyAnswered = Boolean(answers[question.id])

    // Save answer to Backend incrementally
    if (user) {
      setSyncingAnswers((prev) => ({ ...prev, [question.id]: true }))
      try {
        const answerValue = customText || option.label?.[locale] || option.content;
        
        if (isAlreadyAnswered) {
          await questionAPI.updateUserAnswer({
            questionId: question.id,
            answer: answerValue,
          })
        } else {
          await questionAPI.submitUserAnswer({
            questionId: question.id,
            answer: answerValue,
          })
        }
        setSyncedQuestions((prev) => ({ ...prev, [question.id]: true }))
      } catch (error) {
        console.error("Failed to save user answer dynamically:", error)
        const errorMsg = error.response?.data?.message || error.message || "";
        // If already answered, we can safely treat it as synced
        if (errorMsg.includes("đã trả lời rồi") || errorMsg.includes("already answered")) {
          setSyncedQuestions((prev) => ({ ...prev, [question.id]: true }))
        } else {
          toast.error(locale === 'vi' ? 'Không thể lưu câu trả lời. Vui lòng thử lại!' : 'Failed to save answer. Please try again.')
          setSyncingAnswers((prev) => {
            const next = { ...prev };
            delete next[question.id];
            return next;
          })
          return;
        }
      } finally {
        setSyncingAnswers((prev) => {
          const next = { ...prev };
          delete next[question.id];
          return next;
        })
      }
    }

    // Update local profile score vector
    setProfile((prev) => {
      const next = { ...prev }
      if (isAlreadyAnswered) {
        const previousOptionId = answers[question.id]
        const previousOption = question.options.find((o) => o.id === previousOptionId)
        if (previousOption) {
          const prevVector = previousOption.vector || getVectorFromScoreTag(previousOption.scoreTag)
          Object.entries(prevVector).forEach(([key, value]) => {
            next[key] = Math.max(0, (next[key] ?? 0) - value)
          })
        }
      }
      const optionVector = option.vector || getVectorFromScoreTag(option.scoreTag)
      Object.entries(optionVector).forEach(([key, value]) => {
        next[key] = (next[key] ?? 0) + value
      })
      return next
    })

    // Update local state answers (use customText if entered, otherwise option.id)
    setAnswers((prev) => ({ ...prev, [question.id]: customText || option.id }))

    // Find all questions in the same category
    const categoryQuestions = quizQuestions.filter(q => 
      getQuestionCategory(q, quizQuestions.indexOf(q)) === getQuestionCategory(question, qIndex)
    )
    const lastQuestionOfCategory = categoryQuestions[categoryQuestions.length - 1]
    const hasExistingInsight = Boolean(insights[lastQuestionOfCategory.id])

    if (hasExistingInsight || isEndOfCategory) {
      // Clear old category insight immediately
      setInsights(prev => {
        const next = { ...prev }
        delete next[lastQuestionOfCategory.id]
        return next
      })

      setIsThinking(true)
      setThinkingQuestionId(lastQuestionOfCategory.id)

      let evaluationText = ""
      if (user && question.categoryId) {
        // Short proactive delay to allow database transaction to completely commit
        await new Promise(resolve => setTimeout(resolve, 600));

        let retries = 3;
        while (retries > 0) {
          try {
            const response = await questionAPI.evaluateCategory(question.categoryId)
            if (response.data?.success && response.data?.data) {
              evaluationText = response.data.data
              break;
            } else {
              console.warn(`Category evaluation response not successful. Retries left: ${retries - 1}`);
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1500));
              }
            }
          } catch (error) {
            console.warn(`Attempt to generate AI evaluation failed. Retries left: ${retries - 1}`, error);
            retries--;
            if (retries === 0) {
              console.error("Failed to generate AI evaluation for category after all retries:", error);
            } else {
              // Wait 1.5 seconds before retrying
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
        }
      }

      // Fallback if AI call failed, not logged in, or offline
      if (!evaluationText) {
        if (user) {
          evaluationText = locale === 'vi'
            ? "Đã có lỗi xảy ra khi gọi AI phân tích chuyên mục này. Vui lòng bấm Tiếp tục để đi tiếp hoặc thử lại sau."
            : "An error occurred while generating AI analysis for this category. Please click Continue or try again later.";
        } else {
          evaluationText = buildInsight(option, qIndex)
        }
      }

      setInsights((prev) => ({
        ...prev,
        [lastQuestionOfCategory.id]: evaluationText,
      }))

      // Reset category-level thinking spinner before overall summary begins
      setThinkingQuestionId('')
      setIsThinking(false)

      // If this was the last question of the whole quiz, generate overall summary
      const isAllDone = quizQuestions.every((q) => q.id === question.id || answers[q.id])
      if (isAllDone && user) {
        setOverallSummary('')
        setAiRecommendations([])
        setIsOverallLoading(true)
        // Short proactive delay to allow database transaction to completely commit
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        let overallRetries = 3;
        while (overallRetries > 0) {
          try {
            const overallRes = await questionAPI.evaluateOverall()
            if (overallRes.data?.success && overallRes.data?.data) {
              const summaryData = overallRes.data.data
              setOverallSummary(summaryData.summaryText || summaryData.SummaryText || '')
              const mapped = mapBackendRecommendations(summaryData)
              setAiRecommendations(mapped)
              break;
            } else {
              console.warn(`Overall AI summary response not successful. Retries left: ${overallRetries - 1}`);
              overallRetries--;
              if (overallRetries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1500));
              }
            }
          } catch (overallErr) {
            console.warn(`Attempt to generate overall AI summary failed. Retries left: ${overallRetries - 1}`, overallErr);
            overallRetries--;
            if (overallRetries === 0) {
              console.error("Failed to generate overall AI summary after all retries:", overallErr);
            } else {
              // Wait 1.5 seconds before retrying
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
        }
        setIsOverallLoading(false)
      }
    } else {
      // Direct fast transition for non-end-of-category questions
      const nextTimer = window.setTimeout(() => {
        setActiveIndex((prev) => Math.min(prev + 1, quizQuestions.length - 1))
      }, 250)
      timeoutRef.current.push(nextTimer)
    }
  }


  const handleContinue = () => {
    setActiveIndex((prev) => Math.min(prev + 1, quizQuestions.length - 1))
  }

  function handleViewDetail(school) {
    if (!school) {
      return
    }
    navigate(`/university/${school.id}`, {
      state: {
        from: '/quiz',
        matchScore: school.score,
      },
    })
  }

  const triggerRedoQuiz = () => {
    setIsRedoConfirmOpen(true)
  }

  const executeRedoQuiz = async () => {
    setIsRedoConfirmOpen(false)
    setIsQuizLoading(true)
    try {
      if (user) {
        await questionAPI.deleteAllUserAnswers()
      }

      setAnswers({})
      setInsights({})
      setProfile(createEmptyProfile())
      setActiveIndex(0)
      setOverallSummary('')
      setAiRecommendations([])
      setSyncedQuestions({})
      setSyncingAnswers({})

      window.sessionStorage.removeItem(QUIZ_STATE_KEY)

      toast.success(locale === 'vi' ? 'Đã reset bài trắc nghiệm thành công!' : 'Quiz reset successfully!')
    } catch (err) {
      console.error("Failed to reset quiz:", err)
      toast.error(locale === 'vi' ? 'Không thể làm lại bài trắc nghiệm. Vui lòng thử lại!' : 'Failed to reset quiz. Please try again.')
    } finally {
      setIsQuizLoading(false)
    }
  }

  if (isQuizLoading) {
    return (
      <div className="flex h-[calc(100dvh-74px)] w-full items-center justify-center bg-[#081a30]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-[#ecc741]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-300 font-semibold text-base animate-pulse">
            {locale === 'vi' ? 'Đang tải tiến trình làm bài của bạn...' : 'Loading your quiz progress...'}
          </p>
        </div>
      </div>
    )
  }

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://4s.vercel.app';

  return (
    <>
      <Helmet>
        <title>{locale === 'vi' ? 'Trắc Nghiệm Tính Cách Holland - Định Hướng Nghề Nghiệp 4S' : 'Holland RIASEC Test - 4S Career Guidance'}</title>
        <meta name="description" content={locale === 'vi' ? 'Làm bài trắc nghiệm Holland khoa học để nhận biết nhóm tính cách nổi trội của bản thân và gợi ý trường đại học phù hợp nhất.' : 'Take the Holland RIASEC test to discover your personality types and receive tailored university recommendations.'} />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content={locale === 'vi' ? 'Trắc Nghiệm Tính Cách Holland - Định Hướng Nghề Nghiệp 4S' : 'Holland RIASEC Test - 4S Career Guidance'} />
        <meta property="og:description" content={locale === 'vi' ? 'Làm bài trắc nghiệm Holland khoa học để nhận biết nhóm tính cách nổi trội của bản thân và gợi ý trường đại học phù hợp nhất.' : 'Take the Holland RIASEC test to discover your personality types and receive tailored university recommendations.'} />
        <meta property="og:url" content={`${siteUrl}/quiz`} />
        <meta property="og:image" content={`${siteUrl}/assets/logo-4s.png`} />
      </Helmet>
      <main className="mx-auto flex h-[calc(100dvh-74px)] w-[min(1360px,96vw)] flex-col overflow-hidden py-3">
        <div className="mb-3 flex justify-end">
          <button
            className="rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 md:text-sm"
            onClick={() => navigate('/consultation')}
            type="button"
          >
            {text.changeMode}
          </button>
        </div>
        <section className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-white/12 bg-[#081a30]/62 lg:grid-cols-[minmax(0,1fr)_340px]">
          <QuizLeftPanel
            activeIndex={activeIndex}
            answers={answers}
            buildInsight={buildInsight}
            insights={insights}
            isDone={isDone}
            isThinking={isThinking}
            isAiAnalyzing={isAiAnalyzing}
            listRef={listRef}
            locale={locale}
            onSelect={onSelect}
            questionCount={quizQuestions.length}
            text={text}
            thinkingQuestionId={thinkingQuestionId}
            visibleQuestions={visibleQuestions}
            recommendations={finalRecommendations}
            onViewDetail={handleViewDetail}
            submitLoading={submitLoading}
            onContinue={handleContinue}
            overallSummary={overallSummary}
            onRedoQuiz={triggerRedoQuiz}
          />
          <QuizRightPanel
            onViewDetail={handleViewDetail}
            answeredCount={answeredCount}
            isDone={isDone}
            isThinking={isThinking}
            isAiAnalyzing={isAiAnalyzing}
            locale={locale}
            questionCount={quizQuestions.length}
            recommendations={finalRecommendations}
            text={text}
            answers={answers}
            questions={quizQuestions}
            insights={insights}
          />
        </section>
      </main>
      <ConfirmModal
        isOpen={isRedoConfirmOpen}
        title={locale === 'vi' ? 'Làm lại bài trắc nghiệm?' : 'Redo the Quiz?'}
        message={locale === 'vi' 
          ? 'Bạn có chắc chắn muốn xóa toàn bộ câu trả lời để làm lại bài trắc nghiệm từ đầu không?' 
          : 'Are you sure you want to delete all answers and redo the quiz from the beginning?'}
        confirmText={locale === 'vi' ? 'Xác nhận' : 'Confirm'}
        cancelText={locale === 'vi' ? 'Hủy' : 'Cancel'}
        onConfirm={executeRedoQuiz}
        onCancel={() => setIsRedoConfirmOpen(false)}
        type="warning"
      />
    </>
  )
}

export default GuidedQuizPage

