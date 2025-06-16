import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import BloubBot from './BloubBot'
import PetChatPanel from './PetChatPanel'
import { initPresence, presence } from '../lib/pet/presence'
import { petActivityStore } from '../lib/pet/petActivity'
import { PetDirector, type GazeMode, type PanelRect, type PetAccessory } from '../lib/pet/petDirector'
import type { StateId } from '../lib/bloub/bot/states'

const PET_SIZE = 128

interface Point {
  x: number
  y: number
}

/** 面板默认几何：右下角，距底 128、距右 20。 */
function defaultGeom(): PanelRect {
  const w = Math.min(360, window.innerWidth - 40)
  const h = Math.min(500, window.innerHeight - 140)
  const x = window.innerWidth - w - 20
  const y = Math.max(8, window.innerHeight - h - 128)
  return { x, y, w, h }
}

/**
 * 全局桌宠：bloub 团子（x.ai 风格）。
 *
 * 行为全部由 `PetDirector` 决策（角落待命 / 满屏乱跑 / 围绕聊天窗 /
 * 打字思考），本组件负责：初始化在场监测、跑 rAF 把导演给出的位置直接
 * 应用到浮层、处理拖拽与点击、挂载可拖动缩放的聊天窗。
 */
export default function ChatPet() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [geom, setGeom] = useState<PanelRect>(defaultGeom)
  const [face, setFace] = useState<{ state: StateId; gaze: GazeMode; accessory: PetAccessory }>({
    state: 'idle',
    gaze: 'mouse',
    accessory: null,
  })

  const wrapRef = useRef<HTMLDivElement>(null)
  const directorRef = useRef<PetDirector | null>(null)
  if (!directorRef.current) directorRef.current = new PetDirector(PET_SIZE)

  // 最新值供 rAF 读取，避免重复订阅。
  const openRef = useRef(open)
  openRef.current = open
  const geomRef = useRef(geom)
  geomRef.current = geom
  const draggingRef = useRef(false)
  const dragPointer = useRef<{
    pointerId: number
    startX: number
    startY: number
    offsetX: number
    offsetY: number
    moved: boolean
  } | null>(null)

  // 初始化用户在场监测（一次）。
  useEffect(() => initPresence(), [])

  // 行为导演 rAF：位置直接写 DOM，状态/视线变化才触发 React 渲染。
  useEffect(() => {
    const el = wrapRef.current
    const director = directorRef.current!
    let raf = 0
    let last = performance.now() / 1000
    let prevState: StateId | null = null
    let prevGaze: GazeMode | null = null
    let prevAccessory: PetAccessory = null

    const tick = (ms: number) => {
      raf = requestAnimationFrame(tick)
      const now = ms / 1000
      const dt = Math.min(0.05, Math.max(0, now - last))
      last = now

      const out = director.update({
        now,
        dt,
        viewport: { w: window.innerWidth, h: window.innerHeight },
        active: presence.isActive(now),
        pointer: presence.pointer,
        activity: petActivityStore.current,
        panel: openRef.current ? geomRef.current : null,
        dragging: draggingRef.current,
      })

      if (el) {
        el.style.left = out.x + 'px'
        el.style.top = out.y + 'px'
      }
      if (out.state !== prevState || out.gaze !== prevGaze || out.accessory !== prevAccessory) {
        prevState = out.state
        prevGaze = out.gaze
        prevAccessory = out.accessory
        setFace({ state: out.state, gaze: out.gaze, accessory: out.accessory })
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // 窗口尺寸变化：约束面板几何，并让导演重新选位。
  useEffect(() => {
    const onResize = () => {
      setGeom((g) => {
        const clamped: PanelRect = {
          ...g,
          x: Math.min(g.x, window.innerWidth - g.w - 8),
          y: Math.min(g.y, window.innerHeight - g.h - 8),
        }
        return clamped
      })
      directorRef.current?.endDrag()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 拖拽 + 点击（指针事件挂在团子浮层）。
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const onDown = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      dragPointer.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        moved: false,
      }
      el.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      const d = dragPointer.current
      if (!d) return
      if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) {
        d.moved = true
        draggingRef.current = true
      }
      if (d.moved) {
        const next: Point = {
          x: Math.max(0, Math.min(window.innerWidth - PET_SIZE, e.clientX - d.offsetX)),
          y: Math.max(0, Math.min(window.innerHeight - PET_SIZE, e.clientY - d.offsetY)),
        }
        directorRef.current?.dragTo(next.x, next.y)
      }
    }
    const onUp = (e: PointerEvent) => {
      const d = dragPointer.current
      dragPointer.current = null
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      if (d?.moved) {
        draggingRef.current = false
        directorRef.current?.endDrag()
      } else if (pathname !== '/chat') {
        // /chat 页已是完整聊天界面，点击不再弹浮层
        setOpen((v) => !v)
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [pathname])

  return (
    <>
      <style>{`
        .pet-wrap { cursor: grab; touch-action: none; user-select: none;
          filter: drop-shadow(0 10px 18px rgba(90,58,44,0.35)); }
        .pet-wrap:active { cursor: grabbing; }
      `}</style>
      <div
        ref={wrapRef}
        className="pet-wrap fixed left-0 top-0 z-[97]"
        style={{ width: PET_SIZE, height: PET_SIZE }}
        role="button"
        aria-label="Chat with ModelNex"
        title="拖拽移动 · 点击聊天"
      >
        <BloubBot size={PET_SIZE} color="brun" paper="#fff8f3" state={face.state} gaze={face.gaze} accessory={face.accessory} />
      </div>
      {open && (
        <PetChatPanel geom={geom} onGeomChange={setGeom} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
