// ============ 候选端视图：门户 → 对话 + 我的星/星讯/分档地图 ============

import { useMemo, useState } from 'react'
import { ChatConv, type ConvCfg } from '../components/ChatConv'
import { Portal } from '../components/Portal'
import { MyStar } from '../components/SkyField'
import { EvidenceMap } from '../components/EvidenceMap'
import { candGreeting, candReply } from '../engine/flows'
import { buildArchive, candidateChips } from '../data/universe'
import { fmtRel, readStats, recordSignal } from '../lib/stats'
import { load } from '../lib/storage'
import type { End, SignalKind } from '../types'

const EVENT_LABEL: Record<string, { ic: string; text: string }> = {
  onboard: { ic: '✦', text: '你的档案已入宇宙 · 授权出示后才会被看到' },
  search: { ic: '◉', text: '被雇主搜索命中 · 你的档案进了那轮可见名单' },
  meet: { ic: '◎', text: '雇主已约面 · 正等回执（经你同意才发联系方式）' },
  view: { ic: '↑', text: '被打开查看（授权出示后）' },
}

export function CandidateView({ credits, onSwitch }: { credits: string[]; onSwitch: (end: End) => void }) {
  const storedStep = load<{ step: number } | null>('cand', null)?.step ?? 0
  const [mode, setMode] = useState<'portal' | 'chat'>(() => (storedStep >= 1 ? 'chat' : 'portal'))
  const [onboarded, setOnboarded] = useState<boolean>(storedStep >= 3)
  const [onboardTs, setOnboardTs] = useState(0)
  const [stats, setStats] = useState(readStats)

  const met = credits.some((c) => c.includes('约面'))

  const counts = useMemo(() => {
    const dims = buildArchive(credits, false).dims
    const c = { verified: 0, strongSolo: 0, solo: 0, pending: 0 }
    for (const d of dims) {
      if (d.level === 'verified') c.verified += 1
      else if (d.level === 'strongSolo') c.strongSolo += 1
      else if (d.level === 'solo') c.solo += 1
      else c.pending += 1
    }
    return c
  }, [credits])

  const handleSignal = (kind: SignalKind, src: string) => {
    const s = recordSignal(kind, src)
    setStats(s)
    if (kind === 'onboard') {
      setOnboarded(true)
      setOnboardTs(Date.now())
    }
  }

  const cfg: ConvCfg = {
    persona: { label: '候选端 · 你的能力档案整理师', accent: 'cand' },
    persistKey: 'cand',
    greet: candGreeting(),
    chips: candidateChips,
    fileHint: (step) =>
      step === 0 ? { name: 'data_dashboard_v2.pdf', size: '2.1 MB' } : { name: 'sales_week.png', size: '1.8 MB' },
    run: (step, act) => candReply(step, act, credits),
    classifyText: (step, text) => {
      if (step === 2 && /做过|补过|口径|定义过/.test(text)) return 'yes'
      if (step === 2) return 'no'
      return 'text'
    },
  }

  if (mode === 'portal') {
    return (
      <Portal
        overline="OBSERVATION LOG · 我的档案"
        eyebrow="候选端 · 证明我行 / 同一宇宙的另一头：雇主 · 敢用的人"
        title={
          onboarded ? (
            <>你的档案已<span className="k">入轨</span>——去补强它，或看它在夜空里的动静。</>
          ) : (
            <>把<span className="k">“做过的事”</span>投进一片天空</>
          )
        }
        lede={
          onboarded
            ? '一句话/一个文件 → 结成一页带得走的"能力证据档案"。我核过的才点亮，没核的我不替你亮。'
            : '你的一句话/一个文件 → 结成一页带得走的"能力证据档案"。我核过的才点亮，没核的我不替你亮。'
        }
        ctaLabel={storedStep >= 1 ? '继续补强我的档案 →' : '投第一颗星 →'}
        ctaSub={storedStep >= 1 ? '从上次停的地方接着来' : '30 秒，成为一颗雇主敢核的星'}
        onStart={() => setMode('chat')}
        cross={
          <div>
            那边是雇主的天 —— 只有你授权出示、且我核过的部分才会被它照到。
            <br />
            <a onClick={() => onSwitch('employer')}>去雇主端，看看他们会怎么照你 →</a>
            <span style={{ margin: '0 6px' }}>·</span>
            <a onClick={() => onSwitch('orbit')}>看整个闭环 →</a>
          </div>
        }
        sky={
          <div className="castwrap" style={{ margin: '0 auto' }}>
            <MyStar
              v={onboarded ? 2 : 0}
              spike={onboarded}
              warm={onboarded}
              meet={met}
              ignite={onboarded}
              cap={onboarded ? (met ? '我的档案 · 已入轨 · 被约面' : '我的档案 · 已入轨') : '档案 · 等第一件料'}
            />
          </div>
        }
      />
    )
  }

  return (
    <>
      <div className="viewtop">
        {onboarded ? (
          <div className="castwrap" key={onboardTs || 'o'}>
            <MyStar v={2} warm meet={met} cap={met ? '我的档案 · 已入轨 · 被约面' : '我的档案 · 已入轨'} />
          </div>
        ) : null}
        <div className="mysky">
          <div style={{ flex: 1 }}>
            <div className="t">
              档案状态 · 已验证 <b className="tnum">{counts.verified}</b> · 强孤证{' '}
              <b className="tnum">{counts.strongSolo}</b> · 待补 <b className="tnum">{counts.pending}</b>
            </div>
            <div className="t" style={{ marginTop: 2 }}>
              近 7 天宇宙动静（都来自真实动作）· 入轨 <b className="tnum">{counts7(stats).onboard}</b> · 命中{' '}
              <b className="tnum">{counts7(stats).search}</b> · 约面 <b className="tnum">{counts7(stats).meet}</b>
            </div>
          </div>
          <button className="btn ghost" onClick={() => onSwitch('orbit')}>
            看闭环 →
          </button>
        </div>
        <div className="panel rail">
          <div className="panel-bd" style={{ paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="kicker">你的档案在雇主视野里的样子</div>
              <span className="kicker" style={{ color: 'var(--text-3)' }}>证据覆盖，不是 0-100 分</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <EvidenceMap counts={counts} />
            </div>
          </div>
        </div>
        <Notices stats={stats} />
      </div>
      <ChatConv cfg={cfg} credits={credits} onSignal={handleSignal} />
    </>
  )
}

function counts7(stats: { events: { kind: string }[] }): Record<string, number> {
  const out: Record<string, number> = { onboard: 0, search: 0, meet: 0, view: 0 }
  for (const e of stats.events) {
    if (out[e.kind] != null) out[e.kind] += 1
  }
  return out
}

function Notices({ stats }: { stats: { events: { id: string; kind: string; src: string; ts: number }[] } }) {
  const [open, setOpen] = useState(true)
  const events = stats.events
  return (
    <div className="notices">
      <button className="hd" onClick={() => setOpen((o) => !o)}>
        星讯 · 档案在宇宙里的动静
        {events.length > 0 ? <span className="n">{events.length}</span> : null}
        <span className="chev" style={{ marginLeft: 'auto', transition: 'transform .18s var(--eo)', transform: open ? 'rotate(180deg)' : 'none' }}>⌄</span>
      </button>
      {open ? (
        events.length > 0 ? (
          <div>
            {events.slice(0, 6).map((e) => {
              const meta = EVENT_LABEL[e.kind] ?? { ic: '·', text: e.src }
              return (
                <div key={e.id} className="nitem">
                  <span className="ic">{meta.ic}</span>
                  <div style={{ flex: 1 }}>
                    <div>{meta.text}</div>
                    <div className="src">来源：{e.src}</div>
                  </div>
                  <span className="when">{fmtRel(e.ts)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="nitem">
            <div style={{ color: 'var(--text-2)' }}>
              还没有动静 —— 在雇主端让人搜你/约你一次，这里会如实亮起。我们不造"可能有人正看你"的假推送。
            </div>
          </div>
        )
      ) : null}
    </div>
  )
}
