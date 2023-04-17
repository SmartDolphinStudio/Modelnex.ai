import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import AIMessageContent from '../components/AIMessageContent'
import { useI18n, type Lang } from '../i18n/useI18n'
import { petActivityStore } from '../lib/pet/petActivity'

type ChatRole = 'assistant' | 'user'
type ReasoningMode = 'fast' | 'standard' | 'deep'
type ModelName = 'Core' | 'Reason' | 'Fast'

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  timestamp: string
  attachmentName?: string
}

type ChatSession = {
  id: string
  title: string
  updatedAt: string
  messages: ChatMessage[]
  pinned?: boolean
}

type UsageState = {
  fiveHour: number
  sevenDay: number
  apiCredit: number
}

type ContextMenuState = {
  id: string
  x: number
  y: number
}

const storageKey = 'smart-dolphin-chat-sessions-v3'
const legacyStorageKey = 'smart-dolphin-chat-sessions-v2'
const usageStorageKey = 'smart-dolphin-usage-v1'
const models: ModelName[] = ['Core', 'Reason', 'Fast']
const reasoningModes: ReasoningMode[] = ['fast', 'standard', 'deep']
const defaultUsage: UsageState = { fiveHour: 42, sevenDay: 61, apiCredit: 482.35 }

const localeMap: Record<Lang, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  de: 'de-DE',
  nl: 'nl-NL',
}

function currentLang(): Lang {
  const value = localStorage.getItem('mn-lang')
  return value === 'zh' || value === 'zh-TW' || value === 'de' || value === 'nl' ? value : 'en'
}

function localCopy(lang: Lang) {
  const copy: Record<Lang, { newChat: string; greeting: string; recent: string }> = {
    en: { newChat: 'New chat', greeting: 'Hello. What would you like to work on today?', recent: 'Recent chats' },
    zh: { newChat: '新对话', greeting: '你好，今天想先处理什么？', recent: '最近对话' },
    'zh-TW': { newChat: '新對話', greeting: '你好，今天想先處理什麼？', recent: '最近對話' },
    de: { newChat: 'Neuer Chat', greeting: 'Hallo. Woran möchtest du heute arbeiten?', recent: 'Letzte Chats' },
    nl: { newChat: 'Nieuwe chat', greeting: 'Hallo. Waar wil je vandaag aan werken?', recent: 'Recente chats' },
  }
  return copy[lang]
}

function makeMessage(role: ChatRole, content: string, attachmentName?: string): ChatMessage {
  return { id: role + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), role, content, timestamp: new Date().toISOString(), attachmentName }
}

function createChat(title = localCopy(currentLang()).newChat, greeting = localCopy(currentLang()).greeting): ChatSession {
  return {
    id: 'chat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    title,
    updatedAt: new Date().toISOString(),
    messages: [makeMessage('assistant', greeting)],
  }
}

function readProfileName() {
  const lang = currentLang()
  return localStorage.getItem('mn-username') || (lang === 'en' ? 'Guest' : lang === 'de' || lang === 'nl' ? 'Gast' : lang === 'zh-TW' ? '訪客' : '访客')
}

function fallbackChats(): ChatSession[] {
  const lang = currentLang()
  const copy = localCopy(lang)
  const current = createChat(copy.newChat, copy.greeting)
  const productTitle = lang === 'en' ? 'Product structure' : lang === 'de' ? 'Produktstruktur' : lang === 'nl' ? 'Productstructuur' : lang === 'zh-TW' ? '產品首頁結構' : '产品首页结构'
  const dashboardTitle = lang === 'en' ? 'Dashboard visual system' : lang === 'de' ? 'Dashboard-System' : lang === 'nl' ? 'Dashboard-ontwerp' : lang === 'zh-TW' ? '儀表板視覺優化' : '仪表盘视觉优化'
  const productReply = lang === 'en' ? 'We can start with the main user task, information hierarchy, and primary action.' : lang === 'de' ? 'Wir können mit der wichtigsten Aufgabe, der Informationshierarchie und der Hauptaktion beginnen.' : lang === 'nl' ? 'We kunnen beginnen met de belangrijkste taak, de informatiestructuur en de hoofdactie.' : lang === 'zh-TW' ? '我們可以先從主要任務、資訊層級和主要操作開始梳理。' : '我们可以先从主要任务、信息层级和主要操作开始梳理。'
  const dashboardReply = lang === 'en' ? 'A dashboard should keep dense data readable and make key metrics easy to scan.' : lang === 'de' ? 'Ein Dashboard darf datenreich sein, muss Kennzahlen aber schnell erfassbar machen.' : lang === 'nl' ? 'Een dashboard mag veel data tonen, maar kerncijfers moeten direct scanbaar blijven.' : lang === 'zh-TW' ? '儀表板可以保留高密度資料，但核心指標要一眼可讀。' : '仪表盘可以保留高密度数据，但核心指标要一眼可读。'
  const product = createChat(productTitle)
  const dashboard = createChat(dashboardTitle)
  product.messages = [makeMessage('assistant', productReply)]
  dashboard.messages = [makeMessage('assistant', dashboardReply)]
  return [current, product, dashboard]
}

