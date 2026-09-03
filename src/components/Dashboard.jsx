import { useMemo, useState } from 'react'
import { useTheme } from '../theme'
import { AREAS, corDaArea, AreaDot } from '../shared'

// ── Régua de barras finas (entradas por mês) ────────────────────────────
function ReguaBarras({ dados, alturaMax = 64 }) {
  const { theme } = useTheme()
  if (!dados.length) return null
  const max = Math.max(...dados.map(d => d.valor), 1)
  const ultimoIdx = dados.length - 1

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: alturaMax, marginBottom: 8 }}>
        {dados.map((d, i) => {
          const h = Math.max((d.valor / max) * alturaMax, d.valor > 0 ? 3 : 1)
          const atual = i === ultimoIdx
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              {d.valor > 0 && (
                <div style={{ fontSize: 11, color: atual ? theme.gold : theme.muted, fontFamily: theme.fontSerif, marginBottom: 4 }}>{d.valor}</div>
              )}
              <div style={{ width: 3, height: h, background: atual ? theme.gold : theme.text, opacity: atual ? 1 : 0.55, borderRadius: 1 }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {dados.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: theme.muted, fontFamily: theme.fontSerif, fontStyle: 'italic' }}>{d.rotulo}</div>
        ))}
      </div>
    </div>
  )
}

