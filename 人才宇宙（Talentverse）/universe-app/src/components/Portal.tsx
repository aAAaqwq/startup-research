// 双端入口门户（Act3 hero）：深空舞台 + 宋体展示字 + overline + 单主行动。

import type { ReactNode } from 'react'

export function Portal({
  overline,
  eyebrow,
  title,
  lede,
  ctaLabel,
  ctaSub,
  onStart,
  cross,
  sky,
}: {
  overline: string
  eyebrow: string
  title: ReactNode
  lede: string
  ctaLabel: string
  ctaSub?: string
  onStart: () => void
  cross: ReactNode
  sky: ReactNode
}) {
  return (
    <div className="portalwrap">
      <div className="overline">{overline}</div>
      <div className="persona-line" style={{ justifyContent: 'center', marginTop: 8 }}>
        {eyebrow}
      </div>
      <h1 className="display">{title}</h1>
      <div className="lede">{lede}</div>
      <div className="cta">
        <button className="btn teal" style={{ height: 50, fontSize: 16, padding: '0 30px' }} onClick={onStart}>
          {ctaLabel}
        </button>
        {ctaSub ? <div className="ghostline">{ctaSub}</div> : null}
      </div>
      <div className="p-sky">{sky}</div>
      <div className="crosslink">{cross}</div>
    </div>
  )
}
