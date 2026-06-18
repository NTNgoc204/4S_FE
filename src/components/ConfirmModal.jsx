import React, { useEffect } from 'react'

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  type = 'warning', // 'warning', 'danger', 'info'
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const getTheme = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          glow: 'shadow-[0_0_50px_-12px_rgba(244,63,94,0.35)] border-rose-500/20',
          confirmBtn: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-950/20 hover:from-rose-400 hover:to-red-500 focus:ring-rose-500/50',
          icon: (
            <svg className="h-7 w-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        }
      case 'info':
        return {
          iconBg: 'bg-teal-500/10 border-teal-500/30 text-[#0ed8ab]',
          glow: 'shadow-[0_0_50px_-12px_rgba(14,216,171,0.35)] border-teal-500/20',
          confirmBtn: 'bg-gradient-to-r from-[#0ed8ab] to-teal-500 text-[#081a30] shadow-teal-950/20 hover:brightness-110 focus:ring-teal-500/50',
          icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      case 'warning':
      default:
        return {
          iconBg: 'bg-amber-500/10 border-[#ecc741]/30 text-[#ecc741]',
          glow: 'shadow-[0_0_50px_-12px_rgba(236,199,65,0.35)] border-[#ecc741]/20',
          confirmBtn: 'bg-gradient-to-r from-[#ecc741] to-[#debd34] text-[#11243b] shadow-amber-950/20 hover:brightness-110 focus:ring-amber-500/50',
          icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
    }
  }

  const theme = getTheme()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300"
      onClick={onCancel}
    >
      {/* Modal Card */}
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-3xl border bg-gradient-to-b from-[#0f243e] to-[#081526] p-6 text-center shadow-2xl transition-all duration-300 scale-100 hover:scale-[1.01] ${theme.glow}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated background decoration */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/2 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/2 blur-2xl" />

        {/* Icon */}
        <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${theme.iconBg} shadow-inner`}>
          {theme.icon}
        </div>

        {/* Title */}
        <h3 className="font-['Sora'] text-xl font-bold tracking-tight text-white mb-3">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-300 mb-6 leading-relaxed px-2">
          {message}
        </p>

        {/* Footer actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-98 cursor-pointer"
            type="button"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`flex-1 rounded-2xl py-3 text-sm font-bold shadow-lg transition-all duration-200 active:scale-98 focus:outline-hidden focus:ring-2 cursor-pointer ${theme.confirmBtn}`}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
