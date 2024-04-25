/**
 * 用户「在场 / 离开」监测（模块级单例）。
 *
 * 全局监听指针与键盘，记录最后一次输入时间和指针位置：
 * - 最近有输入  -> 用户在场（active），桌宠聚到角落、眼睛跟随鼠标；
 * - 一段时间无输入 -> 用户离开（away），桌宠开始满屏乱跑 / 围绕面板调皮。
 *
 * 纯逻辑 + 一个 `initPresence()` 负责挂 DOM 监听，规则可在无 DOM 下测试。
 */

export interface Pointer {
  x: number
  y: number
}

/** 超过该秒数没有任何指针/键盘输入，判定用户离开。 */
export const IDLE_AFTER = 9

const nowSec = (): number => performance.now() / 1000

let pointer: Pointer | null = null
let inside = true
let lastInputAt = nowSec()

function mark(x: number, y: number): void {
  pointer = { x, y }
  inside = true
  lastInputAt = nowSec()
}

function markKey(): void {
  lastInputAt = nowSec()
}

/**
 * 挂载全局输入监听。
 * @returns 取消挂载函数。
 */
export function initPresence(): () => void {
  const onMove = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return
    mark(e.clientX, e.clientY)
  }
  const onDown = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return
    mark(e.clientX, e.clientY)
  }
  const onKey = (): void => markKey()
  const onLeave = (): void => {
    inside = false
    pointer = null
  }
  const onEnter = (): void => {
    inside = true
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerdown', onDown)
  window.addEventListener('keydown', onKey)
  document.addEventListener('pointerleave', onLeave)
  document.addEventListener('pointerenter', onEnter)

  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerdown', onDown)
    window.removeEventListener('keydown', onKey)
    document.removeEventListener('pointerleave', onLeave)
    document.removeEventListener('pointerenter', onEnter)
  }
}

export const presence = {
  /** 最新指针位置；指针离开文档时为 null。 */
  get pointer(): Pointer | null {
    return pointer
  },

  /** 指针是否在文档内。 */
  get isInside(): boolean {
    return inside
  },

  /** 距上次输入的秒数。 */
  idleFor(at: number = nowSec()): number {
    return Math.max(0, at - lastInputAt)
  },

  /** 用户当前是否在场（最近有输入）。 */
  isActive(at: number = nowSec()): boolean {
    return this.idleFor(at) < IDLE_AFTER
  },
}
