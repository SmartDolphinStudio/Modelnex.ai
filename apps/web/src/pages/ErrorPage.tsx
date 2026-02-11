import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'

interface ErrorPageProps {
  code: string
}

export default function ErrorPage({ code }: ErrorPageProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const quote = t(`errors.${code}.quote`)
  const author = t(`errors.${code}.author`)
  const desc = t(`errors.${code}.desc`)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full top-0 sticky z-50 bg-surface-bright/90 backdrop-blur-md border-b border-outline-variant/10">
        <nav className="flex items-center max-w-[1280px] mx-auto px-4 h-14">
          <a href="/" className="font-display text-xl font-semibold text-primary shrink-0">ModelNex.AI</a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <h1 className="font-display text-8xl font-bold text-primary mb-6">{code}</h1>
          <p className="text-lg text-on-surface-variant mb-2 italic leading-relaxed">"{quote}"</p>
          <p className="text-sm text-on-surface-variant/60 mb-8">— {author}</p>
          <p className="text-on-surface-variant mb-10">{desc}</p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              返回首页
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
