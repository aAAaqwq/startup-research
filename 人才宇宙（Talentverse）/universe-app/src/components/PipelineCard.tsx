// 分析流水线（Act4）：agent 的关键过程对用户可见、可复核，不藏黑箱。

import { useEffect, useState } from 'react'

export interface PipeStep {
  label: string
  meta?: string
}

export function PipelineCard({ title, steps }: { title: string; steps: PipeStep[] }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const iv = window.setInterval(() => {
      setN((c) => {
        if (c >= steps.length) {
          window.clearInterval(iv)
          return c
        }
        return c + 1
      })
    }, 560)
    return () => window.clearInterval(iv)
  }, [steps.length])

  const done = n >= steps.length
  return (
    <div className="pipe">
      <div className="ph">
        <b>{title}</b>
        <span>{done ? '完成 · 结论如下' : '进行中…'}</span>
      </div>
      {steps.map((s, i) => {
        const active = i === n
        const isDone = i < n
        return (
          <div key={s.label} className={`pstep${active ? ' on' : ''}`}>
            <span className={`st${isDone || active ? (active ? ' on' : ' done') : ''}`}>
              {isDone ? '✓' : i + 1}
            </span>
            {active ? <span className="bar" /> : null}
            <span>{s.label}</span>
            {s.meta ? <span className="meta">{s.meta}</span> : null}
          </div>
        )
      })}
      <div className="pfoot">
        AI 辅助评估 · 关键判断由<b>专业人员复核终审</b>——每一步都可点开原件对证，AI 不当最终拍板者。
      </div>
    </div>
  )
}
