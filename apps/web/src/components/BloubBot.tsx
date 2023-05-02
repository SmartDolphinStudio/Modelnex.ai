import { useEffect, useRef, useState } from 'react'
import { BotEngine, type BotFrame, type Look } from '../lib/bloub/bot/engine'
import { NOTIF_BLUE } from '../lib/bloub/bot/decor'
import { clamp, easings } from '../lib/bloub/bot/math'
import { DEFAULT_EXPRESSION, EXPRESSION_BY_ID } from '../lib/bloub/bot/expressions'
import { COLOR_BY_ID, DEFAULT_COLOR, DEFAULT_SHAPE, SHAPE_BY_ID, mixHex } from '../lib/bloub/bot/skins'
import { DEMI_VIEWBOX, RAYON } from '../lib/bloub/bot/repere'
import type { StateId } from '../lib/bloub/bot/states'
import { YAW_MAX, PITCH_MAX, TURN_TIME } from '../lib/bloub/gaze'
import { presence } from '../lib/pet/presence'
import type { GazeMode, PetAccessory } from '../lib/pet/petDirector'

const R = RAYON
const VB = DEMI_VIEWBOX

/** watchdown 视线：低头看向屏幕下方（pitch 负）。 */
const WATCH_LOOK: Look = { yaw: 0, pitch: -13, mix: 1, spin: 0, wander: 1 }

interface BloubBotProps {
  size?: number
  /** 皮肤色 id（见 skins.ts），默认品牌棕 `brun`。 */
  color?: string
  /** 「纸」色：团子身体的填充底色，通常取页面背景色。 */
  paper?: string
  /** 当前引擎状态，由外部行为导演决定。 */
  state?: StateId
  /** 视线模式。 */
  gaze?: GazeMode
  /** 手持配件（如写字毛笔）。 */
  accessory?: PetAccessory
}

/**
 * React 复刻的 BloubBot：引擎来自 jeremy-prt/bloub（MIT），渲染层从 Vue
 * 翻译为 React。本组件只负责「按给定状态与视线渲染」，所有行为决策都在
 * `petDirector` 中，保持渲染与行为分离。
 */
