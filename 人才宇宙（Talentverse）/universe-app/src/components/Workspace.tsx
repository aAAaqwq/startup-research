// 两端工作台（Act7）：frame + 可收起侧栏(历史对话/新建) + 面板
// 雇主：搜索 / JD星球 / 简历池 / 面试空间；候选：对话 / 简历 / 面试空间

import { useEffect, useState } from 'react'
import { SideChrome } from './SideChrome'
import { DossierModal, type DossierData } from './Dossier'
import { CandidateView } from '../views/CandidateView'
import { EmployerView } from '../views/EmployerView'
import { buildArchive, buildEmpResult } from '../data/universe'
import { recordJd, readJds, readInvites, sendInvite, decideInvite } from '../lib/jobs'
import { deriveLabel, pushSnapshot, readHist, type ConvSnapshot } from '../lib/history'
import { load, save } from '../lib/storage'
import { candGreeting, empGreeting } from '../engine/flows'
import type { End } from '../types'

function dossierOf(cand: { id: string; name: string; canDo: string; reasons: { verified: boolean; text: string }[]; boundaries: string[]; tags: string[] }): DossierData {
  const archive = cand.id === 'c1' ? buildArchive([], false) : null
  return {
    name: cand.name,
    role: cand.tags.join(' · '),
    canDo: cand.canDo,
    reasons: cand.reasons,
    boundaries: cand.boundaries,
    evidence: archive ? archive.evidence.map((e) => ({ source: e.source, claim: e.claim })) : cand.reasons.filter((r) => r.verified).map((r) => ({ source: '核验记录', claim: r.text })),
    human: 'A-07',
  }
}

const convKey = (end: End) => (end === 'employer' ? 'emp' : 'cand')
const modeKey = (end: End) => (end === 'employer' ? 'empMode' : 'candMode')

