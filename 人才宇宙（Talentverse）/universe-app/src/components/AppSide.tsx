// 侧边栏（Act4）：两端不同结构；当前项高亮 + 徽标。

export interface SideItem {
  key: string
  icon: string
  label: string
  badge?: number
}

export function AppSide({
  items,
  active,
  onNav,
  header,
}: {
  items: SideItem[]
  active: string
  onNav: (key: string) => void
  header: string
}) {
  return (
    <nav className="side" aria-label="工作台">
      <div className="cap2">{header}</div>
      {items.map((it) => (
        <button key={it.key} type="button" className={`si${active === it.key ? ' on' : ''}`} onClick={() => onNav(it.key)}>
          <span className="ic">{it.icon}</span>
          <span>{it.label}</span>
          {it.badge && it.badge > 0 ? <span className="badge-n">{it.badge}</span> : null}
        </button>
      ))}
    </nav>
  )
}
