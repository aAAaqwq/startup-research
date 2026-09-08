// ============ 对话容器：状态机 + 消息播放 + Composer（说话 / 拖文件） ============
// Act8：新增人类闸门 —— cfg.approvalFor 命中的动作先挂起为 gate（draft + 原文对照），
// 在 Composer 上方决定；确认才 resume 原 act，驳回 = 显式回退文案。

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'
import type { Msg } from '../msg'
import type { End, SignalKind } from '../types'
import type { RunResult } from '../engine/flows'
import { load, save } from '../lib/storage'
import { rejectCopy, type GateProposal } from '../gates'
import {
  ArchiveCard,
  ConclusionCard,
  EmpResultCard,
  NoteCard,
} from './cards'
import { PipelineCard } from './PipelineCard'
import { ApprovalGate } from './ApprovalGate'

export interface ChipDef {
  label: string
  act: string
}

export interface ConvCfg {
  persona: { label: string; accent: 'cand' | 'emp' }
  persistKey: string
  greet: Msg[]
  chips: (step: number) => ChipDef[]
  fileHint: (step: number) => { name: string; size: string }
  run: (step: number, act: string) => RunResult
  classifyText: (step: number, text: string) => string
  /** Act8 人类闸门：命中则动作先进 gate（draft + 原文对照），确认后才执行原 act。 */
  approvalFor?: (act: string, step: number) => GateProposal | null
}

interface ConvState {
  step: number
  msgs: Msg[]
}

function isMsg(m: Msg | undefined): m is Msg {
  return m != null
}

// 顶层消息渲染器（避免内联组件）
function MessageNode({ msg, liveCred }: { msg: Msg; liveCred: string[] }) {
  if (msg.kind === 'text') {
    if (msg.role === 'user') {
      return (
        <div className="row user">
          <div className="bubble">{msg.text}</div>
        </div>
      )
    }
    return (
      <div className="row agent">
        <div className="avatar agent">T</div>
        <div className="bubble">{msg.text}</div>
      </div>
    )
  }
  if (msg.kind === 'attach') {
    return (
      <div className="row user">
        <div className="attach">
          <span className="ic">▤</span>
          <div>
            <div className="n">{msg.name}</div>
            <div className="s">{msg.size} · 已接收</div>
          </div>
        </div>
      </div>
    )
  }
  if (msg.kind === 'thinking') {
    return (
      <div className="row agent">
        <div className="avatar agent">T</div>
        <div className="thinking">
          <span className="td"><i /><i /><i /></span>
          {msg.text}
        </div>
      </div>
    )
  }
  if (msg.kind === 'conclusion') {
    return (
      <div className="row agent">
        <div className="avatar agent">T</div>
        <ConclusionCard body={msg.body} />
      </div>
    )
  }
  if (msg.kind === 'pipeline') {
    return (
      <div className="row agent">
        <div className="avatar agent">T</div>
        <PipelineCard title={msg.body.title} steps={msg.body.steps} />
      </div>
    )
  }
  if (msg.kind === 'archive') {
    return (
      <div className="row agent">
        <div className="avatar agent">T</div>
        <ArchiveCard body={msg.body} liveCred={liveCred} />
      </div>
    )
  }
  if (msg.kind === 'emp') {
    return (
      <div className="row agent">
        <div className="avatar agent" style={{ background: 'var(--ink)' }}>E</div>
        <EmpResultCard body={msg.body} />
      </div>
    )
  }
  if (msg.kind === 'note') {
    return (
      <div className="row agent">
        <div className="avatar agent">T</div>
        <NoteCard em={msg.body.em} text={msg.body.text} />
      </div>
    )
  }
  return null
}

