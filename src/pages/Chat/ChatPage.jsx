import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
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
import ChatHistoryDrawer from './components/ChatHistoryDrawer'
import ConfirmModal from '../../components/ConfirmModal'
import { useSpeech } from './hooks/useSpeech'

const FREE_MESSAGE_LIMIT = 5

function ChatPage() {
  const { t, i18n } = useTranslation('chat')
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const reduxPlan = useSelector((state) => state.auth.plan)
  const currentPlan = String(reduxPlan ?? '').toLowerCase()
  const isProAccount = currentPlan !== 'free' && currentPlan !== ''
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'

  const systemBadge = isProAccount
    ? {
        label: '\u{1F451}',
        className: 'border-[#ecc741]/35 bg-[#ecc741]/12 text-[#f2cb36]',
      }
    : {
        icon: sparklesIcon,
        className: 'border-emerald-300/40 bg-emerald-400/12 text-emerald-300',
      }

  const {
    chatMessages: messages,
    guidedChatLoading: isThinking,
    chatSummaryText: summaryText,
    chatRecommendations: aiRecommendations,
    currentSessionId,
    sessions,
    sessionsLoading,
    activeSessionLoading,
  } = useSelector((state) => state.chat)

  // Đếm số tin nhắn user đã gửi — giới hạn 5 với Free
  const userMessageCount = messages.filter((m) => m.role === 'user').length
  const isLocked = !isProAccount && userMessageCount >= FREE_MESSAGE_LIMIT

  const [inputValue, setInputValue] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)
  
  const conversationRef = useRef(null)
  const shouldAutoSpeakRef = useRef(false)

  // Speech-to-Text & Text-to-Speech Hook
  const {
    speakingMessageId,
    isRecording,
    toggleSpeak,
    toggleRecording,
    hadVoiceInput,
    setHadVoiceInput,
  } = useSpeech({ setInputValue, currentSessionId })

  // Load danh sách các phiên chat của user khi mount
  useEffect(() => {
    dispatch(fetchSessionsRequest())
  }, [dispatch])

  // Tải lại danh sách lịch sử khi mở drawer
  useEffect(() => {
    if (isHistoryOpen) {
      dispatch(fetchSessionsRequest())
    }
  }, [isHistoryOpen, dispatch])

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

  // Hiện câu chào cứng khi mount
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const shouldReset = messages.length === 0 || location.state?.resetChat

    if (shouldReset) {
      const greetingText = t('greetingText')
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
    // Chỉ tự động phát âm thanh phản hồi tiếp theo nếu tin nhắn được nhập từ giọng nói
    if (hadVoiceInput) {
      shouldAutoSpeakRef.current = true
      setHadVoiceInput(false)
    } else {
      shouldAutoSpeakRef.current = false
    }
    dispatch(sendGuidedChatMessageRequest({ message: messageContent, locale }))
  }

  function handleSubmit(e) {
    if (e) e.preventDefault()
    sendMessage(inputValue)
  }

  function handleInputChange(val) {
    setInputValue(val)
    setHadVoiceInput(false) // Reset state giọng nói nếu gõ thủ công
  }

  function handleNewChat() {
    const greetingText = t('greetingText')
    dispatch(startNewChat({ greetingText }))
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
            className="rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 md:text-sm cursor-pointer"
            onClick={() => navigate('/consultation')}
            type="button"
          >
            {t('changeMode')}
          </button>
        </div>
      ) : null}

      <section className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/12 bg-[#081a30]/62">
        {/* Chat History Sidebar Drawer Component */}
        <ChatHistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          sessionsLoading={sessionsLoading}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={(id) => {
            dispatch(fetchSessionDetailRequest(id))
            setIsHistoryOpen(false)
          }}
          onDeleteSession={(session) => setSessionToDelete(session)}
        />

        {/* Main Conversation Panel */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ChatConversationPanel
            inputValue={inputValue}
            isThinking={isThinking}
            isLoading={activeSessionLoading}
            isLocked={isLocked}
            listRef={conversationRef}
            messages={messages}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onNewChat={handleNewChat}
            systemBadge={systemBadge}
            onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
            isRecording={isRecording}
            onToggleRecording={toggleRecording}
            speakingMessageId={speakingMessageId}
            onToggleSpeak={toggleSpeak}
            onUpgrade={() => navigate('/pricing')}
          />
        </div>

        {/* Recommendations Panel - Visible on lg screens */}
        <div className="hidden lg:flex w-[340px] shrink-0 min-h-0 flex-col">
          <ChatRecommendationPanel
            isPro={isProAccount}
            onViewDetail={handleViewDetail}
            recommendations={aiRecommendations}
            summaryText={summaryText}
            systemBadge={systemBadge}
            onUpgrade={() => navigate('/pricing')}
            isLoading={activeSessionLoading}
          />
        </div>
      </section>

      {/* Reusable Premium styled ConfirmModal for Delete Session */}
      <ConfirmModal
        isOpen={Boolean(sessionToDelete)}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteDesc', { name: sessionToDelete?.name || t('thisSession') })}
        confirmText={t('confirmDeleteBtn')}
        cancelText={t('cancel')}
        onConfirm={() => {
          dispatch(deleteSessionRequest(sessionToDelete.id))
          setSessionToDelete(null)
        }}
        onCancel={() => setSessionToDelete(null)}
        type="danger"
      />
    </main>
  )
}

export default ChatPage
