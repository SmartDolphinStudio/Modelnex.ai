import { useState, useEffect } from 'react'
import { useI18n } from '../i18n/useI18n'

export default function Hero() {
  const { t } = useI18n()
  const phrases = t('hero.phrases').split('|')
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex]
    let timeout: number

    if (isDeleting) {
      if (charIndex > 0) {
        timeout = window.setTimeout(() => {
          setText(currentPhrase.substring(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        }, 80)
      } else {
        setIsDeleting(false)
        setPhraseIndex((phraseIndex + 1) % phrases.length)
        timeout = window.setTimeout(() => {}, 800)
      }
    } else {
      if (charIndex < currentPhrase.length) {
        timeout = window.setTimeout(() => {
          setText(currentPhrase.substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }, 150)
      } else {
        timeout = window.setTimeout(() => setIsDeleting(true), 3000)
      }
    }

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex, phrases])

  return (
    <section className={`py-16 min-h-[60vh] flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="relative z-10 max-w-4xl">
        <h1 className="font-display text-5xl font-semibold text-on-surface mb-6 italic -mt-4">
          {t('hero.title')} <span className="typing-cursor">{text}</span>
        </h1>
        <p className="text-lg text-on-surface-variant mb-8 leading-relaxed max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/chat" className="bg-primary text-white px-8 py-2.5 rounded-full font-semibold hover:shadow-lg transition-all">
            {t('hero.tryAI')}
          </a>
          <a href="/console" className="border border-primary text-primary px-8 py-2.5 rounded-full font-semibold hover:bg-primary/5 transition-all">
            {t('hero.console')}
          </a>
        </div>
      </div>
    </section>
  )
}
