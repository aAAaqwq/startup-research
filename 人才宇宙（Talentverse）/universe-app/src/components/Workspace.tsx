// 两端工作台（Act4）：左侧栏 + 主内容区。雇主：搜索/JD星球/简历池/面试空间；候选：对话/简历档/面试空间。

import { useState } from 'react'
import { AppSide } from './AppSide'
import { DossierModal, type DossierData } from './Dossier'
import { CandidateView } from '../views/CandidateView'
import { EmployerView } from '../views/EmployerView'
import { buildArchive, buildEmpResult } from '../data/universe'
import { recordJd, readJds, readInvites, sendInvite, decideInvite } from '../lib/jobs'
import { fmtRel } from '../lib/stats'
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

export function EmployerWorkspace({
  credits,
  onCredit,
  onSwitch,
}: {
  credits: string[]
  onCredit: (credit: string) => void
  onSwitch: (end: End) => void
}) {
  const [panel, setPanel] = useState<'chat' | 'pool' | 'interviews'>('chat')
  const [jds, setJds] = useState(readJds)
  const [invites, setInvites] = useState(readInvites)
  const [sel, setSel] = useState<DossierData | null>(null)

  const pending = invites.filter((i) => i.status === 'pending').length

  const items = [
    { key: 'chat', icon: '✦', label: '人才宇宙搜索' },
    { key: 'pool', icon: '▤', label: '候选人简历池' },
    { key: 'interviews', icon: '◎', label: '面试空间', badge: pending },
  ]

  return (
    <>
      <AppSide
        header="雇主 · 工作台"
        items={items}
        active={panel}
        onNav={(k) => {
          setPanel(k as typeof panel)
          setInvites(readInvites())
        }}
      />
      <div className="maincol">
        {jds.length > 0 && (
          <div style={{ maxWidth: 820, margin: '0 auto', padding: '14px 20px 0' }}>
            <div className="jdplanet">
              <div className="t">◈ {jds[0].title}</div>
              <div className="s">
                {jds[0].company} · 本 JD 候选人星球 {jds[0].starCount} 颗 · 已在左侧「宇宙搜索」建档
              </div>
            </div>
          </div>
        )}
        {panel === 'chat' ? (
          <EmployerView
            credits={credits}
            onCredit={onCredit}
            onSwitch={onSwitch}
            onSearch={() => setJds(recordJd(3))}
            onMeet={() => {
              setInvites(sendInvite('c1', '阿哲'))
              onCredit('BI/数分岗 · 出海 SaaS · 面试邀约已发')
            }}
          />
        ) : null}

        {panel === 'pool' ? (
          <div className="maincol-inner">
            <PoolHeader title="候选人简历池 · 不信 agent，就自己开档案核" />
            {buildEmpResult().candidates.map((c) => (
              <div key={c.id} className="itv">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="who">{c.name}</span>
                  <span className="badge v">可核验</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{c.canDo}</div>
                <div className="row" style={{ marginTop: 8 }}>
                  {c.tags.map((t) => (
                    <span key={t} className="humancheck" style={{ margin: 0 }}>
                      <span className="pill">{t}</span>
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
            <p className="ghostline">每一份「敢背书」的结论都在档里锚定原件；简历 PDF 可打开对证。</p>
          </div>
        ) : null}

        {panel === 'interviews' ? (
          <div className="maincol-inner">
            <PoolHeader title="面试空间 · 你发出的邀约" />
            {invites.length === 0 ? (
              <p className="ghostline">还没有邀约 —— 在对话里对某人说「约面」，agent 会把邀约发到对方档案端（含公司信息，双向匹配）。</p>
            ) : (
              invites.map((i) => (
                <div key={i.id} className="itv">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className="who">{i.candName}</span>
                    <span className={`status ${i.status}`}>{i.status === 'pending' ? '待对方回应' : i.status === 'accepted' ? '已确认 · 双向匹配' : '已婉拒'}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>{fmtRel(i.createdTs)}</span>
                  </div>
                  <div className="row">{i.jdTitle} · {i.company}</div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
      <DossierModal data={sel} open={sel != null} onClose={() => setSel(null)} />
    </>
  )
}

export function CandidateWorkspace({
  credits,
  onCredit,
  onSwitch,
}: {
  credits: string[]
  onCredit: (credit: string) => void
  onSwitch: (end: End) => void
}) {
  const [panel, setPanel] = useState<'chat' | 'resume' | 'interviews'>('chat')
  const [invites, setInvites] = useState(readInvites)
  const [sel, setSel] = useState<DossierData | null>(null)

  const pending = invites.filter((i) => i.status === 'pending').length

  const items = [
    { key: 'chat', icon: '✦', label: '对话 · 我的档案' },
    { key: 'resume', icon: '▤', label: '能力证据 / 简历' },
    { key: 'interviews', icon: '◎', label: '面试空间', badge: pending },
  ]

  const myDossier = dossierOf(buildEmpResult().candidates[0])
  const archive = buildArchive([], false)

  return (
    <>
      <AppSide
        header="候选 · 工作台"
        items={items}
        active={panel}
        onNav={(k) => {
          setPanel(k as typeof panel)
          setInvites(readInvites())
        }}
      />
      <div className="maincol">
        {panel === 'chat' ? <CandidateView credits={credits} onSwitch={onSwitch} /> : null}

        {panel === 'resume' ? (
          <div className="maincol-inner">
            <PoolHeader title={`我的能力证据档案 · ${myDossier.name}`} />
            <div className="itv">
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{archive.oneLiner}</div>
              <div className="row" style={{ marginTop: 6 }}>
                <span className="badge v">已验证 {archive.dims.filter((d) => d.level === 'verified').length}</span>
                <span className="badge ss">强孤证 {archive.dims.filter((d) => d.level === 'strongSolo').length}</span>
                <span className="badge p">待补 {archive.dims.filter((d) => d.level === 'pending').length}</span>
              </div>
              <div className="row" style={{ marginTop: 6, color: 'var(--text-2)', fontSize: 12.5 }}>
                近 7 天：被搜索命中 / 被查看 / 被约面 —— 见「宇宙动静」（对话上方星讯）。
              </div>
              <div className="acts">
                <button className="btn teal" onClick={() => setSel(myDossier)}>
                  打开我的简历 / 证据档 →
                </button>
                <button className="btn out" onClick={() => setPanel('chat')}>
                  回对话继续补强
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {panel === 'interviews' ? (
          <div className="maincol-inner">
            <PoolHeader title="面试空间 · 收到的邀约（双向：你看得到对方公司）" />
            {invites.length === 0 ? (
              <p className="ghostline">还没有邀约。当雇主在另一头「约面」，agent 会把带公司信息的邀约推到这里，由你决定是否同意。</p>
            ) : (
              invites.map((i) => (
                <div key={i.id} className="itv">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className="who">{i.company} · {i.candName}</span>
                    <span className={`status ${i.status}`}>{i.status === 'pending' ? '待你决定' : i.status === 'accepted' ? '已确认' : '已婉拒'}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>{fmtRel(i.createdTs)}</span>
                  </div>
                  <div className="row">{i.jdTitle}</div>
                  <div className="row" style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '6px 10px' }}>{i.companyBlurb}</div>
                  <div className="acts">
                    {i.status === 'pending' ? (
                      <>
                        <button
                          className="btn teal"
                          onClick={() => {
                            setInvites(decideInvite(i.id, 'accepted'))
                            onCredit('BI/数分岗 · 面试确认 · 双向匹配')
                          }}
                        >
                          同意面试
                        </button>
                        <button
                          className="btn out"
                          onClick={() => setInvites(decideInvite(i.id, 'declined'))}
                        >
                          婉拒
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
      <DossierModal data={sel} open={sel != null} onClose={() => setSel(null)} />
    </>
  )
}

function PoolHeader({ title }: { title: string }) {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '22px 20px 4px' }}>
      <div className="overline">WORKSPACE</div>
      <h2 className="display" style={{ fontSize: 24, marginTop: 6 }}>{title}</h2>
    </div>
  )
}