// ── Barra horizontal por área (mantém cor — ajuda no reconhecimento) ────
function BarrasPorArea({ dados }) {
  const { theme } = useTheme()
  const max = Math.max(...dados.map(d => d.valor), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {dados.filter(d => d.valor > 0).sort((a, b) => b.valor - a.valor).map(d => (
        <div key={d.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <div style={{ fontSize: 12, color: theme.text, fontFamily: theme.fontSerif, fontStyle: 'italic' }}>{d.label}</div>
            <div style={{ fontSize: 12, color: d.cor, fontFamily: theme.fontSerif }}>{d.valor}</div>
          </div>
          <div style={{ height: 4, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: d.cor, width: `${(d.valor / max) * 100}%`, opacity: 0.8 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Anel fino (por tipo) ─────────────────────────────────────────────────
function AnelFino({ fatias, raio = 46 }) {
  const { theme } = useTheme()
  const total = fatias.reduce((s, f) => s + f.valor, 0)
  if (!total) return <div style={{ color: theme.muted, fontSize: 12, fontStyle: 'italic', fontFamily: theme.fontSerif, textAlign: 'center', padding: 20 }}>Sem dados.</div>

  let angulo = -Math.PI / 2
  const cx = 60, cy = 60
  const espessura = 8

  const fatiasSVG = fatias.filter(f => f.valor > 0).map(f => {
    const pct   = f.valor / total
    const start = angulo
    angulo += pct * 2 * Math.PI
    const end   = angulo
    const ri    = raio - espessura
    const x1o = cx + raio * Math.cos(start), y1o = cy + raio * Math.sin(start)
    const x2o = cx + raio * Math.cos(end),   y2o = cy + raio * Math.sin(end)
    const x1i = cx + ri * Math.cos(end),     y1i = cy + ri * Math.sin(end)
    const x2i = cx + ri * Math.cos(start),   y2i = cy + ri * Math.sin(start)
    const large = pct > 0.5 ? 1 : 0
    return { ...f, pct, d: `M${x1o},${y1o} A${raio},${raio} 0 ${large},1 ${x2o},${y2o} L${x1i},${y1i} A${ri},${ri} 0 ${large},0 ${x2i},${y2i} Z` }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <svg width={120} height={120} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={raio - espessura / 2} fill="none" stroke={theme.border} strokeWidth={1} />
        {fatiasSVG.map((f, i) => <path key={i} d={f.d} fill={f.cor} />)}
        <text x={cx} y={cy - 2} textAnchor="middle" fill={theme.text} fontSize={18} fontWeight="600" fontFamily={theme.fontTitle}>{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={theme.muted} fontSize={9} fontStyle="italic" fontFamily={theme.fontSerif}>entradas</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {fatiasSVG.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.cor, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: theme.text, fontFamily: theme.fontSerif }}>
              {f.rotulo} <span style={{ color: theme.muted, fontStyle: 'italic' }}>({f.valor})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, valor, cor, sub, onClick }) {
  const { theme } = useTheme()
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onClick && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? theme.raised : theme.cardBg,
        border: `1px solid ${hover ? cor + '77' : theme.border}`,
        borderTop: `2px solid ${cor}`,
        borderRadius: 6, padding: '14px 16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background .15s, border-color .15s',
      }}>
      <div style={{ fontSize: 26, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: 12, color: cor, marginTop: 5, fontFamily: theme.fontSerif, fontStyle: 'italic' }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: theme.muted, marginTop: 2, fontFamily: theme.fontSerif, fontStyle: 'italic' }}>{sub}</div>}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard({ entradas, countLegislacao = 0, session, onCriarAlerta, onSelecionarArea, onIrParaLegislacao }) {
  const { theme } = useTheme()

  const stats = useMemo(() => {
    const total   = entradas.length
    const porArea = Object.keys(AREAS).map(a => ({
      label: a, valor: entradas.filter(e => e.area === a).length,
      cor: AREAS[a].color,
    }))
    const porTipo = ['jurisprudência', 'doutrina', 'súmula', 'lei'].map(t => ({
      rotulo: t, valor: entradas.filter(e => e.tipo === t).length,
      cor: { jurisprudência: theme.text, doutrina: theme.gold, súmula: theme.vinho, lei: theme.border }[t],
    }))

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

    const fonteCount = {}
    entradas.forEach(e => {
      if (!e.fonte) return
      fonteCount[e.fonte] = (fonteCount[e.fonte] || 0) + 1
    })
    const topFontes = Object.entries(fonteCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([nome, valor]) => ({ rotulo: nome.length > 18 ? nome.slice(0, 17) + '…' : nome, valor, nomeCompleto: nome }))

    const lacunas = porArea.filter(a => a.valor < 5)
    const totalTeses = entradas.reduce((s, e) => s + (Array.isArray(e.teses) ? e.teses.length : 0), 0)

    const maisUsadas = [...entradas]
      .filter(e => (e.uso_count || 0) > 0)
      .sort((a, b) => (b.uso_count || 0) - (a.uso_count || 0))
      .slice(0, 5)

    const recentes = [...entradas]
      .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
      .slice(0, 5)

    return { total, porArea, porTipo, meses, topFontes, lacunas, totalTeses, recentes, maisUsadas }
  }, [entradas, theme])

  const card = { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 18 }
  const secLabel = { fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, borderBottom: `1px solid ${theme.text}`, paddingBottom: 6, marginBottom: 16 }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>
          Dashboard
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
          Visão geral do repositório, atualizada em tempo real
        </div>
      </div>

      {/* ── Stats cards ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Entradas" valor={stats.total} cor={theme.gold}
          sub={`${stats.totalTeses} teses`} onClick={() => onSelecionarArea?.('all')} />
        <StatCard label="Legislação" valor={countLegislacao} cor={theme.vinho}
          sub="artigos cadastrados" onClick={onIrParaLegislacao} />
        {stats.porArea.map(a => (
          <StatCard key={a.label} label={a.label} valor={a.valor} cor={a.cor}
            onClick={() => onSelecionarArea?.(a.label)} />
        ))}
      </div>

      {/* ── Evolução mensal + Tipos ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <div style={secLabel}>Entradas por mês</div>
          <ReguaBarras dados={stats.meses} />
        </div>
        <div style={card}>
          <div style={secLabel}>Por tipo</div>
          <AnelFino fatias={stats.porTipo} />
        </div>
      </div>

      {/* ── Por área + Top fontes ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 14 }}>
        <div style={card}>
          <div style={secLabel}>Por área</div>
          <BarrasPorArea dados={stats.porArea} />
        </div>
        <div style={card}>
          <div style={secLabel}>Fontes mais citadas</div>
          {stats.topFontes.length === 0 ? (
            <div style={{ color: theme.muted, fontSize: 12, fontStyle: 'italic', fontFamily: theme.fontSerif }}>Sem dados.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {stats.topFontes.map((f, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ fontSize: 12, color: theme.text, fontFamily: theme.fontSerif, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }} title={f.nomeCompleto}>
                      {f.nomeCompleto}
                    </div>
                    <div style={{ fontSize: 12, color: theme.gold, fontFamily: theme.fontSerif }}>{f.valor}</div>
                  </div>
                  <div style={{ height: 4, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: theme.gold,
                      width: `${(f.valor / stats.topFontes[0].valor) * 100}%`,
                      opacity: 0.7,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Lacunas + Recentes ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>

        <div style={card}>
          <div style={secLabel}>Lacunas de cobertura</div>
          {stats.lacunas.length === 0 ? (
            <div style={{ fontSize: 12, color: theme.success, fontStyle: 'italic', fontFamily: theme.fontSerif, padding: '8px 0' }}>
              Todas as áreas têm cobertura adequada.
            </div>
          ) : (
            <div>
              {stats.lacunas.map(l => (
                <div key={l.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 0', borderBottom: `0.5px solid ${theme.border}`, gap: 8, flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AreaDot area={l.label} theme={theme} />
                    <div style={{ fontSize: 12, color: theme.text, fontFamily: theme.fontSerif, fontStyle: 'italic' }}>{l.label}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 11, color: l.valor === 0 ? theme.penal : theme.gold, fontFamily: theme.fontSerif }}>
                      {l.valor === 0 ? 'vazio' : `${l.valor} entrada${l.valor !== 1 ? 's' : ''}`}
                    </div>
                    {onCriarAlerta && (
                      <button onClick={() => onCriarAlerta(l.label)} style={{
                        background: 'none', border: `1px solid ${theme.border}`, color: theme.muted,
                        borderRadius: 5, padding: '3px 9px', fontSize: 10, cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        Criar alerta
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginTop: 8 }}>
                Áreas com menos de 5 entradas.
              </div>
            </div>
          )}
        </div>

        {stats.maisUsadas.length > 0 && (
          <div style={card}>
            <div style={secLabel}>Mais citadas em peças</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {stats.maisUsadas.map(e => {
                const cor = corDaArea(e.area, theme)
                const pct = Math.max(16, (e.uso_count / stats.maisUsadas[0].uso_count) * 80)
                return (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: theme.fontSerif }}>{e.tema}</div>
                      <div style={{ fontSize: 10, color: theme.muted, marginTop: 2, fontStyle: 'italic', fontFamily: theme.fontSerif }}>{e.fonte}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <div style={{ height: 4, background: cor, borderRadius: 2, width: pct, opacity: 0.8 }} />
                      <span style={{ fontSize: 12, color: cor, fontFamily: theme.fontSerif, minWidth: 22, textAlign: 'right' }}>{e.uso_count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={card}>
          <div style={secLabel}>Adicionadas recentemente</div>
          {stats.recentes.length === 0 ? (
            <div style={{ color: theme.muted, fontSize: 12, fontStyle: 'italic', fontFamily: theme.fontSerif }}>Nenhuma entrada ainda.</div>
          ) : (
            <div>
              {stats.recentes.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', gap: 9, padding: '10px 0', borderBottom: i < stats.recentes.length - 1 ? `0.5px solid ${theme.border}` : 'none' }}>
                  <div style={{ paddingTop: 3, flexShrink: 0 }}>
                    <AreaDot area={e.area} theme={theme} size={6} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: theme.text, fontFamily: theme.fontSerif, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.tema}
                    </div>
                    <div style={{ fontSize: 10, color: theme.muted, marginTop: 3, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
                      {[e.fonte, new Date(e.criado_em).toLocaleDateString('pt-BR')].filter(Boolean).join(', ')}
                      {e.area === 'Informativo' ? ' — novo' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
