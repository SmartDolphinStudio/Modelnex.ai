import type { PetActivity } from './petActivity'
import type { Pointer } from './presence'
import { STATE_BY_ID, type StateId } from '../bloub/bot/states'

/** 视线模式（交给 BloubBot 渲染层）。 */
export type GazeMode = 'mouse' | 'watchdown' | 'off'

/** 手持小配件（渲染层叠加在团子身上）。 */
export type PetAccessory = 'brush' | null

/** 轴对齐矩形，同时用于聊天窗几何与避让计算。 */
export interface PanelRect {
  x: number
  y: number
  w: number
  h: number
}

export interface DirectorCtx {
  now: number
  dt: number
  viewport: { w: number; h: number }
  active: boolean
  pointer: Pointer | null
  activity: PetActivity
  panel: PanelRect | null
  dragging: boolean
}

export interface DirectorOutput {
  x: number
  y: number
  state: StateId
  gaze: GazeMode
  accessory: PetAccessory
}

type Mode = 'corner' | 'roam' | 'panelWatch' | 'panelRoam' | 'placed'

const MARGIN = 16
/** 用户手动拖动后，团子在落点停留的秒数区间。 */
const PLACED_DWELL_MIN = 26
const PLACED_DWELL_MAX = 42
const rand = (min: number, max: number): number => min + Math.random() * (max - min)
const clampN = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v))

/** 仍保留「可转动眼睛」的状态：这些状态下眼睛可以继续跟随鼠标。 */
const EYE_STATES: ReadonlySet<StateId> = new Set<StateId>([
  'idle',
  'wink',
  'wide',
  'alert',
  'notify',
  'play',
])

/**
 * 桌宠行为导演：每帧根据「用户在场/离开、聊天活动、面板位置」决定团子
 * 去哪里（位置在内部平滑插值）、呈现哪个引擎状态、拿什么配件。
 *
 * - corner     用户在场、无面板：聚到最近的角落，偶尔小动作，眼睛跟随鼠标；
 * - roam       用户离开：满屏乱跑，绕开聊天窗；
 * - panelWatch 面板打开且用户在场：停在面板旁看对话，并定期跑进来吸引注意；
 * - panelRoam  面板打开但用户离开：在面板上/下/里/侧调皮地串门；
 * - placed     用户手动把它放到某处：在落点安静待一段时间，再恢复自动行为。
 */
export class PetDirector {
  private readonly pet: number
  private x: number
  private y: number
  private mode: Mode | null = null
  private goal: { x: number; y: number }
  private holdUntil = 0
  private dwellFace: StateId = 'idle'
  private state: StateId = 'idle'
  private stateUntil = 0
  private activityStartedAt = 0
  private prevActivity: PetActivity = 'idle'

  // 手动摆放
  private placedUntil = 0

  // 长时间对话时的「吸引注意」
  private attentionUntil = 0
  private nextAttentionAt = 0
  private attentionSpot: { x: number; y: number } = { x: 0, y: 0 }

  constructor(pet: number) {
    this.pet = pet
    this.x = window.innerWidth - pet - MARGIN
    this.y = window.innerHeight - pet - MARGIN
    this.goal = { x: this.x, y: this.y }
  }

