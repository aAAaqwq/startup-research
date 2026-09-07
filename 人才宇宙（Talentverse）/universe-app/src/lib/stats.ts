// 宇宙信号账本：所有"被搜/被约面/入轨"都来自真实动作并落 localStorage。
// 诚实纪律：计数可下钻到事件流水；禁止无关演示数据的假指标。

import { load, save } from './storage'
import type { SignalEvt, SignalKind } from '../types'

const KEY = 'stats'

export interface Stats {
  events: SignalEvt[] // 环形缓冲，上限 40
  noticesSeenTs: number
}

const MAX_EVENTS = 40

let seq = 0

export function readStats(): Stats {
  return load<Stats>(KEY, { events: [], noticesSeenTs: 0 })
}

export function recordSignal(kind: SignalKind, src: string): Stats {
  const prev = readStats()
  const evt: SignalEvt = { id: `ev${Date.now().toString(36)}${(seq += 1).toString(36)}`, kind, src, ts: Date.now() }
  const events = [evt].concat(prev.events).slice(0, MAX_EVENTS)
  const next = { ...prev, events }
  save(KEY, next)
  return next
}

export function markNoticesSeen(ts: number): void {
  const prev = readStats()
  save(KEY, { ...prev, noticesSeenTs: ts })
}

/** 近 7 天各信号计数（派生，不落库） */
export function countsLast7d(stats: Stats, sinceTs = Date.now() - 7 * 864e5): Record<SignalKind, number> {
  const out: Record<SignalKind, number> = { search: 0, view: 0, meet: 0, onboard: 0 }
  for (const e of stats.events) {
    if (e.ts >= sinceTs) out[e.kind] += 1
  }
  return out
}

export function fmtRel(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return `${s} 秒前`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} 分钟前`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} 小时前`
  return `${Math.round(h / 24)} 天前`
}
