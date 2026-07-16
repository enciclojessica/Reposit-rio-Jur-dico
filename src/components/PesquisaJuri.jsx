import { useState } from 'react'
import { useTheme } from '../theme'
import { AREAS, Badge } from '../shared'
import { supabase } from '../supabase'

const TRIBUNAIS = [
  { id: 'todos',  label: 'Todos' },
  { id: 'STJ',   label: 'STJ' },
  { id: 'STF',   label: 'STF' },
  { id: 'TST',   label: 'TST' },
  { id: 'TRF',   label: 'TRFs' },
  { id: 'TJSP',  label: 'TJSP' },
  { id: 'TJRJ',  label: 'TJRJ' },
]

export default function PesquisaJuri({ onImportar }) {
  const { theme, mode } = useTheme()
  const [query, setQuery]         = useState('')
  const [tribunal, setTribunal]   = useState('todos')
  const [resultados, setResultados] = useState([])
  const [loading, setLoading]     = useState(false)
  const [statusMsg, setStatusMsg]   = useState('')
  const [error, setError]         = useState('')
  const [aviso, setAviso]         = useState('')
  const [importados, setImportados] = useState(new Set())

  async function pesquisar() {
    if (!query.trim() || loading) return
    setLoading(true)
    setResultados([])
    setError('')
    setAviso('')
    setImportados(new Set())

    // Mensagens rotativas de progresso
    const msgs = [
      `Consultando ${tribunal === 'todos' ? 'STJ e STF' : tribunal}...`,
      'Buscando decisões relevantes...',
      'Verificando portais oficiais...',
      'Organizando resultados...',
    ]
    let mi = 0
    setStatusMsg(msgs[0])
    const interval = setInterval(() => {
      mi = (mi + 1) % msgs.length
      setStatusMsg(msgs[mi])
    }, 3000)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada. Faça login novamente.')
      const res = await fetch('/api/pesquisa-juri', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({ query, tribunal }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setResultados(json.resultados || [])
      if (json.aviso) setAviso(json.aviso)
    } catch (err) {
      setError('Erro na pesquisa: ' + err.message)
    }
    clearInterval(interval)
    setStatusMsg('')
    setLoading(false)
  }

  function handleImportar(r) {
    // Mapeia resultado para o formato de entrada do repositório
    const entrada = {
      area: r.area || 'Cível',
      tema: r.ementa ? r.ementa.slice(0, 80) + '...' : query,
      tipo: 'jurisprudência',
      fonte: r.tribunal || '',
      referencia: [r.tipo, r.numero].filter(Boolean).join(' '),
      url: r.url || '',
      teses: [{
        tese_assunto: r.ementa || '',
        fundamentacao_legal: '',
        precedente_sumula: [r.tipo, r.numero].filter(Boolean).join(' '),
        ratio_decidendi: '',
        aplicacao_pratica: '',
      }],
      // Metadados adicionais preservados para o formulário
      _prefill: {
        autor_tribunal: r.tribunal || '',
        relator: r.relator || '',
        data: r.data || '',
        titulo_ementa: r.ementa || '',
        tipo_item: [r.tipo, r.numero].filter(Boolean).join(' '),
      }
    }
    onImportar(entrada)
    setImportados(prev => new Set([...prev, r.url || r.numero]))
  }

  const card = {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    padding: 16,
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Pesquisar Jurisprudência
        </div>
        <div style={{ fontSize: 12, color: theme.muted }}>
          Busca em tempo real no STJ, STF e demais tribunais · resultados reais com link oficial
        </div>
      </div>

      {/* Barra de busca */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {TRIBUNAIS.map(t => (
            <button key={t.id} onClick={() => setTribunal(t.id)}
              style={{
                background: tribunal === t.id ? theme.gold : theme.raised,
                color:      tribunal === t.id ? '#0b0f1a' : theme.muted,
                border:     `1px solid ${tribunal === t.id ? theme.gold : theme.border}`,
                borderRadius: 6, padding: '5px 12px', fontSize: 12,
                fontFamily: 'IBM Plex Mono, monospace', cursor: 'pointer', fontWeight: tribunal === t.id ? 700 : 400,
              }}>{t.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pesquisar()}
            placeholder="Ex: responsabilidade civil banco de dados consumidor negativação indevida"
            style={{ flex: 1 }}
          />
          <button onClick={pesquisar} disabled={loading || !query.trim()}
            style={{
              background: loading || !query.trim() ? theme.border : theme.gold,
              color:      loading || !query.trim() ? theme.muted : '#0b0f1a',
              border: 'none', borderRadius: 8, padding: '0 20px',
              fontSize: 13, fontWeight: 700, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap',
            }}>
            {loading ? '⟳ Buscando...' : '⌕ Buscar'}
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div style={{
          background: mode === 'dark' ? '#3b0f0f' : '#fef2f2',
          border: '1px solid #f87171', borderRadius: 10,
          padding: 14, color: '#f87171', fontSize: 13, marginBottom: 16,
        }}>✕ {error}</div>
      )}

      {/* Aviso */}
      {aviso && !error && (
        <div style={{
          background: mode === 'dark' ? '#1a2236' : '#fafaf8',
          border: `1px solid ${theme.border}`, borderRadius: 10,
          padding: 14, color: theme.muted, fontSize: 13, marginBottom: 16,
        }}>ℹ {aviso}</div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ ...card, opacity: 0.5 }}>
              <div style={{ height: 12, background: theme.border, borderRadius: 4, width: '40%', marginBottom: 10 }} />
              <div style={{ height: 10, background: theme.border, borderRadius: 4, width: '90%', marginBottom: 6 }} />
              <div style={{ height: 10, background: theme.border, borderRadius: 4, width: '70%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Resultados */}
      {!loading && resultados.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: theme.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {resultados.map((r, i) => {
              const areaColor = AREAS[r.area]?.color || AREAS['Cível'].color
              const chave = r.url || r.numero || i
              const jaImportado = importados.has(chave)
              return (
                <div key={i} style={{
                  ...card,
                  borderLeft: `3px solid ${areaColor}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Badge label={r.tribunal || '—'} color={areaColor} />
                      <Badge label={r.area || 'Cível'} color={areaColor} small />
                      {r.numero && (
                        <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'monospace' }}>{r.tipo} {r.numero}</span>
                      )}
                      {r.data && (
                        <span style={{ fontSize: 11, color: theme.muted }}>· {r.data}</span>
                      )}
                    </div>

                    {/* Relator */}
                    {r.relator && (
                      <div style={{ fontSize: 11, color: theme.muted, marginBottom: 6 }}>
                        Rel. {r.relator}
                      </div>
                    )}

                    {/* Ementa */}
                    <div style={{ fontSize: 13, color: theme.cream, lineHeight: 1.6, marginBottom: 8 }}>
                      {r.ementa}
                    </div>

                    {/* Link oficial */}
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, color: theme.gold, textDecoration: 'none', wordBreak: 'break-all' }}>
                        ↗ Acessar no portal oficial
                      </a>
                    )}
                  </div>

                  {/* Botão importar */}
                  <button onClick={() => handleImportar(r)} disabled={jaImportado}
                    style={{
                      background: jaImportado ? (mode === 'dark' ? '#0f2b1a' : '#f0fdf4') : theme.gold,
                      color:      jaImportado ? theme.success : '#0b0f1a',
                      border:     `1px solid ${jaImportado ? theme.success : theme.gold}`,
                      borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700,
                      cursor: jaImportado ? 'default' : 'pointer',
                      fontFamily: 'IBM Plex Mono, monospace',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                    {jaImportado ? '✓ Importado' : '+ Importar'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
