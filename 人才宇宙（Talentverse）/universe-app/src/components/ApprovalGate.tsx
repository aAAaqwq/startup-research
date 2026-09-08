// ============ ApprovalGate（Act8）：Composer 上方的"待你决定"决定行 ============
// 展示 draft（将发 / 将改）+ against（原文对照）→ 确认才执行原 act；驳回 = 显式回退文案。
// 语义色：amber 虚线族（闸门），注释 ≠ 证据档色。组件顶层定义、无内联子组件。

import type { GateAgainst, GateProposal } from '../gates'
import { GATE_APPROVE_LABEL, GATE_KIND_LABEL } from '../gates'

function AgainstBlock({ against }: { against: GateAgainst }) {
  return (
    <div className="gate-block">
      <div className="gate-bt">
        原文对照 · <span className="gate-against-label">{against.label}</span>
      </div>
      <ul className="gate-lines">
        {against.lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  )
}

export function ApprovalGate({
  gate,
  onApprove,
  onReject,
}: {
  gate: GateProposal
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div className="gate" role="region" aria-label="待你决定">
      <div className="gate-top">
        <span className="gate-tag">闸门 · {GATE_KIND_LABEL[gate.kind]}</span>
        <span className="gate-why">{gate.why}</span>
      </div>
      <div className="gate-title">{gate.title}</div>

      <div className="gate-pane">
        <div className="gate-block">
          <div className="gate-bt">将发 / 将改（draft · 未生效）</div>
          <ul className="gate-lines">
            {gate.draft.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <AgainstBlock against={gate.against} />
      </div>

      <div className="gate-acts">
        <button type="button" className="btn teal" onClick={onApprove}>
          {GATE_APPROVE_LABEL[gate.kind]} →
        </button>
        <button type="button" className="btn out" onClick={onReject}>
          驳回（不改 / 不发）
        </button>
        <span className="gate-note">驳回会显式说明，绝不静默改动更版本。</span>
      </div>
    </div>
  )
}
