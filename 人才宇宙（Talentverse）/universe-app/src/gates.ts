// ============ 人类闸门（Act8）：发外部 / 要钱 / 改证据草稿 ============
// 语义铁律：闸门 = "待真人拍板"，用 amber 虚线族；≠ 证据档三色（验青/孤证/待补灰）。
// 结构按设计 §3 Gate：kind / draft(将发或将改) + against(原文对照) / 由谁要求 / 决定。

export type GateKind = 'external' | 'spend' | 'evidence-mutation'

export const GATE_KIND_LABEL: Record<GateKind, string> = {
  external: '发外部 · 待你决定',
  spend: '要钱 / 触发担保 · 待你决定',
  'evidence-mutation': '改证据草稿 · 待你决定',
}

export const GATE_APPROVE_LABEL: Record<GateKind, string> = {
  external: '确认发出',
  spend: '确认并触发',
  'evidence-mutation': '确认生效',
}

/** 原文对照（against）：改/发之前原本是什么 */
export interface GateAgainst {
  label: string
  lines: string[]
}

/** 一次待决闸门的内容。id 由消费方生成；act/step 用于批准后 resume 原动作。 */
export interface GateProposal {
  kind: GateKind
  act: string
  step: number
  title: string
  why: string
  /** draft：将发出 / 将改动的内容（给用户看，未生效） */
  draft: string[]
  /** against：原文对照 */
  against: GateAgainst
}

/** 驳回后 agent 的显式回退说明（永不静默改更版本） */
export function rejectCopy(kind: GateKind): string {
  if (kind === 'external') {
    return '已取消本次对外发送 —— 什么都没发出去。想发再点一次，或先核原件再定。'
  }
  if (kind === 'spend') {
    return '已取消 —— 没有产生任何扣费或触发担保。'
  }
  return '已驳回草稿 —— 档案措辞保持原样，未做任何改动，孤证依旧孤证、待补依旧待补。'
}
