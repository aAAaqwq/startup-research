// ============ 对话流程引擎（确定性编排，屏蔽繁杂过程 = 默认只见结果） ============

import type { Msg, StageItem } from '../msg'
import { buildArchive, buildEmpResult, JD_TEXT } from '../data/universe'
import type { End, SignalKind } from '../types'

let seq = 0
export function nid(prefix = 'm'): string {
  seq += 1
  return `${prefix}${Date.now().toString(36)}${seq.toString(36)}`
}

const t = (text: string): Msg => ({ id: nid(), role: 'agent', kind: 'text', text })
const th = (text: string): Msg => ({ id: nid(), role: 'agent', kind: 'thinking', text })
const note = (em: string, text: string): Msg => ({ id: nid(), role: 'agent', kind: 'note', body: { em, text } })
const item = (delay: number, ...msgs: Msg[]): StageItem => ({ delay, msgs })

export interface RunResult {
  next: number
  items: StageItem[]
  credit?: string
  goto?: End
  signal?: { kind: SignalKind; src: string }
}

// ====================== 候选端 ======================

export function candGreeting(): Msg[] {
  return [
    t(
      '我把你「做过的事」变成一份带得走、雇主敢信的「能力证据档案」。\n\n' +
        '你不用填表 —— 跟我说一句话，或把任何东西拖进来：作品、文档、数据、代码、周报、链接，都行。\n\n' +
        '先给我一件你最想证明的事：你做过、做成、且愿意让我核的。就一件。',
    ),
  ]
}

export function candReply(step: number, act: string, credits: string[]): RunResult {
  // 首料 → 结论 #1
  if (step === 0) {
    return {
      next: 1,
      items: [
        item(650, th('正在读你给的东西…')),
        item(
          900,
          t(
            '读完了。里面有完整架构图和 12 个指标定义 —— 「能把一块看板从接数到可视化完整做出来」，这条现在有原件撑，我标 ✓ 已验证。',
          ),
          {
            id: nid(),
            role: 'agent',
            kind: 'conclusion',
            body: {
              kicker: '结论 #1 · 从你的材料里提出来',
              dim: '数据看板交付（端到端）',
              line: '能独立把一块看板从接数到可视化完整交付 —— 有原件支撑',
              level: 'verified',
              evidence: ['data_dashboard_v2.pdf · 架构 3 页 + 12 指标定义'],
            },
          },
        ),
        item(
          900,
          t(
            '但「真给业务带来变化」这句我看不到：文档里写了「提升销售效率」，没有数字、没有谁确认过、没有使用记录。这句话我先不替你背书。\n\n' +
              '把它升成已验证，通常只差一件：一个第二方（谁确认过），或一个数字（哪段到哪段、从多少到多少）。你手上有吗？30 秒，一句话或一个文件。',
          ),
        ),
      ],
    }
  }

  // 补料 → 升档（21%→34%）
  if (step === 1) {
    return {
      next: 2,
      items: [
        item(500, th('在读你补的东西…')),
        item(
          800,
          note(
            '升档通知',
            '「看板上线后，销售转化 21%→34%」→ ✓ 已验证（周报日期 / 数值 / 署名齐，第二方记录可独立核验）',
          ),
        ),
        item(
          1000,
          t(
            '这条现在是证据链里最硬的一环。但雇主的第二问通常是：这件事真是你做的吗？\n\n' +
              '目前它靠「周报署名 + 项目页署名」撑着 —— 严格说是 强孤证，还不是铁证。要雇主绝对放心，差一句第二方确认（同事 / 主管一句话、评审、邮件都行）。不急，档案记着这一项，你有空再补。\n\n' +
              '下一个问题，还是只问一项：\n「指标口径」你单独定义过吗，或者抓过别人数字算错的例子？做过 —— 丢个东西；没做过 —— 我老实标 待补，不替你编。回一句「没有」也行。',
          ),
        ),
      ],
    }
  }

  // 纵深：口径 有/无 → 收口成档案
  if (step === 2) {
    const hadCaliber = act === 'yes'
    const archive = buildArchive(credits, hadCaliber)
    const countLine = hadCaliber
      ? '口径这格亮了。你的档案现在：已验证 3 项 · 强孤证 1 项 · 待补 1 项（出海）。'
      : '好 —— 口径标 待补，不替你编。你的档案现在：已验证 2 项 · 强孤证 1 项 · 待补 2 项（口径 + 出海）。'
    return {
      next: 3,
      signal: { kind: 'onboard', src: '档案收口 · 入宇宙' },
      items: [
        item(120, {
          id: nid(),
          role: 'agent',
          kind: 'pipeline',
          body: {
            title: '分析流水线 · 建档收口',
            steps: [
              { label: '读取你的材料 · 证据抽提' },
              { label: '按档位归档 · 已验证 / 孤证 / 待补', meta: '逐条锚定原件' },
              { label: '缺口判定 · 一次只问一项', meta: '按雇主采信影响排序' },
              { label: '人工复核终审', meta: '复核员 A-07' },
            ],
          },
        }),
        item(
          hadCaliber ? 600 : 300,
          ...(hadCaliber ? [note('升档通知', '「指标口径定义」→ ✓ 已验证')] : []),
        ),
        item(1200, t(`${countLine}\n\n我收口成你的档案 —— 它不是一页表单，是这次对话自己凝结成的一张活卡。`)),
        item(1850, { id: nid(), role: 'agent', kind: 'archive', body: archive }),
        item(
          2400,
          t('它可以带走、可以出示、会随你每次丢进来的新料自动重跑 —— 旧孤证可能当场升档。\n\n在左侧边栏看它的简历档、被看记录；也去雇主端看看它在另一头长什么样。'),
        ),
      ],
    }
  }

  // 已收口：导出 / 出示 / 润色
  if (act === 'polish') {
    return {
      next: 3,
      items: [
        item(
          700,
          note(
            '润色 · 只改说法，不改已验事实',
            '原句：「能独立把一个业务问题做成带口径与提效度量的数据看板（原件 + 第二方周报双支撑）；缺出海协作铁证。」',
          ),
          t(
            '建议改写（前后对照，草稿不影响已验证字段，需你真人确认后生效）：\n\n' +
              '· 「我独立交付过一份带口径与提效度量的数据看板 —— 架构 3 页 + 12 指标定义有原件可核，上线后销售转化 21%→34% 有第二方周报佐证。」\n' +
              '· 「出海协作目前是缺口，我把它标在待补，不假装有 —— 补一轮评估即可点亮。」\n\n' +
              '我没有替你补任何数字、日期或第二方 —— 每个新说法都锚在档案已有证据上。孤证依旧孤证，待补依旧待补。',
          ),
        ),
      ],
    }
  }
  return {
    next: 3,
    items: [
      item(
        500,
        note(
          '已生成出示链接',
          '唯一核验 URL：tv.verify/a/zhe-20260907 —— 学信网式可核验，谁拿到谁可查，你不再需要反复转发原件。',
        ),
        t(
          '要带去别处用，随时说。有新料（一件作品 / 一句第二方确认 / 一份文档）丢进来，档案自己会更新、会自动变强。',
        ),
      ),
    ],
  }
}

