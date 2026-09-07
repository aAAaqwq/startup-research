// 历史对话账本：把一段对话快照存入本地，可新建/恢复（多线程切换）。

import { load, save } from './storage'
import type { Msg } from '../msg'
import type { End } from '../types'

export interface ConvSnapshot {
  id: string
  end: End
  label: string
  ts: number
  mode: 'portal' | 'chat'
  conv: { step: number; msgs: Msg[] }
}

const KEY = 'hist'
const MAX = 14

let seq = 0
const nid = () => `h${Date.now().toString(36)}${(seq += 1).toString(36)}`

export function readHist(end: End): ConvSnapshot[] {
  return load<ConvSnapshot[]>(KEY, []).filter((s) => s.end === end)
}

export function pushSnapshot(snap: Omit<ConvSnapshot, 'id' | 'ts'>): void {
  const all = load<ConvSnapshot[]>(KEY, [])
  const next = [{ ...snap, id: nid(), ts: Date.now() }, ...all].slice(0, MAX * 2)
  save(KEY, next)
}

/** 从对话消息里推导一个人类可读的标签 */
export function deriveLabel(conv: { msgs: Msg[] }): string {
  const first = conv.msgs.find((m) => (m.kind === 'text' && m.role === 'user') || m.kind === 'attach')
  if (first && first.kind === 'attach') return `上传 ${first.name}`
  if (first && first.kind === 'text') return first.text.replace(/\s+/g, ' ').slice(0, 20)
  const emp = conv.msgs.find((m) => m.kind === 'emp')
  if (emp) return '宇宙搜索 · BI/数分 · 出海'
  const arc = conv.msgs.find((m) => m.kind === 'archive')
  if (arc) return '建档收口 · 能力证据档案'
  return '新对话'
}
