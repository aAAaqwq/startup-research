// ============ 消息模型 ============

import type { Archive, AttachmentBody, EmpResult, UserTextBody } from './types'

export type Msg =
  | { id: string; role: 'agent'; kind: 'text'; text: string }
  | { id: string; role: 'user'; kind: 'text'; text: string; ghost?: boolean }
  | { id: string; role: 'system'; kind: 'attach'; name: string; size: string }
  | { id: string; role: 'agent'; kind: 'thinking'; text: string }
  | { id: string; role: 'agent'; kind: 'conclusion'; body: ConclusionBody }
  | { id: string; role: 'agent'; kind: 'pipeline'; body: { title: string; steps: { label: string; meta?: string }[] } }
  | { id: string; role: 'agent'; kind: 'archive'; body: Archive }
  | { id: string; role: 'agent'; kind: 'emp'; body: EmpResult }
  | { id: string; role: 'agent'; kind: 'note'; body: { em: string; text: string } }

export interface ConclusionBody {
  kicker: string
  dim: string
  line: string
  level: 'verified' | 'solo'
  evidence: string[]
  missing?: string
}

/** 一次"用户动作 → agent 应答"的编排。item 之间按顺序、各自带 delay 播放 */
export interface StageItem {
  delay: number
  msgs: Msg[]
}

export type { Archive, AttachmentBody, EmpResult, UserTextBody }
