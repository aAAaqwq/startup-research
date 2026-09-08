// ============ IdentityAnchor（Act8 顶栏）：我是谁端 + 授权出示范围 + 复核员 ============
// 纯展示（诚实红线：不画假链、不假装有真实授权系统）。孤证/待补不收钱 = 提示入口（popover）。

import { useState } from 'react'
import type { End } from '../types'

/* ---------- 顶层小组件 ---------- */
function PopoverCard() {
  return (
    <div className="anchor-pop" role="tooltip">
      <div className="ap-row">
        <span className="ap-key">敢收费 = 已验证核验格</span>
        <span className="ap-val">敢背书 · 有源可核（验青）</span>
      </div>
      <div className="ap-row">
        <span className="ap-key">孤证 / 待补不收钱</span>
        <span className="ap-val">那部分我本就没敢背书</span>
      </div>
      <div className="ap-row">
        <span className="ap-key">试用不符可退换</span>
        <span className="ap-val">仅对已验证部分（印朱）</span>
      </div>
    </div>
  )
}

export function IdentityAnchor({ end }: { end: End }) {
  const [hint, setHint] = useState(false)

  const subject = end === 'candidate'
    ? { label: '候选主体', who: '阿哲 · 本人档案', auth: 'ON', authNote: '授权出示 · 已勾核验格' }
    : end === 'employer'
      ? { label: '雇主主体', who: '海升科技 · BI 岗', auth: 'NONE', authNote: '不出示个人档案 · 只读对方已授权出示' }
      : { label: '双端闭环', who: '全景观测', auth: 'NONE', authNote: '只做两端真实动作的落点展示' }

  return (
    <div className="identity-anchor" aria-label="身份锚">
      <span className="ia-cell">
        <span className="ia-k">{subject.label}</span>
        <span className="ia-v">{subject.who}</span>
      </span>
      <span className="ia-cell">
        <span className="ia-k">授权出示</span>
        <span className={`ia-v ia-auth${subject.auth === 'ON' ? ' on' : ''}`}>
          <span className="ia-dot" />{subject.auth}
          <span className="ia-note">{subject.authNote}</span>
        </span>
      </span>
      <span className="ia-cell">
        <span className="ia-k">复核员</span>
        <span className="ia-v">A-07</span>
      </span>
      <span className="anchor-hint-wrap">
        <button
          className={`anchor-hint${hint ? ' on' : ''}`}
          onClick={() => setHint((h) => !h)}
          aria-expanded={hint}
          aria-label="计费边界说明"
        >
          孤证/待补不收钱
        </button>
        {hint ? <PopoverCard /> : null}
      </span>
    </div>
  )
}
