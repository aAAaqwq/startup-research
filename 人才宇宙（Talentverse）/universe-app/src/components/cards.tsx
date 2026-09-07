// ============ 结果卡组件（结论 / 档案 / 雇主精选 / 升档通知 / 担保） ============
// 语义绑定铁律：验青只表已验证，印朱只表敢退/换，灰/虚线只表孤证/待补。

import { useState, type ReactNode } from 'react'
import type { Level } from '../types'
import type { Archive, ConclusionBody, EmpResult } from '../msg'

/* ---------- 图标 ---------- */
export function Check({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true">
      <path
        d="M1 5.5 4 8l5-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------- 三级徽章（弱视可读：文字 + 色 + 形态） ---------- */
const BADGE_CLASS: Record<Level, string> = {
  verified: 'v',
  strongSolo: 'ss',
  solo: 's',
  pending: 'p',
}
const BADGE_LABEL: Record<Level, string> = {
  verified: '已验证',
  strongSolo: '强孤证',
  solo: '孤证',
  pending: '待补',
}
export function LevelBadge({ level }: { level: Level }) {
  return <span className={`badge ${BADGE_CLASS[level]}`}>{BADGE_LABEL[level]}</span>
}

function EvidenceState({ status }: { status: 'verified' | 'solo' | 'pendingReview' }) {
  if (status === 'verified') {
    return <span className="badge v"><Check size={7} />已核验</span>
  }
  if (status === 'solo') {
    return <span className="badge s">孤证</span>
  }
  return <span className="badge p">待真人复核</span>
}

/* ---------- 折叠：「它核了什么」--------- */
export function Collapse({ label, defaultOpen = false, children }: { label: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`collapse${open ? ' open' : ''}`}>
      <button className="collapse-head" onClick={() => setOpen((o) => !o)}>
        {open ? '收起' : label}
        <span className="chev">▾</span>
      </button>
      <div className="collapse-body">
        <div>
          <div className="collapse-inner">{children}</div>
        </div>
      </div>
    </div>
  )
}

/* ---------- 担保印朱块 ---------- */
export function Guarantee({ lines, title = '履约担保' }: { lines: string[]; title?: string }) {
  return (
    <div className="guar">
      <div className="stamp">保</div>
      <div>
        <div className="t">{title}</div>
        {lines.map((l) => (
          <div key={l} className="s">· {l}</div>
        ))}
      </div>
    </div>
  )
}

/* ---------- 结论卡（单条） ---------- */
export function ConclusionCard({ body }: { body: ConclusionBody }) {
  return (
    <div className="panel rail">
      <div className="panel-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="kicker">{body.kicker}</span>
        {body.level === 'verified' ? <span className="badge v"><Check size={7} />已验证</span> : <span className="badge s">孤证</span>}
      </div>
      <div className="panel-bd">
        <div className="h1">{body.dim}</div>
        <div className="sub1" style={{ marginTop: 4 }}>{body.line}</div>
        <div className="hair" />
        <div className="ev-list">
          {body.evidence.map((e) => (
            <div key={e} className="evrow">
              <span className="ev-state"><span className="badge v"><Check size={7} />已核验</span></span>
              <div className="d">
                <div className="src">{e}</div>
              </div>
              <span className="open">原件 ↗</span>
            </div>
          ))}
        </div>
        {body.missing ? (
          <div className="gap-line" style={{ marginTop: 10 }}><span className="l">还差</span><span>{body.missing}</span></div>
        ) : null}
        <div style={{ marginTop: 8 }}>
          <Collapse label="它核了什么（默认收起 · 想看再展开）">
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
              AI 辅助评估读原件 → 真人多轮技术追问 → 反作弊核查 → 人工复核终审。这里每一步都可回到原件核对；没有一句话是不能被追问的。
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  )
}

/* ---------- 升档 / 系统通知 ---------- */
export function NoteCard({ em, text }: { em: string; text: string }) {
  return (
    <div className="panel" style={{ borderLeft: `3px solid var(--teal-600)` }}>
      <div className="panel-bd" style={{ paddingTop: 12 }}>
        <div className="kicker" style={{ color: 'var(--teal-700)', fontWeight: 600 }}>{em}</div>
        <div style={{ fontSize: 14, marginTop: 4 }}>{text}</div>
      </div>
    </div>
  )
}

/* ---------- 能力证据档案卡 ---------- */
export function ArchiveCard({ body, liveCred }: { body: Archive; liveCred: string[] }) {
  const extra = liveCred.filter((c) => !body.credibility.includes(c))
  const creds = body.credibility.concat(extra)
  return (
    <div className="panel rail">
      <div className="panel-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="kicker">你的能力证据档案</span>
        <span className="kicker tnum" style={{ color: 'var(--text-3)' }}>{body.updatedAt}</span>
      </div>
      <div className="panel-bd">
        <div className="h1">{body.persona}</div>
        <div className="sub1" style={{ marginTop: 6, fontWeight: 500, color: 'var(--text-1)' }}>{body.oneLiner}</div>

        <div className="hair" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {body.dims.map((d) => (
            <div key={d.name} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <LevelBadge level={d.level} />
              <span style={{ fontSize: 14, flex: 1 }}>{d.name}</span>
              {d.gap ? <span className="kicker" style={{ color: 'var(--text-3)' }}>{d.gap}</span> : null}
            </div>
          ))}
        </div>

        <div className="hair" />
        <div className="kicker" style={{ marginBottom: 6 }}>可核验证据（每行都有源）</div>
        <div className="ev-list">
          {body.evidence.map((e) => (
            <div key={e.id} className="evrow">
              <span className="ev-state"><EvidenceState status={e.status} /></span>
              <div className="d">
                <div className="src">{e.source}</div>
                <div className="claim">{e.claim}</div>
              </div>
              {e.openable ? <span className="open">原件 ↗</span> : null}
            </div>
          ))}
        </div>

        <div className="hair" />
        <div className="kicker" style={{ marginBottom: 4 }}>还差什么（按雇主采信影响排序 · 补齐即点亮）</div>
        {body.gaps.map((g) => (
          <div key={g.missing} className="gap-line">
            <span className="l">补</span>
            <span>{g.missing} → <b style={{ color: 'var(--teal-700)', fontWeight: 600 }}>{g.lightsUp}</b></span>
          </div>
        ))}

        <div className="hair" />
        <div className="kicker" style={{ marginBottom: 4 }}>被采信记录</div>
        {creds.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {creds.map((c) => (
              <div key={c} className="evrow" style={{ padding: '7px 10px' }}>
                <span className="ev-state"><span className="badge v"><Check size={7} />采信</span></span>
                <div className="d" style={{ alignSelf: 'center' }}>{c}</div>
                {extra.includes(c) ? <span className="badge v" style={{ flex: 'none' }}>刚新增</span> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="kicker" style={{ color: 'var(--text-3)' }}>尚无 —— 去雇主端让人采信一次，它会自己亮起来。</div>
        )}
      </div>
      <div className="panel-ft">
        <div className="kicker" style={{ color: 'var(--text-2)' }}>更新承诺：随你每次丢进来的新料自动重跑，旧孤证可能当场升档 · 出示链接：tv.verify/a/zhe-20260907</div>
      </div>
    </div>
  )
}

/* ---------- 雇主精选结果卡 ---------- */
export function EmpResultCard({ body }: { body: EmpResult }) {
  return (
    <div className="panel" style={{ borderTop: `3px solid var(--teal-600)` }}>
      <div className="panel-hd" style={{ paddingTop: 16 }}>
        <span className="kicker">雇主端 · 已验证精选</span>
        <div className="sub1" style={{ marginTop: 6, fontWeight: 500, color: 'var(--text-1)' }}>{body.top}</div>
        {body.note ? <div className="kicker" style={{ color: 'var(--text-2)', marginTop: 6 }}>{body.note}</div> : null}
      </div>
      <div className="panel-bd">
        {body.candidates.map((c, i) => (
          <div key={c.id} className={`hit${c.isYou ? ' hot' : ''}`}>
            <div className="nm">
              #{i + 1} {c.name}
              {c.isYou ? <span className="badge v">候选端同源档案 · 已授权出示</span> : null}
            </div>
            <div className="can">{c.canDo}</div>
            <div className="tags" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {c.tags.map((tag) => (
                <span key={tag} className="kicker" style={{ background: 'var(--surface-inset)', padding: '2px 9px', borderRadius: 'var(--r-pill)', color: 'var(--text-2)' }}>{tag}</span>
              ))}
            </div>
            <div className="rs">
              {c.reasons.map((r) => (
                <div key={r.text} className="r">
                  <span className="ok">{r.verified ? '✓' : '○'}</span>
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
            {c.boundaries.length > 0 ? (
              <div className="bds">
                <b>我不替你背书的：</b>
                {c.boundaries.join(' ')}
              </div>
            ) : null}
            <div style={{ marginTop: 10 }}>
              <Guarantee lines={c.guarantee} />
            </div>
          </div>
        ))}
      </div>
      <div className="panel-ft">
        <div className="kicker" style={{ color: 'var(--text-2)' }}>
          每张卡都带人工复核提示行；「该评估如何做出」随时可展开。AI 辅助评估 + 专业人员复核终审 —— AI 不当最终拍板者。
        </div>
      </div>
    </div>
  )
}