export function ChatConv({
  cfg,
  credits = [],
  onCredit,
  onSwitch,
  onSignal,
  onStateChange,
  onGateChange,
}: {
  cfg: ConvCfg
  credits?: string[]
  onCredit?: (credit: string) => void
  onSwitch?: (end: End) => void
  onSignal?: (kind: SignalKind, src: string) => void
  /** Act8 会话镜像：对话状态变化时上抛（供右栏 EvidenceWorkbench 派生任务/产物） */
  onStateChange?: (s: { step: number; msgs: Msg[] }) => void
  /** Act8 闸门镜像：pending gate 变化时上抛（供右栏 C 显示） */
  onGateChange?: (g: GateProposal | null) => void
}) {
  const [state, setState] = useState<ConvState>(() => {
    const stored = load<ConvState | null>(cfg.persistKey, null)
    if (stored && Array.isArray(stored.msgs) && stored.msgs.every(isMsg)) return stored
    return { step: 0, msgs: cfg.greet }
  })
  const [busy, setBusy] = useState(false)
  const [text, setText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [gate, setGate] = useState<GateProposal | null>(null)
  const pendingTimer = useRef<number | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const deciding = gate != null

  // 持久化镜像 + 上抛会话变化（右栏据此实时更新）
  useEffect(() => {
    save(cfg.persistKey, state)
    if (onStateChange) onStateChange(state)
  }, [cfg.persistKey, state, onStateChange])

  // 卸载时清掉遗留 gate（避免上抛一个已消失的待决）
  useEffect(() => {
    return () => {
      if (pendingTimer.current != null) window.clearTimeout(pendingTimer.current)
      if (onGateChange) onGateChange(null)
    }
  }, [onGateChange])

  // 新消息自动滚动到底
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [state.msgs.length])

  const push = (m: Msg) =>
    setState((prev) => ({ ...prev, msgs: prev.msgs.concat(m) }))

  const playItems = (items: { delay: number; msgs: Msg[] }[]) => {
    setBusy(true)
    let i = 0
    const stepOnce = () => {
      if (i >= items.length) {
        setBusy(false)
        return
      }
      const it = items[i]
      i += 1
      pendingTimer.current = window.setTimeout(() => {
        it.msgs.forEach(push)
        stepOnce()
      }, it.delay)
    }
    stepOnce()
  }

  // 执行原 act（gate 确认后才走这里；与老 submit 一致）
  const commitRun = (act: string, step: number) => {
    const result = cfg.run(step, act)
    if (result.credit != null && onCredit) onCredit(result.credit)
    if (result.signal != null && onSignal) onSignal(result.signal.kind, result.signal.src)
    setState((prev) => ({ ...prev, step: result.next }))
    playItems(result.items)
    if (result.goto != null && onSwitch) onSwitch(result.goto)
  }

  const dismissGate = () => {
    setGate(null)
    if (onGateChange) onGateChange(null)
  }

  const approveGate = () => {
    if (!gate) return
    const { act, step } = gate
    dismissGate()
    commitRun(act, step)
  }

  const rejectGate = () => {
    if (!gate) return
    const { kind } = gate
    dismissGate()
    // 驳回 = agent 显式回退说明，绝不静默改更版本
    push({ id: 's' + Math.random().toString(36).slice(2), role: 'agent', kind: 'text', text: rejectCopy(kind) })
  }

  const submit = (chipAct: string | null, file?: File) => {
    if (busy || deciding) return
    const act = chipAct ?? 'text'
    const typed = text.trim()
    const effectiveAct = chipAct == null ? cfg.classifyText(state.step, typed) : chipAct

    // 用户可见行
    if (act === 'attach') {
      const hint = cfg.fileHint(state.step)
      push({
        id: 's' + Math.random().toString(36).slice(2),
        role: 'system',
        kind: 'attach',
        name: file ? file.name : hint.name,
        size: file ? fmtSize(file.size) : hint.size,
      })
    } else if (chipAct != null) {
      const chipLabel = cfg.chips(state.step).find((c) => c.act === chipAct)
      if (chipLabel) push({ id: 'u' + Math.random().toString(36).slice(2), role: 'user', kind: 'text', text: chipLabel.label })
    } else if (typed.length > 0) {
      push({ id: 'u' + Math.random().toString(36).slice(2), role: 'user', kind: 'text', text: typed })
    }

    setText('')
    if (fileRef.current) fileRef.current.value = ''

    // Act8：命中人类闸门 → 挂起，等确认
    const proposal = cfg.approvalFor ? cfg.approvalFor(effectiveAct, state.step) : null
    if (proposal != null) {
      setGate(proposal)
      if (onGateChange) onGateChange(proposal)
      return
    }

    commitRun(effectiveAct, state.step)
  }

  const chips = busy || deciding ? [] : cfg.chips(state.step)

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) submit('attach', f)
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) submit('attach', f)
  }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim().length > 0 || chips.length === 0) submit(null)
    }
  }

  return (
    <div>
      <div className="persona-line">
        <span className={`persona-dot ${cfg.persona.accent}`}>{cfg.persona.accent === 'cand' ? '你' : '雇'}</span>
        {cfg.persona.label}
      </div>

      <div className="chat" onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        {state.msgs.map((m) => (
          <MessageNode key={m.id} msg={m} liveCred={credits} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={`composer${dragging ? ' dragover' : ''}`}>
        {gate ? <ApprovalGate gate={gate} onApprove={approveGate} onReject={rejectGate} /> : null}
        <div className="composer-in">
          {chips.length > 0 ? (
            <div className="chips">
              {chips.map((c) => (
                <button key={c.label} className="chip" disabled={busy} onClick={() => submit(c.act)}>
                  {c.act === 'attach' ? <span className="plus">＋</span> : null} {c.label}
                </button>
              ))}
            </div>
          ) : null}
          <div className="box">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              disabled={deciding}
              placeholder={deciding ? '先决定上面这扇门…' : '说一句，或把文件拖进来…'}
              aria-label="对话输入"
            />
            <button
              className="upload"
              aria-label="上传文件"
              disabled={deciding}
              onClick={() => fileRef.current?.click()}
            >
              ＋
              <input ref={fileRef} type="file" onChange={onFile} tabIndex={-1} />
            </button>
            <button
              className="send"
              aria-label="发送"
              disabled={busy || deciding || text.trim().length === 0}
              onClick={() => submit(null)}
            >
              ↑
            </button>
          </div>
          <div className="composer-hint">拖文件 / 粘贴链接 / 说话，都行 —— 繁杂的部分是这个 agent 的活，不是你的。</div>
        </div>
      </div>
    </div>
  )
}

function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB'
  return bytes + ' B'
}
