import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import sparklesIcon from '../../assets/Sparkles.svg'
import {
  initGuidedChat,
  sendGuidedChatMessageRequest,
} from '../../feature/chat/chatSlice'
import ChatConversationPanel from './components/ChatConversationPanel'
import ChatRecommendationPanel from './components/ChatRecommendationPanel'

const FREE_MESSAGE_LIMIT = 5

const UI_TEXT = {
  en: {
    changeMode: 'Change mode',
    thinking: 'Assistant is analyzing your response...',
    inputPlaceholder: 'Share your interests, strengths, or goals...',
    send: 'Send',
    panelTitle: 'Recommended Universities',
    viewDetail: 'View details',
    lockedTitle: '🔒 You have reached the free limit',
    lockedDesc: 'Upgrade to PRO to continue chatting and get personalized university recommendations.',
    lockedCta: 'Upgrade to PRO →',
  },
  vi: {
    changeMode: 'Đổi chế độ',
    thinking: 'Trợ lý đang phân tích câu trả lời...',
    inputPlaceholder: 'Chia sẻ sở thích, thế mạnh hoặc định hướng của bạn...',
    send: 'Gửi',
    panelTitle: 'Trường đại học gợi ý',
    viewDetail: 'Xem chi tiết',
    lockedTitle: '🔒 Bạn đã dùng hết lượt miễn phí',
    lockedDesc: 'Nâng cấp lên PRO để tiếp tục trò chuyện và nhận gợi ý trường phù hợp nhất.',
    lockedCta: 'Nâng cấp PRO ngay →',
  },
}

function ChatPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const reduxPlan = useSelector((state) => state.auth.plan)
  const currentPlan = String(reduxPlan ?? '').toLowerCase()
  const isProAccount = currentPlan !== 'free' && currentPlan !== ''
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

  const dispatch = useDispatch()
  const {
    chatMessages: messages,
    guidedChatLoading: isThinking,
    chatSummaryText: summaryText,
    chatRecommendations: aiRecommendations,
  } = useSelector((state) => state.chat)

  // Đếm số tin nhắn user đã gửi — giới hạn 5 với Free
  const userMessageCount = messages.filter((m) => m.role === 'user').length
  const isLocked = !isProAccount && userMessageCount >= FREE_MESSAGE_LIMIT

  const [inputValue, setInputValue] = useState('')
  const conversationRef = useRef(null)

  // Hiện câu chào cứng khi mount, không call API
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const shouldReset = messages.length === 0 || location.state?.resetChat

    if (shouldReset) {
      const greetingText = locale === 'vi'
        ? 'Xin chào! Tôi là Trợ lý Hướng nghiệp AI. Hãy chia sẻ để tôi có thể tìm ngành học và trường đại học phù hợp nhất với bạn nhé! 😊'
        : 'Hello! I am your AI Career Advisor. Share a bit about yourself so I can find the best majors and universities for you! 😊'

      dispatch(initGuidedChat({ greetingText }))
      
      // Clear location state to prevent repeating the reset
      navigate(location.pathname, { replace: true, state: {} })
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.resetChat])

  useEffect(() => {
    if (!conversationRef.current) return
    conversationRef.current.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isThinking])

  function sendMessage(messageContent) {
    if (isThinking || isLocked || !messageContent.trim()) return
    setInputValue('')
    dispatch(sendGuidedChatMessageRequest({ message: messageContent, locale }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage(inputValue)
  }

  function handleViewDetail(school) {
    if (!school) return
    navigate(`/university/${school.id}`, {
      state: { from: '/chat', matchScore: school.matchPercent },
    })
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
          isLocked={isLocked}
          listRef={conversationRef}
          messages={messages}
          onInputChange={setInputValue}
          onSubmit={handleSubmit}
          onUpgrade={() => navigate('/pricing')}
          systemBadge={systemBadge}
          text={text}
        />

        <ChatRecommendationPanel
          isPro={isProAccount}
          locale={locale}
          onViewDetail={handleViewDetail}
          recommendations={aiRecommendations}
          summaryText={summaryText}
          systemBadge={systemBadge}
          text={text}
          onUpgrade={() => navigate('/pricing')}
        />
      </section>
    </main>
  )
}

export default ChatPage