function readChats(): ChatSession[] {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey) || '[]')
    if (Array.isArray(saved) && saved.length > 0 && saved.every((item) => item?.id && Array.isArray(item.messages))) {
      return saved.map((item) => ({ ...item, pinned: item.pinned === true })) as ChatSession[]
    }
  } catch {
    // Browser-only conversation data is disposable.
  }
  return fallbackChats()
}

function readUsage(): UsageState {
  try {
    const saved = JSON.parse(localStorage.getItem(usageStorageKey) || 'null')
    if (saved && typeof saved.fiveHour === 'number' && typeof saved.sevenDay === 'number') return { ...defaultUsage, ...saved }
  } catch {
    // Ignore invalid browser-only usage data.
  }
  return defaultUsage
}

function formatChatTime(value: string, lang: Lang) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  const options = date.toDateString() === today.toDateString() ? { hour: '2-digit', minute: '2-digit' } as const : { month: 'short', day: 'numeric' } as const
  return new Intl.DateTimeFormat(localeMap[lang], options).format(date)
}

function countTokens(value: string) {
  return Math.max(0, Math.ceil(value.trim().length / 2))
}

function localReply(prompt: string, model: ModelName, reasoning: ReasoningMode, attachmentName: string | undefined, lang: Lang) {
  const attachment = attachmentName
    ? ({ en: 'I received the attachment “' + attachmentName + '”.', zh: '我已读取到附件「' + attachmentName + '」。', 'zh-TW': '我已讀取到附件「' + attachmentName + '」。', de: 'Ich habe den Anhang „' + attachmentName + '“ erhalten.', nl: 'Ik heb de bijlage “' + attachmentName + '” ontvangen.' }[lang])
    : ''
  const reasoningLabel = lang === 'en' ? (reasoning === 'fast' ? 'fast' : reasoning === 'deep' ? 'deep' : 'standard') : lang === 'de' ? (reasoning === 'fast' ? 'schneller' : reasoning === 'deep' ? 'tiefer' : 'standard') : lang === 'nl' ? (reasoning === 'fast' ? 'snelle' : reasoning === 'deep' ? 'diepe' : 'standaard') : reasoning === 'fast' ? '快速' : reasoning === 'deep' ? '深度思考' : lang === 'zh-TW' ? '標準' : '标准'
  const footer = ({
    en: 'This local showcase reply uses ' + model + ' with ' + reasoningLabel + ' reasoning. No external service was contacted.',
    zh: '当前回复由 ' + model + '（' + reasoningLabel + '）的本地展示逻辑生成，不会请求外部服务。',
    'zh-TW': '目前回覆由 ' + model + '（' + reasoningLabel + '）的本地展示邏輯產生，不會請求外部服務。',
    de: 'Diese lokale Demo-Antwort verwendet ' + model + ' mit ' + reasoningLabel + ' Analyse. Es wurde kein externer Dienst kontaktiert.',
    nl: 'Dit lokale demo-antwoord gebruikt ' + model + ' met ' + reasoningLabel + ' redenering. Er is geen externe dienst aangeroepen.',
  }[lang])
  const lower = prompt.toLowerCase()
  if (/代码|程式|code|typescript|react|css|tailwind/.test(lower)) {
    const intro = ({ en: 'Separate layout, state, and style boundaries first, then extract reusable components.', zh: '可以先把布局、状态和样式边界拆开，再抽取可复用组件。', 'zh-TW': '可以先拆分版面、狀態和樣式邊界，再抽取可重用元件。', de: 'Trenne zuerst Layout, Zustand und Stilgrenzen, und extrahiere danach wiederverwendbare Komponenten.', nl: 'Splits eerst layout, state en stijlgrenzen op en haal daarna herbruikbare componenten uit de code.' }[lang])
    const fence = String.fromCharCode(96).repeat(3)
    const snippet = [fence + 'tsx', 'type MetricCardProps = {', '  label: string', '  value: string', '  detail: string', '}', '', 'export function MetricCard({ label, value, detail }: MetricCardProps) {', '  return <section className="rounded-lg border p-4">...</section>', '}', fence].join('\n')
    return attachment + (attachment ? ' ' : '') + intro + '\n\n' + snippet + '\n\n' + footer
  }
  const body = ({
    en: 'I received your idea: “' + prompt.slice(0, 120) + '”.\n\nThis is a frontend-only showcase. Conversations stay in this browser and are not sent to a server.',
    zh: '已收到你的想法：「' + prompt.slice(0, 120) + '」。\n\n当前是纯前端展示模式：会话只保存在这个浏览器里，不会发往服务器。',
    'zh-TW': '已收到你的想法：「' + prompt.slice(0, 120) + '」。\n\n目前是純前端展示模式：對話只保存在這個瀏覽器裡，不會傳送到伺服器。',
    de: 'Ich habe deine Idee erhalten: „' + prompt.slice(0, 120) + '“.\n\nDies ist eine reine Frontend-Demo. Gespräche bleiben in diesem Browser und werden nicht an einen Server gesendet.',
    nl: 'Ik heb je idee ontvangen: “' + prompt.slice(0, 120) + '”.\n\nDit is een frontend-demo. Gesprekken blijven in deze browser en worden niet naar een server gestuurd.',
  }[lang])
  return attachment + (attachment ? '\n\n' : '') + body + '\n\n' + footer
}

function aiLang(lang: Lang): 'zh' | 'zh-TW' | 'en' | 'de' | 'nl' {
  return lang
}

export default function ChatPage() {
  const { t, lang } = useI18n()
  const [sessions, setSessions] = useState<ChatSession[]>(readChats)
  const [activeChatId, setActiveChatId] = useState<string>()
  const [input, setInput] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [model, setModel] = useState<ModelName>('Core')
  const [reasoning, setReasoning] = useState<ReasoningMode>('standard')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [plusOpen, setPlusOpen] = useState(false)
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const [reasoningMenuOpen, setReasoningMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [resetCredits, setResetCredits] = useState(3)
  const [deleteTarget, setDeleteTarget] = useState<ChatSession>()
  const [renameTarget, setRenameTarget] = useState<ChatSession>()
  const [renameValue, setRenameValue] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenuState>()
  const [profileName] = useState(readProfileName)
  const [usage, setUsage] = useState<UsageState>(readUsage)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeChatId && sessions[0]) setActiveChatId(sessions[0].id)
  }, [activeChatId, sessions])

  // 把「等待回复 / 正在输出」同步给桌宠，驱动团子切到思考状态；
  // 离开聊天页（组件卸载）时复位。
  useEffect(() => {
    petActivityStore.set(isTyping ? 'thinking' : 'idle')
    return () => petActivityStore.set('idle')
  }, [isTyping])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem(usageStorageKey, JSON.stringify(usage))
  }, [usage])

  useEffect(() => {
    const closeOverlays = () => {
      setContextMenu(undefined)
      setPlusOpen(false)
      setModelMenuOpen(false)
      setReasoningMenuOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeOverlays()
    }
    document.addEventListener('mousedown', closeOverlays)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', closeOverlays)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const activeChat = useMemo(() => sessions.find((item) => item.id === activeChatId) || sessions[0], [activeChatId, sessions])
  const orderedSessions = useMemo(() => [...sessions].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [sessions])
  const tokenMetrics = useMemo(() => {
    const messages = activeChat?.messages || []
    const inputTokens = messages.filter((message) => message.role === 'user').reduce((sum, message) => sum + countTokens(message.content), 0) + countTokens(input)
    const outputTokens = messages.filter((message) => message.role === 'assistant').reduce((sum, message) => sum + countTokens(message.content), 0)
    const cachedTokens = Math.round((inputTokens + outputTokens) * 0.18)
    const total = Math.max(1, inputTokens + outputTokens)
    return { inputTokens, outputTokens, cacheRate: Math.round((cachedTokens / total) * 100), firstTokenLatency: isTyping ? '0.24s' : '0.18s' }
  }, [activeChat?.messages, input, isTyping])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages.length, isTyping])

  function createNewChat() {
    const chat = createChat(t('chat.newChat'), t('chat.greeting'))
    setSessions((current) => [chat, ...current])
    setActiveChatId(chat.id)
    setInput('')
    setAttachmentName('')
    setSidebarOpen(false)
  }

  function requestDelete(chat: ChatSession) {
    setContextMenu(undefined)
    setDeleteTarget(chat)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    const next = sessions.filter((item) => item.id !== deleteTarget.id)
    const replacement = next.length > 0 ? next : [createChat(t('chat.newChat'), t('chat.greeting'))]
    setSessions(replacement)
    if (activeChatId === deleteTarget.id) setActiveChatId(replacement[0].id)
    setDeleteTarget(undefined)
  }

  function togglePin(chat: ChatSession) {
    setSessions((current) => current.map((item) => item.id === chat.id ? { ...item, pinned: !item.pinned } : item))
    setContextMenu(undefined)
  }

  function requestRename(chat: ChatSession) {
    setContextMenu(undefined)
    setRenameTarget(chat)
    setRenameValue(chat.title)
  }

  function saveRename() {
    const title = renameValue.trim()
    if (!renameTarget || !title) return
    setSessions((current) => current.map((item) => item.id === renameTarget.id ? { ...item, title, updatedAt: new Date().toISOString() } : item))
    setRenameTarget(undefined)
  }

  function resizeTextarea(element: HTMLTextAreaElement) {
    element.style.height = 'auto'
    element.style.height = Math.min(element.scrollHeight, 176) + 'px'
  }

  function sendMessage(prompt = input.trim()) {
    if (!prompt || !activeChat || isTyping) return
    const chatId = activeChat.id
    const userMessage = makeMessage('user', prompt, attachmentName || undefined)
    const now = new Date().toISOString()
    setSessions((current) => current.map((chat) => chat.id === chatId
      ? { ...chat, title: chat.messages.length <= 1 ? prompt.replace(/\s+/g, ' ').slice(0, 28) : chat.title, updatedAt: now, messages: [...chat.messages, userMessage] }
      : chat,
    ))
    setInput('')
    setAttachmentName('')
    setPlusOpen(false)
    setModelMenuOpen(false)
    setReasoningMenuOpen(false)
    if (textareaRef.current) textareaRef.current.style.height = '56px'
    setIsTyping(true)
    window.setTimeout(() => {
      const assistantMessage = makeMessage('assistant', localReply(prompt, model, reasoning, userMessage.attachmentName, lang))
      setSessions((current) => current.map((chat) => chat.id === chatId
        ? { ...chat, updatedAt: new Date().toISOString(), messages: [...chat.messages, assistantMessage] }
        : chat,
      ))
      setIsTyping(false)
    }, 560)
  }

  async function copyMessage(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopiedId(message.id)
      window.setTimeout(() => setCopiedId(undefined), 1200)
    } catch {
      setCopiedId(undefined)
    }
  }

  function resetUsage() {
    setUsage((current) => ({ ...current, fiveHour: 0, sevenDay: 0 }))
    setResetCredits((value) => Math.max(0, value - 1))
    setResetConfirmOpen(false)
  }

  const userInitial = profileName.slice(0, 1).toUpperCase()

  return (
    <div className="mn-chat flex h-screen overflow-hidden bg-background text-on-surface">
      {sidebarOpen && <button aria-label={t('chat.closeSidebar')} onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-20 bg-on-surface/20 lg:hidden" />}

      <aside className={'fixed inset-y-0 left-0 z-30 flex w-[18rem] shrink-0 flex-col border-r border-outline-variant/70 bg-surface-container-low shadow-xl transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ' + (sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between border-b border-outline-variant/60 px-5 py-5">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">ModelNex.AI</p><p className="mt-1 text-sm font-semibold text-on-surface">{t('chat.title')}</p></div>
          <button onClick={() => setSidebarOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary lg:hidden" title={t('chat.close')}><span className="material-symbols-outlined text-[18px]">close</span></button>
        </div>
        <div className="px-4 pb-5 pt-5"><button onClick={createNewChat} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90"><span className="material-symbols-outlined text-[19px]">add</span>{t('chat.newChat')}</button></div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{t('chat.recent')}</p>
          <nav className="space-y-1" aria-label={t('chat.history')}>
            {orderedSessions.map((chat) => {
              const active = chat.id === activeChat?.id
              return <div key={chat.id} onContextMenu={(event) => { event.preventDefault(); setContextMenu({ id: chat.id, x: Math.min(event.clientX, window.innerWidth - 224), y: Math.min(event.clientY, window.innerHeight - 190) }) }} className={'group relative flex items-center gap-1 rounded-xl border transition-colors ' + (active ? 'border-primary/30 bg-surface-container-high text-on-surface' : 'border-transparent text-on-surface-variant hover:border-outline-variant/60 hover:bg-surface-container')}>
                <button onClick={() => { setActiveChatId(chat.id); setSidebarOpen(false) }} className="min-w-0 flex-1 px-3 py-3.5 text-left"><span className="flex min-w-0 items-center gap-2"><span className="block truncate text-sm font-medium">{chat.title}</span>{chat.pinned && <span className="material-symbols-outlined shrink-0 text-[15px] text-primary">push_pin</span>}</span><span className="mt-1 block text-[11px] text-on-surface-variant/70">{formatChatTime(chat.updatedAt, lang)}</span></button>
                <button onClick={() => setContextMenu({ id: chat.id, x: Math.min(window.innerWidth - 224, 270), y: Math.min(window.innerHeight - 190, 130) })} className="mr-2 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary group-hover:inline-flex" title={t('chat.more')}><span className="material-symbols-outlined text-[18px]">more_horiz</span></button>
              </div>
            })}
          </nav>
        </div>

        <div className="relative border-t border-outline-variant/60 p-3">
          {profileOpen && <ProfileMenu profileName={profileName} usage={usage} onSettings={() => { setProfileOpen(false); setSettingsOpen(true) }} onLogout={() => { for (const key of ['mn-logged-in', 'mn-username', 'mn-user-id', 'mn-session-token']) localStorage.removeItem(key); window.location.href = '/' }} t={t} />}
          <div className="flex items-center gap-2 rounded-xl px-2 py-2">
            <button onClick={() => setProfileOpen((value) => !value)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container text-sm font-bold text-primary"><img src="/smartdolphin.png" alt="" className="h-full w-full object-cover" /></span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-on-surface">{profileName}</span><span className="block text-[11px] text-on-surface-variant">Max · {usage.apiCredit.toFixed(2)} Credit</span></span></button>
            <button onClick={() => setSettingsOpen(true)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary" title={t('chat.settings')}><span className="material-symbols-outlined text-[19px]">settings</span></button>
          </div>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-outline-variant/60 px-4 sm:px-8 lg:px-12">
          <button onClick={() => setSidebarOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary lg:hidden" title={t('chat.openSidebar')}><span className="material-symbols-outlined text-[19px]">menu</span></button>
          <div className="hidden items-center gap-3 text-sm text-on-surface-variant lg:flex"><span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(127,84,69,0.12)]" />{activeChat?.title}</div>
          <div className="ml-auto flex items-center gap-2 text-[11px] text-on-surface-variant"><span className="hidden sm:inline">{t('chat.localMode')}</span><span className="rounded-full border border-primary/30 bg-surface-container-low px-2.5 py-1 text-primary">{t('chat.plan')}</span></div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-8 sm:px-8 lg:px-12">
          <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-7">
            {activeChat?.messages.map((message) => <article key={message.id} className={'group flex gap-3 sm:gap-4 ' + (message.role === 'user' ? 'flex-row-reverse' : '')}>
              <div className={'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-semibold ' + (message.role === 'assistant' ? 'bg-primary-container text-primary' : 'border border-primary/25 bg-secondary-container text-primary')}>{message.role === 'assistant' ? <img src="/smartdolphin.png" alt="" className="h-full w-full object-cover" /> : userInitial}</div>
              <div className="min-w-0 max-w-[calc(100%-3rem)] sm:max-w-[82%]">
                <div className={'rounded-2xl px-4 py-3.5 text-sm leading-6 shadow-[0_12px_28px_rgba(127,84,69,0.08)] ' + (message.role === 'assistant' ? 'rounded-tl-md border border-outline-variant/70 bg-surface text-on-surface' : 'rounded-tr-md border border-primary/20 bg-secondary-container/70 text-on-surface')}>
                  {message.attachmentName && <span className={'mb-2 inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ' + (message.role === 'assistant' ? 'border-outline-variant bg-surface-container-low text-on-surface-variant' : 'border-primary/25 bg-primary/10 text-primary')}><span className="material-symbols-outlined text-[15px]">attach_file</span><span className="truncate">{message.attachmentName}</span></span>}
                  {message.role === 'assistant' ? <AIMessageContent content={message.content} lang={aiLang(lang)} compact /> : <p className="whitespace-pre-wrap">{message.content}</p>}
                </div>
                <div className={'mt-1.5 flex items-center gap-2 px-1 text-[11px] text-on-surface-variant/70 ' + (message.role === 'user' ? 'justify-end' : '')}><span>{formatChatTime(message.timestamp, lang)}</span><button onClick={() => void copyMessage(message)} className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-surface-container hover:text-primary" title={t('chat.copy')}><span className="material-symbols-outlined text-[14px]">{copiedId === message.id ? 'check' : 'content_copy'}</span></button></div>
              </div>
            </article>)}
            {isTyping && <div className="flex gap-4"><div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-container"><img src="/smartdolphin.png" alt="" className="h-full w-full object-cover" /></div><div className="rounded-2xl rounded-tl-md border border-outline-variant bg-surface px-4 py-3.5"><span className="inline-flex gap-1.5"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" /></span></div></div>}
            <div ref={messagesEndRef} />
          </div>
        </section>

        <footer className="shrink-0 bg-background px-4 pb-5 pt-3 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[56rem]">
            <div className="relative overflow-visible rounded-[1.35rem] border border-outline-variant bg-surface shadow-[0_18px_44px_rgba(127,84,69,0.12)] transition-shadow focus-within:border-primary/55 focus-within:shadow-[0_18px_48px_rgba(127,84,69,0.18)]">
              {attachmentName && <div className="mx-4 mt-3 inline-flex max-w-[calc(100%-2rem)] items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1.5 text-xs text-on-surface-variant"><span className="material-symbols-outlined text-[15px] text-primary">attach_file</span><span className="truncate">{attachmentName}</span><button onClick={() => setAttachmentName('')} className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-surface-container hover:text-primary" title={t('chat.removeAttachment')}><span className="material-symbols-outlined text-[14px]">close</span></button></div>}
              <textarea ref={textareaRef} value={input} onChange={(event) => { setInput(event.target.value); resizeTextarea(event.currentTarget) }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() } }} rows={1} placeholder={t('chat.placeholder')} className="min-h-14 w-full resize-none bg-transparent px-5 py-4 text-sm leading-6 text-on-surface outline-none placeholder:text-on-surface-variant/60" />
              <div className="flex flex-wrap items-center gap-2 border-t border-outline-variant/70 px-3 py-3">
                <div className="relative"><button onClick={(event) => { event.stopPropagation(); setPlusOpen((value) => !value); setModelMenuOpen(false); setReasoningMenuOpen(false) }} className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-primary transition-colors hover:border-primary/50 hover:bg-surface-container" title={t('chat.attach')}><span className="material-symbols-outlined text-[20px]">add</span></button>{plusOpen && <div onMouseDown={(event) => event.stopPropagation()} className="absolute bottom-12 left-0 z-20 w-56 overflow-hidden rounded-xl border border-outline-variant bg-surface p-1.5 shadow-[0_18px_36px_rgba(67,43,32,0.16)]"><button onClick={() => { fileRef.current?.click(); setPlusOpen(false) }} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm text-on-surface hover:bg-surface-container-low"><span className="material-symbols-outlined text-[19px] text-primary">attach_file</span><span><span className="block font-semibold">{t('chat.attachFile')}</span><span className="mt-0.5 block text-xs text-on-surface-variant">{t('chat.attachFileDesc')}</span></span></button></div>}</div>
                <input ref={fileRef} onChange={(event) => { const file = event.target.files?.[0]; if (file) setAttachmentName(file.name); event.currentTarget.value = '' }} type="file" className="hidden" />
                <div className="relative"><button onClick={(event) => { event.stopPropagation(); setModelMenuOpen((value) => !value); setPlusOpen(false); setReasoningMenuOpen(false) }} className="inline-flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-transparent px-3 text-xs font-semibold text-on-surface hover:border-primary/50 hover:bg-surface-container-low"><span className="h-2 w-2 rounded-full bg-primary" /><span>{model}</span><span className="material-symbols-outlined text-[16px] text-primary">expand_more</span></button>{modelMenuOpen && <ModelSelector selectedModel={model} onModel={(value) => { setModel(value); setModelMenuOpen(false) }} t={t} />}</div>
                <div className="relative"><button onClick={(event) => { event.stopPropagation(); setReasoningMenuOpen((value) => !value); setPlusOpen(false); setModelMenuOpen(false) }} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant bg-transparent px-3 text-xs font-semibold text-on-surface hover:border-primary/50 hover:bg-surface-container-low"><span>{t('chat.reasoning')} · {t('chat.reasoningOptions.' + reasoning)}</span><span className="material-symbols-outlined text-[16px] text-primary">expand_more</span></button>{reasoningMenuOpen && <ReasoningSelector reasoning={reasoning} onChoose={(value) => { setReasoning(value); setReasoningMenuOpen(false) }} t={t} />}</div>
                <div className="ml-auto"><button onClick={() => sendMessage()} disabled={!input.trim() || isTyping} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-35" title={t('chat.send')}><span className="material-symbols-outlined text-[19px]">arrow_upward</span></button></div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 px-2"><TokenMetric label={t('chat.metrics.input')} value={tokenMetrics.inputTokens.toLocaleString(localeMap[lang])} /><TokenMetric label={t('chat.metrics.output')} value={tokenMetrics.outputTokens.toLocaleString(localeMap[lang])} /><TokenMetric label={t('chat.metrics.cache')} value={tokenMetrics.cacheRate + '%'} /><TokenMetric label={t('chat.metrics.firstToken')} value={tokenMetrics.firstTokenLatency} /></div>
          </div>
        </footer>
      </main>

      {contextMenu && <ChatContextMenu menu={contextMenu} chat={sessions.find((item) => item.id === contextMenu.id)} onPin={togglePin} onRename={requestRename} onDelete={requestDelete} t={t} />}
      {settingsOpen && <SubscriptionDialog usage={usage} resetCredits={resetCredits} onClose={() => setSettingsOpen(false)} onReset={() => setResetConfirmOpen(true)} t={t} />}
      {renameTarget && <RenameDialog value={renameValue} onChange={setRenameValue} onClose={() => setRenameTarget(undefined)} onSave={saveRename} t={t} />}
      {deleteTarget && <DeleteDialog onClose={() => setDeleteTarget(undefined)} onConfirm={confirmDelete} t={t} />}
      {resetConfirmOpen && <ResetConfirmDialog resetCredits={resetCredits} onClose={() => setResetConfirmOpen(false)} onConfirm={resetUsage} t={t} />}
    </div>
  )
}

function TokenMetric({ label, value }: { label: string; value: string }) {
  return <span className="whitespace-nowrap text-[11px] text-on-surface-variant/70"><span className="mr-1 text-on-surface-variant">{label}</span><span className="font-mono text-on-surface">{value}</span></span>
}

function ModelSelector({ selectedModel, onModel, t }: { selectedModel: ModelName; onModel: (model: ModelName) => void; t: (key: string) => any }) {
  return <div onMouseDown={(event) => event.stopPropagation()} className="absolute bottom-12 left-0 z-20 w-72 overflow-hidden rounded-xl border border-outline-variant bg-surface p-1.5 shadow-[0_18px_36px_rgba(67,43,32,0.16)]"><p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">{t('chat.modelSelect')}</p>{models.map((item) => <button key={item} onClick={() => onModel(item)} className={'flex min-h-14 w-full items-center justify-between gap-3 border-b border-outline-variant/50 px-3 py-3 text-left last:border-b-0 ' + (selectedModel === item ? 'bg-primary/10 text-primary' : 'text-on-surface hover:bg-surface-container-low')}><span className="flex min-w-0 items-center gap-3"><span className={'flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold ' + (selectedModel === item ? 'bg-primary text-white' : 'bg-surface-container-high text-primary')}>{item.slice(0, 1)}</span><span className="min-w-0"><span className="block text-sm font-semibold">{item}</span><span className="mt-0.5 block truncate text-xs text-on-surface-variant">{t('chat.modelDescriptions.' + item)}</span></span></span>{selectedModel === item && <span className="material-symbols-outlined text-[17px] text-primary">check</span>}</button>)}</div>
}

function ReasoningSelector({ reasoning, onChoose, t }: { reasoning: ReasoningMode; onChoose: (mode: ReasoningMode) => void; t: (key: string) => any }) {
  return <div onMouseDown={(event) => event.stopPropagation()} className="absolute bottom-12 left-0 z-20 w-72 overflow-hidden rounded-xl border border-outline-variant bg-surface p-1.5 shadow-[0_18px_36px_rgba(67,43,32,0.16)]"><p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">{t('chat.reasoningSelect')}</p>{reasoningModes.map((item) => <button key={item} onClick={() => onChoose(item)} className={'flex min-h-14 w-full items-center justify-between gap-3 border-b border-outline-variant/50 px-3 py-3 text-left last:border-b-0 ' + (reasoning === item ? 'bg-primary/10 text-primary' : 'text-on-surface hover:bg-surface-container-low')}><span><span className="block text-sm font-semibold">{t('chat.reasoningOptions.' + item)}</span><span className="mt-0.5 block text-xs text-on-surface-variant">{t('chat.reasoningDescriptions.' + item)}</span></span>{reasoning === item && <span className="material-symbols-outlined text-[17px] text-primary">check</span>}</button>)}</div>
}

function ChatContextMenu({ menu, chat, onPin, onRename, onDelete, t }: { menu: ContextMenuState; chat?: ChatSession; onPin: (chat: ChatSession) => void; onRename: (chat: ChatSession) => void; onDelete: (chat: ChatSession) => void; t: (key: string) => any }) {
  if (!chat) return null
  return <div onMouseDown={(event) => event.stopPropagation()} style={{ left: menu.x, top: menu.y }} className="fixed z-[60] w-52 overflow-hidden rounded-xl border border-outline-variant bg-surface p-1.5 shadow-[0_18px_36px_rgba(67,43,32,0.16)]"><button onClick={() => onPin(chat)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px] text-primary">push_pin</span>{chat.pinned ? t('chat.unpin') : t('chat.pin')}</button><button onClick={() => onRename(chat)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px] text-primary">edit</span>{t('chat.rename')}</button><div className="my-1 border-t border-outline-variant/70" /><button onClick={() => onDelete(chat)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"><span className="material-symbols-outlined text-[18px]">delete</span>{t('chat.delete')}</button></div>
}

function ProfileMenu({ profileName, usage, onSettings, onLogout, t }: { profileName: string; usage: UsageState; onSettings: () => void; onLogout: () => void; t: (key: string) => any }) {
  return <div onMouseDown={(event) => event.stopPropagation()} className="absolute bottom-[4.8rem] left-3 z-40 w-72 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-[0_18px_36px_rgba(67,43,32,0.16)]"><div className="flex items-center gap-3 border-b border-outline-variant/70 p-4"><span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-container"><img src="/smartdolphin.png" alt="" className="h-full w-full object-cover" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-on-surface">{profileName}</p><p className="text-xs text-on-surface-variant">Max</p></div></div><div className="p-2"><div className="mb-1 rounded-lg bg-surface-container-low px-3 py-3"><div className="flex items-center justify-between gap-3 text-sm"><span className="text-on-surface-variant">{t('chat.currentBalance')}</span><span className="font-mono font-semibold text-primary">{usage.apiCredit.toFixed(2)} Credit</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-container-high"><div className="h-full w-[72%] rounded-full bg-primary" /></div></div><button onClick={onSettings} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px] text-primary">settings</span>{t('chat.subscriptionAndUsage')}</button></div><div className="border-t border-outline-variant/70 p-2"><button onClick={onLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"><span className="material-symbols-outlined text-[18px]">logout</span>{t('chat.logout')}</button></div></div>
}

function ModalShell({ title, children, onClose, t }: { title: string; children: ReactNode; onClose: () => void; t: (key: string) => any }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d2b24]/25 p-4" role="presentation" onMouseDown={onClose}><section role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-5 text-on-surface shadow-[0_24px_64px_rgba(67,43,32,0.22)]"><div className="flex items-center justify-between gap-4"><h2 className="text-base font-semibold text-primary">{title}</h2><button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-primary" title={t('chat.close')}><span className="material-symbols-outlined text-[19px]">close</span></button></div>{children}</section></div>
}

function SubscriptionDialog({ usage, resetCredits, onClose, onReset, t }: { usage: UsageState; resetCredits: number; onClose: () => void; onReset: () => void; t: (key: string) => any }) {
  return <ModalShell title={t('chat.subscriptionAndUsage')} onClose={onClose} t={t}><div className="mt-5 rounded-xl border border-outline-variant bg-surface-container-low p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-on-surface-variant">{t('chat.currentSubscription')}</p><p className="mt-1 text-2xl font-semibold text-primary">Max</p><p className="mt-1 text-xs text-on-surface-variant">{t('chat.subscriptionDescription')}</p></div><span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{t('chat.active')}</span></div><div className="mt-5 flex items-end justify-between gap-3"><span className="text-sm text-on-surface-variant">{t('chat.currentBalance')}</span><strong className="font-mono text-xl text-primary">{usage.apiCredit.toFixed(2)} <span className="text-xs font-normal text-on-surface-variant">Credit</span></strong></div></div><div className="mt-5 space-y-5"><UsageBar label={t('chat.fiveHourLimit')} value={usage.fiveHour} reset={t('chat.resetsInFiveHours')} t={t} /><UsageBar label={t('chat.sevenDayLimit')} value={usage.sevenDay} reset={t('chat.resetsInSevenDays')} t={t} /></div><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/70 pt-4"><p className="text-xs text-on-surface-variant">{t('chat.resetCredits')}: {resetCredits}</p><button onClick={onReset} disabled={resetCredits <= 0} className="inline-flex items-center gap-2 rounded-lg border border-primary/45 px-3.5 py-2 text-sm font-semibold text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"><span className="material-symbols-outlined text-[17px]">refresh</span>{t('chat.resetUsage')}</button></div></ModalShell>
}

function UsageBar({ label, value, reset, t }: { label: string; value: number; reset: string; t: (key: string) => any }) {
  return <div><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-on-surface">{label}</p><p className="mt-1 text-xs text-on-surface-variant">{reset}</p></div><span className="text-sm font-semibold text-primary">{value}% {t('chat.used')}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: Math.max(0, Math.min(100, value)) + '%' }} /></div><div className="mt-1 flex justify-between text-[10px] text-on-surface-variant/70"><span>0%</span><span>100%</span></div></div>
}

function RenameDialog({ value, onChange, onClose, onSave, t }: { value: string; onChange: (value: string) => void; onClose: () => void; onSave: () => void; t: (key: string) => any }) {
  return <ModalShell title={t('chat.renameTitle')} onClose={onClose} t={t}><div className="mt-5"><label className="text-xs font-semibold text-on-surface-variant" htmlFor="chat-rename">{t('chat.chatTitle')}</label><input id="chat-rename" autoFocus value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onSave() }} className="mt-2 h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary" /></div><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low">{t('chat.cancel')}</button><button onClick={onSave} disabled={!value.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">{t('chat.save')}</button></div></ModalShell>
}

function DeleteDialog({ onClose, onConfirm, t }: { onClose: () => void; onConfirm: () => void; t: (key: string) => any }) {
  return <ModalShell title={t('chat.deleteTitle')} onClose={onClose} t={t}><p className="mt-4 text-sm leading-6 text-on-surface-variant">{t('chat.deleteDescription')}</p><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low">{t('chat.cancel')}</button><button onClick={onConfirm} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">{t('chat.confirmDelete')}</button></div></ModalShell>
}

function ResetConfirmDialog({ resetCredits, onClose, onConfirm, t }: { resetCredits: number; onClose: () => void; onConfirm: () => void; t: (key: string) => any }) {
  return <ModalShell title={t('chat.confirmResetTitle')} onClose={onClose} t={t}><p className="mt-4 text-sm leading-6 text-on-surface-variant">{t('chat.confirmResetDescription')} {resetCredits}.</p><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low">{t('chat.cancel')}</button><button onClick={onConfirm} disabled={resetCredits <= 0} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">{t('chat.confirmReset')}</button></div></ModalShell>
}
