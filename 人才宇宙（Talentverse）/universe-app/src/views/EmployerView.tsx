// ============ 雇主端视图（Act3）：门户 → 对话 + 星空逐颗点亮 ============

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatConv, type ConvCfg } from '../components/ChatConv'
import { Portal } from '../components/Portal'
import { SkyField, type SkyStarDef } from '../components/SkyField'
import { empGreeting, empReply } from '../engine/flows'
import { employerChips } from '../data/universe'
import { recordSignal } from '../lib/stats'
import { load } from '../lib/storage'
import type { End, SignalKind } from '../types'

type Phase = 'idle' | 'scan' | 'silence' | 'lit'

export function EmployerView({
  credits,
  onCredit,
  onSwitch,
  onSearch,
  onMeet,
}: {
  credits: string[]
  onCredit: (credit: string) => void
  onSwitch: (end: End) => void
  onSearch?: () => void
  onMeet?: () => void
}) {
  const storedStep = load<{ step: number } | null>('emp', null)?.step ?? 0
  const [mode, setMode] = useState<'portal' | 'chat'>(() => (storedStep >= 1 ? 'chat' : 'portal'))
  const [phase, setPhase] = useState<Phase>(() => (storedStep >= 1 ? 'lit' : 'idle'))
  const met = credits.some((c) => c.includes('约面'))
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  // 只亮敢背书的少数（主星 c1 压轴）
  const stars: SkyStarDef[] = useMemo(() => {
    if (phase !== 'lit') return []
    const metC = met
    const list: SkyStarDef[] = [
      { id: 'c2', name: '于蓝', v: 1, warm: true, igniteAt: 220, head: '出海已验证 · BI 交付孤证', dim: false },
      { id: 'c3', name: '陈述', v: 1, warm: true, igniteAt: 400, head: '口径可信 · 看板偏弱', dim: false },
      { id: 'c1', name: '阿哲', v: 3, warm: true, spike: true, igniteAt: 700, meet: metC, head: '敢背书 · 出海待补', dim: false },
    ]
    return list
  }, [phase, met])

  const goLit = () => {
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setPhase('lit')
      return
    }
    setPhase('scan')
    timers.current.push(window.setTimeout(() => setPhase('silence'), 950))
    timers.current.push(window.setTimeout(() => setPhase('lit'), 950 + 650))
  }

  const handleSignal = (kind: SignalKind, _src: string) => {
    recordSignal(kind, _src)
    if (kind === 'search') {
      goLit()
      if (onSearch) onSearch()
    } else if (kind === 'meet') {
      if (onMeet) onMeet()
    }
  }

  const onPickStar = (s: SkyStarDef) => {
    recordSignal('view', `雇主端展开查看 #${s.name}`)
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.hit'))
    const card = cards.find((el) => el.textContent?.includes(s.name))
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' })
      card.classList.add('flash')
      window.setTimeout(() => card.classList.remove('flash'), 1400)
    }
  }

  const stageText =
    phase === 'scan' ? '检索授权视野…' : phase === 'silence' ? '已静置 —— 逐颗点亮' : phase === 'lit' ? `本域点亮 ${stars.length} · 无授权不出现在夜空` : undefined

  const cfg: ConvCfg = {
    persona: { label: '雇主端 · 替你验人的分析台', accent: 'emp' },
    persistKey: 'emp',
    greet: empGreeting(),
    chips: employerChips,
    fileHint: () => ({ name: 'jd_bi_saas.pdf', size: '380 KB' }),
    run: (step, act) => {
      if (act === 'gocand') return { next: 2, items: [], goto: 'candidate' as End }
      return empReply(step, act)
    },
    classifyText: (step, text) => {
      if (step === 0) return 'attach'
      if (/约面|面|推进/.test(text)) return 'meet'
      if (/补强|出海|升级/.test(text)) return 'upgrade'
      if (/原件|核|证据/.test(text)) return 'verify'
      return 'meet'
    },
  }

  if (mode === 'portal') {
    return (
      <Portal
        overline="OBSERVATION LOG · 要人的天"
        eyebrow="雇主端 · 敢用的人 / 同一宇宙的另一头：候选 · 证明我行"
        title={<>在夜空里要人，只给<span className="k">敢背书</span>的那几颗</>}
        lede="你给需求 → 黑暗只在授权 + 已核验的范围里，点亮刚好够格、且我敢背书的星。孤证 / 待补那颗，我既不给它亮、也不跟你收那部分的钱。"
        ctaLabel={storedStep >= 1 ? '继续（从上次停的地方）→' : '开始要人 →'}
        onStart={() => setMode('chat')}
        cross={
          <div>
            你看到的每颗星都来自对方授权出示 · 没有全量人才库。
            <br />
            <a onClick={() => onSwitch('candidate')}>去候选端，亲手投一颗 →</a>
            <span style={{ margin: '0 6px' }}>·</span>
            <a onClick={() => onSwitch('orbit')}>看整个闭环 →</a>
          </div>
        }
        sky={
          <SkyField
            height={300}
            cap="可凝视的诚实虚空"
            empty={{
              t1: '空不是没人：还没授权、还没核到够格',
              t2: '我们把稀缺如实画给你看 —— 没有藏起来的全量人才库。',
            }}
          />
        }
      />
    )
  }

  return (
    <>
      <div className="viewtop">
        <SkyField
          height={280}
          cap="已验证精选 · 只亮我敢背书的"
          beam={phase === 'scan'}
          stage={stageText}
          items={stars}
          side="点一颗星 = 展开一次查看（如实计入对方档案）"
          onPick={onPickStar}
          empty={{
            t1: '提交需求后，这里会照亮少数敢背书的人',
            t2: '空不是没人 —— 是还没授权 / 还没核到够格。稀缺即承诺。',
          }}
        />
        {met ? (
          <div className="mysky">
            <span className="t">
              约面已入轨 <b className="tnum">1</b> · 中性轨道（不升温）已回写进对方档案「被采信记录」。
            </span>
          </div>
        ) : null}
      </div>
      <ChatConv cfg={cfg} credits={credits} onCredit={onCredit} onSignal={handleSignal} onSwitch={onSwitch} />
    </>
  )
}
