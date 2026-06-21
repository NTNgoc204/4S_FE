import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

export function useSpeech({ setInputValue, currentSessionId }) {
  const { t, i18n } = useTranslation('chat')
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'

  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [hadVoiceInput, setHadVoiceInput] = useState(false)
  
  const recognitionRef = useRef(null)

  // Hủy âm thanh đang phát khi unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Hủy phát tiếng khi đổi phiên chat (hoặc bắt đầu cuộc trò chuyện mới)
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setSpeakingMessageId(null)
  }, [currentSessionId])

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

    // Lọc giọng đọc nữ tự nhiên trẻ trung
    const voices = window.speechSynthesis.getVoices()
    if (locale === 'vi') {
      const viVoices = voices.filter(v => 
        v.lang.startsWith('vi') || 
        v.lang.replace('_', '-').toLowerCase().startsWith('vi-vn')
      )
      
      // 1. Ưu tiên các giọng nữ chất lượng cao (Hoài Chi của Edge, Google Tiếng Việt của Chrome)
      let selectedVoice = viVoices.find(v => 
        v.name.includes('HoaiChi') || 
        v.name.includes('Natural') ||
        v.name.toLowerCase().includes('google') ||
        v.name.includes('tiếng Việt')
      )
      
      // 2. Kế tiếp ưu tiên các giọng nữ khác (chứa An, female)
      if (!selectedVoice) {
        selectedVoice = viVoices.find(v => 
          v.name.includes('An') || 
          v.name.toLowerCase().includes('female')
        )
      }
      
      // 3. Fallback: Lấy giọng tiếng Việt đầu tiên tìm thấy để tránh bị đọc bằng giọng mặc định tiếng Anh/nam của hệ thống
      if (!selectedVoice && viVoices.length > 0) {
        selectedVoice = viVoices[0]
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    } else {
      const enVoices = voices.filter(v => 
        v.lang.startsWith('en') || 
        v.lang.replace('_', '-').toLowerCase().startsWith('en-us')
      )
      
      // 1. Ưu tiên các giọng nữ/tự nhiên phổ biến
      let selectedVoice = enVoices.find(v => 
        v.name.includes('Aria') || 
        v.name.includes('Natural') ||
        v.name.toLowerCase().includes('google')
      )
      
      // 2. Kế tiếp ưu tiên các giọng nữ khác
      if (!selectedVoice) {
        selectedVoice = enVoices.find(v => 
          v.name.includes('Zira') || 
          v.name.toLowerCase().includes('female')
        )
      }
      
      // 3. Fallback: Lấy giọng tiếng Anh đầu tiên
      if (!selectedVoice && enVoices.length > 0) {
        selectedVoice = enVoices[0]
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    utterance.onend = () => {
      setSpeakingMessageId(null)
    }

    utterance.onerror = () => {
      setSpeakingMessageId(null)
    }

    window.speechSynthesis.speak(utterance)
  }

  function toggleRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error(t('speechNotSupported'))
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
    recognition.continuous = false
    recognition.interimResults = false

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
        setHadVoiceInput(true)
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setIsRecording(false)
    }

    recognition.start()
  }

  return {
    speakingMessageId,
    setSpeakingMessageId,
    isRecording,
    toggleSpeak,
    toggleRecording,
    hadVoiceInput,
    setHadVoiceInput,
  }
}