export default function BloubBot({
  size = 120,
  color = 'brun',
  paper = '#fff8f3',
  state = 'idle',
  gaze = 'mouse',
  accessory = null,
}: BloubBotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [frame, setFrame] = useState<BotFrame | null>(null)
  const uidRef = useRef(Math.random().toString(36).slice(2, 8))
  const uid = uidRef.current
  const maskId = `bot-mask-${uid}`

  // 最新的外部驱动值，供 rAF 读取。
  const stateRef = useRef(state)
  stateRef.current = state
  const gazeRef = useRef(gaze)
  gazeRef.current = gaze

  useEffect(() => {
    const ink = COLOR_BY_ID.get(color)?.hex ?? COLOR_BY_ID.get(DEFAULT_COLOR)!.hex
    const shapeRadii = SHAPE_BY_ID.get(DEFAULT_SHAPE)?.radii ?? null
    const expression = EXPRESSION_BY_ID.get(DEFAULT_EXPRESSION) ?? null
    const engine = new BotEngine(R, stateRef.current, shapeRadii, expression)

    let raf = 0
    let curGaze: GazeMode | null = null
    let turnSince = performance.now() / 1000

    /** 视线：mouse 每帧跟随指针；watchdown/off 仅在切换时设定。 */
    const resolveGaze = (now: number) => {
      const mode = gazeRef.current
      if (mode === curGaze && mode !== 'mouse') return

      if (mode === 'mouse') {
        const box = svgRef.current?.getBoundingClientRect()
        if (!box || box.width === 0 || box.height === 0) return
        if (curGaze !== 'mouse') turnSince = now
        const pointer = presence.pointer
        const demiW = Math.max(1, window.innerWidth / 2)
        const demiH = Math.max(1, window.innerHeight / 2)
        // 纯鼠标跟随：眼睛/头部按指针方向在四周自由转动（无固定左偏、无自旋）。
        engine.setLook(
          {
            yaw: (pointer ? clamp((pointer.x - (box.left + box.width / 2)) / demiW, -1, 1) : 0) * YAW_MAX,
            pitch:
              4 -
              (pointer ? clamp((pointer.y - (box.top + box.height / 2)) / demiH, -1, 1) : 0) * PITCH_MAX,
            mix: easings.easeOutQuint(clamp((now - turnSince) / TURN_TIME)),
            spin: 0,
            wander: pointer ? 0 : 1,
          },
          now,
        )
      } else if (mode === 'watchdown') {
        engine.setLook(WATCH_LOOK, now, TURN_TIME)
      } else {
        engine.setLook(null, now, TURN_TIME)
      }
      curGaze = mode
    }

    const tick = (ms: number) => {
      raf = requestAnimationFrame(tick)
      const now = ms / 1000

      const wanted = stateRef.current
      if (wanted !== engine.state) engine.setState(wanted, now)

      resolveGaze(now)
      setFrame(engine.sample(now))
    }
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [color])

  if (!frame) return <svg ref={svgRef} width={size} height={size} viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`} />

  const ink = COLOR_BY_ID.get(color)?.hex ?? COLOR_BY_ID.get(DEFAULT_COLOR)!.hex

  const dotEl = (dot: BotFrame['dots'][number], key: string) => {
    const fill = dot.color ?? (dot.depth === undefined ? ink : mixHex(paper, ink, dot.depth))
    const common = { fill, opacity: dot.opacity }
    if (dot.d) {
      return (
        <path
          key={key}
          {...common}
          d={dot.d}
          transform={`translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${R})`}
        />
      )
    }
    return <circle key={key} {...common} cx={dot.x} cy={dot.y} r={dot.r} />
  }

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
      role="img"
      aria-label="ModelNex pet"
    >
      <style>{`
        .pet-brush { animation: petBrushWrite 0.45s ease-in-out infinite; }
        @keyframes petBrushWrite {
          0%   { transform: translate(26px,30px) rotate(33deg); }
          50%  { transform: translate(34px,22px) rotate(47deg); }
          100% { transform: translate(26px,30px) rotate(33deg); }
        }
      `}</style>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-VB} y={-VB} width={VB * 2} height={VB * 2}>
          <path d={frame.bodyPath} fill="#fff" />
          {frame.eyes.map((eye, i) => (
            <path key={i} d={eye.d} transform={eye.matrix} opacity={eye.alpha} fill="#000" />
          ))}
          {frame.notch && <circle cx={frame.notch.x} cy={frame.notch.y} r={frame.notch.r} fill="#000" />}
        </mask>
        {frame.arcs.map((arc) => (
          <linearGradient
            key={arc.id}
            id={`${uid}-${arc.id}`}
            gradientUnits="userSpaceOnUse"
            x1={arc.grad.x1}
            y1={arc.grad.y1}
            x2={arc.grad.x2}
            y2={arc.grad.y2}
          >
            {arc.grad.stops.map((c, i) => (
              <stop key={i} offset={i / Math.max(1, arc.grad.stops.length - 1)} stopColor={c} />
            ))}
          </linearGradient>
        ))}
      </defs>

      {/* 后半圆轨道 */}
      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path key={`b${arc.id}`} d={arc.back} stroke={`url(#${uid}-${arc.id})`} strokeWidth={arc.width} opacity={arc.opacity} />
        ))}
      </g>

      {/* 爆炸粒子在身后 */}
      {frame.dotsBehind && frame.dots.map((d, i) => dotEl(d, `pb${i}`))}

      {/* 身体：纸色底 + 被 mask 挖出眼睛的墨色填充 */}
      <g opacity={frame.bodyAlpha}>
        <path d={frame.bodyPath} fill={paper} />
        <g mask={`url(#${maskId})`}>
          <rect x={-VB} y={-VB} width={VB * 2} height={VB * 2} fill={ink} />
        </g>
      </g>

      {!frame.dotsBehind && frame.dots.map((d, i) => dotEl(d, `pf${i}`))}

      {frame.notif && <circle cx={frame.notif.x} cy={frame.notif.y} r={frame.notif.r} fill={NOTIF_BLUE} />}

      {/* 前半圆轨道 */}
      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path key={`f${arc.id}`} d={arc.front} stroke={`url(#${uid}-${arc.id})`} strokeWidth={arc.width} opacity={arc.opacity} />
        ))}
      </g>

      {/* 手持配件：写字毛笔（写字时小幅摆动） */}
      {accessory === 'brush' && (
        <g className="pet-brush">
          <rect x="4" y="-5" width="57" height="10" rx="4" fill="#7c5443" />
          <rect x="61" y="-6.5" width="12" height="13" rx="2" fill="#cdb6a6" />
          <path d="M73 -6.5 L98 0 L73 6.5 Z" fill="#3c2b23" />
          <circle cx="98" cy="0" r="2.8" fill="#241712" />
        </g>
      )}
    </svg>
  )
}
