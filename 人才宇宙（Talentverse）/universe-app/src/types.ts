// ============ 领域类型 ============

/** 视图：候选端 / 雇主端 / 闭环全景 */
export type End = 'candidate' | 'employer' | 'orbit'

/** 宇宙信号种类（诚实：只有真实动作产生；无"被看但不说明谁"的假指标） */
export type SignalKind = 'search' | 'view' | 'meet' | 'onboard'

export interface SignalEvt {
  id: string
  kind: SignalKind
  src: string
  ts: number
}

/** 证据档位 —— 三级徽章，语义绑定铁律（视觉：验青=已验证，虚线=孤证，灰=待补） */
export type Level = 'verified' | 'strongSolo' | 'solo' | 'pending'

export const LEVEL_LABEL: Record<Level, string> = {
  verified: '已验证',
  strongSolo: '强孤证',
  solo: '孤证',
  pending: '待补',
}

export interface EvidenceRow {
  id: string
  source: string
  claim: string
  /** 行级状态：已核验 / 孤证 / 待真人复核 */
  status: 'verified' | 'solo' | 'pendingReview'
  openable: boolean
}

export interface Dim {
  name: string
  level: Level
  evidenceIds: string[]
  gap?: string
}

export interface GapItem {
  missing: string
  lightsUp: string
}

export interface Archive {
  persona: string
  oneLiner: string
  dims: Dim[]
  evidence: EvidenceRow[]
  gaps: GapItem[]
  credibility: string[]
  updatedAt: string
}

export interface CandidateHit {
  id: string
  name: string
  isYou?: boolean
  canDo: string
  reasons: { verified: boolean; text: string }[]
  boundaries: string[]
  guarantee: string[]
  tags: string[]
}

export interface EmpResult {
  top: string
  note?: string
  candidates: CandidateHit[]
}

/** 用户自由说 / 系统附件消息体 */
export interface UserTextBody {
  text: string
  ghost?: boolean
}

export interface AttachmentBody {
  name: string
  size: string
}
