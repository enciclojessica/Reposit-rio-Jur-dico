import { AREAS } from '../shared'

export default function EntradaList({ entradas, onSelect, search }) {
  const filtered = entradas.filter(e => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.tema?.toLowerCase().includes(q) ||
      e.fonte?.toLowerCase().includes(q) ||
      e.referencia?.toLowerCase().includes(q) ||
      e.teses?.some(t => t.tese_assunto?.toLowerCase().includes(q))
    )
  })

  if (filtered.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7fa3' }}>
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🗄</div>
        <div style={{ fontSize: 14, marginBottom: 6 }}>
          {search ? 'Nenhum resultado encontrado.' : 'Repositório vazio.'}
        </div>
        <div style={{ fontSize: 12 }}>
          {search ? 'Tente outros termos.' : 'Use "+" para adicionar a primeira entrada.'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {filtered.map(e => {
        const am = AREAS[e.area] || { color: '#6b7fa3', icon: '📄' }
        return (
          <div
            key={e.id}
            onClick={() => onSelect(e)}
            style={{
              background: '#1a2236',
              borderLeft: `3px solid ${am.color}`,
              borderRadius: 8,
              padding: '14px 16px',
              marginBottom: 8,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
              <span style={{
                background: am.color + '22',
                color: am.color,
                border: `1px solid ${am.color}44`,
                borderRadius: 4,
                padding: '1px 6px',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontWeight: 600,
              }}>{e.area}</span>
              <span style={{
                background: '#6b7fa322',
                color: '#6b7fa3',
                border: '1px solid #6b7fa344',
                borderRadius: 4,
                padding: '1px 6px',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>{e.tipo}</span>
            </div>
            <div style={{
              fontSize: 14,
              color: '#e8dfc8',
              fontFamily: 'Playfair Display, serif',
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: 4,
            }}>{e.tema}</div>
            {e.fonte && (
              <div style={{ fontSize: 11, color: '#6b7fa3' }}>{e.fonte}</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 10, color: '#6b7fa3' }}>
                {e.teses?.length || 0} tese(s)
              </span>
              <span style={{ fontSize: 10, color: '#6b7fa3' }}>
                {new Date(e.criado_em).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
