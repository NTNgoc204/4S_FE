function ChatConversationPanel({
  inputValue,
  isThinking,
  isLocked = false,
  listRef,
  messages,
  onInputChange,
  onSubmit,
  onUpgrade,
  systemBadge,
  text,
}) {

  return (
    <div className="flex min-h-0 flex-col border-r border-white/10">
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
              <p className="max-w-[780px] rounded-2xl border border-[#5f7396]/45 bg-gradient-to-b from-[#213a58]/95 to-[#182f4a]/98 px-4 py-3 text-[1rem] leading-8 text-slate-100 whitespace-pre-line md:px-5">
                {message.content}
              </p>
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
              placeholder={text.inputPlaceholder}
              type="text"
              value={inputValue}
            />
            <button
              className={`rounded-2xl px-5 py-3 text-base font-semibold transition ${
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

export default ChatConversationPanel
