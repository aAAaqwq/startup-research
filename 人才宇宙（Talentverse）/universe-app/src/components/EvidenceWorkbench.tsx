// ============ EvidenceWorkbench（Act8 右栏）：Agent 证据工作台 ============
// A 当前任务 · 步骤轨道（派生自会话镜像，把 PipelineCard 的步骤语义常驻化，不重写 flows）
// B 产物 artifacts（档案 / 精选 / JD 星球 / 邀约）—— 点每条滚动到对话对应卡或开面板
// C 边界 / 计价行 + 当前待决闸门
// 纯展示 + 派生：状态由 AppWorkspace 注入；桌面栏与移动抽屉共用同一实例契约。

import type { Msg } from '../msg'
import type { End } from '../types'
import type { GateProposal } from '../gates'
import { GATE_KIND_LABEL } from '../gates'
import type { InterviewInvite, JdPlanet } from '../lib/jobs'

/* ---------- 类型 ---------- */
export interface WbArtifact {
  id: string
  kind: 'archive' | 'result' | 'jd' | 'invite'
  icon: string
  title: string
  sub: string
  badge?: string
  act: 'scroll' | 'panel'
  marker?: string
}

export interface WbStep {
  label: string
  meta?: string
  state: 'done' | 'active' | 'todo'
}

export interface WbTask {
  title: string
  statusText: string
  statusTone: 'running' | 'waiting' | 'done' | 'idle'
  steps: WbStep[]
}

export interface EvidenceWorkbenchProps {
  end: End
  conv: { step: number; msgs: Msg[] } | null
  invites: InterviewInvite[]
  jds: JdPlanet[]
  gate: GateProposal | null
  onSelectArtifact: (a: WbArtifact) => void
  onDecideInvite: (id: string, decision: 'accepted' | 'declined') => void
  onJumpGate: () => void
}

/* ---------- 常量（对应 flows 里 pipeline 的步骤语义，常驻化） ---------- */
const CAND_STEPS: { label: string; meta?: string }[] = [
  { label: '读取你的材料 · 证据抽提' },
  { label: '按档位归档 · 已验证 / 孤证 / 待补', meta: '逐条锚定原件' },
  { label: '缺口判定 · 一次只问一项', meta: '按雇主采信影响排序' },
  { label: '人工复核终审', meta: '复核员 A-07' },
]
const EMP_STEPS: { label: string; meta?: string }[] = [
  { label: '解析 JD · 生成岗位画像', meta: '并入公司信息' },
  { label: '画像 × 授权视野检索' },
  { label: '逐人核验 · 命中 / 缺口对账' },
  { label: '敢背书排序 · 只勾已验证' },
  { label: '人工复核终审', meta: '复核员 A-07' },
]

const BILL_ROWS = [
  { key: 'paid', tag: '敢收费', text: '已验证核验格 = 敢背书 · 有源可核' },
  { key: 'free', tag: '不收钱', text: '孤证 / 待补 = 那部分我本就没敢背书' },
  { key: 'guar', tag: '可退换', text: '试用不符可退换 · 仅对已验证部分' },
]

/* ---------- 纯派生 helpers（顶层，便于复用与测试） ---------- */

function hasMsg(msgs: Msg[], kind: Msg['kind']): boolean {
  return msgs.some((m) => m.kind === kind)
}

function toSteps(def: { label: string; meta?: string }[], done: number): WbStep[] {
  return def.map((s, i) => ({
    label: s.label,
    meta: s.meta,
    state: i < done ? 'done' : i === done ? 'active' : 'todo',
  }))
}

