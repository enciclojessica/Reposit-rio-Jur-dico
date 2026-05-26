import { AREAS } from '../shared'
import { TagPill } from './TagInput'
import { useTheme } from '../theme'

export default function EntradaList({ entradas, onSelect }) {
  const { theme } = useTheme()

  if (entradas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: theme.muted }}>
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🗄</div>
        <div style={{ fontSize: 14, marginBottom: 6 }}>Nenhuma entrada encontrada.</div>
        <div style={{ fontSize: 12 }}>Tente outros termos ou ative a busca semântica ✦.</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '4px 0' }}>
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
                ↳ {e._motivo}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