  /** 当前渲染位置（供外部读取）。 */
  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y }
  }

  /** 被拖动：直接落到指针位置，打断任何目标。 */
  dragTo(x: number, y: number): void {
    this.x = x
    this.y = y
    this.goal = { x, y }
    this.holdUntil = 0
    this.mode = null
  }

  /** 结束拖动：进入「手动摆放」状态，在落点停留一段时间。 */
  endDrag(): void {
    this.mode = null
    this.holdUntil = 0
    this.placedUntil = performance.now() / 1000 + rand(PLACED_DWELL_MIN, PLACED_DWELL_MAX)
    this.attentionUntil = 0
    this.nextAttentionAt = 0
  }

  /* ------------------------------------------------------------- 目标选择 */

  private corners(vw: number, vh: number): Array<{ x: number; y: number }> {
    const p = this.pet
    // 顶部角落需让开固定的站点头部（约 64px 高）。
    const top = 76
    return [
      { x: MARGIN, y: top },
      { x: vw - p - MARGIN, y: top },
      { x: MARGIN, y: vh - p - MARGIN },
      { x: vw - p - MARGIN, y: vh - p - MARGIN },
    ]
  }

  private nearestCorner(vw: number, vh: number): { x: number; y: number } {
    return this.corners(vw, vh)
      .map((c) => ({ c, d: Math.hypot(c.x - this.x, c.y - this.y) }))
      .sort((a, b) => a.d - b.d)[0]!.c
  }

  /** 面板上方居中；上方放不下则退到左/右/下。 */
  private watchAnchor(panel: PanelRect, vw: number, vh: number): { x: number; y: number } {
    const p = this.pet
    const cx = clampN(panel.x + panel.w / 2 - p / 2, MARGIN, vw - p - MARGIN)
    if (panel.y - p - 12 >= MARGIN) return { x: cx, y: panel.y - p - 12 }
    if (panel.x - p - 12 >= MARGIN) return { x: panel.x - p - 12, y: panel.y + 8 }
    if (panel.x + panel.w + 12 + p <= vw - MARGIN) return { x: panel.x + panel.w + 12, y: panel.y + 8 }
    if (panel.y + panel.h + 12 + p <= vh - MARGIN) return { x: cx, y: panel.y + panel.h + 12 }
    return { x: cx, y: MARGIN }
  }

  /** 围绕面板的候选停靠点（上/下/左/右/内部顶边）。 */
  private panelSpots(panel: PanelRect, vw: number, vh: number): Array<{ x: number; y: number }> {
    const p = this.pet
    const spots: Array<{ x: number; y: number }> = []
    const push = (x: number, y: number): void => {
      if (x >= MARGIN && y >= MARGIN && x + p <= vw - MARGIN && y + p <= vh - MARGIN) {
        spots.push({ x, y })
      }
    }
    push(panel.x + panel.w / 2 - p / 2, panel.y - p - 12) // 上面
    push(panel.x + panel.w / 2 - p / 2, panel.y + panel.h + 12) // 下面
    push(panel.x - p - 12, panel.y + panel.h / 2 - p / 2) // 左侧
    push(panel.x + panel.w + 12, panel.y + panel.h / 2 - p / 2) // 右侧
    push(panel.x + 10, panel.y + 8) // 钻进顶部内边
    push(panel.x + panel.w - p - 10, panel.y + 8) // 顶部内边另一侧
    return spots
  }

  /**
   * 「吸引注意」的落点：跑进面板上三分之一居中处（避开底部输入框），
   * 短暂露脸后再退回。
   */
  private attentionWaypoint(panel: PanelRect, vw: number, vh: number): { x: number; y: number } {
    const p = this.pet
    const x = clampN(panel.x + panel.w / 2 - p / 2, MARGIN, vw - p - MARGIN)
    const y = clampN(panel.y + panel.h * 0.3 - p / 2, panel.y + 8, panel.y + panel.h - p - 76)
    return { x, y }
  }

  /** 满屏随机路点，通过拒绝采样避开聊天窗。 */
  private roamWaypoint(panel: PanelRect | null, vw: number, vh: number): { x: number; y: number } {
    for (let i = 0; i < 24; i++) {
      const x = rand(MARGIN, vw - this.pet - MARGIN)
      const y = rand(MARGIN, vh - this.pet - MARGIN)
      if (panel && this.hit(x, y, this.pet, panel, 28)) continue
      return { x, y }
    }
    return { x: MARGIN, y: MARGIN }
  }

  private hit(x: number, y: number, p: number, r: PanelRect, pad: number): boolean {
    return (
      x < r.x + r.w + pad &&
      x + p > r.x - pad &&
      y < r.y + r.h + pad &&
      y + p > r.y - pad
    )
  }

  private pickGoal(mode: Mode, ctx: DirectorCtx): { x: number; y: number } {
    const { w, h } = ctx.viewport
    if (mode === 'corner') return this.nearestCorner(w, h)
    if (mode === 'placed') return this.goal
    if (mode === 'panelWatch') return this.watchAnchor(ctx.panel!, w, h)
    if (mode === 'panelRoam') {
      const spots = this.panelSpots(ctx.panel!, w, h)
      return spots[Math.floor(rand(0, spots.length))] ?? this.watchAnchor(ctx.panel!, w, h)
    }
    return this.roamWaypoint(ctx.panel, w, h)
  }

  /* ------------------------------------------------------------- 状态选择 */

  private commitState(next: StateId, now: number, force = false): void {
    if (!force && next !== 'idle' && now < this.stateUntil) return
    if (next === this.state) return
    this.state = next
    const def = STATE_BY_ID.get(next)
    this.stateUntil = next === 'idle' ? now : now + (def?.duration ?? 1.5)
  }

  /**
   * 聊天活动对应的「脸 + 配件」；无活动返回 null。
   * - 用户打字 -> 拿毛笔（写字）；
   * - 助手思考 / 回复输出 -> 三个点思考；
   * - 检索 -> 睁大眼。
   */
  private activityOutcome(
    activity: PetActivity,
  ): { face: StateId; accessory: PetAccessory } | null {
    switch (activity) {
      case 'thinking':
      case 'writing':
        return { face: 'thinking', accessory: null }
      case 'searching':
        return { face: 'wide', accessory: null }
      case 'typing':
        return { face: 'idle', accessory: 'brush' }
      default:
        return null
    }
  }

  /** 停留时的表情：以 idle 为主，按概率给小动作。 */
  private rollDwellFace(mode: Mode): StateId {
    if (mode === 'panelWatch') return 'idle'
    const playful = ['wink', 'wide', 'play', 'alert', 'notify'] as const
    if (mode === 'corner' || mode === 'placed') {
      return Math.random() < 0.26 ? playful[Math.floor(rand(0, 2))]! : 'idle'
    }
    const r = Math.random()
    if (r < 0.32) return 'idle'
    if (r < 0.6) return playful[Math.floor(rand(0, 2))]!
    return playful[Math.floor(rand(2, playful.length))]!
  }

  private dwellTime(mode: Mode): number {
    switch (mode) {
      case 'corner':
      case 'placed':
        return rand(5, 11)
      case 'panelWatch':
        return rand(12, 22)
      case 'panelRoam':
        return rand(1.6, 3.4)
      default:
        return rand(1.2, 2.6)
    }
  }

  private gazeFor(face: StateId, mode: Mode, ctx: DirectorCtx): GazeMode {
    if (!EYE_STATES.has(face)) return 'off'
    if (ctx.active && ctx.pointer) return 'mouse'
    if (mode === 'panelWatch') return 'watchdown'
    return 'off'
  }

  private modeFor(ctx: DirectorCtx): Mode {
    if (ctx.now < this.placedUntil) return 'placed'
    if (ctx.panel) {
      return ctx.active || ctx.activity !== 'idle' ? 'panelWatch' : 'panelRoam'
    }
    return ctx.active ? 'corner' : 'roam'
  }

  /* ----------------------------------------------------------------- 主循环 */

  update(ctx: DirectorCtx): DirectorOutput {
    const { now } = ctx
    if (ctx.activity !== this.prevActivity) {
      this.activityStartedAt = now
      this.prevActivity = ctx.activity
    }

    if (ctx.dragging) {
      this.mode = null
      this.commitState('orbit', now, true)
      return { x: this.x, y: this.y, state: this.state, gaze: 'off', accessory: null }
    }

    const mode = this.modeFor(ctx)
    if (mode !== this.mode) {
      this.mode = mode
      this.goal = this.pickGoal(mode, ctx)
      this.holdUntil = 0
    }

    // panelWatch：管理「吸引注意」的计时与目标（仅在空闲、用户在场时）。
    let attentionActive = false
    if (mode === 'panelWatch' && ctx.panel) {
      if (now < this.attentionUntil) {
        attentionActive = true
        this.goal = this.attentionSpot
      } else {
        if (this.nextAttentionAt === 0) {
          this.nextAttentionAt = now + rand(16, 26)
        } else if (now >= this.nextAttentionAt && ctx.activity === 'idle') {
          this.attentionSpot = this.attentionWaypoint(ctx.panel, ctx.viewport.w, ctx.viewport.h)
          this.attentionUntil = now + rand(1.8, 2.8)
          this.nextAttentionAt = now + rand(26, 40)
          this.holdUntil = 0
        }
        if (!attentionActive) this.goal = this.watchAnchor(ctx.panel, ctx.viewport.w, ctx.viewport.h)
      }
    }

    const dist = Math.hypot(this.goal.x - this.x, this.goal.y - this.y)
    let moving = false
    if (dist > 5) {
      moving = true
      const rate = mode === 'corner' || mode === 'panelWatch' || mode === 'placed' ? 3.0 : 4.4
      const k = 1 - Math.exp(-rate * ctx.dt)
      this.x += (this.goal.x - this.x) * k
      this.y += (this.goal.y - this.y) * k
    } else {
      this.x = this.goal.x
      this.y = this.goal.y
      if (this.holdUntil === 0) {
        // 刚到达：安排停留并抽取停留表情
        this.holdUntil = now + this.dwellTime(mode)
        this.dwellFace = this.rollDwellFace(mode)
      } else if (now >= this.holdUntil) {
        if (mode === 'placed') {
          this.holdUntil = 0 // 仍在摆放期：原地换表情
        } else {
          this.goal = this.pickGoal(mode, ctx)
          this.holdUntil = 0
        }
      }
    }

    // 决定脸/配件/视线：聊天活动优先，其次吸引注意，最后按移动/停留取。
    const act = this.activityOutcome(ctx.activity)
    let face: StateId
    let gaze: GazeMode
    let accessory: PetAccessory = null
    if (act) {
      face = act.face
      accessory = act.accessory
      this.commitState(face, now, true)
      gaze = this.gazeFor(face, mode, ctx)
    } else if (attentionActive) {
      gaze = 'off'
      this.commitState('notify', now, true)
    } else {
      face = moving
        ? mode === 'roam' || mode === 'panelRoam'
          ? dist > 320
            ? 'orbit'
            : 'play'
          : 'idle'
        : this.dwellFace
      gaze = this.gazeFor(face, mode, ctx)
      this.commitState(face, now)
    }

    return { x: this.x, y: this.y, state: this.state, gaze, accessory }
  }
}
