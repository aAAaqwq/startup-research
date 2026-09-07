// Act7 侧栏：可收起成窄图标轨；含"新建对话"与"历史对话"（点击恢复）。

import type { SideItem } from './AppSide'
import type { ConvSnapshot } from '../lib/history'
import { fmtRel } from '../lib/stats'

export function SideChrome({
  header,
  items,
  active,
  onNav,
  hist,
  onNew,
  onRestore,
  collapsed,
  onToggle,
}: {
  header: string
  items: SideItem[]
  active: string
  onNav: (key: string) => void
  hist: ConvSnapshot[]
  onNew: () => void
  onRestore: (snap: ConvSnapshot) => void
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <nav className={`side${collapsed ? ' narrow' : ''}`} aria-label="工作台">
      <div className="side-top">
        {!collapsed ? <span className="t cap2" style={{ padding: '6px 4px' }}>{header}</span> : null}
        <button className="collap" onClick={onToggle} title={collapsed ? '展开侧栏' : '收起侧栏'} aria-label="收起或展开侧栏">
          {collapsed ? '»' : '«'}
        </button>
      </div>

      {!collapsed ? (
        <>
          <button className="rail-new" onClick={onNew} title="把当前对话存档，开一段新对话">
            ＋ 新建对话
          </button>
          {items.map((it) => (
            <button key={it.key} type="button" className={`si${active === it.key ? ' on' : ''}`} onClick={() => onNav(it.key)}>
              <span className="ic">{it.icon}</span>
              <span>{it.label}</span>
              {it.badge && it.badge > 0 ? <span className="badge-n">{it.badge}</span> : null}
            </button>
          ))}

          <div className="cap2">历史对话 · {hist.length}</div>
          <div className="hist">
            {hist.length === 0 ? (
              <span style={{ fontSize: 11.5, color: 'var(--text-3)', padding: '2px 10px', lineHeight: 1.6 }}>
                还没有存档。聊完一段点「新建对话」会把当前这段存进这里，可随时恢复。
              </span>
            ) : (
              hist.slice(0, 10).map((h) => (
                <button key={h.id} className="hitem" onClick={() => onRestore(h)} title="恢复这段对话">
                  <span className="dot" />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.label}</span>
                  <span className="when">{fmtRel(h.ts)}</span>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="mini">
          <button className="rail-new" onClick={onNew} title="新建对话" style={{ width: 38, height: 34, padding: 0, justifyContent: 'center' }}>
            ＋
          </button>
          {items.map((it) => (
            <button key={it.key} type="button" className={`si${active === it.key ? ' on' : ''}`} onClick={() => onNav(it.key)} title={it.label}>
              <span className="ic">{it.icon}</span>
              {it.badge && it.badge > 0 ? <span className="badge-n" style={{ position: 'absolute', margin: '-6px 0 0 18px' }}>{it.badge}</span> : null}
            </button>
          ))}
          <span style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 6 }}>{hist.length} 段</span>
        </div>
      )}
    </nav>
  )
}
