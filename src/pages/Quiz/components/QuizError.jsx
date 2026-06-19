import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function QuizError({ onRetry }) {
  const navigate = useNavigate()
  const { t } = useTranslation('quiz')

  return (
    <div className="flex h-[calc(100dvh-74px)] w-full items-center justify-center bg-[#081a30] text-slate-100">
      <div className="glass-card max-w-md rounded-3xl border border-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mb-4 border border-rose-500/20">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-['Sora'] text-xl font-bold text-white mb-2">
          {t('error.title')}
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {t('error.message')}
        </p>
        <div className="flex gap-4">
          <button
            onClick={onRetry}
            className="flex-1 rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-5 py-3 font-semibold text-[#112542] hover:brightness-110 transition cursor-pointer"
            type="button"
          >
            {t('error.retry')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 rounded-xl border border-white/10 bg-transparent px-5 py-3 font-semibold text-slate-300 hover:bg-white/5 transition cursor-pointer"
            type="button"
          >
            {t('error.home')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuizError
