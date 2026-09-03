import { useMemo } from 'react'
import { useTheme } from '../theme'
import { corDaArea } from '../shared'
import { Sparkles } from 'lucide-react'

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000

export default function Hoje({ entradas, session, onSelectEntrada }) {
  const { theme } = useTheme()

  const novidades = useMemo(() => {
    const agora = Date.now()
    const recentes = entradas.filter(e => e.criado_em && (agora - new Date(e.criado_em).getTime()) < SETE_DIAS_MS)
    const base = recentes.length > 0 ? recentes : [...entradas].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)).slice(0, 5)
    return [...base].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)).slice(0, 8)
  }, [entradas])

  const card = { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20 }
  const secLabel = { fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, fontFamily: 'IBM Plex Mono, monospace' }

  const data = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4, textTransform: 'capitalize' }}>
          Hoje
        </div>
        <div style={{ fontSize: 12, color: theme.muted, textTransform: 'capitalize' }}>{data}</div>
      </div>

      {/* ── Novidades ─────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={secLabel}>Novidades</div>
        {novidades.length === 0 ? (
          <div style={{ color: theme.muted, fontSize: 12 }}>Nenhuma entrada ainda.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {novidades.map(e => {
              const cor = corDaArea(e.area, theme)
              return (
                <div key={e.id} onClick={() => onSelectEntrada?.(e)}
                  style={{
                    padding: '10px 14px', background: theme.raised,
                    border: `1px solid ${theme.border}`, borderLeft: `3px solid ${cor}`,
                    borderRadius: 8, cursor: onSelectEntrada ? 'pointer' : 'default',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {e.area === 'Informativo' && (
                      <span style={{ fontSize: 8, color: '#10b981', border: '1px solid #10b98155', borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0 }}>
                        <Sparkles size={8} style={{ marginRight: 2, verticalAlign: -1 }} />novo
                      </span>
                    )}
                    <div style={{ fontSize: 13, color: theme.text, fontFamily: 'IBM Plex Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.tema}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: theme.muted, marginTop: 3 }}>
                    {e.area}{e.fonte && ` · ${e.fonte}`} · {new Date(e.criado_em).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
