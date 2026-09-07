// ============ App：同一宇宙 · 双端入口 + 闭环全景 ============

import { useState } from 'react'
import { OrbitView } from './views/OrbitView'
import { Backdrop } from './components/Backdrop'
import { AppWorkspace } from './components/Workspace'
import { load, save, clearAll } from './lib/storage'
import type { End } from './types'

function loadCredits(): string[] {
  return load<string[]>('credits', [])
}

export function App() {
  const [end, setEnd] = useState<End>(() => load<End>('end', 'candidate'))
  const [credits, setCredits] = useState<string[]>(loadCredits)
  const [resetN, setResetN] = useState(0)

  const recordCredit = (credit: string) => {
    const next = credits.includes(credit) ? credits : credits.concat(credit)
    setCredits(next)
    save('credits', next)
  }

  const switchEnd = (next: End) => {
    save('end', next)
    setEnd(next)
  }

  const reset = () => {
    clearAll()
    setCredits([])
    save('end', 'candidate')
    setEnd('candidate')
    setResetN((n) => n + 1)
  }

  const navBtn = (v: End, label: string) => (
    <button className={end === v ? 'on' : ''} onClick={() => switchEnd(v)}>
      {label}
    </button>
  )

  return (
    <>
      <Backdrop />
      <div className="topbar">
        <div className="topbar-in">
          <div className="brand">
            <span className="mark">宇</span>
            Talentverse
          </div>
          <div className="endswitch" role="tablist" aria-label="切换视图">
            {navBtn('candidate', '候选端')}
            {navBtn('employer', '雇主端')}
            {navBtn('orbit', '闭环')}
          </div>
          <button
            onClick={reset}
            title="清空演示进度，回到开场"
            aria-label="重置演示"
            style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 2, padding: '4px 8px', border: '1px solid var(--hairline)', borderRadius: 'var(--r-pill)' }}
          >
            重置
          </button>
          <div className="universe-note" style={{ marginLeft: 'auto' }}>
            同一内核 · 两端不同入口 · 档案共用
          </div>
        </div>
      </div>

      {end === 'orbit' ? (
        <OrbitView key={`orb-${resetN}`} credits={credits} onSwitch={switchEnd} />
      ) : (
        <AppWorkspace key={`${end}-${resetN}`} end={end} credits={credits} onCredit={recordCredit} onSwitch={switchEnd} />
      )}

      <div className="legal">
        <b>口径与边界（原样呈现）：</b>"已验证" = 候选人本人授权 + 自产证据 + AI 辅助评估与真人多轮技术验证 + 人工复核终审；不等于背调，也不等于录用保证。孤证 / 待补不计入已验证，也不在担保内。宇宙星等只映射"已验证证据强度 + 新鲜度"，不是能力分；约面只写"被采信"，不自动升高星等。本原型为演示，不构成录用 / offer / 背调结果的任何保证。
        <div className="legend">
          <span><span className="badge v" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)' }}>已验证</span> 敢背书 · 有源可核</span>
          <span><span className="badge ss">强孤证</span> 有署名时间线 · 差第二方一句</span>
          <span><span className="badge s">孤证</span> 只有自述 · 不背书</span>
          <span><span className="badge p">待补</span> 补料即点亮</span>
          <span><span style={{ color: 'var(--seal)', fontWeight: 600 }}>保</span> 试用不符可退换（仅对已验证部分）</span>
          <span style={{ color: 'var(--text-2)' }}>◎ 约面环（中性白）只表"被约面"，不表"更行"</span>
        </div>
      </div>
    </>
  )
}
