// ============ 原型种子与文案（真实口径 · 诚实措辞） ============
// 文案遵循 CPO v2 措辞铁律：孤证不讲过已验证、不承诺 offer、印朱只盖"试用不符可退换"。

import type { Archive, CandidateHit, Dim, EmpResult, EvidenceRow, GapItem } from '../types'

export const NOW = '2026-09-07'

export function buildArchive(credibility: string[], caliberVerified = false): Archive {
  const evidence: EvidenceRow[] = [
    {
      id: 'ev-doc',
      source: 'data_dashboard_v2.pdf · 架构 3 页 + 12 指标定义',
      claim: '能独立把一块看板从接数到可视化完整交付 —— 有原件支撑',
      status: 'verified',
      openable: true,
    },
    {
      id: 'ev-week',
      source: 'sales_week.png · 上线后首月周报',
      claim: '周报日期 / 数值 / 署名齐 —— 第二方记录，可独立核验',
      status: 'verified',
      openable: true,
    },
  ]
  if (caliberVerified) {
    evidence.push({
      id: 'ev-cal',
      source: 'caliber_defs.md · 口径定义 / 纠错记录',
      claim: '定义过指标口径、能说清统计边界 —— 有文档支撑',
      status: 'verified',
      openable: true,
    })
  }
  const gaps: GapItem[] = [
    { missing: '一轮出海场景真人评估，或一份英文协作样例', lightsUp: '出海协作 → 已验证' },
    { missing: '一句"是你做的"第二方确认（同事 / 主管聊天、评审、邮件均可）', lightsUp: '归属铁证 → 已验证' },
  ]
  if (!caliberVerified) {
    gaps.push({ missing: '一份你写过的指标口径定义，或一次纠错记录', lightsUp: '指标口径定义 → 已验证' })
  }
  const dims: Dim[] = [
    { name: '数据看板交付（端到端）', level: 'verified' as const, evidenceIds: ['ev-doc', 'ev-week'] },
    { name: '业务提效度量（上线后 21%→34%）', level: 'verified' as const, evidenceIds: ['ev-week'] },
    { name: '归属铁证（"是你做的"）', level: 'strongSolo' as const, evidenceIds: ['ev-week'] },
    caliberVerified
      ? { name: '指标口径定义', level: 'verified' as const, evidenceIds: ['ev-cal'] }
      : { name: '指标口径定义', level: 'pending' as const, evidenceIds: [], gap: '给一份口径定义 / 一次纠错记录' },
    { name: '出海协作（远程 · 英文书面）', level: 'pending' as const, evidenceIds: [], gap: '一轮出海场景评估 / 英文样例' },
  ]
  const archive: Archive = {
    persona: '阿哲（化名）',
    oneLiner:
      '能独立把一个业务问题做成带口径与提效度量的数据看板（原件 + 第二方周报双支撑）；缺出海协作铁证。',
    dims,
    evidence,
    gaps,
    credibility,
    updatedAt: `${NOW} · 会话收口`,
  }
  return archive
}

export function candidateChips(step: number): { label: string; act: 'attach' | 'no' | 'yes' | 'export' | 'polish' }[] {
  switch (step) {
    case 0:
      return [
        { label: '上传：项目讲解 PDF', act: 'attach' },
        { label: '就说一句话：我做过一个数据看板', act: 'attach' },
      ]
    case 1:
      return [
        { label: '上传：上线后首月销售周报截图', act: 'attach' },
        { label: '补一句：转化从 21% 涨到 34%', act: 'attach' },
      ]
    case 2:
      return [
        { label: '口径这块没单独做过 —— 标待补，别编', act: 'no' },
        { label: '做过 —— 补一份口径文档', act: 'yes' },
      ]
    case 3:
      return [
        { label: '导出档案 / 生成出示链接', act: 'export' },
        { label: '让 agent 润色档案（只改说法，不编造）', act: 'polish' },
      ]
    default:
      return []
  }
}

