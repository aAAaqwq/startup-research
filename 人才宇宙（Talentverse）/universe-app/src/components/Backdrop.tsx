// Act5+ 动态宇宙背景 —— 不纯黑、有色彩、星光漂移活起来：
// 彩色亮星（白/玉青/琥珀/冰蓝，带光晕）+ 慢漂移 + 极淡鼠标视差 + 少量拖尾光尘（流星感）。
// 纪律：rAF 用 dt、document.hidden 停、pointer 不进 React state、reduced/low-power 只画一帧。

import { useEffect, useRef } from 'react'

const TINTS: [number, number, number][] = [
  [224, 233, 242], // 白
  [110, 240, 214], // 玉青
  [240, 205, 168], // 琥珀
  [150, 185, 255], // 冰蓝
]

interface Pt {
  x: number
  y: number
  r: number
  a: number
  ph: number
  sp: number
  vy: number
  tint: number
}

interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  sz: number
  al: number
  ph: number
  tint: number
}

function rgb(tint: number, alpha: number): string {
  const c = TINTS[tint % TINTS.length]
  return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`
}

function makeStars(w: number, h: number): Pt[] {
  const count = Math.max(70, Math.min(240, Math.floor((w * h) / 9500)))
  const out: Pt[] = []
  for (let i = 0; i < count; i += 1) {
    const mod = i % 13
    const tint = mod === 0 ? 1 : mod === 6 ? 2 : mod === 10 ? 3 : 0
    out.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.35 + Math.random() * 1.45,
      a: 0.3 + Math.random() * 0.5,
      ph: Math.random() * Math.PI * 2,
      sp: 0.3 + Math.random() * 0.7,
      vy: 3 + Math.random() * 11,
      tint,
    })
  }
  return out
}

function makeMotes(w: number, h: number): Mote[] {
  const n = Math.max(3, Math.min(7, Math.round(Math.min(w, h) / 230)))
  const out: Mote[] = []
  for (let i = 0; i < n; i += 1) {
    out.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 4 + Math.random() * 14,
      vy: 6 + Math.random() * 18,
      sz: 1.4 + Math.random() * 1.8,
      al: 0.10 + Math.random() * 0.16,
      ph: Math.random() * Math.PI * 2,
      tint: i % 3 === 0 ? 1 : i % 3 === 1 ? 3 : 0,
    })
  }
  return out
}

export function Backdrop() {
  const wrap = useRef<HTMLDivElement | null>(null)
  const cv = useRef<HTMLCanvasElement | null>(null)
  const stars = useRef<Pt[]>([])
  const motes = useRef<Mote[]>([])
  const size = useRef({ w: 0, h: 0, dpr: 1 })
  const ptr = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 })

  useEffect(() => {
    const canvas = cv.current
    const host = wrap.current
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = host.clientWidth
      const h = host.clientHeight
      size.current = { w, h, dpr }
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      stars.current = makeStars(w, h)
      motes.current = makeMotes(w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    const onMove = (e: PointerEvent) => {
      const w = size.current.w || 1
      const h = size.current.h || 1
      ptr.current.tx = e.clientX / w
      ptr.current.ty = e.clientY / h
    }
    host.addEventListener('pointermove', onMove, { passive: true })

    const W = () => size.current.w || 1
    const H = () => size.current.h || 1
    let raf = 0
    let last = performance.now()
    let running = true

    const draw = (now: number) => {
      if (!running) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ptr.current.x += (ptr.current.tx - ptr.current.x) * 0.06
      ptr.current.y += (ptr.current.ty - ptr.current.y) * 0.06
      const ox = (ptr.current.x - 0.5) * 20
      const oy = (ptr.current.y - 0.5) * 12

      const w = W()
      const h = H()
      const dpr = size.current.dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.translate(ox, oy)

      // 拖尾光尘（流星感，慢）
      for (const m of motes.current) {
        m.x += m.vx * dt
        m.y += m.vy * dt
        m.y += Math.sin(now / 1800 + m.ph) * 0.25
        if (m.x > w + 60) m.x = -40
        if (m.y > h + 60) { m.y = -40; m.x = Math.random() * w }
        const tailX = m.x - m.vx * 0.45
        const tailY = m.y - m.vy * 0.45
        ctx.globalAlpha = m.al
        ctx.strokeStyle = rgb(m.tint, 1)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(tailX, tailY)
        ctx.stroke()
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.sz * 4.5)
        g.addColorStop(0, rgb(m.tint, m.al * 1.4))
        g.addColorStop(1, rgb(m.tint, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.sz * 4.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // 星光
      for (const s of stars.current) {
        s.y -= s.vy * dt
        if (s.y < -6) {
          s.y = h + 6
          s.x = (s.x + s.r * 7) % w
        }
        const tw = 0.5 + 0.5 * Math.sin(now / 1000 * s.sp + s.ph)
        const alpha = s.a * (0.35 + 0.65 * tw)
        if (s.r > 0.9) {
          ctx.globalAlpha = alpha * 0.3
          ctx.fillStyle = rgb(s.tint, 1)
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r * 3.4, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = alpha
        ctx.fillStyle = rgb(s.tint, 1)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
      ctx.globalAlpha = 1
      if (!reduced && !lowPower) raf = requestAnimationFrame(draw)
    }

    if (reduced || lowPower) {
      draw(performance.now())
    } else {
      raf = requestAnimationFrame(draw)
    }

    const onVis = () => {
      running = document.visibilityState === 'visible'
      if (running && !reduced && !lowPower && !raf) raf = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div className="bg" ref={wrap} aria-hidden="true">
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      <canvas ref={cv} />
      <div className="vig" />
      <div className="grain" />
    </div>
  )
}
