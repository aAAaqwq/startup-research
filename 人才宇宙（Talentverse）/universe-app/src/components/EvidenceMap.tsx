// 分档地图：替代"评分"——只画各档真实维度数，永不出 0-100、不出能力排名。

export interface EvMapCounts {
  verified: number
  strongSolo: number
  solo: number
  pending: number
}

const COLORS: Record<keyof EvMapCounts, string> = {
  verified: '#0F7567',
  strongSolo: '#9fd8c7',
  solo: '#c9972a',
  pending: '#E1E1E4',
}

const LABELS: Record<keyof EvMapCounts, string> = {
  verified: '已验证',
  strongSolo: '强孤证',
  solo: '孤证',
  pending: '待补',
}

export function EvidenceMap({ counts, cap = true }: { counts: EvMapCounts; cap?: boolean }) {
  const total = Math.max(1, counts.verified + counts.strongSolo + counts.solo + counts.pending)
  const keys = Object.keys(LABELS) as (keyof EvMapCounts)[]
  return (
    <div className="evmap">
      <div style={{ display: 'flex', gap: 2 }}>
        {keys.map((k) =>
          counts[k] > 0 ? (
            <span
              key={k}
              title={`${LABELS[k]} ${counts[k]}`}
              style={{
                width: `${(counts[k] / total) * 100}%`,
                background: COLORS[k],
                border: k === 'strongSolo' || k === 'solo' ? '1px dashed rgba(0,0,0,.25)' : 'none',
              }}
              className="seg"
            />
          ) : null,
        )}
      </div>
      <div className="legend" style={{ marginTop: 4 }}>
        {keys.map((k) =>
          counts[k] > 0 ? (
            <span key={k}>
              <i style={{ background: COLORS[k], width: 8, height: 8, borderRadius: 2, display: 'inline-block', marginRight: 5 }} />
              {LABELS[k]} {counts[k]}
            </span>
          ) : null,
        )}
      </div>
      {cap ? <div className="cap">分档地图 = 各档真实条数，不是 0-100 分，更不是能力排名。</div> : null}
    </div>
  )
}
