import { useState } from 'react'
import { useTheme } from '../theme'
import { X, FileText } from 'lucide-react'
import { MODELOS_PECAS, CATEGORIAS_MODELO } from '../data/modelosPecas'

export default function ModalModelos({ onUsar, onFechar }) {
  const { theme } = useTheme()
  const [categoria, setCategoria] = useState('Todas')

  const filtrados = categoria === 'Todas'
    ? MODELOS_PECAS
    : MODELOS_PECAS.filter(m => m.categoria === categoria)

  return (
    <div onClick={onFechar} style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#00000066', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', boxShadow: theme.shadow, margin: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif' }}>Modelos de Peças</div>
          <button onClick={onFechar} aria-label="Fechar" style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: 6, padding: '12px 20px 0', flexWrap: 'wrap' }}>
          {['Todas', ...CATEGORIAS_MODELO].map(c => (
            <button key={c} onClick={() => setCategoria(c)}
              style={{
                fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${categoria === c ? theme.gold : theme.border}`,
                background: categoria === c ? theme.gold + '18' : 'none',
                color: categoria === c ? theme.gold : theme.muted,
                fontFamily: 'IBM Plex Mono, monospace',
              }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {filtrados.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: theme.muted, fontSize: 13 }}>
              Nenhum modelo nesta categoria ainda.
            </div>
          ) : filtrados.map(m => (
            <div key={m.id} onClick={() => onUsar(m)} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
              borderRadius: 10, marginBottom: 8, cursor: 'pointer',
              background: theme.cardBg, border: `1px solid ${theme.border}`,
              transition: 'border-color .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = theme.gold + '66'}
              onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}>
              <FileText size={18} color={theme.gold} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, fontFamily: 'Georgia, serif' }}>
                  {m.titulo}
                </div>
                <div style={{ fontSize: 11, color: theme.muted, marginTop: 4, lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                  {m.descricao}
                </div>
                <div style={{ fontSize: 9, color: theme.gold, marginTop: 6, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {m.categoria} · {m.rito}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 20px', borderTop: `1px solid ${theme.border}`, fontSize: 10, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
          Modelos são esqueletos estruturais — fundamentação, teses e precedentes vêm do seu Repositório.
        </div>
      </div>
    </div>
  )
}
