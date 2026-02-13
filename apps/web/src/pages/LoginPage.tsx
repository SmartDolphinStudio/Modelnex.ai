import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useConsoleStore } from '../features/console/store'
import { useI18n } from '../i18n/useI18n'

const DOC_URL = 'https://docs.modelnex.ai'

const COUNTRY_CODES = [
  { iso: 'CN', code: '+86', name: '中国' }, { iso: 'US', code: '+1', name: '美国 / 加拿大' },
  { iso: 'GB', code: '+44', name: '英国' }, { iso: 'JP', code: '+81', name: '日本' },
  { iso: 'KR', code: '+82', name: '韩国' }, { iso: 'HK', code: '+852', name: '中国香港' },
  { iso: 'MO', code: '+853', name: '中国澳门' }, { iso: 'TW', code: '+886', name: '中国台湾' },
  { iso: 'SG', code: '+65', name: '新加坡' }, { iso: 'AU', code: '+61', name: '澳大利亚' },
  { iso: 'NZ', code: '+64', name: '新西兰' }, { iso: 'DE', code: '+49', name: '德国' },
  { iso: 'FR', code: '+33', name: '法国' }, { iso: 'IT', code: '+39', name: '意大利' },
  { iso: 'ES', code: '+34', name: '西班牙' }, { iso: 'NL', code: '+31', name: '荷兰' },
  { iso: 'SE', code: '+46', name: '瑞典' }, { iso: 'NO', code: '+47', name: '挪威' },
  { iso: 'FI', code: '+358', name: '芬兰' }, { iso: 'DK', code: '+45', name: '丹麦' },
  { iso: 'RU', code: '+7', name: '俄罗斯' }, { iso: 'IN', code: '+91', name: '印度' },
  { iso: 'ID', code: '+62', name: '印度尼西亚' }, { iso: 'MY', code: '+60', name: '马来西亚' },
  { iso: 'TH', code: '+66', name: '泰国' }, { iso: 'VN', code: '+84', name: '越南' },
  { iso: 'PH', code: '+63', name: '菲律宾' }, { iso: 'BR', code: '+55', name: '巴西' },
  { iso: 'MX', code: '+52', name: '墨西哥' }, { iso: 'AR', code: '+54', name: '阿根廷' },
  { iso: 'TR', code: '+90', name: '土耳其' }, { iso: 'AE', code: '+971', name: '阿联酋' },
  { iso: 'SA', code: '+966', name: '沙特阿拉伯' }, { iso: 'ZA', code: '+27', name: '南非' },
]

function flag(iso: string) {
  if (iso.length !== 2) return iso
  return String.fromCodePoint(...iso.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0)))
}

function filterEmailInput(value: string) {
  return value.replace(/[^A-Za-z0-9.@]/g, '')
}

function filterPasswordInput(value: string) {
  return value.replace(/[^A-Za-z0-9@.]/g, '')
}

