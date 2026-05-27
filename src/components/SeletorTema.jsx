import { useState } from 'react'
import { useTheme, TEMAS_CONFIG } from '../theme'

const GRUPOS = [...new Set(Object.values(TEMAS_CONFIG).map(t => t.grupo))]

export default function SeletorTema() {
  const { theme, mode, temaId, setTema } = useTheme()
  const [aberto, setAberto] = useState(false)
  const [grupoAtivo, setGrupoAtivo] = useState('Todos')

  const temasFiltrados = grupoAtivo === 'Todos'
    ? Object.entries(TEMAS_CONFIG)
    : Object.entries(TEMAS_CONFIG).filter(([, t]) => t.grupo === grupoAtivo)

  const temaAtual = TEMAS_CONFIG[temaId]

  return (
    <div style={{ position: 'relative' }}>
      {/* Botão de abertura */}
      <button
        onClick={() => setAberto(a => !a)}
        title="Escolher tema visual"
        style={{
          background: theme.raised,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          padding: '5px 10px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          color: theme.muted,
          fontSize: 11,
          fontFamily: 'IBM Plex Mono, monospace',
          transition: 'all .15s',
        }}
      >
        <span style={{ fontSize: 14 }}>{temaAtual?.isDark ? '🌙' : '☀️'}</span>
        <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {temaAtual?.nome || 'Tema'}
        </span>
        <span style={{ opacity: 0.5, fontSize: 9 }}>{aberto ? '▲' : '▼'}</span>
      </button>

      {/* Painel */}
      {aberto && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setAberto(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          />

          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            width: 340,
            maxHeight: '70vh',
            background: theme.surface,
            border: `1px solid ${theme.borderGold}`,
            borderRadius: 14,
            boxShadow: theme.shadow,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header do painel */}
            <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, fontFamily: 'IBM Plex Mono, monospace' }}>
                  Escolher Tema
                </div>
                <button onClick={() => setAberto(false)}
                  style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
              </div>

              {/* Filtros de grupo */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {['Todos', ...GRUPOS].map(g => {
                  const ativo = grupoAtivo === g
                  return (
                    <button key={g} onClick={() => setGrupoAtivo(g)}
                      style={{
                        background: ativo ? theme.gold + '22' : 'none',
                        color: ativo ? theme.gold : theme.muted,
                        border: `1px solid ${ativo ? theme.gold + '55' : theme.border}`,
                        borderRadius: 20, padding: '2px 8px', fontSize: 9,
                        cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
                        transition: 'all .15s', whiteSpace: 'nowrap',
                      }}>{g}</button>
                  )
                })}
              </div>
            </div>

            {/* Lista de temas */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {temasFiltrados.map(([id, t]) => {
                const ativo = temaId === id
                return (
                  <button key={id}
                    onClick={() => { setTema(id); setAberto(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      background: ativo ? theme.gold + '15' : 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${theme.border}22`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={ev => { if (!ativo) ev.currentTarget.style.background = theme.raised }}
                    onMouseLeave={ev => { if (!ativo) ev.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Preview de cores */}
                    <div style={{
                      width: 36, height: 28, borderRadius: 6, flexShrink: 0,
                      background: t.bg,
                      border: ativo ? `2px solid ${t.gold}` : `1px solid ${t.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 3, overflow: 'hidden',
                    }}>
                      <div style={{ width: 10, height: '100%', background: t.surface }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '3px 2px 3px 0' }}>
                        <div style={{ height: 4, background: t.gold, borderRadius: 2, opacity: 0.9 }} />
                        <div style={{ height: 3, background: t.muted, borderRadius: 2, opacity: 0.5 }} />
                        <div style={{ height: 3, background: t.muted, borderRadius: 2, opacity: 0.3 }} />
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: ativo ? 700 : 400, color: ativo ? theme.gold : theme.text, fontFamily: t.fontTitle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.nome}
                        </span>
                        {ativo && (
                          <span style={{ fontSize: 9, color: theme.gold, background: theme.gold + '22', borderRadius: 10, padding: '1px 6px', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            ativo
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 9, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.isDark ? '🌙' : '☀️'} {t.grupo} · {t.fontBody.split(',')[0].replace(/'/g, '')}
                      </div>
                    </div>

                    {/* Swatches de cor */}
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      {[t.gold, t.civel, t.penal].map((c, i) => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
