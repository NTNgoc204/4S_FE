import React from 'react';

function ChatConversationPanel({
  inputValue,
  isThinking,
  isLocked = false,
  listRef,
  messages,
  onInputChange,
  onSubmit,
  onUpgrade,
  onNewChat,
  systemBadge,
  text,
  onToggleHistory,
  // Voice chat props
  isRecording,
  onToggleRecording,
  speakingMessageId,
  onToggleSpeak,
  locale,
}) {

  return (
    <div className="flex min-h-0 flex-col border-r border-white/10 h-full">
      {/* Chat header with History and New Chat buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 bg-[#0c1c30]/50 md:px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">{text.assistantTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98] cursor-pointer"
            onClick={onToggleHistory}
          >
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{text.viewHistory}</span>
          </button>
          
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#ecc741]/30 bg-[#ecc741]/10 px-2.5 py-1.5 text-xs font-semibold text-[#fcd34d] transition hover:bg-[#ecc741]/20 active:scale-[0.98] cursor-pointer"
            onClick={onNewChat}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>{text.newChat}</span>
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_transparent] md:p-6 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/45 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300/55"
      >
        {messages.map((message) =>
          message.role === 'assistant' ? (
            <div key={message.id} className="flex items-start gap-3">
              <span className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[0.72rem] ${systemBadge.className}`}>
                {systemBadge.icon ? (
                  <img alt="" aria-hidden="true" className="h-4 w-4 object-contain" src={systemBadge.icon} />
                ) : (
                  systemBadge.label
                )}
              </span>
              <div className="relative group max-w-[780px]">
                <p className="rounded-2xl border border-[#5f7396]/45 bg-gradient-to-b from-[#213a58]/95 to-[#182f4a]/98 px-4 py-3 text-[1rem] leading-8 text-slate-100 whitespace-pre-line md:px-5 pr-10">
                  {message.content}
                </p>
                <button
                  type="button"
                  onClick={() => onToggleSpeak(message.id, message.content)}
                  className={`absolute right-2 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg border transition-all hover:bg-white/10 active:scale-95 cursor-pointer ${
                    speakingMessageId === message.id
                      ? 'border-[#0ed8ab]/35 bg-[#0ed8ab]/12 text-[#0fe2a8]'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                  title={speakingMessageId === message.id ? "Dừng đọc" : "Đọc thành tiếng"}
                >
                  {speakingMessageId === message.id ? (
                    // Stop/Speaking waves
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    // Speaker icon
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex justify-end">
              <p className="max-w-[560px] rounded-2xl border border-[#ecc741]/20 bg-gradient-to-br from-[#f4d040] to-[#debd34] px-4 py-2.5 text-sm font-semibold text-[#11243c] md:text-base">
                {message.content}
              </p>
            </div>
          ),
        )}

        {isThinking ? (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
            <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-[#ecc741]" />
            {text.thinking}
          </div>
        ) : null}
      </div>


      {isLocked ? (
        // Free user đã dùng hết 5 lượt — hiện CTA nâng cấp
        <div className="border-t border-white/10 bg-[#0c1e34]/95 p-4 md:p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
          <div className="relative overflow-hidden rounded-2xl border border-[#ecc741]/25 bg-gradient-to-b from-[#1b2d47]/90 to-[#0f1d31]/98 p-5 text-center shadow-[0_0_25px_rgba(236,199,65,0.06)] md:p-6">
            {/* Decorative abstract glow */}
            <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-[#ecc741]/5 blur-3xl" />
            <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-[#ecc741]/5 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Premium Lock Icon with Gold Glow */}
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#ecc741]/35 bg-gradient-to-br from-[#ecc741]/20 to-[#ecc741]/5 text-[#fcd34d] shadow-[0_0_15px_rgba(236,199,65,0.15)]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h4 className="font-['Sora'] text-base font-extrabold bg-gradient-to-r from-[#ffea9f] via-[#ecc741] to-[#cca625] bg-clip-text text-transparent mb-1">
                {text.lockedTitle.replace('🔒 ', '')}
              </h4>
              <p className="max-w-[480px] text-xs leading-relaxed text-slate-300/90 mb-4">
                {text.lockedDesc}
              </p>
              <button
                onClick={onUpgrade}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#ffe072] to-[#debd34] px-6 py-2.5 text-xs font-bold text-[#0c1b2f] shadow-[0_4px_15px_rgba(236,199,65,0.25)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(236,199,65,0.4)] hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                type="button"
              >
                {/* Shiny gloss effect on hover */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                
                {/* Crown Icon */}
                <svg className="h-4 w-4 shrink-0 text-[#0c1b2f] transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 22h20v-2H2v2zm1-3h18l-2-7-4 3-3-8-3 8-4-3-2 7z" />
                </svg>
                <span>{text.lockedCta.replace(' →', '')}</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">➔</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form className="border-t border-white/10 bg-[#1f3857]/90 p-4 md:p-5" onSubmit={onSubmit}>
          <div className="flex items-center gap-3">
            <input
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-base text-slate-100 outline-none placeholder:text-slate-500 focus:border-[#ecc741]/45"
              onChange={(event) => onInputChange(event.target.value)}
              placeholder={isRecording ? (locale === 'vi' ? 'Đang nghe giọng nói... Nhấn để dừng...' : 'Listening to voice... Click to stop...') : text.inputPlaceholder}
              type="text"
              value={inputValue}
              disabled={isRecording}
            />
            
            {/* Voice chat recording button */}
            <button
              type="button"
              onClick={onToggleRecording}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all active:scale-95 cursor-pointer ${
                isRecording
                  ? 'border-red-500 bg-red-500/20 text-red-400 animate-pulse'
                  : 'border-white/10 bg-white/[0.06] text-slate-300 hover:bg-white/10'
              }`}
              title={isRecording ? "Dừng ghi âm" : "Ghi âm giọng nói"}
            >
              {isRecording ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            <button
              className={`rounded-2xl px-5 py-3 text-base font-semibold transition cursor-pointer ${
                isThinking || !inputValue.trim()
                  ? 'cursor-not-allowed border border-white/10 bg-white/[0.06] text-slate-500'
                  : 'bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] text-[#112542] hover:brightness-110'
              }`}
              disabled={isThinking || !inputValue.trim()}
              type="submit"
            >
              {text.send}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ChatConversationPanel;
