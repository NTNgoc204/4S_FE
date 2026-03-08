import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import loginIcon from '../../assets/Login.svg'

function LoginPage({ onSignIn }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const demoAccounts = [
    {
      plan: 'FREE',
      title: t('auth:freeAccount'),
      email: 'free@4s.edu',
      password: 'free123',
    },
    {
      plan: 'PRO',
      title: t('auth:proAccount'),
      email: 'pro@4s.edu',
      password: 'pro123',
    },
  ]

  function handleSubmit(event) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password.trim()) {
      return
    }

    const account = demoAccounts.find((item) => item.email === normalizedEmail && item.password === password)
    if (!account) {
      setError(t('auth:invalidCredentials'))
      return
    }

    setError('')
    onSignIn(account.plan)
    navigate('/', { replace: true })
  }

  return (
    <>
      <main className="mx-auto flex min-h-[calc(100vh-74px)] w-[min(1120px,92vw)] items-center justify-center py-10">
        <section className="w-full max-w-[540px] rounded-3xl border border-white/10 bg-gradient-to-b from-[#1e3451]/90 to-[#182c47]/94 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <div className="mb-5 flex justify-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#ffe16d] to-[#deb320] shadow-[0_10px_24px_rgba(237,196,46,0.28)]">
              <img alt="Login icon" className="h-8 w-8 object-contain" src={loginIcon} />
            </div>
          </div>

          <h1 className="text-center font-['Sora'] text-4xl font-bold">{t('auth:welcomeBack')}</h1>
          <p className="mt-2 text-center text-lg text-slate-300">{t('auth:subtitle')}</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="email">
                {t('auth:emailLabel')}
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('auth:emailPlaceholder')}
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-slate-200" htmlFor="password">
                {t('auth:passwordLabel')}
              </label>
              <input
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-[#ecc741] focus:outline-none"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('auth:passwordPlaceholder')}
                required
                type="password"
                value={password}
              />
            </div>

            <button
              className="mt-2 w-full rounded-xl bg-gradient-to-br from-[#ffdd5d] to-[#e5bc23] px-6 py-3 text-xl font-semibold text-[#112542] shadow-[0_14px_30px_rgba(238,198,49,0.23)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(238,198,49,0.3)]"
              type="submit"
            >
              {t('auth:signIn')}
            </button>

            {error ? <p className="text-sm font-medium text-rose-300">{error}</p> : null}
          </form>

          <p className="mt-7 text-center text-lg text-slate-300">
            {t('auth:noAccount')}{' '}
            <button className="font-semibold text-[#ecc741] transition hover:text-[#ffdf69]" type="button">
              {t('auth:signUp')}
            </button>
          </p>

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-amber-200">{t('auth:demoTitle')}</h2>
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <article
                  key={account.plan}
                  className={`rounded-xl border p-3 ${
                    account.plan === 'FREE'
                      ? 'border-emerald-400/70 bg-gradient-to-b from-emerald-500/15 to-[#12263f]/80'
                      : 'border-[#ecc741]/70 bg-gradient-to-b from-[#ecc741]/15 to-[#12263f]/80'
                  }`}
                >
                  <p className={`text-sm font-bold ${account.plan === 'FREE' ? 'text-emerald-400' : 'text-[#ecc741]'}`}>
                    {account.plan === 'PRO' ? '\u{1F451} ' : ''}
                    {account.plan}
                  </p>
                  <p className="text-sm text-slate-100">{account.title}</p>
                  <p className="mt-1 text-xs text-slate-300">
                    {t('auth:emailWord')}: {account.email} - {t('auth:passWord')}: {account.password}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default LoginPage