/** 建档/检索任务：把会话 step + 消息类型映射成常驻步骤轨道（诚实，不造进度） */
export function taskOf(end: End, conv: { step: number; msgs: Msg[] } | null): WbTask {
  if (!conv || !conv.msgs || conv.msgs.length === 0) {
    return end === 'candidate'
      ? { title: '档案整理 · 建档收口', statusText: '空闲 —— 等你投一件料', statusTone: 'idle', steps: toSteps(CAND_STEPS, 0) }
      : { title: '验人 · 检索人才宇宙', statusText: '空闲 —— 等你给需求 / JD', statusTone: 'idle', steps: toSteps(EMP_STEPS, 0) }
  }
  if (end === 'candidate') {
    const archived = hasMsg(conv.msgs, 'archive')
    const step = conv.step
    if (archived) {
      return { title: '档案整理 · 建档收口', statusText: '完成 · 人工复核终审已过', statusTone: 'done', steps: toSteps(CAND_STEPS, CAND_STEPS.length) }
    }
    if (step <= 0) {
      return { title: '档案整理 · 建档收口', statusText: '等你投第一件料', statusTone: 'waiting', steps: toSteps(CAND_STEPS, 0) }
    }
    const done = step >= CAND_STEPS.length ? CAND_STEPS.length - 1 : step
    return { title: '档案整理 · 建档收口', statusText: '运行中 —— 逐条核、一次只问一项', statusTone: 'running', steps: toSteps(CAND_STEPS, done) }
  }
  // employer
  const hit = hasMsg(conv.msgs, 'emp')
  if (hit) {
    return { title: '验人 · 检索人才宇宙', statusText: '完成 · 精选就绪（复核终审已过）', statusTone: 'done', steps: toSteps(EMP_STEPS, EMP_STEPS.length) }
  }
  if (conv.step <= 0) {
    return { title: '验人 · 检索人才宇宙', statusText: '等你给需求 / 拖 JD', statusTone: 'waiting', steps: toSteps(EMP_STEPS, 0) }
  }
  return { title: '验人 · 检索人才宇宙', statusText: '运行中 —— 授权视野内点亮', statusTone: 'running', steps: toSteps(EMP_STEPS, EMP_STEPS.length - 1) }
}

function archiveCounts(msgs: Msg[]): { verified: number; pending: number } {
  const a = msgs.find((m) => m.kind === 'archive')
  if (!a || a.kind !== 'archive') return { verified: 0, pending: 0 }
  const dims = a.body.dims
  return {
    verified: dims.filter((d) => d.level === 'verified').length,
    pending: dims.filter((d) => d.level === 'pending').length,
  }
}

export function artifactsOf(end: End, conv: { step: number; msgs: Msg[] } | null, invites: InterviewInvite[], jds: JdPlanet[]): WbArtifact[] {
  const msgs = conv && conv.msgs ? conv.msgs : []
  const out: WbArtifact[] = []
  if (end === 'candidate') {
    const a = msgs.find((m) => m.kind === 'archive')
    if (a && a.kind === 'archive') {
      const c = archiveCounts(msgs)
      out.push({
        id: 'arc',
        kind: 'archive',
        icon: '▤',
        title: '能力证据档案',
        sub: `${a.body.persona} · 已验证 ${c.verified} · 待补 ${c.pending}`,
        act: 'scroll',
        marker: '你的能力证据档案',
      })
    }
  } else {
    const e = msgs.find((m) => m.kind === 'emp')
    if (e && e.kind === 'emp') {
      out.push({
        id: 'emp',
        kind: 'result',
        icon: '✦',
        title: '已验证精选 · 人才命中',
        sub: e.body.candidates[0] ? `#1 ${e.body.candidates[0].name} · 敢背书 ${e.body.candidates[0].canDo}` : '见对话精选卡',
        act: 'scroll',
        marker: '已验证精选',
      })
    }
    if (jds.length > 0) {
      out.push({
        id: 'jd',
        kind: 'jd',
        icon: '◈',
        title: 'JD 星球',
        sub: `${jds[0].title} · ${jds[0].company} · 候选 ${jds[0].starCount} 颗`,
        act: 'scroll',
        marker: '本 JD 候选人星球',
      })
    }
  }
  if (invites.length > 0) {
    const pending = invites.filter((i) => i.status === 'pending').length
    const accepted = invites.filter((i) => i.status === 'accepted').length
    const first = invites[0]
    out.push({
      id: 'invite',
      kind: 'invite',
      icon: '◎',
      title: '面试邀约',
      sub: first ? `${first.company} · ${first.jdTitle}` : '见面试空间',
      badge: pending > 0 ? `${pending} 待决定` : accepted > 0 ? '已确认' : '已婉拒',
      act: 'panel',
    })
  }
  return out
}

/* ---------- 顶层小组件 ---------- */
function StepTrack({ task }: { task: WbTask }) {
  return (
    <div className="wb-steps">
      {task.steps.map((s, i) => (
        <div key={s.label} className={`ws ${s.state}`}>
          <span className="ws-dot">{s.state === 'done' ? '✓' : i + 1}</span>
          <span className="ws-label">{s.label}</span>
          {s.state === 'active' ? <span className="ws-bar" /> : null}
          {s.meta ? <span className="ws-meta">{s.meta}</span> : null}
        </div>
      ))}
    </div>
  )
}

