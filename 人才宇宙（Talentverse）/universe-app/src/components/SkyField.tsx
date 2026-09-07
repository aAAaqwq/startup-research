// 宇宙天窗 SkyField（Act3 · 深空）：
// 星 = 三层光（灼白核 core / 玉青辉光 bloom / 衍射芒 spikes）。ignite 点火序列由 --sd 控制。
// 语义：已验证=玉青实心、强孤证=冷灰 dim、孤证/待补=不画成星（诚实暗）；约面=中性倾斜虚线轨，不升温。
// 铁律：布局确定性（同 items 同槽位）；只动 transform/opacity；reduced-motion 全局已兜底。

import { useMemo, useState } from 'react'

export interface SkyStarDef {
  id: string
  name: string
  v: number // min(已验证证据维数,4)
  dim?: boolean // 强孤证：冷灰弱光
  spike?: boolean // 衍射芒（少数才给）
  warm?: boolean
  meet?: boolean
  head: string
  igniteAt?: number // 点火延迟(ms)，-1 = 不自动点
}

const SLOTS: [number, number][] = [
  [22, 26], [50, 18], [78, 30], [30, 58], [62, 52], [88, 66],
  [14, 80], [72, 78], [44, 84], [84, 12], [7, 46], [93, 44],
]

// 固定星尘（模块级一次生成）
const DUST: { x: number; y: number; faint: boolean }[] = (() => {
  const out: { x: number; y: number; faint: boolean }[] = []
  const k = (i: number, p: number) => ((i * p * 9301 + 49297) % 233280) / 233280
  for (let i = 0; i < 46; i += 1) out.push({ x: 2 + k(i, 3) * 96, y: 3 + k(i, 7) * 93, faint: i % 3 !== 0 })
  return out
})()

function toMs(s: number | undefined, base: number): string {
  const t = s == null || s < 0 ? base : s
  return `${(t / 1000).toFixed(2)}s`
}

export function SkyField({
  height = 240,
  cap,
  beam = false,
  stage,
  side,
  items = [],
  empty,
  onPick,
}: {
  height?: number
  cap?: string
  beam?: boolean
  stage?: string
  side?: string
  items?: SkyStarDef[]
  empty?: { t1: string; t2?: string }
  onPick?: (s: SkyStarDef) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const layout = useMemo(
    () =>
      items.map((it, i) => ({
        it,
        x: SLOTS[i % SLOTS.length][0],
        y: SLOTS[i % SLOTS.length][1],
      })),
    [items],
  )
  const openItem = layout.find((l) => l.it.id === openId)

  return (
    <div className="sky" style={{ height }} role="img" aria-label={cap ?? '人才宇宙星域'}>
      {cap ? <div className="cap">{cap}</div> : null}
      {side ? <div className="sider">{side}</div> : null}
      {beam ? <div className="beam" /> : null}
      {stage ? (
        <div className="stage" role="status" aria-live="polite">
          {stage}
        </div>
      ) : null}
      {DUST.map((d, i) => (
        <span key={i} className={`sky-dust${d.faint ? ' faint' : ''}`} style={{ left: `${d.x}%`, top: `${d.y}%` }} />
      ))}
      {items.length === 0 && empty ? (
        <div className="sky-empty">
          <div className="t1">{empty.t1}</div>
          {empty.t2 ? <div className="t2">{empty.t2}</div> : null}
        </div>
      ) : null}
      <div className="skyfield">
        {layout.map(({ it, x, y }) => (
          <button
            key={it.id}
            type="button"
            className={`star v${it.v} ignite${it.dim ? ' dim' : ''}${it.spike ? ' spike' : ''}${it.warm ? ' warm' : ''}${it.meet ? ' meet' : ''}`}
            style={{ left: `${x}%`, top: `${y}%`, ['--sd' as string]: toMs(it.igniteAt, 0.4) }}
            onClick={() => {
              setOpenId(it.id)
              if (onPick) onPick(it)
            }}
            aria-label={it.name}
          >
            <span className="core" />
            <span className="bloom" />
            {it.spike ? <span className="spikes" /> : null}
            {it.warm ? <span className="pulse" /> : null}
            {it.meet ? (
              <svg className="orbit" viewBox="0 0 64 40" aria-hidden="true">
                <ellipse cx="32" cy="20" rx="28" ry="12" />
              </svg>
            ) : null}
            <span className="lbl">{it.name}</span>
          </button>
        ))}
      </div>
      {openItem ? (
        <div className="star-pop" style={{ left: 16, right: 16, bottom: 12, width: 'auto' }}>
          <button className="close" onClick={() => setOpenId(null)} aria-label="关闭">
            ×
          </button>
          <div style={{ fontWeight: 600 }}>{openItem.it.name}</div>
          <div style={{ color: 'var(--text-2)' }}>{openItem.it.head}</div>
          <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--text-3)' }}>
            这颗星只亮它被核过的证据；孤证 / 待补那格既不给它亮，也不在担保内。要看敢背书理由与原件，点对话里那张精选卡。
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** 候选端"我的星"：单颗、固定槽位、天体诞生/合轨 */
export function MyStar({
  v,
  dim = false,
  spike = true,
  warm = false,
  meet = false,
  ignite = true,
  height = 220,
  cap = '我的档案 · 已入轨',
}: {
  v: number
  dim?: boolean
  spike?: boolean
  warm?: boolean
  meet?: boolean
  ignite?: boolean
  height?: number
  cap?: string
}) {
  return (
    <div className="sky" style={{ height }}>
      <div className="cap">{cap}</div>
      <span className="sky-dust faint" style={{ left: '9%', top: '22%' }} />
      <span className="sky-dust" style={{ left: '87%', top: '28%' }} />
      <span className="sky-dust faint" style={{ left: '91%', top: '74%' }} />
      <span className="sky-dust" style={{ left: '12%', top: '82%' }} />
      <span className="sky-dust faint" style={{ left: '70%', top: '84%' }} />
      <div style={{ position: 'absolute', left: '50%', top: '44%', transform: 'translate(-50%,-50%)' }}>
        <div
          className={`star v${v}${dim ? ' dim' : ''}${spike ? ' spike' : ''}${warm ? ' warm' : ''}${meet ? ' meet' : ''}${ignite ? ' ignite' : ''}`}
          style={{ ['--sd' as string]: '0.3s', position: 'relative' }}
        >
          <span className="core" />
          <span className="bloom" />
          {spike ? <span className="spikes" /> : null}
          {warm ? <span className="pulse" /> : null}
          {meet ? (
            <svg className="orbit" viewBox="0 0 64 40" aria-hidden="true">
              <ellipse cx="32" cy="20" rx="28" ry="12" />
            </svg>
          ) : null}
          <span className="lbl">阿哲 · 我的档案</span>
        </div>
      </div>
      <div className="sider">雇主那头只会照到授权出示、且我核过的部分</div>
    </div>
  )
}
