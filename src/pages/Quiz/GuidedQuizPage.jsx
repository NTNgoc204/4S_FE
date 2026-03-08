import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import QuizLeftPanel from './components/QuizLeftPanel'
import QuizRightPanel from './components/QuizRightPanel'

const SCORE_KEYS = ['tech', 'business', 'engineering', 'creative', 'social']

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

const UNIVERSITIES = [
  {
    id: 'hcmut',
    name: { en: 'HCMC University of Technology', vi: 'ĐH Bách Khoa TP.HCM' },
    major: { en: 'Technology - Engineering', vi: 'Khối ngành Công nghệ - Kỹ thuật' },
    place: { en: 'Ho Chi Minh City', vi: 'TP. Hồ Chí Minh' },
    tuition: { en: '15-25M VND/semester', vi: '15-25M VNĐ/học kỳ' },
    affinity: { tech: 4, engineering: 4, business: 1, creative: 1, social: 1 },
  },
  {
    id: 'hust',
    name: { en: 'Hanoi University of Science and Technology', vi: 'ĐH Bách Khoa Hà Nội' },
    major: { en: 'Engineering & Applied Science', vi: 'Kỹ thuật và Công nghệ ứng dụng' },
    place: { en: 'Ha Noi', vi: 'Hà Nội' },
    tuition: { en: '18-28M VNĐ/semester', vi: '18-28M VNĐ/học kỳ' },
    affinity: { tech: 3, engineering: 4, business: 1, creative: 1, social: 1 },
  },
  {
    id: 'ftu',
    name: { en: 'Foreign Trade University', vi: 'ĐH Ngoại Thương' },
    major: { en: 'International Business', vi: 'Kinh tế đối ngoại' },
    place: { en: 'Ha Noi', vi: 'Hà Nội' },
    tuition: { en: '14-22M VNĐ/semester', vi: '14-22M VNĐ/học kỳ' },
    affinity: { tech: 1, engineering: 1, business: 4, creative: 2, social: 3 },
  },
  {
    id: 'rmit',
    name: { en: 'RMIT Vietnam', vi: 'RMIT Việt Nam' },
    major: { en: 'Business, Media & Design', vi: 'Kinh doanh, Truyền thông, Thiết kế' },
    place: { en: 'HCMC & Ha Noi', vi: 'TP.HCM & Hà Nội' },
    tuition: { en: '70-95M VNĐ/semester', vi: '70-95M VNĐ/học kỳ' },
    affinity: { tech: 2, engineering: 1, business: 3, creative: 4, social: 3 },
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

function GuidedQuizPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'
  const text = UI_TEXT[locale]

  const [answers, setAnswers] = useState({})
  const [insights, setInsights] = useState({})
  const [profile, setProfile] = useState(createEmptyProfile)
  const [activeIndex, setActiveIndex] = useState(0)
  const [thinkingQuestionId, setThinkingQuestionId] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const listRef = useRef(null)
  const timeoutRef = useRef([])

  const answeredCount = Object.keys(answers).length
  const isDone = answeredCount === QUESTIONS.length
  const visibleQuestions = QUESTIONS.slice(0, Math.min(activeIndex + 1, QUESTIONS.length))

  const recommendations = useMemo(() => {
    return UNIVERSITIES.map((school) => {
      const weighted = SCORE_KEYS.reduce((sum, key) => {
        return sum + (profile[key] ?? 0) * (school.affinity[key] ?? 0)
      }, 0)
      const score = Math.max(68, Math.min(97, Math.round(68 + weighted / 2.4)))
      return {
        ...school,
        score,
      }
    }).sort((a, b) => b.score - a.score)
  }, [profile])

  const strengths = useMemo(() => {
    return SCORE_KEYS.map((key) => ({
      key,
      score: profile[key],
      label: text.strengths[key],
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
  }, [profile, text.strengths])

  const hemisphere = useMemo(() => {
    if (profile.leftBrain === profile.rightBrain) {
      return text.brainBalanced
    }
    return profile.leftBrain > profile.rightBrain ? text.brainLeft : text.brainRight
  }, [profile.leftBrain, profile.rightBrain, text.brainBalanced, text.brainLeft, text.brainRight])

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

  function buildInsight(option) {
    const profile = INSIGHT_PROFILES[option.profile] ?? INSIGHT_PROFILES.balanced
    if (locale === 'vi') {
      return `Bạn có xu hướng ${profile.personality.vi}. Bạn phù hợp với ${profile.interest.vi}, và hiện tại ${profile.brain.vi}.`
    }
    return `You are ${profile.personality.en}. You show strong interest in ${profile.interest.en}, and currently look ${profile.brain.en}.`
  }

  function onSelect(question, option) {
    if (isThinking || answers[question.id]) {
      return
    }

    setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
    setProfile((prev) => {
      const next = { ...prev }
      Object.entries(option.vector).forEach(([key, value]) => {
        next[key] = (next[key] ?? 0) + value
      })
      return next
    })

    setIsThinking(true)
    setThinkingQuestionId(question.id)

    const insightTimer = window.setTimeout(() => {
      setInsights((prev) => ({
        ...prev,
        [question.id]: true,
      }))
    }, 320)

    const nextTimer = window.setTimeout(() => {
      setActiveIndex((prev) => Math.min(prev + 1, QUESTIONS.length - 1))
      setThinkingQuestionId('')
      setIsThinking(false)
    }, 900)

    timeoutRef.current.push(insightTimer, nextTimer)
  }

  return (
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
          hemisphere={hemisphere}
          insights={insights}
          isDone={isDone}
          isThinking={isThinking}
          listRef={listRef}
          locale={locale}
          onSelect={onSelect}
          questionCount={QUESTIONS.length}
          strengths={strengths}
          text={text}
          thinkingQuestionId={thinkingQuestionId}
          visibleQuestions={visibleQuestions}
        />
        <QuizRightPanel
          answeredCount={answeredCount}
          isDone={isDone}
          locale={locale}
          questionCount={QUESTIONS.length}
          recommendations={recommendations}
          text={text}
        />
      </section>
    </main>
  )
}

export default GuidedQuizPage