export default function LoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [isRegister, setIsRegister] = useState(() => location.pathname === '/signup')
  const [usePhone, setUsePhone] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+86')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showCountrySelect, setShowCountrySelect] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setIsRegister(location.pathname === '/signup')
  }, [location.pathname])

  useEffect(() => {
    if (countdown <= 0) return
    timerRef.current = setInterval(() => setCountdown((prev) => Math.max(prev - 1, 0)), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [countdown])

  const finishAuth = (user: any, token?: string) => {
    useConsoleStore.getState().resetSessionState()
    for (const key of ['mn-session-token', 'mn-user-id', 'mn-username', 'mn-provider', 'mn-avatar', 'mn-user-uid16', 'mn-registered-at', 'mn-local-credit-balance', 'mn-local-payment-orders']) {
      localStorage.removeItem(key)
    }
    localStorage.setItem('mn-logged-in', 'true')
    localStorage.setItem('mn-user-id', user.id || 'usr_demo')
    localStorage.setItem('mn-username', user.nickname || user.email || 'User')
    if (token) {
      localStorage.setItem('mn-session-token', token)
    } else {
      localStorage.removeItem('mn-logged-in')
      showError('登录状态异常，请重新登录')
      return
    }
    const params = new URLSearchParams(location.search)
    navigate(params.get('next') || '/')
  }

  const showError = (message: string) => {
    setError(message)
    setToast(message)
    setTimeout(() => setToast(''), 3600)
  }

  const validate = () => {
    setError('')
    if (!agreed) return showError('请先勾选同意用户协议、隐私政策和法律声明'), false
    if (usePhone) {
      if (!phone) return showError('请输入手机号'), false
      if (!/^\d{5,16}$/.test(phone.replace(/\D/g, ''))) return showError('手机号格式不正确'), false
      if (!verifyCode) return showError('请输入验证码'), false
      return true
    }
    if (!email) return showError('请输入邮箱'), false
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('邮箱地址格式不正确'), false
    if (!password) return showError('请输入密码'), false
    if (isRegister && !/^[\u4e00-\u9fa5A-Za-z0-9_-]{2,32}$/.test(nickname)) return showError('昵称只能包含中文、英文、数字、下划线和短横线，长度 2-32'), false
    if (isRegister && password !== confirmPassword) return showError('两次密码不一致'), false
    return true
  }

  const handleSendCode = () => {
    if (countdown > 0) return
    if (usePhone && !phone) return showError('请输入手机号')
    if (!usePhone && !email) return showError('请输入邮箱')
    setVerifyCode('000000')
    setCountdown(60)
  }

  const handleSubmit = () => {
    if (!validate()) return
    const identity = usePhone ? `${countryCode} ${phone}` : email
    const displayName = isRegister ? nickname : (email.split('@')[0] || 'Smart Dolphin')
    finishAuth({ id: `usr_${Date.now()}`, email: usePhone ? '' : email, nickname: displayName || identity }, `local_${Date.now()}`)
  }

  const handleQuickLogin = (provider: 'Google' | 'GitHub' | 'Apple' | 'Smart Dolphin') => {
    if (!agreed) return showError('请先勾选同意用户协议、隐私政策和法律声明')
    localStorage.setItem('mn-provider', provider)
    finishAuth({ id: `usr_${Date.now()}`, nickname: provider, email: '' }, `local_${Date.now()}`)
  }

  const inputClass = 'w-full h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 text-on-surface placeholder:text-on-surface-variant/50 text-sm outline-none focus:border-primary/50 transition-colors mb-3'
  const currentCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {toast && (
        <div className="fixed right-5 top-5 z-[80] min-w-[280px] max-w-[420px] rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm text-on-error-container shadow-lg">
          {toast}
        </div>
      )}
      <div className="max-w-sm w-full">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <SocialButton label="Google" brand="google" title="Google" onClick={() => handleQuickLogin('Google')} />
          <SocialButton label="GitHub" brand="github" title="GitHub" onClick={() => handleQuickLogin('GitHub')} />
          <SocialButton label="Apple" brand="apple" title="Apple" onClick={() => handleQuickLogin('Apple')} />
          <SocialButton label="Smart Dolphin" brand="smartdolphin" title="Smart Dolphin" onClick={() => handleQuickLogin('Smart Dolphin')} />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="text-xs text-on-surface-variant/60">{t('login.or')}</span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>

        {isRegister && !usePhone && <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={t('login.nicknamePlaceholder')} className={inputClass} />}

        {usePhone ? (
          <div className="flex gap-2 mb-3">
            <div className="relative">
              <button onClick={() => setShowCountrySelect(!showCountrySelect)} className="h-12 px-3 rounded-xl border border-outline-variant/30 bg-surface-container/50 text-on-surface text-sm flex items-center gap-1 min-w-[104px]">
                <CountryMark iso={currentCountry.iso} /> {currentCountry.code}
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              {showCountrySelect && (
                <div className="absolute top-full left-0 mt-1 bg-surface-container-low border border-outline-variant/30 rounded-lg shadow-lg max-h-[260px] overflow-y-auto z-10 min-w-[220px]">
                  {COUNTRY_CODES.map((c) => (
                    <button key={`${c.iso}-${c.code}`} onClick={() => { setCountryCode(c.code); setShowCountrySelect(false) }} className="w-full px-3 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center gap-2">
                      <span className="w-7"><CountryMark iso={c.iso} /></span>
                      <span>{c.code}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('login.phonePlaceholder')} className="flex-1 h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 text-on-surface placeholder:text-on-surface-variant/50 text-sm outline-none focus:border-primary/50 transition-colors" />
          </div>
        ) : (
          <input type="email" value={email} onChange={(e) => setEmail(filterEmailInput(e.target.value))} placeholder={t('login.emailPlaceholder')} className={inputClass} />
        )}

        {usePhone ? (
          <div className="flex gap-2 mb-3">
            <input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder={t('login.verifyCodePlaceholder')} className="flex-1 h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 text-on-surface placeholder:text-on-surface-variant/50 text-sm outline-none focus:border-primary/50 transition-colors" />
            <button onClick={handleSendCode} disabled={countdown > 0} className="h-12 px-4 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors whitespace-nowrap disabled:opacity-50">{countdown > 0 ? `${countdown}s` : t('login.sendCode')}</button>
          </div>
        ) : (
          <input type="password" value={password} onChange={(e) => setPassword(filterPasswordInput(e.target.value))} placeholder={t('login.passwordPlaceholder')} className={inputClass} />
        )}

        {isRegister && !usePhone && <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(filterPasswordInput(e.target.value))} placeholder={t('login.confirmPasswordPlaceholder')} className={inputClass} />}
        {isRegister && !usePhone && (
          <div className="flex gap-2 mb-3">
            <input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder={t('login.verifyCodePlaceholder')} className="flex-1 h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 text-on-surface placeholder:text-on-surface-variant/50 text-sm outline-none focus:border-primary/50 transition-colors" />
            <button onClick={handleSendCode} disabled={countdown > 0} className="h-12 px-4 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors whitespace-nowrap disabled:opacity-50">{countdown > 0 ? `${countdown}s` : t('login.sendCode')}</button>
          </div>
        )}

        <label className="flex items-start gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20" />
          <span className="text-xs text-on-surface-variant leading-relaxed">
            {isRegister ? t('login.registerAgreePrefix') : t('login.loginAgreePrefix')}{' '}
            <a href={`${DOC_URL}#terms`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('login.userAgreement')}</a>
            {' '}{t('login.and')}{' '}
            <a href={`${DOC_URL}#legal`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('login.legalNotice')}</a>
            {' '}、<a href={`${DOC_URL}#privacy`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">隐私政策</a>
            {' '}、<a href={`${DOC_URL}#refund`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">退款政策</a>
            {' '}、<a href={`${DOC_URL}#risk`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">风险提示</a>
          </span>
        </label>
        <button onClick={handleSubmit} disabled={!agreed} className="w-full h-12 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-4">
          {isRegister ? t('login.register') : t('header.login')}
        </button>

        <p className="text-center text-sm text-on-surface-variant">
          {isRegister ? t('login.haveAccount') : t('login.noAccount')}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setUsePhone(false); navigate(isRegister ? '/login' : '/signup') }} className="text-primary font-semibold hover:underline">
            {isRegister ? t('header.login') : t('header.signUp')}
          </button>
        </p>
      </div>
    </div>
  )
}

function SocialButton({ label, brand, title, onClick }: { label: string; brand: 'google' | 'github' | 'apple' | 'smartdolphin'; title: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-outline-variant/30 bg-white px-3 text-xs font-semibold transition-colors hover:border-primary/40 hover:bg-surface-variant/50" title={title}><BrandIcon brand={brand} />{label}</button>
}

function CountryMark({ iso }: { iso: string }) {
  return (
    <span className="inline-flex items-center justify-center min-w-6 h-6 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30" title={iso}>
      <img
        src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
        alt={iso}
        className="h-full w-full object-cover"
        onError={(event) => {
          const target = event.currentTarget
          target.style.display = 'none'
          const fallback = target.nextElementSibling as HTMLElement | null
          if (fallback) fallback.style.display = 'inline'
        }}
      />
      <span className="hidden px-1 text-[10px] font-bold text-primary">{iso}</span>
    </span>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="7" y="2.75" width="10" height="18.5" rx="2.2" />
      <path d="M10 5.75h4M11 18.25h2" strokeLinecap="round" />
    </svg>
  )
}

function BrandIcon({ brand }: { brand: 'google' | 'github' | 'apple' | 'smartdolphin' }) {
  if (brand === 'smartdolphin') {
    return <img src="/smartdolphin.png" alt="" className="h-[19px] w-[19px] rounded-full object-cover" />
  }
  if (brand === 'google') {
    return <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
  }
  if (brand === 'github') {
    return <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.08 1.83 2.82 1.3 3.51.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5z" /></svg>
  }
  return <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true"><path d="M16.37 1.43c0 1.16-.43 2.14-1.28 2.94-.91.86-1.9 1.35-2.96 1.27-.13-1.1.37-2.18 1.17-2.94.85-.8 2.1-1.41 3.07-1.27zM20.7 17.34c-.53 1.22-.78 1.77-1.46 2.85-.95 1.45-2.29 3.26-3.95 3.28-1.48.02-1.86-.96-3.87-.95-2.01.01-2.43.98-3.91.96-1.66-.02-2.93-1.65-3.88-3.1-2.65-4.06-2.93-8.83-1.29-11.36 1.16-1.8 3-2.85 4.73-2.85 1.76 0 2.87.97 4.33.97 1.42 0 2.28-.97 4.32-.97 1.54 0 3.17.84 4.33 2.28-3.81 2.09-3.19 7.53.65 8.89z" /></svg>
}
