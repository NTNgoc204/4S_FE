import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useOutletContext } from 'react-router-dom'
import sparklesIcon from '../../assets/Sparkles.svg'
import ChatConversationPanel from './components/ChatConversationPanel'
import ChatRecommendationPanel from './components/ChatRecommendationPanel'

const SCORE_KEYS = ['tech', 'business', 'engineering', 'creative', 'social']

const KEYWORD_RULES = [
  {
    pattern: /(tech|it|computer|ai|software|code|programming|engineering|lập trình|công nghệ|máy tính|kỹ thuật)/i,
    delta: { tech: 2, engineering: 1 },
  },
  {
    pattern: /(business|economics|finance|marketing|startup|kinh doanh|kinh tế|tài chính|khởi nghiệp|quản trị)/i,
    delta: { business: 2, social: 1 },
  },
  {
    pattern: /(design|media|art|creative|ui|ux|nghệ thuật|thiết kế|truyền thông|sáng tạo)/i,
    delta: { creative: 2, social: 1 },
  },
  {
    pattern: /(communication|team|social|psychology|xã hội|giao tiếp|nhóm|tâm lý|con người|hướng ngoại)/i,
    delta: { social: 2, business: 1 },
  },
  {
    pattern: /(scholarship|tuition|budget|cost|học phí|chi phí|ngân sách|học bổng|rẻ|dưới|under)/i,
    delta: { business: 1, social: 1 },
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

const UI_TEXT = {
  en: {
    tab: 'Free Chat',
    changeMode: 'Change mode',
    initialGreeting:
      "Hi! I'm your AI Career Assistant. I can help you explore majors, universities, and career directions. What would you like to start with?",
    thinking: 'Assistant is generating suggestions...',
    inputPlaceholder: 'Ask me anything about universities, majors, or careers...',
    send: 'Send',
    panelTitle: 'Recommended Universities',
    panelIdle: 'Waiting for your preference analysis...',
    panelActive: (count) => `${count} preference signal(s) detected`,
    emptyState: "Share your interests in chat, and I'll show matching universities here.",
    viewDetail: 'View details',
    quickPrompts: [
      'Schools under 50M VND',
      'Best IT majors',
      'Universities in Ho Chi Minh City',
      'Business programs with high job placement',
      'Engineering scholarships',
    ],
    focusLabels: {
      tech: 'technology and computing',
      business: 'business and market orientation',
      engineering: 'engineering and practical problem-solving',
      creative: 'creative and media-oriented fields',
      social: 'communication and social impact areas',
    },
    demoOnlyReply:
      'Thanks for your message. Free-text chat is currently in demo mode, so personalized responses are still limited. Try a suggested prompt to see a complete response.',
    recommendationAsk: (schoolName) => `Tell me more about ${schoolName}.`,
    recommendationReply: (schoolName, major, place, tuition, strengths) =>
      `${schoolName} is a strong match for your current profile. It stands out in ${major}. Campus area: ${place}. Typical tuition: ${tuition}. Based on your signals, your strongest fit is around ${strengths}.`,
    focusJoin: ' and ',
    replyTemplate: (focus, school) =>
      `I can see strong interest in ${focus}. Based on your current inputs, ${school} looks very relevant. Do you want me to filter further by tuition, city, or specific major?`,
  },
  vi: {
    tab: 'Free Chat',
    changeMode: 'Đổi chế độ',
    initialGreeting:
      'Xin chào! Tôi là Trợ lý Hướng nghiệp AI. Tôi có thể giúp bạn tìm ngành học, trường phù hợp, hoặc giải đáp thắc mắc về định hướng tương lai. Bạn muốn bắt đầu từ điều gì?',
    thinking: 'Trợ lý đang tạo gợi ý phù hợp...',
    inputPlaceholder: 'Hãy hỏi bất kỳ điều gì về trường, ngành hoặc định hướng nghề nghiệp...',
    send: 'Gửi',
    panelTitle: 'Trường đại học gợi ý',
    panelIdle: 'Chờ kết quả phân tích...',
    panelActive: (count) => `Đã ghi nhận ${count} tín hiệu sở thích`,
    emptyState: 'Hãy chia sẻ sở thích trong khung chat, hệ thống sẽ gợi ý trường phù hợp tại đây.',
    viewDetail: 'Xem chi tiết',
    quickPrompts: [
      'Trường có học phí dưới 50 triệu',
      'Ngành IT nổi bật',
      'Trường ở TP.HCM',
      'Ngành kinh doanh dễ có việc',
      'Học bổng ngành kỹ thuật',
    ],
    focusLabels: {
      tech: 'công nghệ và máy tính',
      business: 'kinh doanh và thị trường',
      engineering: 'kỹ thuật và giải quyết vấn đề thực tế',
      creative: 'sáng tạo, truyền thông và thiết kế',
      social: 'giao tiếp, con người và tác động xã hội',
    },
    demoOnlyReply:
      'Cảm ơn bạn đã nhắn. Chat tự do hiện đang ở chế độ demo nên phản hồi cá nhân hóa vẫn còn giới hạn. Bạn có thể chọn một gợi ý có sẵn để xem phản hồi đầy đủ.',
    recommendationAsk: (schoolName) => `Cho mình xem chi tiết về ${schoolName}.`,
    recommendationReply: (schoolName, major, place, tuition, strengths) =>
      `${schoolName} là lựa chọn phù hợp với hồ sơ hiện tại của bạn. Trường nổi bật ở nhóm ${major}. Khu vực: ${place}. Mức học phí tham khảo: ${tuition}. Theo tín hiệu bạn đã cung cấp, mức độ phù hợp cao nhất nằm ở nhóm ${strengths}.`,
    focusJoin: ' và ',
    replyTemplate: (focus, school) =>
      `Mình ghi nhận bạn quan tâm nhiều đến nhóm ${focus}. Với dữ liệu hiện tại, ${school} là lựa chọn khá phù hợp. Bạn muốn mình lọc thêm theo học phí, khu vực hay ngành cụ thể không?`,
  },
}

function createEmptyProfile() {
  return {
    tech: 0,
    business: 0,
    engineering: 0,
    creative: 0,
    social: 0,
  }
}

function mergeProfile(base, delta) {
  const next = { ...base }
  Object.entries(delta).forEach(([key, value]) => {
    next[key] = (next[key] ?? 0) + value
  })
  return next
}

function extractDeltaFromMessage(message) {
  const delta = {}
  let matched = false
  KEYWORD_RULES.forEach((rule) => {
    if (rule.pattern.test(message)) {
      matched = true
      Object.entries(rule.delta).forEach(([key, value]) => {
        delta[key] = (delta[key] ?? 0) + value
      })
    }
  })

  if (!matched) {
    return { social: 1, business: 1 }
  }

  return delta
}

function rankUniversities(profile) {
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
}

function getSchoolStrengthKeys(school) {
  return SCORE_KEYS.map((key) => ({ key, score: school.affinity[key] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.key)
}

function getSchoolById(id) {
  return UNIVERSITIES.find((item) => item.id === id)
}

function ChatPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const outletContext = useOutletContext()
  const currentPlan = String(outletContext?.currentPlan ?? '').toLowerCase()
  const isProAccount = currentPlan === 'pro'
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'
  const text = UI_TEXT[locale]
  const systemBadge = isProAccount
    ? {
        label: '\u{1F451}',
        className: 'border-[#ecc741]/35 bg-[#ecc741]/12 text-[#f2cb36]',
      }
    : {
        icon: sparklesIcon,
        className: 'border-emerald-300/40 bg-emerald-400/12 text-emerald-300',
      }

  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [profile, setProfile] = useState(createEmptyProfile)
  const [userSignalCount, setUserSignalCount] = useState(0)
  const [usedPromptIndexes, setUsedPromptIndexes] = useState([])
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      kind: 'welcome',
    },
  ])

  const conversationRef = useRef(null)
  const messageIdRef = useRef(0)
  const timeoutRef = useRef([])

  const recommendations = useMemo(() => rankUniversities(profile), [profile])
  const hasSignal = userSignalCount > 0

  const displayMessages = useMemo(() => {
    return messages.map((message) => {
      if (message.role === 'user' && message.kind === 'user_manual') {
        return { ...message, content: message.text }
      }

      if (message.kind === 'user_preset') {
        const content = text.quickPrompts[message.promptIndex] ?? message.fallbackText ?? ''
        return { ...message, content }
      }

      if (message.kind === 'user_recommend_ask') {
        const school = getSchoolById(message.schoolId)
        const schoolName = school ? school.name[locale] : message.fallbackName
        return { ...message, content: text.recommendationAsk(schoolName) }
      }

      if (message.kind === 'welcome') {
        return { ...message, content: text.initialGreeting }
      }

      if (message.kind === 'assistant_demo') {
        return { ...message, content: text.demoOnlyReply }
      }

      if (message.kind === 'assistant_focus') {
        const school = getSchoolById(message.schoolId)
        const schoolName = school ? school.name[locale] : locale === 'vi' ? 'một số trường phù hợp' : 'a few matching schools'
        const focusLabel = text.focusLabels[message.dominantKey] ?? text.focusLabels.social
        return { ...message, content: text.replyTemplate(focusLabel, schoolName) }
      }

      if (message.kind === 'assistant_recommendation_detail') {
        const school = getSchoolById(message.schoolId)
        if (!school) {
          return {
            ...message,
            content: locale === 'vi' ? 'Hiện chưa có dữ liệu chi tiết cho trường này trong bản demo.' : 'Detailed data for this school is not available in this demo yet.',
          }
        }

        const strengths = (message.strengthKeys ?? [])
          .map((key) => text.focusLabels[key])
          .filter(Boolean)
          .join(text.focusJoin)

        return {
          ...message,
          content: text.recommendationReply(
            school.name[locale],
            school.major[locale],
            school.place[locale],
            school.tuition[locale],
            strengths || text.focusLabels.social,
          ),
        }
      }

      return { ...message, content: message.content ?? '' }
    })
  }, [locale, messages, text])

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      timeoutRef.current.forEach((id) => window.clearTimeout(id))
      timeoutRef.current = []
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  useEffect(() => {
    if (!conversationRef.current) {
      return
    }
    conversationRef.current.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [displayMessages, isThinking])

  function createMessageId(prefix) {
    messageIdRef.current += 1
    return `${prefix}-${messageIdRef.current}`
  }

  function pushAssistantMessage(createPayload) {
    setIsThinking(true)
    const responseTimer = window.setTimeout(() => {
      setMessages((prev) => [...prev, createPayload()])
      setIsThinking(false)
    }, 700)

    timeoutRef.current.push(responseTimer)
  }

  function sendManualMessage(rawMessage) {
    const message = rawMessage.trim()
    if (!message || isThinking) {
      return
    }

    setMessages((prev) => [...prev, { id: createMessageId('user'), role: 'user', kind: 'user_manual', text: message }])
    setInputValue('')

    pushAssistantMessage(() => ({
      id: createMessageId('assistant'),
      role: 'assistant',
      kind: 'assistant_demo',
    }))
  }

  function sendPresetMessage(promptIndex) {
    if (isThinking || usedPromptIndexes.includes(promptIndex)) {
      return
    }

    const promptText = text.quickPrompts[promptIndex]
    if (!promptText) {
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId('user'),
        role: 'user',
        kind: 'user_preset',
        promptIndex,
        fallbackText: promptText,
      },
    ])

    const delta = extractDeltaFromMessage(promptText)
    const nextProfile = mergeProfile(profile, delta)
    const nextRecommendations = rankUniversities(nextProfile)
    const topSchool = nextRecommendations[0] ?? UNIVERSITIES[0]
    const strengthKeys = getSchoolStrengthKeys(topSchool)

    setProfile(nextProfile)
    setUserSignalCount((prev) => prev + 1)
    setUsedPromptIndexes((prev) => [...prev, promptIndex])

    pushAssistantMessage(() => ({
      id: createMessageId('assistant'),
      role: 'assistant',
      kind: 'assistant_recommendation_detail',
      schoolId: topSchool.id,
      strengthKeys,
    }))
  }

  function handleViewDetail(school) {
    if (!school) {
      return
    }
    navigate(`/universities/${school.id}`)
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendManualMessage(inputValue)
  }

  return (
    <main className="mx-auto flex h-[calc(100dvh-74px)] w-[min(1360px,96vw)] flex-col overflow-hidden py-3">
      {isProAccount ? (
        <div className="mb-3 flex justify-end">
          <button
            className="rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 md:text-sm"
            onClick={() => navigate('/consultation')}
            type="button"
          >
            {text.changeMode}
          </button>
        </div>
      ) : null}

      <section className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-white/12 bg-[#081a30]/62 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ChatConversationPanel
          inputValue={inputValue}
          isThinking={isThinking}
          listRef={conversationRef}
          messages={displayMessages}
          onInputChange={setInputValue}
          onQuickPrompt={sendPresetMessage}
          onSubmit={handleSubmit}
          quickPrompts={text.quickPrompts}
          usedPromptIndexes={usedPromptIndexes}
          systemBadge={systemBadge}
          text={text}
        />

        <ChatRecommendationPanel
          hasSignal={hasSignal}
          locale={locale}
          onViewDetail={handleViewDetail}
          recommendations={recommendations}
          systemBadge={systemBadge}
          text={text}
          userSignalCount={userSignalCount}
        />
      </section>
    </main>
  )
}

export default ChatPage

