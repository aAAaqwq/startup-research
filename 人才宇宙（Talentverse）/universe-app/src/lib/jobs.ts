// Act4 领域账本：JD 星球实例 + 双向面试邀请（真落 localStorage，跨端可见）

import { load, save } from './storage'

export interface JdPlanet {
  id: string
  title: string
  company: string
  starCount: number
  createdTs: number
}

export interface InterviewInvite {
  id: string
  candId: string
  candName: string
  jdTitle: string
  company: string
  companyBlurb: string
  createdTs: number
  status: 'pending' | 'accepted' | 'declined'
  decidedTs?: number
}

const JD_KEY = 'jdplanets'
const IV_KEY = 'invites'

export const DEMO_COMPANY = {
  name: '海升科技',
  blurb: '出海 SaaS · 50-100 人 · 服务北美销售团队 · 全部远程异步协作',
  jd: 'BI / 数据分析师 · 独立交付数据看板 · 出海 SaaS',
}

let seq = 0
const nid = (p: string) => `${p}${Date.now().toString(36)}${(seq += 1).toString(36)}`

export function readJds(): JdPlanet[] {
  return load<JdPlanet[]>(JD_KEY, [])
}

export function recordJd(starCount = 3): JdPlanet[] {
  const prev = readJds()
  if (prev.some((j) => j.title === DEMO_COMPANY.jd)) return prev
  const jd: JdPlanet = { id: nid('jd'), title: DEMO_COMPANY.jd, company: DEMO_COMPANY.name, starCount, createdTs: Date.now() }
  const next = [jd].concat(prev)
  save(JD_KEY, next)
  return next
}

export function readInvites(): InterviewInvite[] {
  return load<InterviewInvite[]>(IV_KEY, [])
}

export function sendInvite(candId: string, candName: string): InterviewInvite[] {
  const prev = readInvites()
  if (prev.some((i) => i.candId === candId && i.status === 'pending')) return prev
  const inv: InterviewInvite = {
    id: nid('iv'),
    candId,
    candName,
    jdTitle: DEMO_COMPANY.jd,
    company: DEMO_COMPANY.name,
    companyBlurb: DEMO_COMPANY.blurb,
    createdTs: Date.now(),
    status: 'pending',
  }
  const next = [inv].concat(prev)
  save(IV_KEY, next)
  return next
}

export function decideInvite(id: string, status: 'accepted' | 'declined'): InterviewInvite[] {
  const next = readInvites().map((i) => (i.id === id ? { ...i, status, decidedTs: Date.now() } : i))
  save(IV_KEY, next)
  return next
}