// ---------- 雇主端种子 ----------
export const JD_TEXT =
  'BI / 数据分析师 · 能独立交付数据看板 · 出海 SaaS 团队 · 最好带过销售数据'

export function buildEmpResult(): EmpResult {
  const candidates: CandidateHit[] = [
    {
      id: 'c1',
      name: '阿哲',
      isYou: true,
      canDo: '能独立交付带口径与提效度量的数据看板（有原件 + 第二方双支撑）',
      reasons: [
        { verified: true, text: '你要「SaaS 销售数据」→ 他交付过 SaaS 转化看板，上线后 21%→34%（已验证 · 周报原件）' },
        { verified: true, text: '你要「独立交付看板」→ 架构 + 12 指标定义已核，端到端交付有原件（已验证）' },
        { verified: false, text: '你要「出海」→ 档案里没有，如实标待补' },
      ],
      boundaries: ['「出海协作」目前是待补，我不替它背书。'],
      guarantee: [
        '试用期发现他与「已验证」部分不符 → 可换同档 1 次，或退该单服务费',
        '孤证 / 待补部分不在担保内 —— 那部分我本就没敢跟你收钱',
      ],
      tags: ['BI 看板交付 · 已验证', 'SaaS 销售数据 · 已验证', '出海 · 待补'],
    },
    {
      id: 'c2',
      name: '于蓝',
      canDo: '两年北美 SaaS 团队真实协作，跨境/远程习惯成熟',
      reasons: [
        { verified: true, text: '你要「出海」→ 前雇主邮件 + 在职项目佐证两年北美协作（已验证）' },
        { verified: false, text: '你要「独立交付看板」→ 目前是其自述，孤证，我不背书' },
      ],
      boundaries: ['「独立交付看板」是孤证 —— 要敢用他，先补一场带实操的真人评估。'],
      guarantee: [
        '已验证部分不符 → 可换同档 1 次或退该单费',
      ],
      tags: ['出海 · 已验证', 'BI 交付 · 孤证'],
    },
    {
      id: 'c3',
      name: '陈述',
      canDo: '数仓口径扎实，能写清指标定义',
      reasons: [
        { verified: true, text: '你要「口径能算对」→ 他有一份自建口径文档 + 数仓评审记录（已验证）' },
        { verified: false, text: '你要「面向业务的可视化交付」→ 偏数仓工程，看板前端经验少（部分不符，如实说）' },
      ],
      boundaries: ['他是数仓 / 口径向，不是看板可视化向 —— 若这岗强看板前端，他不合适。'],
      guarantee: ['已验证部分不符 → 可换同档 1 次或退该单费'],
      tags: ['指标口径 · 已验证', '看板可视化 · 偏弱'],
    },
  ]
  return {
    top:
      '你要「BI/数分 · 独立交付看板 · 出海 SaaS」。宇宙里 3 人够格我敢背书，0 人完全对口 —— 全都在「出海」或「独立看板铁证」上有一格。我按敢用度排，最贴的第 1 位，就是你在候选端刚建档、刚授权出示的那份。',
    note: '只有你授权出示的档案，才会进入我视野 —— 我没有也攒不出一个"全量人才库"。',
    candidates,
  }
}

export function employerChips(step: number): { label: string; act: string }[] {
  switch (step) {
    case 0:
      return [
        { label: '上传：JD（BI · 出海 SaaS）', act: 'attach' },
        { label: '一句话：要数分，独立交付看板，出海优先', act: 'attach' },
      ]
    case 1:
      return [
        { label: '约面 #1 阿哲', act: 'meet' },
        { label: '核原件 #1（只看证据）', act: 'verify' },
        { label: '先把 #1 的"出海"补强再定', act: 'upgrade' },
      ]
    case 2:
      return [{ label: '回到候选端，看档案新增的"被采信记录"', act: 'gocand' }]
    default:
      return []
  }
}