export function AppWorkspace({
  end,
  credits,
  onCredit,
  onSwitch,
}: {
  end: 'candidate' | 'employer'
  credits: string[]
  onCredit: (credit: string) => void
  onSwitch: (end: End) => void
}) {
  const [panel, setPanel] = useState<'chat' | 'pool' | 'resume' | 'interviews'>('chat')
  const [gen, setGen] = useState(0)
  const [jds, setJds] = useState(readJds)
  const [invites, setInvites] = useState(readInvites)
  const [hist, setHist] = useState<ConvSnapshot[]>(() => readHist(end))
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = load<boolean>('sideCollapse', false)
    if (typeof window !== 'undefined' && window.matchMedia('(max-width:900px)').matches) return true
    return saved
  })
  const [sel, setSel] = useState<DossierData | null>(null)

  useEffect(() => {
    save('sideCollapse', collapsed)
  }, [collapsed])

  const isEmp = end === 'employer'
  const pending = invites.filter((i) => i.status === 'pending').length

  const items = isEmp
    ? [
        { key: 'chat', icon: '✦', label: '人才宇宙搜索' },
        { key: 'pool', icon: '▤', label: '候选人简历池' },
        { key: 'interviews', icon: '◎', label: '面试空间', badge: pending },
      ]
    : [
        { key: 'chat', icon: '✦', label: '对话 · 我的档案' },
        { key: 'resume', icon: '▤', label: '能力证据 / 简历' },
        { key: 'interviews', icon: '◎', label: '面试空间', badge: pending },
      ]

  const refresh = () => {
    setInvites(readInvites())
    setHist(readHist(end))
  }

  const snapshotCurrent = () => {
    const cur = load<{ step: number; msgs: unknown[] } | null>(convKey(end), null)
    if (!cur || !cur.msgs || cur.msgs.length === 0 || cur.step === 0) return
    const mode = load<'portal' | 'chat'>(modeKey(end), cur.step >= 1 ? 'chat' : 'portal')
    pushSnapshot({ end, label: deriveLabel(cur as never), mode, conv: cur as never })
  }

  const newChat = () => {
    snapshotCurrent()
    const greet = isEmp ? empGreeting() : candGreeting()
    save(convKey(end), { step: 0, msgs: greet })
    save(modeKey(end), 'chat')
    setGen((g) => g + 1)
    setPanel('chat')
    setHist(readHist(end))
  }

  const restore = (snap: ConvSnapshot) => {
    save(convKey(end), snap.conv)
    save(modeKey(end), snap.mode)
    setGen((g) => g + 1)
    setPanel('chat')
    setHist(readHist(end))
  }

  const myDossier = !isEmp ? dossierOf(buildEmpResult().candidates[0]) : null
  const archive = !isEmp ? buildArchive([], false) : null

  const body =
    panel === 'chat' ? (
      isEmp ? (
        <EmployerView
          key={gen}
          credits={credits}
          onCredit={onCredit}
          onSwitch={onSwitch}
          onSearch={() => setJds(recordJd(3))}
          onMeet={() => {
            setInvites(sendInvite('c1', '阿哲'))
            onCredit('BI/数分岗 · 出海 SaaS · 面试邀约已发')
          }}
        />
      ) : (
        <CandidateView key={gen} credits={credits} onSwitch={onSwitch} />
      )
    ) : null

  let secondary = null
  if (isEmp && panel === 'pool') {
    secondary = (
      <div className="maincol-inner">
        <Header title="候选人简历池 · 不信 agent，就自己开档案核" />
        {buildEmpResult().candidates.map((c) => (
          <div key={c.id} className="itv">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="who">{c.name}</span>
              <span className="badge v">可核验</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{c.canDo}</div>
            <div className="row" style={{ marginTop: 8 }}>
              {c.tags.map((t) => (
                <span key={t} className="pill" style={{ background: 'rgba(255,255,255,.06)', border: '1px dashed var(--hairline-strong)', borderRadius: 999, padding: '1px 9px', fontSize: 11 }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="acts">
              <button className="btn teal" onClick={() => setSel(dossierOf(c))}>
                打开简历 / 证据档 →
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  } else if (panel === 'interviews') {
    secondary = (
      <div className="maincol-inner">
        <Header title={isEmp ? '面试空间 · 你发出的邀约' : '面试空间 · 收到的邀约（双向：你看得到对方公司）'} />
        {invites.length === 0 ? (
          <p className="ghostline" style={{ marginTop: 8 }}>
            {isEmp
              ? '还没有邀约 —— 在对话里对某人说「约面」，agent 会把邀约发到对方档案端（含公司信息，双向匹配）。'
              : '还没有邀约。当雇主在另一头「约面」，agent 会把带公司信息的邀约推到这里，由你决定是否同意。'}
          </p>
        ) : (
          invites.map((i) => (
            <div key={i.id} className="itv">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="who">{isEmp ? i.candName : `${i.company} · ${i.candName}`}</span>
                <span className={`status ${i.status}`}>{i.status === 'pending' ? (isEmp ? '待对方回应' : '待你决定') : i.status === 'accepted' ? (isEmp ? '已确认 · 双向匹配' : '已确认') : '已婉拒'}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>{new Date(i.createdTs).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="row">{i.jdTitle} · {i.company}</div>
              {!isEmp ? <div className="row" style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '6px 10px' }}>{i.companyBlurb}</div> : null}
              {!isEmp && i.status === 'pending' ? (
                <div className="acts">
                  <button className="btn teal" onClick={() => { setInvites(decideInvite(i.id, 'accepted')); onCredit('BI/数分岗 · 面试确认 · 双向匹配') }}>
                    同意面试
                  </button>
                  <button className="btn out" onClick={() => setInvites(decideInvite(i.id, 'declined'))}>婉拒</button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    )
  } else if (!isEmp && panel === 'resume' && myDossier && archive) {
    secondary = (
      <div className="maincol-inner">
        <Header title={`我的能力证据档案 · ${myDossier.name}`} />
        <div className="itv">
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{archive.oneLiner}</div>
          <div className="row" style={{ marginTop: 6 }}>
            <span className="badge v">已验证 {archive.dims.filter((d) => d.level === 'verified').length}</span>
            <span className="badge ss">强孤证 {archive.dims.filter((d) => d.level === 'strongSolo').length}</span>
            <span className="badge p">待补 {archive.dims.filter((d) => d.level === 'pending').length}</span>
          </div>
          <div className="acts">
            <button className="btn teal" onClick={() => setSel(myDossier)}>打开我的简历 / 证据档 →</button>
            <button className="btn out" onClick={() => setPanel('chat')}>回对话继续补强</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="frame" style={{ gridTemplateColumns: collapsed ? '70px 1fr' : '248px 1fr' }}>
      <SideChrome
        header={isEmp ? '雇主 · 工作台' : '候选 · 工作台'}
        items={items}
        active={panel}
        onNav={(k) => {
          setPanel(k as typeof panel)
          refresh()
        }}
        hist={hist}
        onNew={newChat}
        onRestore={restore}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="maincol">
        {jds.length > 0 && isEmp && (
          <div style={{ maxWidth: 820, margin: '0 auto', padding: '14px 20px 0' }}>
            <div className="jdplanet">
              <div className="t">◈ {jds[0].title}</div>
              <div className="s">{jds[0].company} · 本 JD 候选人星球 {jds[0].starCount} 颗</div>
            </div>
          </div>
        )}
        {body}
        {secondary}
      </div>
      <DossierModal data={sel} open={sel != null} onClose={() => setSel(null)} />
    </div>
  )
}

function Header({ title }: { title: string }) {
  return (
    <div style={{ margin: '0 0 6px' }}>
      <div className="overline">WORKSPACE</div>
      <h2 className="display" style={{ fontSize: 24, margin: '6px 0 14px' }}>{title}</h2>
    </div>
  )
}