function ArtifactList({ items, onSelect }: { items: WbArtifact[]; onSelect: (a: WbArtifact) => void }) {
  if (items.length === 0) {
    return <div className="wb-empty">还没有产物 —— 走完一轮建档 / 检索，这里会固化成卡。</div>
  }
  return (
    <div className="wb-artifacts">
      {items.map((a) => (
        <button key={a.id} type="button" className="wb-art" onClick={() => onSelect(a)}>
          <span className="wb-art-ic">{a.icon}</span>
          <span className="wb-art-bd">
            <span className="wb-art-t">{a.title}</span>
            <span className="wb-art-s">{a.sub}</span>
          </span>
          {a.badge ? <span className="wb-art-badge">{a.badge}</span> : null}
          <span className="wb-art-go">↗</span>
        </button>
      ))}
    </div>
  )
}

function GateNow({ gate, onJump }: { gate: GateProposal; onJump: () => void }) {
  return (
    <div className="wb-gatenow">
      <div className="wb-gatenow-hd">
        <span className="wb-tag">闸门 · {GATE_KIND_LABEL[gate.kind]}</span>
        <button type="button" className="wb-gotenow" onClick={onJump}>
          去对话区决定 →
        </button>
      </div>
      <div className="wb-gatenow-title">{gate.title}</div>
      <ul className="wb-gatenow-list">
        {gate.draft.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <div className="wb-gatenow-note">draft 未生效；确认后才执行，驳回会显式说明。</div>
    </div>
  )
}

function InviteGate({
  invites,
  onDecide,
}: {
  invites: InterviewInvite[]
  onDecide: (id: string, decision: 'accepted' | 'declined') => void
}) {
  const pending = invites.filter((i) => i.status === 'pending')
  if (pending.length === 0) return null
  return (
    <div className="wb-gatenow">
      <div className="wb-gatenow-hd">
        <span className="wb-tag">闸门 · 面试回执待你决定</span>
      </div>
      {pending.map((i) => (
        <div key={i.id} className="wb-invite">
          <div className="wb-invite-t">{i.company} · {i.jdTitle}</div>
          <div className="wb-invite-s">{i.companyBlurb}</div>
          <div className="wb-invite-acts">
            <button type="button" className="btn teal" onClick={() => onDecide(i.id, 'accepted')}>同意面试</button>
            <button type="button" className="btn out" onClick={() => onDecide(i.id, 'declined')}>婉拒</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- 主组件 ---------- */
export function EvidenceWorkbench({
  end,
  conv,
  invites,
  jds,
  gate,
  onSelectArtifact,
  onDecideInvite,
  onJumpGate,
}: EvidenceWorkbenchProps) {
  const task = taskOf(end, conv)
  const artifacts = artifactsOf(end, conv, invites, jds)
  const isCand = end === 'candidate'
  const noPending = gate == null && invites.filter((i) => i.status === 'pending').length === 0

  return (
    <div className="wb">
      <div className="wb-over">AGENT 证据工作台 · {end === 'candidate' ? '候选' : '雇主'}</div>

      <section className="wb-sec">
        <div className="wb-sec-hd">
          <span>A · 当前任务</span>
          <span className={`wb-status ${task.statusTone}`}>{task.statusText}</span>
        </div>
        <StepTrack task={task} />
      </section>

      <section className="wb-sec">
        <div className="wb-sec-hd">
          <span>B · 产物 artifacts</span>
          <span className="wb-hint">点每条 = 滚到对话对应卡 / 开面板</span>
        </div>
        <ArtifactList items={artifacts} onSelect={onSelectArtifact} />
      </section>

      <section className="wb-sec">
        <div className="wb-sec-hd">
          <span>C · 边界 / 计价行</span>
        </div>
        <div className="wb-bill">
          {BILL_ROWS.map((r) => (
            <div key={r.key} className="wb-bill-row">
              <span className={`wb-bill-tag${r.key === 'guar' ? ' seal' : ''}`}>{r.tag}</span>
              <span className="wb-bill-t">{r.text}</span>
            </div>
          ))}
          <div className="wb-bill-note">闸门语义 = amber 虚线，≠ 证据档色。孤证/待补不混进已验证，也不在担保内。</div>
        </div>
      </section>

      <section className="wb-sec">
        <div className="wb-sec-hd">
          <span>待决事项 · 闸门</span>
          {gate ? <span className="wb-pulse-dot" aria-label="有待决事项" /> : null}
        </div>
        {gate ? <GateNow gate={gate} onJump={onJumpGate} /> : null}
        {isCand ? <InviteGate invites={invites} onDecide={onDecideInvite} /> : null}
        {noPending ? (
          <div className="wb-empty">
            {gate == null
              ? '当前无待决事项 —— 触发「约面 / 润色」类动作会先进闸门，在这里与 Composer 上方同步。'
              : '（见上方闸门）'}
          </div>
        ) : null}
      </section>
    </div>
  )
}
