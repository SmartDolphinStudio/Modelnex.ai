import { useState, useEffect } from 'react'
import { useI18n } from '../i18n/useI18n'

export default function CookieBanner() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('cookie-dismissed')
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-dismissed', 'accepted')
    setVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookie-dismissed', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-md w-[calc(100%-3rem)] md:w-auto animate-slide-up">
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl shadow-2xl p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-semibold text-on-surface text-sm">{t('cookie.title')}</h3>
        </div>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">{t('cookie.desc')}</p>
        <div className="flex items-center gap-2">
          <button onClick={handleAccept} className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
            {t('cookie.acceptAll')}
          </button>
          <button onClick={handleReject} className="border border-outline-variant/40 text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-surface-variant/50 transition-colors">
            {t('cookie.rejectAll')}
          </button>
        </div>
        <p className="text-[10px] text-on-surface-variant/50 mt-2">{t('cookie.rejectWarning')}</p>
      </div>
    </div>
  )
}
