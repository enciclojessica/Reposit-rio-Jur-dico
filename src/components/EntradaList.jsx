import { useState } from 'react'
import { AREAS } from '../shared'
import { TagPill } from './TagInput'
import { useTheme } from '../theme'

export default function EntradaList({ entradas, onSelect }) {
  const { theme } = useTheme()
  const [modoTabela, setModoTabela] = useState(false)

  const ToggleModo = () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, gap: 4 }}>
      <button onClick={() => setModoTabela(false)}
        style={{ background: !modoTabela ? theme.gold + '22' : 'none', color: !modoTabela ? theme.gold : theme.muted, border: `1px solid ${!modoTabela ? theme.gold + '44' : theme.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 10, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
        ▦ Cards
      </button>
      <button onClick={() => setModoTabela(true)}
        style={{ background: modoTabela ? theme.gold + '22' : 'none', color: modoTabela ? theme.gold : theme.muted, border: `1px solid ${modoTabela ? theme.gold + '44' : theme.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 10, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
        ≡ Tabela
      </button>
    </div>
  )

  if (entradas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: theme.muted }}>
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🗄</div>
        <div style={{ fontSize: 14, marginBottom: 6 }}>Nenhuma entrada encontrada.</div>
        <div style={{ fontSize: 12 }}>Tente outros termos ou ative a busca semântica ✦.</div>
      </div>
    )
  }

  if (modoTabela) return (
    <div>
      <ToggleModo />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {['Área', 'Tipo', 'Tema', 'Fonte', 'Teses', 'Status', 'Data'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', background: theme.raised, color: theme.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entradas.map(e => {
              const am = AREAS[e.area] || { color: theme.muted }
              return (
                <tr key={e.id} onClick={() => onSelect(e)}
                  style={{ cursor: 'pointer', borderBottom: `1px solid ${theme.border}22` }}
                  onMouseEnter={ev => ev.currentTarget.style.background = theme.raised}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: am.color, fontSize: 10, fontWeight: 700 }}>{e.area}</span>
                  </td>
                  <td style={{ padding: '8px 10px', color: theme.muted, whiteSpace: 'nowrap', fontSize: 11 }}>{e.tipo}</td>
                  <td style={{ padding: '8px 10px', color: theme.text, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Playfair Display, serif' }}>{e.tema}</td>
                  <td style={{ padding: '8px 10px', color: theme.muted, whiteSpace: 'nowrap', fontSize: 11 }}>{e.fonte}</td>
                  <td style={{ padding: '8px 10px', color: theme.muted, textAlign: 'center', fontSize: 11 }}>{e.teses?.length || 0}</td>
                  <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', fontSize: 10 }}>
                    {e.status && e.status !== 'vigente' ? (
                      <span style={{ color: { vinculante: '#c9a452', em_revisao: '#f59e0b', superada: '#ef4444' }[e.status] || theme.muted }}>
                        {e.status}
                      </span>
                    ) : <span style={{ color: theme.muted, opacity: 0.4 }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 10px', color: theme.muted, whiteSpace: 'nowrap', fontSize: 11 }}>
                    {new Date(e.criado_em).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '4px 0' }}>
      <ToggleModo />
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {entradas.map(e => {
        const am = AREAS[e.area] || { color: theme.muted, icon: '📄' }
        return (
          <div
            key={e.id}
            onClick={() => onSelect(e)}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderLeft: `3px solid ${am.color}`,
              borderRadius: 8,
              padding: '14px 16px',
              marginBottom: 8,
              cursor: 'pointer',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={ev => ev.currentTarget.style.boxShadow = `0 4px 16px ${am.color}22`}
            onMouseLeave={ev => ev.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
              <span style={{
                background: am.color + '22', color: am.color,
                border: `1px solid ${am.color}44`,
                borderRadius: 4, padding: '1px 6px',
                fontSize: 10, textTransform: 'uppercase',
                letterSpacing: 1, fontWeight: 600,
              }}>{e.area}</span>
              <span style={{
                background: theme.raised,
                color: theme.muted,
                border: `1px solid ${theme.border}`,
                borderRadius: 4, padding: '1px 6px',
                fontSize: 10, textTransform: 'uppercase', letterSpacing: 1,
              }}>{e.tipo}</span>
              {e.status && e.status !== 'vigente' && (
                <StatusBadge status={e.status} pequena />
              )}
            </div>
            <div style={{
              fontSize: 14, color: theme.text,
              fontFamily: 'Playfair Display, serif',
              fontWeight: 600, lineHeight: 1.3, marginBottom: 4,
            }}>{e.tema}</div>
            {(e.tags || []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {(e.tags || []).map(t => <TagPill key={t} tag={t} pequena />)}
              </div>
            )}
            {e.fonte && (
              <div style={{ fontSize: 11, color: theme.muted }}>{e.fonte}</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 10, color: theme.muted }}>
                {e.teses?.length || 0} tese(s)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {e._relevancia && (
                  <span style={{ fontSize: 10, color: theme.gold, background: theme.gold + '22', border: `1px solid ${theme.gold}44`, borderRadius: 10, padding: '1px 7px', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>
                    ✦ {e._relevancia}%
                  </span>
                )}
                <span style={{ fontSize: 10, color: theme.muted }}>
                  {new Date(e.criado_em).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
            {e._motivo && (
              <div style={{ fontSize: 11, color: theme.gold, marginTop: 6, opacity: 0.8, fontStyle: 'italic' }}>
                → {e._motivo}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
