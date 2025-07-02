import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { petActivityStore } from '../lib/pet/petActivity'
import type { PanelRect } from '../lib/pet/petDirector'

type ChatRole = 'assistant' | 'user'

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  timestamp: string
}

function localReply(prompt: string): string {
  const lower = prompt.toLowerCase()
  if (/code|typescript|react|css|tailwind|bug|debug/.test(lower)) {
    return 'Sure — separate layout, state, and style boundaries first, then extract reusable pieces.\n\n(This floating chat is a local preview; conversations stay in your browser.)'
  }
  if (/hi|hello|hey|你好/.test(lower)) {
    return 'Hi! I\'m ModelNex. Ask me about API pricing, models, or how to integrate.'
  }
  if (/pricing|price|cost|credit|价格/.test(lower)) {
    return 'Pricing is usage-based: pay per token across Core / Reason / Fast models. Check the Pricing page for current rates.'
  }
  return 'Got it: “' + prompt.slice(0, 120) + '”.\n\nThis is the floating preview chat (frontend-only, local to your browser).'
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi, I\'m ModelNex. Ask me about models, pricing, or integration.',
  timestamp: new Date().toISOString(),
}

const MIN_W = 280
const MIN_H = 320
/** 输入框最大高度：约 3 行，超过则内部滚动，不会一直长高。 */
const MAX_TA = 72

interface Edges {
  t?: boolean
  r?: boolean
  b?: boolean
  l?: boolean
}

/** 把几何约束在视口内。 */
function clampGeom(g: PanelRect): PanelRect {
  const vw = window.innerWidth
  const vh = window.innerHeight
  let { x, y, w, h } = g
  w = Math.max(MIN_W, Math.min(w, vw - 16))
  h = Math.max(MIN_H, Math.min(h, vh - 16))
  x = Math.max(8, Math.min(x, vw - w - 8))
  y = Math.max(8, Math.min(y, vh - h - 8))
  return { x, y, w, h }
}

/** 右下角弹出的轻量聊天浮层：可拖动、八向缩放（本地预览，不跳转页面）。 */
export default function PetChatPanel({
  geom,
  onGeomChange,
  onClose,
}: {
  geom: PanelRect
  onGeomChange: (g: PanelRect) => void
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  /** 拖动/缩放起始状态。 */
  const interact = useRef<{
    sx: number
    sy: number
    g: PanelRect
    edges?: Edges
  } | null>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    inputRef.current?.focus()
    return () => petActivityStore.set('idle')
  }, [])

  function send() {
    const text = input.trim()
    if (!text || isTyping) return
    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    petActivityStore.set('thinking')
    setIsTyping(true)
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: 'a-' + Date.now(), role: 'assistant', content: localReply(text), timestamp: new Date().toISOString() },
      ])
      setIsTyping(false)
      petActivityStore.set('idle')
    }, 600)
  }

  /** 标题栏拖动。 */
  const drag = {
    onPointerDown: (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return
      e.preventDefault()
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      interact.current = { sx: e.clientX, sy: e.clientY, g: geom }
    },
    onPointerMove: (e: React.PointerEvent) => {
      const it = interact.current
      if (!it || it.edges) return
      onGeomChange(
        clampGeom({
          ...it.g,
          x: it.g.x + e.clientX - it.sx,
          y: it.g.y + e.clientY - it.sy,
        }),
      )
    },
    onPointerUp: () => {
      interact.current = null
    },
  }

  /** 某个方向的缩放手柄。 */
  const resize = (edges: Edges) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      interact.current = { sx: e.clientX, sy: e.clientY, g: geom, edges }
    },
    onPointerMove: (e: React.PointerEvent) => {
      const it = interact.current
      if (!it?.edges) return
      const dx = e.clientX - it.sx
      const dy = e.clientY - it.sy
      let { x, y, w, h } = it.g
      if (it.edges.l) {
        x = it.g.x + dx
        w = it.g.w - dx
      }
      if (it.edges.r) w = it.g.w + dx
      if (it.edges.t) {
        y = it.g.y + dy
        h = it.g.h - dy
      }
      if (it.edges.b) h = it.g.h + dy
      if (w < MIN_W && it.edges.l) x -= MIN_W - w
      if (h < MIN_H && it.edges.t) y -= MIN_H - h
      onGeomChange(clampGeom({ x, y, w, h }))
    },
    onPointerUp: () => {
      interact.current = null
    },
  })

  /** 文本变化：更新值 + 自动增高 + 同步打字状态。 */
  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const ta = e.target
    setInput(ta.value)
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, MAX_TA) + 'px'
    petActivityStore.set(ta.value ? 'typing' : 'idle')
  }

  return (
    <div
      className="fixed z-[95] flex flex-col overflow-hidden rounded-2xl border border-outline-variant/80 bg-surface shadow-[0_24px_64px_rgba(67,43,32,0.28)]"
      style={{ left: geom.x, top: geom.y, width: geom.w, height: geom.h }}
    >
      <style>{`
        .panel-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .panel-scroll::-webkit-scrollbar { width: 0; height: 0; display: none; }
      `}</style>

      {/* header（拖动区） */}
      <div
        {...drag}
        className="flex shrink-0 cursor-grab touch-none items-center gap-2.5 border-b border-outline-variant/60 px-4 py-3 active:cursor-grabbing"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">M</span>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">ModelNex Assistant</p>
        <button onClick={() => navigate('/chat')} aria-label="Open full chat" title="打开完整聊天" className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary">
          <span className="material-symbols-outlined text-[18px]">open_in_full</span>
        </button>
        <button onClick={onClose} aria-label="Close chat" className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* messages（滚动但不显示滚动条） */}
      <div ref={listRef} className="panel-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-tr-md border border-primary/20 bg-primary px-3.5 py-2.5 text-sm leading-6 text-white shadow-[0_8px_20px_rgba(127,84,69,0.08)]">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">M</div>
              <div className="max-w-[78%] whitespace-pre-wrap rounded-2xl rounded-tl-md border border-outline-variant/70 bg-background px-3.5 py-2.5 text-sm leading-6 text-on-surface shadow-[0_8px_20px_rgba(127,84,69,0.08)]">
                {m.content}
              </div>
            </div>
          ),
        )}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">M</div>
            <div className="rounded-2xl rounded-tl-md border border-outline-variant bg-surface px-3.5 py-3">
              <span className="inline-flex gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* input（无顶部分隔线，更紧凑；超 2 行才适度增高） */}
      <div className="shrink-0 px-3 pb-3 pt-1">
        <div className="flex items-end gap-2 rounded-xl border border-outline-variant bg-background px-2.5 py-1.5 transition-colors focus-within:border-primary/60">
          <textarea
            ref={inputRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            rows={1}
            placeholder="Ask ModelNex…"
            className="max-h-[72px] min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-6 text-on-surface outline-none placeholder:text-on-surface-variant/60"
          />
          <button onClick={send} disabled={!input.trim() || isTyping} aria-label="Send" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105 disabled:opacity-30">
            <span className="material-symbols-outlined text-[17px]">arrow_upward</span>
          </button>
        </div>
      </div>

      {/* 八向缩放手柄 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <span {...resize({ t: true })} className="pointer-events-auto absolute left-2 right-2 top-0 h-1.5 cursor-ns-resize touch-none" />
        <span {...resize({ b: true })} className="pointer-events-auto absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize touch-none" />
        <span {...resize({ l: true })} className="pointer-events-auto absolute bottom-2 left-0 top-2 w-1.5 cursor-ew-resize touch-none" />
        <span {...resize({ r: true })} className="pointer-events-auto absolute bottom-2 right-0 top-2 w-1.5 cursor-ew-resize touch-none" />
        <span {...resize({ t: true, l: true })} className="pointer-events-auto absolute left-0 top-0 h-3 w-3 cursor-nwse-resize touch-none" />
        <span {...resize({ t: true, r: true })} className="pointer-events-auto absolute right-0 top-0 h-3 w-3 cursor-nesw-resize touch-none" />
        <span {...resize({ b: true, l: true })} className="pointer-events-auto absolute bottom-0 left-0 h-3 w-3 cursor-nesw-resize touch-none" />
        <span {...resize({ b: true, r: true })} className="pointer-events-auto absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize touch-none" />
      </div>
    </div>
  )
}
