// 双向闭环全景：把两端互相喂养的一次性讲清楚（演示/教学用，非日常看板）。

import { load } from '../lib/storage'
import type { End } from '../types'

export function OrbitView({ credits, onSwitch }: { credits: string[]; onSwitch: (end: End) => void }) {
  const candStep = load<{ step: number } | null>('cand', null)?.step ?? 0
  const empStep = load<{ step: number } | null>('emp', null)?.step ?? 0
  const met = credits.some((c) => c.includes('约面'))

  const s1 = candStep >= 3 // 投一颗星（建档收口）
  const s3 = empStep >= 1 // 雇主搜索命中
  const s5 = met // 约面

  const nodes = [
    { i: '①', label: '投一颗星\n建档收口', lit: s1 },
    { i: '②', label: '入轨 · 授权出示', lit: s1 },
    { i: '③', label: '雇主搜索命中\n被看 / 被搜', lit: s3 },
    { i: '④', label: '敢背书理由\n只勾已验证', lit: s3 },
    { i: '⑤', label: '约面 · 回执', lit: s5 },
    { i: '⑥', label: '采信记录回写档案\n下次搜索自动更亮', lit: s5 },
  ]

  const litCount = nodes.filter((n) => n.lit).length
  const prompt =
    litCount === 0
      ? '闭环还没点亮：先从候选端投一件「做过的事」，档案收口后这颗星才入轨。'
      : litCount <= 2
        ? '档案已入轨。下一站：去雇主端提交需求，让 agent 在授权范围内照亮它 →'
        : litCount <= 4
          ? '雇主已命中并给出敢背书理由。下一站：约面 #1，或回候选端把「出海」补强再回来——都会在轨道上留真实记录。'
          : '约面完成，被采信记录已回写候选档案。候选端补一格已验证 → 亮区扩大 → 下次搜索自动更亮：闭环成立。'

  return (
    <div className="orbit-wrap">
      <div className="persona-line" style={{ justifyContent: 'center' }}>两端 · 同一份档案 · 双向闭环</div>
      <h1 style={{ textAlign: 'center', fontSize: 30, letterSpacing: '-.02em', margin: '10px 0 6px' }}>
        人才宇宙 · <span className="k">闭环</span>
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: 13.5, margin: '0 auto 22px', maxWidth: 520 }}>
        它讲清一件事：雇主端每次约面回写「需求侧事实」，候选端每次补料回写「证据侧事实」——两端各自看见对方动作的落点。
      </p>

      <div className="orbit-line">
        {nodes.map((n, idx) => (
          <div key={n.i} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`o-node${n.lit ? ' lit' : ''}`}>
              <span className="dot">{n.i}</span>
              <span className="lb" style={{ whiteSpace: 'pre-line' }}>{n.label}</span>
            </div>
            {idx < nodes.length - 1 ? (
              <div className={`o-edge${n.lit && nodes[idx + 1].lit ? ' lit' : ''}`} />
            ) : null}
          </div>
        ))}
      </div>

      <div className="orbit-prompt">
        <span style={{ color: 'var(--teal-700)', fontWeight: 600 }}>当前位置 ▸ </span>
        {prompt}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
        <button className="btn out" onClick={() => onSwitch('candidate')}>回候选端 · 证明我行</button>
        <button className="btn ink" onClick={() => onSwitch('employer')}>回雇主端 · 敢用的人</button>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 11.5, marginTop: 16 }}>
        铁律：约面只写「采信」，不自动升高星等；只有补料/核验升档才让星更亮。被采信是需求信号，不是能力又验了一层。
      </p>
    </div>
  )
}