// ====================== 雇主端 ======================

export function empGreeting(): Msg[] {
  return [
    t(
      '把你要的人丢给我 —— 一句话，或一份 JD / 简历包。我不会给你一屏简历，只给 2-4 个「敢用」的人：\n\n' +
        '· 每个都贴你的 JD 讲清楚凭什么敢用\n' +
        '· 哪一句我不敢替他背书，我明说\n' +
        '· 不合适怎么退换，白纸黑字\n\n' +
        '先说要什么岗、跟什么样的人干。',
    ),
  ]
}

export function empReply(step: number, act: string): RunResult {
  // 一句话 / JD → 盘点 + 精选
  if (step === 0) {
    return {
      next: 1,
      signal: { kind: 'search', src: `雇主搜索命中 · ${JD_TEXT}` },
      items: [
        item(120, {
          id: nid(),
          role: 'agent',
          kind: 'pipeline',
          body: {
            title: '分析流水线 · 检索人才宇宙',
            steps: [
              { label: '解析 JD · 生成岗位画像', meta: '并入公司信息' },
              { label: '画像 × 授权视野检索' },
              { label: '逐人核验 · 命中 / 缺口对账' },
              { label: '敢背书排序 · 只勾已验证' },
              { label: '人工复核终审', meta: '复核员 A-07' },
            ],
          },
        }),
        item(1200, t(`读完了。你要「${JD_TEXT}」（${'海升科技 · 出海 SaaS'}）。先交底，再给人。`)),
        item(
          2200,
          {
            id: nid(),
            role: 'agent',
            kind: 'emp',
            body: buildEmpResult(),
          },
        ),
        item(
          2600,
          t(
            '上面对我背书的每一句，都只勾「已验证」的部分；孤证 / 待补那句我既没背书、也不跟你收那部分的钱。\n\n' +
              '在左侧栏可以打开他的简历档核验原件；下一步：约面 #1，核原件，还是先把 #1 的「出海」补强？',
          ),
        ),
      ],
    }
  }

  // 决定
  if (step === 1) {
    if (act === 'meet') {
      return {
        next: 2,
        credit: 'BI/数分岗 · 出海 SaaS · 约面',
        signal: { kind: 'meet', src: '雇主端约面 #1 阿哲' },
        items: [
          item(
            600,
            note(
              '约面回执',
              '已把 #1（阿哲）的可约时段整理成一句话，发给对方确认；经他本人同意出示联系方式后，30 分钟内给你回执。',
            ),
            t(
              '约面确认后，这条会被回写进他的档案「被采信记录」—— 下次同类岗，它会自己亮出来。\n\n' +
                '回到候选端，你能亲眼看到档案新增了这行。',
            ),
          ),
        ],
      }
    }
    if (act === 'verify') {
      return {
        next: 1,
        items: [
          item(
            600,
            t(
              '证据原件都挂在他档案的每一行里，可点开核对 —— PDF 原文、周报原图，都是源。我不会只给一句「AI 说他行」。\n\n' +
                '核完回一句「约面 #1」，或「补强出海」再定。',
            ),
          ),
        ],
      }
    }
    // upgrade
    return {
      next: 1,
      items: [
        item(
          600,
          t(
            '要补「出海」，工序是：一轮出海场景真人技术评估 + 一段英文协作样例。\n\n' +
              '它会把 待补 升成 已验证 —— 也是我唯一敢对雇主收钱的部分，因为这格起我敢背书。\n\n' +
              '走这条回「补强」，想直接推进回「约面 #1」。',
          ),
        ),
      ],
    }
  }

  // 完成态
  return { next: 2, items: [] }
}
