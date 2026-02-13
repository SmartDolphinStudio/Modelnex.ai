import { useI18n } from '../i18n/useI18n'

export default function MaintenancePage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full top-0 sticky z-50 bg-surface-bright/90 backdrop-blur-md border-b border-outline-variant/10">
        <nav className="flex items-center max-w-[1280px] mx-auto px-4 h-14">
          <a href="/" className="font-display text-xl font-semibold text-primary shrink-0">ModelNex.AI</a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-bold text-on-surface mb-6">{t('maintenance.title')}</h1>
          <p className="text-lg text-on-surface-variant mb-2 italic leading-relaxed">"{t('maintenance.quote')}"</p>
          <p className="text-sm text-on-surface-variant/60 mb-8">— {t('maintenance.author')}</p>
          <p className="text-on-surface-variant">{t('maintenance.desc')}</p>
        </div>
      </main>
    </div>
  )
}
