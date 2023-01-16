import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'

const GITHUB_URL = 'https://github.com'
const X_URL = 'https://x.com'
const FACEBOOK_URL = 'https://facebook.com'
const REDDIT_URL = 'https://reddit.com'
const DISCORD_URL = 'https://discord.com'
const DOC_URL = 'https://docs.modelnex.ai'
const LOG_URL = 'https://log.modelnex.ai'

export default function Footer() {
  const { t } = useI18n()
  const [chatInput, setChatInput] = useState('')

  const handleChatSend = () => {
    const text = chatInput.trim()
    if (!text) return
    sessionStorage.setItem('modelnex_pending_chat', text)
    window.location.href = '/chat'
  }

  const navColumns = [
    {
      title: t('footer.llmServices'),
      links: [
        { label: t('footer.chatModels'), href: '/chat' },
        { label: t('footer.modelRankings'), href: '/rankings' },
      ],
    },
    {
      title: t('footer.agreement'),
      links: [
        { label: '法律声明', href: `${DOC_URL}#legal` },
        { label: '用户协议', href: `${DOC_URL}#terms` },
        { label: '隐私政策', href: `${DOC_URL}#privacy` },
        { label: '风险提示', href: `${DOC_URL}#risk` },
        { label: '开源协议', href: `${DOC_URL}#opensource` },
      ],
    },
    {
      title: t('footer.developers'),
      links: [
        { label: t('footer.apiDocs'), href: DOC_URL },
        { label: t('footer.changelog'), href: LOG_URL },
      ],
    },
    {
      title: t('footer.community'),
      links: [
        { label: t('footer.github'), href: GITHUB_URL },
        { label: t('footer.x'), href: X_URL },
        { label: t('footer.facebook'), href: FACEBOOK_URL },
        { label: t('footer.reddit'), href: REDDIT_URL },
        { label: 'Discord', href: DISCORD_URL },
      ],
    },
  ]

  return (
    <footer className="bg-surface-container-low mt-12">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex justify-between items-start gap-8 mb-6">
          <div className="flex-1">
            <div className="mb-6">
              <a href="/" className="flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="#7f5445" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
                </svg>
                <span className="font-display text-2xl font-semibold text-primary">{t('footer.brand')}</span>
              </a>
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr' }}>
              {navColumns.map((col) => (
                <div key={col.title} className="flex flex-col gap-2">
                  <span className="font-semibold text-primary text-sm">{col.title}</span>
                  {col.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-on-surface-variant hover:text-secondary transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-sm w-full mt-12">
            <div className="bg-surface-container rounded-full p-1.5 shadow-lg border border-primary/10 flex items-center gap-2 transition-transform hover:scale-[1.01]">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
                </svg>
              </div>
              <input
                className="bg-transparent border-none outline-none focus:outline-none focus:border-none flex-1 text-on-surface placeholder:text-on-surface-variant/50 text-sm"
                placeholder={t('footer.chatPlaceholder')}
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleChatSend()}
              />
              <button onClick={handleChatSend} className="bg-surface-container-highest hover:bg-surface-variant text-primary px-4 py-1.5 rounded-full font-semibold transition-all text-sm">{t('footer.send')}</button>
            </div>
            <p className="text-center text-[10px] text-on-surface-variant/40 mt-2">{t('footer.poweredBy')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
          <div className="text-sm text-on-surface-variant">
            © 2026 ModelNex.AI. All rights reserved.
          </div>
          <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="#7f5445" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
          </svg>
        </div>
      </div>
    </footer>
  )
}
