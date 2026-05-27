import { useMemo } from 'react'
import { useTheme } from '../theme'
import { AREAS } from '../shared'

// ── SVG Bar Chart ─────────────────────────────────────────────────────────
function BarChart({ dados, cor, altura = 120, label }) {
  const { theme } = useTheme()
  if (!dados.length) return null
  const max = Math.max(...dados.map(d => d.valor), 1)
  const W = 100 / dados.length

  return (
    <div>
      {label && <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, fontFamily: 'IBM Plex Mono, monospace' }}>{label}</div>}
      <svg width="100%" height={altura} style={{ overflow: 'visible' }}>
        {dados.map((d, i) => {
          const h = Math.max((d.valor / max) * (altura - 28), d.valor > 0 ? 4 : 0)
          const x = `${i * W + W * 0.15}%`
          const w = `${W * 0.7}%`
          const y = altura - 20 - h
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h}
                fill={d.cor || cor} rx={3} opacity={0.85} />
              <text x={`${i * W + W / 2}%`} y={altura - 6}
                textAnchor="middle" fill={theme.muted} fontSize={9}
                fontFamily="IBM Plex Mono, monospace">
                {d.rotulo}
              </text>
              {d.valor > 0 && (
                <text x={`${i * W + W / 2}%`} y={y - 4}
                  textAnchor="middle" fill={d.cor || cor} fontSize={10}
                  fontFamily="IBM Plex Mono, monospace" fontWeight="700">
                  {d.valor}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── SVG Donut ─────────────────────────────────────────────────────────────
function Donut({ fatias, raio = 52 }) {
  const { theme } = useTheme()
  const total = fatias.reduce((s, f) => s + f.valor, 0)
  if (!total) return <div style={{ color: theme.muted, fontSize: 12, textAlign: 'center', padding: 20 }}>Sem dados</div>

  let angulo = -Math.PI / 2
  const cx = 70, cy = 70
  const espessura = 20

  const fatiasSVG = fatias.filter(f => f.valor > 0).map(f => {
    const pct   = f.valor / total
    const start = angulo
    angulo += pct * 2 * Math.PI
    const end   = angulo
    const ri    = raio - espessura
    const x1o   = cx + raio * Math.cos(start), y1o = cy + raio * Math.sin(start)
    const x2o   = cx + raio * Math.cos(end),   y2o = cy + raio * Math.sin(end)
    const x1i   = cx + ri    * Math.cos(end),  y1i = cy + ri    * Math.sin(end)
    const x2i   = cx + ri    * Math.cos(start),y2i = cy + ri    * Math.sin(start)
    const large = pct > 0.5 ? 1 : 0
    return { ...f, pct, d: `M${x1o},${y1o} A${raio},${raio} 0 ${large},1 ${x2o},${y2o} L${x1i},${y1i} A${ri},${ri} 0 ${large},0 ${x2i},${y2i} Z` }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <svg width={140} height={140} style={{ flexShrink: 0 }}>
        {fatiasSVG.map((f, i) => (
          <path key={i} d={f.d} fill={f.cor} opacity={0.88} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={theme.gold}
          fontSize={18} fontWeight="700" fontFamily="IBM Plex Mono, monospace">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={theme.muted}
          fontSize={9} fontFamily="IBM Plex Mono, monospace">total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fatiasSVG.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: f.cor, flexShrink: 0 }} />
            <div style={{ fontSize: 11, color: theme.text, fontFamily: 'IBM Plex Mono, monospace' }}>
              {f.rotulo} <span style={{ color: theme.muted }}>({f.valor})</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mais citadas no editor */}
      {stats.maisUsadas.length > 0 && (
        <div style={{ ...card, marginTop: 14 }}>
          <div style={secLabel}>Mais citadas em pecas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.maisUsadas.map((e, i) => {
              const cor = AREAS[e.area]?.color || C.muted
              const pct = Math.max(20, (e.uso_count / stats.maisUsadas[0].uso_count) * 80)
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: C.cream, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.tema}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{e.fonte}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{ height: 6, background: cor, borderRadius: 3, width: pct }} />
                    <span style={{ fontSize: 11, color: cor, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace', minWidth: 24, textAlign: 'right' }}>{e.uso_count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, valor, cor, sub }) {
  const { theme } = useTheme()
  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.border}`,
      borderLeft: `3px solid ${cor}`,
      borderRadius: 10, padding: '14px 18px',
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: cor, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: 11, color: theme.text, marginTop: 4, fontFamily: 'IBM Plex Mono, monospace' }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: theme.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard({ entradas }) {
  const { theme } = useTheme()

  const stats = useMemo(() => {
    const total   = entradas.length
    const porArea = Object.keys(AREAS).map(a => ({
      label: a, valor: entradas.filter(e => e.area === a).length,
      cor: AREAS[a].color,
    }))
    const porTipo = ['jurisprudência', 'doutrina', 'súmula', 'lei'].map(t => ({
      rotulo: t, valor: entradas.filter(e => e.tipo === t).length,
      cor: { jurisprudência: '#3b82f6', doutrina: '#a855f7', súmula: '#f59e0b', lei: '#10b981' }[t],
    }))

    // Evolução mensal (últimos 6 meses)
    const agora = new Date()
    const meses = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(agora.getFullYear(), agora.getMonth() - (5 - i), 1)
      return {
        rotulo: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        ano: d.getFullYear(), mes: d.getMonth(),
        valor: 0,
      }
    })
    entradas.forEach(e => {
      if (!e.criado_em) return
      const d = new Date(e.criado_em)
      const m = meses.find(m => m.ano === d.getFullYear() && m.mes === d.getMonth())
      if (m) m.valor++
    })

    // Top tribunais/fontes
    const fonteCount = {}
    entradas.forEach(e => {
      if (!e.fonte) return
      fonteCount[e.fonte] = (fonteCount[e.fonte] || 0) + 1
    })
    const topFontes = Object.entries(fonteCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([nome, valor]) => ({ rotulo: nome.length > 14 ? nome.slice(0, 13) + '…' : nome, valor, nomeCompleto: nome }))

    // Lacunas (áreas com menos de 5 entradas)
    const lacunas = porArea.filter(a => a.valor < 5)

    // Teses totais
    const totalTeses = entradas.reduce((s, e) => s + (e.teses?.length || 0), 0)

    // Recentes (últimas 5)
    const maisUsadas = [...entradas]
      .filter(e => (e.uso_count || 0) > 0)
      .sort((a, b) => (b.uso_count || 0) - (a.uso_count || 0))
      .slice(0, 5)

    const recentes = [...entradas]
      .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
      .slice(0, 5)

    return { total, porArea, porTipo, meses, topFontes, lacunas, totalTeses, recentes, maisUsadas }
  }, [entradas])

  const card = { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20 }
  const secLabel = { fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontFamily: 'IBM Plex Mono, monospace' }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Dashboard
        </div>
        <div style={{ fontSize: 12, color: theme.muted }}>
          Visão geral do repositório · atualizado em tempo real
        </div>
      </div>

      {/* ── Stats cards ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Entradas" valor={stats.total} cor={theme.gold}
          sub={`${stats.totalTeses} teses`} />
        {stats.porArea.map(a => (
          <StatCard key={a.label} label={a.label} valor={a.valor} cor={a.cor} />
        ))}
      </div>

      {/* ── Evolução mensal + Tipos ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <div style={secLabel}>Entradas por mês</div>
          <BarChart
            dados={stats.meses.map(m => ({ rotulo: m.rotulo, valor: m.valor, cor: theme.gold }))}
            cor={theme.gold}
            altura={130}
          />
        </div>
        <div style={card}>
          <div style={secLabel}>Por tipo</div>
          <Donut fatias={stats.porTipo} />
        </div>
      </div>

      {/* ── Por área + Top fontes ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <div style={secLabel}>Por área</div>
          <BarChart
            dados={stats.porArea.map(a => ({ rotulo: a.label.slice(0, 6), valor: a.valor, cor: a.cor }))}
            cor={theme.gold}
            altura={130}
          />
        </div>
        <div style={card}>
          <div style={secLabel}>Top fontes</div>
          {stats.topFontes.length === 0 ? (
            <div style={{ color: theme.muted, fontSize: 12 }}>Sem dados.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.topFontes.map((f, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ fontSize: 11, color: theme.text, fontFamily: 'IBM Plex Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }} title={f.nomeCompleto}>
                      {f.nomeCompleto}
                    </div>
                    <div style={{ fontSize: 11, color: theme.gold, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>{f.valor}</div>
                  </div>
                  <div style={{ height: 4, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: theme.gold,
                      width: `${(f.valor / stats.topFontes[0].valor) * 100}%`,
                      opacity: 0.7, transition: 'width .4s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Lacunas + Recentes ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Lacunas de cobertura */}
        <div style={card}>
          <div style={secLabel}>Lacunas de cobertura</div>
          {stats.lacunas.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 8 }}>
              <div style={{ fontSize: 28 }}>✓</div>
              <div style={{ fontSize: 12, color: theme.success }}>Todas as áreas têm cobertura adequada.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.lacunas.map(l => (
                <div key={l.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: theme.raised,
                  border: `1px solid ${l.cor}33`, borderRadius: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.cor }} />
                    <div style={{ fontSize: 12, color: theme.text, fontFamily: 'IBM Plex Mono, monospace' }}>{l.label}</div>
                  </div>
                  <div style={{ fontSize: 11, color: l.valor === 0 ? theme.error : '#f59e0b', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {l.valor === 0 ? 'vazio' : `${l.valor} entrada${l.valor !== 1 ? 's' : ''}`}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>
                Áreas com menos de 5 entradas. Considere expandir a cobertura.
              </div>
            </div>
          )}
        </div>

        {/* Entradas recentes */}
        <div style={card}>
          <div style={secLabel}>Adicionadas recentemente</div>
          {stats.recentes.length === 0 ? (
            <div style={{ color: theme.muted, fontSize: 12 }}>Nenhuma entrada ainda.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recentes.map(e => {
                const cor = AREAS[e.area]?.color || theme.muted
                return (
                  <div key={e.id} style={{
                    padding: '8px 12px', background: theme.raised,
                    border: `1px solid ${theme.border}`,
                    borderLeft: `3px solid ${cor}`, borderRadius: 8,
                  }}>
                    <div style={{ fontSize: 12, color: theme.text, fontFamily: 'IBM Plex Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.tema}
                    </div>
                    <div style={{ fontSize: 10, color: theme.muted, marginTop: 3 }}>
                      {e.fonte && `${e.fonte} · `}
                      {new Date(e.criado_em).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
