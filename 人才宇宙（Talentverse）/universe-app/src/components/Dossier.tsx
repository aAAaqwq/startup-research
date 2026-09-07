// 简历 / 可核验档案（Act4）：agent 判断的原件与口径，可打开对证——不信 agent，就自己核。

export interface DossierData {
  name: string
  role: string
  canDo: string
  reasons: { verified: boolean; text: string }[]
  boundaries: string[]
  evidence: { source: string; claim: string }[]
  human: string
}

export function DossierModal({ data, open, onClose }: { data: DossierData | null; open: boolean; onClose: () => void }) {
  if (!data || !open) return null
  return (
    <div className="dossier on" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sh-top">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{data.name}</div>
            <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{data.role}</div>
          </div>
          <span className="badge v">可核验档案</span>
          <button className="btn ghost" onClick={onClose} aria-label="关闭">
            关闭
          </button>
        </div>
        <div className="sh-bd">
          <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>{data.canDo}</div>

          <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '.08em', margin: '14px 0 6px' }}>凭什么敢用（每句可对证）</div>
          {data.reasons.map((r) => (
            <div key={r.text} style={{ display: 'flex', gap: 8, fontSize: 13.5, padding: '3px 0' }}>
              <span style={{ color: r.verified ? 'var(--teal-700)' : 'var(--warn-700)' }}>{r.verified ? '✓' : '○'}</span>
              <span>{r.text}</span>
            </div>
          ))}

          {data.boundaries.length > 0 ? (
            <>
              <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '.08em', margin: '12px 0 4px' }}>我不替你背书的</div>
              <div style={{ fontSize: 13, color: 'var(--warn-700)', background: 'var(--warn-100)', borderRadius: 8, padding: '8px 12px' }}>
                {data.boundaries.join(' ')}
              </div>
            </>
          ) : null}

          <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '.08em', margin: '14px 0 6px' }}>可核验证据与原件</div>
          {data.evidence.map((e) => (
            <div key={e.source} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--hairline)', fontSize: 13 }}>
              <span className="badge v" style={{ flex: 'none' }}>已核验</span>
              <div>
                <div style={{ fontWeight: 600 }}>{e.source}</div>
                <div style={{ color: 'var(--text-2)' }}>{e.claim}</div>
              </div>
            </div>
          ))}

          <div className="humancheck">
            <span className="pill">此档案关键判断由 {data.human} 人工复核终审</span>
            <span className="pill">AI 辅助评估 · 不当最终拍板者</span>
          </div>

          <div className="paper-cue">
            想亲眼核原件？本版为演示档卷（合成自证据种子，非真实简历 PDF）。真实版本：agent 在授权范围内抓取可核验原件 → 一键生成 / 打开 PDF（Cmd/Ctrl+P 打印存为 PDF）。
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button className="btn out" onClick={() => window.print()}>
              打开简历 PDF（打印 / 存为）↗
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
