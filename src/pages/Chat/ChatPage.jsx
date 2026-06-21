import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import sparklesIcon from '../../assets/Sparkles.svg'
import {
  initGuidedChat,
  sendGuidedChatMessageRequest,
  startNewChat,
  fetchSessionsRequest,
  fetchSessionDetailRequest,
  deleteSessionRequest,
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
    viewHistory: 'View History',
    newChat: 'New Conversation',
    historyAlert: 'Chat history feature is under development.',
    newChatAlert: 'New conversation feature is under development.',
    newChatSuccess: 'Started a new conversation successfully!',
    assistantTitle: 'AI Career Advisor',
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
    viewHistory: 'Xem lịch sử',
    newChat: 'Cuộc trò chuyện mới',
    historyAlert: 'Chức năng lịch sử trò chuyện đang được phát triển.',
    newChatAlert: 'Chức năng cuộc trò chuyện mới đang được phát triển.',
    newChatSuccess: 'Đã bắt đầu cuộc trò chuyện mới thành công!',
    assistantTitle: 'Trợ lý Hướng nghiệp AI',
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
    currentSessionId,
    sessions,
    sessionsLoading,
  } = useSelector((state) => state.chat)

  // Đếm số tin nhắn user đã gửi — giới hạn 5 với Free
  const userMessageCount = messages.filter((m) => m.role === 'user').length
  const isLocked = !isProAccount && userMessageCount >= FREE_MESSAGE_LIMIT

  const [inputValue, setInputValue] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const [sessionToDelete, setSessionToDelete] = useState(null)
  
  const conversationRef = useRef(null)
  const recognitionRef = useRef(null)
  const shouldAutoSpeakRef = useRef(false)

  // Load danh sách các phiên chat của user khi mount
  useEffect(() => {
    dispatch(fetchSessionsRequest())
  }, [dispatch])

  // Tự động phát âm thanh đối với câu trả lời mới nhận được từ AI
  useEffect(() => {
    if (messages.length > 0 && shouldAutoSpeakRef.current) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.role === 'assistant') {
        shouldAutoSpeakRef.current = false
        // Đọc to phản hồi
        toggleSpeak(lastMsg.id, lastMsg.content)
      }
    }
  }, [messages])

  // Hủy âm thanh đang phát khi thoát trang
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Hiện câu chào cứng khi mount
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
    // Cho phép tự động đọc to phản hồi kế tiếp của AI
    shouldAutoSpeakRef.current = true
    dispatch(sendGuidedChatMessageRequest({ message: messageContent, locale }))
  }

  function handleSubmit(e) {
    if (e) e.preventDefault()
    sendMessage(inputValue)
  }

  // Bắt đầu một cuộc trò chuyện mới mà không hiển thị toast thông báo
  function handleNewChat() {
    const greetingText = locale === 'vi'
      ? 'Xin chào! Tôi là Trợ lý Hướng nghiệp AI. Hãy chia sẻ để tôi có thể tìm ngành học và trường đại học phù hợp nhất với bạn nhé! 😊'
      : 'Hello! I am your AI Career Advisor. Share a bit about yourself so I can find the best majors and universities for you! 😊'

    dispatch(startNewChat({ greetingText }))
  }

  function handleViewDetail(school) {
    if (!school) return
    navigate(`/university/${school.id}`, {
      state: { from: '/chat', matchScore: school.matchPercent },
    })
  }

  // Chức năng Text-to-Speech (Đọc thành tiếng)
  function toggleSpeak(messageId, textToSpeak) {
    if (!window.speechSynthesis) return

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel()
      setSpeakingMessageId(null)
      return
    }

    window.speechSynthesis.cancel()
    setSpeakingMessageId(messageId)

    // Làm sạch chuỗi markdown và emoji trước khi phát âm
    const cleanText = textToSpeak
      .replace(/[*#_\-`]/g, '')
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = locale === 'vi' ? 'vi-VN' : 'en-US'

    utterance.onend = () => {
      setSpeakingMessageId(null)
    }

    utterance.onerror = () => {
      setSpeakingMessageId(null)
    }

    window.speechSynthesis.speak(utterance)
  }

  // Chức năng Speech-to-Text (Ghi âm nhận diện giọng nói)
  function toggleRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error(locale === 'vi' 
        ? "Trình duyệt của bạn không hỗ trợ chức năng nhận diện giọng nói." 
        : "Your browser does not support Speech Recognition.")
      return
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsRecording(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = locale === 'vi' ? 'vi-VN' : 'en-US'
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (transcript) {
        setInputValue(transcript)
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setIsRecording(false)
    }

    recognition.start()
  }

  return (
    <main className="mx-auto flex h-[calc(100dvh-74px)] w-[min(1360px,96vw)] flex-col overflow-hidden py-3">
      {isProAccount ? (
        <div className="mb-3 flex justify-end">
          <button
            className="rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 md:text-sm cursor-pointer"
            onClick={() => navigate('/consultation')}
            type="button"
          >
            {text.changeMode}
          </button>
        </div>
      ) : null}

      <section className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/12 bg-[#081a30]/62">
        
        {/* Backdrop overlay when history is open */}
        {isHistoryOpen && (
          <div
            className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 cursor-pointer"
            onClick={() => setIsHistoryOpen(false)}
          />
        )}

        {/* Left Sidebar for Chat History - Premium floating overlay drawer */}
        <div
          className={`absolute left-0 top-0 bottom-0 z-20 w-[280px] bg-[#071322]/98 backdrop-blur-lg flex flex-col border-r border-white/10 transition-transform duration-300 ease-in-out shadow-2xl ${
            isHistoryOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-4 bg-[#0e213a]/50">
            <span className="font-['Sora'] font-bold text-slate-200 text-sm tracking-wide flex items-center gap-2">
              <svg className="h-4 w-4 text-[#ecc741]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {locale === 'vi' ? 'Lịch sử trò chuyện' : 'Chat History'}
            </span>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="text-slate-400 hover:text-[#ecc741] transition p-1 rounded-lg hover:bg-white/5 cursor-pointer active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.3)_transparent] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/30 [&::-webkit-scrollbar-track]:bg-transparent">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#ecc741] border-t-transparent" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-slate-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-400">
                  {locale === 'vi' ? 'Chưa có lịch sử trò chuyện' : 'No chat history yet'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {locale === 'vi' ? 'Các cuộc trò chuyện mới sẽ xuất hiện ở đây.' : 'Your new conversations will appear here.'}
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative flex items-center justify-between gap-3 rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                    currentSessionId === session.id
                      ? 'border-[#ecc741]/40 bg-[#ecc741]/8 text-slate-100 shadow-[0_0_12px_rgba(236,199,65,0.04)]'
                      : 'border-white/5 bg-white/[0.01] text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                  onClick={() => {
                    dispatch(fetchSessionDetailRequest(session.id))
                    setIsHistoryOpen(false)
                  }}
                >
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                      currentSessionId === session.id
                        ? 'border-[#ecc741]/30 bg-[#ecc741]/10 text-[#ecc741]'
                        : 'border-white/5 bg-white/[0.03] text-slate-400 group-hover:text-slate-300'
                    }`}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-xs font-semibold ${currentSessionId === session.id ? 'text-[#ecc741]' : 'text-slate-300'}`}>
                        {session.name || `Phiên chat ${session.id.substring(0, 4)}`}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(session.updatedAt || session.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSessionToDelete(session)
                    }}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer focus:opacity-100"
                    title="Xóa phiên"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Conversation Panel */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ChatConversationPanel
            inputValue={inputValue}
            isThinking={isThinking}
            isLocked={isLocked}
            listRef={conversationRef}
            messages={messages}
            onInputChange={setInputValue}
            onSubmit={handleSubmit}
            onNewChat={handleNewChat}
            systemBadge={systemBadge}
            text={text}
            onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
            isRecording={isRecording}
            onToggleRecording={toggleRecording}
            speakingMessageId={speakingMessageId}
            onToggleSpeak={toggleSpeak}
            locale={locale}
          />
        </div>

        {/* Recommendations Panel - Visible on lg screens */}
        <div className="hidden lg:flex w-[340px] shrink-0 min-h-0 flex-col">
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
        </div>
      </section>

      {/* Custom Premium Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-[90vw] max-w-[400px] overflow-hidden rounded-2xl border border-white/10 bg-[#0c1f35]/95 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col items-center text-center">
              {/* Warning Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/35 bg-red-500/10 text-red-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="font-['Sora'] text-base font-bold text-slate-100">
                {locale === 'vi' ? 'Xác nhận xóa cuộc trò chuyện?' : 'Delete Conversation?'}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {locale === 'vi'
                  ? `Bạn có chắc chắn muốn xóa "${sessionToDelete.name || 'Phiên chat này'}"? Toàn bộ lịch sử tin nhắn và đề xuất sẽ bị xóa vĩnh viễn.`
                  : `Are you sure you want to delete "${sessionToDelete.name || 'this session'}"? All message history and recommendations will be permanently deleted.`}
              </p>

              <div className="mt-6 flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 cursor-pointer active:scale-95"
                >
                  {locale === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(deleteSessionRequest(sessionToDelete.id));
                    setSessionToDelete(null);
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 py-2.5 text-xs font-bold text-white transition hover:brightness-110 shadow-lg shadow-red-500/10 cursor-pointer active:scale-95"
                >
                  {locale === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default ChatPage
