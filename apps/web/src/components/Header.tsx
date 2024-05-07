import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useI18n, LANG_LABELS } from '../i18n/useI18n'
import { useConsoleStore } from '../features/console/store'
import type { Lang } from '../i18n/useI18n'

const GITHUB_URL = 'https://github.com'
const X_URL = 'https://x.com'
const FACEBOOK_URL = 'https://facebook.com'
const REDDIT_URL = 'https://reddit.com'
const DISCORD_URL = 'https://discord.com'
const DOC_URL = 'https://docs.modelnex.ai'
const LOG_URL = 'https://log.modelnex.ai'
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=ModelNex&background=111111&color=ffffff'

function DropdownItem({ children, href = '#' }: { children: React.ReactNode; href?: string }) {
  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="block px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
      {children}
    </a>
  )
}
function NavDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold py-2 whitespace-nowrap">
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full bg-surface-container-low border border-outline-variant/20 rounded-lg shadow-lg min-w-[160px] py-1 z-50">
          {children}
        </div>
      )}
    </div>
  )
}
export default function Header() {
  const { t, lang, setLang } = useI18n()
  const navigate = useNavigate()
  const [langOpen, setLangOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [isLoggedIn] = useState(() => localStorage.getItem('mn-logged-in') === 'true')
  const [avatar, setAvatar] = useState(() => localStorage.getItem('mn-avatar') || '')
  const menuRef = useRef<HTMLDivElement>(null)
  const username = localStorage.getItem('mn-username') || 'User'

  useEffect(() => {
    const updateAvatar = () => setAvatar(localStorage.getItem('mn-avatar') || '')
    window.addEventListener('storage', updateAvatar)
    window.addEventListener('mn-avatar-updated', updateAvatar)
    return () => {
      window.removeEventListener('storage', updateAvatar)
      window.removeEventListener('mn-avatar-updated', updateAvatar)
    }
  }, [])

  useEffect(() => {
    if (!langOpen && !userOpen) return
    const closeMenus = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setLangOpen(false)
        setUserOpen(false)
      }
    }
    document.addEventListener('mousedown', closeMenus)
    return () => document.removeEventListener('mousedown', closeMenus)
  }, [langOpen, userOpen])

  const handleLogout = () => {
    useConsoleStore.getState().resetSessionState()
    for (const key of ['mn-logged-in', 'mn-username', 'mn-user-id', 'mn-session-token', 'mn-avatar', 'mn-user-uid16', 'mn-registered-at', 'mn-local-credit-balance', 'mn-local-payment-orders']) {
      localStorage.removeItem(key)
    }
    window.location.href = '/'
  }

  const handleConsoleClick = () => {
    navigate('/console')
    setUserOpen(false)
  }

  return (
    <header className="w-full top-0 sticky z-50 bg-surface-bright/90 backdrop-blur-md border-b border-outline-variant/10">
      <nav className="flex items-center max-w-[1400px] mx-auto px-6 h-16">
        <a href="/" className="font-display text-xl font-semibold text-primary shrink-0 mr-8">{t('header.brand')}</a>
        <div className="flex items-center gap-5 flex-1">
          <NavDropdown label={t('header.llmServices')}>
            <DropdownItem href="/chat">{t('header.chatModels')}</DropdownItem>
            <DropdownItem href={DOC_URL}>{t('header.models')}</DropdownItem>
            <DropdownItem href="/rankings">{t('header.modelRankings')}</DropdownItem>
          </NavDropdown>
          <NavDropdown label={t('header.agreement')}>
            <DropdownItem href={`${DOC_URL}#legal`}>{t('header.legalNotice')}</DropdownItem>
            <DropdownItem href={`${DOC_URL}#terms`}>{t('header.userAgreement')}</DropdownItem>
            <DropdownItem href={`${DOC_URL}#privacy`}>{t('header.privacy')}</DropdownItem>
            <DropdownItem href={`${DOC_URL}#risk`}>{t('header.risk')}</DropdownItem>
            <DropdownItem href={`${DOC_URL}#opensource`}>{t('header.openSource')}</DropdownItem>
          </NavDropdown>
          <NavDropdown label={t('header.pricing')}>
            <DropdownItem href="/pricing?tab=subscription">{t('header.subscription')}</DropdownItem>
            <DropdownItem href="/pricing?tab=api">{t('header.apiCredits')}</DropdownItem>
          </NavDropdown>
          <NavDropdown label={t('header.developers')}>
            <DropdownItem href={DOC_URL}>{t('header.apiDocs')}</DropdownItem>
            <DropdownItem href={LOG_URL}>{t('header.changelog')}</DropdownItem>
          </NavDropdown>
          <NavDropdown label={t('header.community')}>
            <DropdownItem href={GITHUB_URL}>{t('header.github')}</DropdownItem>
            <DropdownItem href={X_URL}>{t('header.x')}</DropdownItem>
            <DropdownItem href={FACEBOOK_URL}>{t('header.facebook')}</DropdownItem>
            <DropdownItem href={REDDIT_URL}>{t('header.reddit')}</DropdownItem>
            <DropdownItem href={DISCORD_URL}>{t('header.discord')}</DropdownItem>
          </NavDropdown>
        </div>
        <div ref={menuRef} className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <button onClick={() => { setLangOpen(!langOpen); setUserOpen(false) }} className="text-on-surface-variant hover:text-primary text-sm font-semibold px-1 py-1 transition-colors">
              {LANG_LABELS[lang]}
            </button>
            {langOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-surface-container-low border border-outline-variant/20 rounded-lg shadow-lg py-1 z-50 min-w-[100px]">
                {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                  <button key={l} onClick={() => { setLang(l); setLangOpen(false) }} className={`block w-full text-left px-4 py-2 text-sm hover:bg-surface-container transition-colors ${lang === l ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => { setUserOpen(!userOpen); setLangOpen(false) }} className="flex items-center gap-2 hover:bg-primary/5 px-2 py-1 rounded-full transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {avatar ? <img src={avatar || DEFAULT_AVATAR} alt="" className="h-full w-full object-cover" /> : username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-on-surface">{username}</span>
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-1 bg-surface-container-low border border-outline-variant/20 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                  <button onClick={handleConsoleClick} className="block w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">{t('header.console')}</button>
                  <button onClick={() => { setUserOpen(false); navigate('/console/profile') }} className="block w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">{t('header.profileSettings')}</button>
                  <div className="border-t border-outline-variant/20 my-1"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-surface-container transition-colors">{t('header.logout')}</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all">{t('header.login')}</Link>
              <Link to="/signup" className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">{t('header.signUp')}</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

