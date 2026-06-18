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
        <div className="border-t border-white/10 bg-[#1f3857]/90 p-4 md:p-5">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
            <p className="text-sm font-semibold text-[#ecc741] mb-1">
              {text.lockedTitle}
            </p>
            <p className="text-xs text-slate-400 mb-3">
              {text.lockedDesc}
            </p>
            <button
              onClick={onUpgrade}
              className="w-full rounded-xl bg-gradient-to-r from-[#ecc741] to-[#debd34] py-2 text-xs font-bold text-[#11243b] shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
              type="button"
            >
              {text.lockedCta}
            </button>
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
