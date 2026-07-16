import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { ScrollText, ChevronLeft, ChevronRight, List, Layers } from 'lucide-react'

const NOME_CODIGO_CURTO = {
  cc: 'Código Civil', cpc: 'Código de Processo Civil', cdc: 'Código de Defesa do Consumidor',
  cf: 'Constituição Federal', cpp: 'Código de Processo Penal', ctb: 'Código de Trânsito Brasileiro',
}

// ── Card de Lei Seca — puxa os artigos do Repositório para os intervalos ──
// detectados no tópico do cronograma. Nunca inventa texto: só mostra o que
// já está curado na tabela `legislacao`.
export default function OabLeiSecaCard({ ranges, theme }) {
  const [artigos, setArtigos] = useState(null)
  const [modo, setModo] = useState('flashcard') // 'flashcard' | 'lista'
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      setArtigos(null)
      const todos = []
      for (const r of ranges) {
        const { data } = await supabase
          .from('legislacao')
          .select('*')
          .eq('codigo', r.codigo)
          .eq('vigente', true)
          .gte('numero', r.min)
          .lte('numero', r.max)
          .order('numero', { ascending: true })
        if (data) todos.push(...data)
      }
      if (!cancelado) { setArtigos(todos); setIdx(0) }
    }
    if (ranges?.length) carregar()
    return () => { cancelado = true }
  }, [JSON.stringify(ranges)])

  if (!ranges?.length) return null

  const codigosEnvolvidos = [...new Set(ranges.map(r => r.codigo))]

  return (
    <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 16px', marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
          <ScrollText size={13} /> Lei Seca — {codigosEnvolvidos.map(c => NOME_CODIGO_CURTO[c] || c.toUpperCase()).join(', ')}
        </div>
        {artigos && artigos.length > 0 && (
          <button onClick={() => setModo(m => m === 'flashcard' ? 'lista' : 'flashcard')}
            title={modo === 'flashcard' ? 'Ver lista corrida' : 'Ver um artigo por vez'}
            style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '4px 8px', color: theme.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
            {modo === 'flashcard' ? <List size={12} /> : <Layers size={12} />}
            {modo === 'flashcard' ? 'Lista' : 'Card a card'}
          </button>
        )}
      </div>

      {artigos === null && (
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>Buscando artigos no Repositório...</div>
      )}

      {artigos !== null && artigos.length === 0 && (
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
          Nenhum artigo deste intervalo cadastrado no Repositório ainda.
        </div>
      )}

      {artigos && artigos.length > 0 && modo === 'lista' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
          {artigos.map(a => (
            <div key={a.id} style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 3 }}>
                {a.codigo.toUpperCase()} — Art. {a.numero}{a.paragrafo ? `, § ${a.paragrafo}` : ''}{a.inciso ? `, ${a.inciso}` : ''}
                {a.titulo ? ` — ${a.titulo}` : ''}
              </div>
              <div style={{ fontSize: 12, color: theme.text, fontFamily: 'Georgia, serif', lineHeight: 1.6 }}>{a.texto}</div>
              {a.aplicacao_pratica && (
                <div style={{ fontSize: 11, color: theme.muted, marginTop: 4, fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
                  {a.aplicacao_pratica}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {artigos && artigos.length > 0 && modo === 'flashcard' && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 6 }}>
            {artigos[idx].codigo.toUpperCase()} — Art. {artigos[idx].numero}{artigos[idx].paragrafo ? `, § ${artigos[idx].paragrafo}` : ''}{artigos[idx].inciso ? `, ${artigos[idx].inciso}` : ''}
            {artigos[idx].titulo ? ` — ${artigos[idx].titulo}` : ''}
          </div>
          <div style={{ fontSize: 13, color: theme.text, fontFamily: 'Georgia, serif', lineHeight: 1.7, minHeight: 60 }}>
            {artigos[idx].texto}
          </div>
          {artigos[idx].aplicacao_pratica && (
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 8, fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
              {artigos[idx].aplicacao_pratica}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
              aria-label="Artigo anterior"
              style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '5px 8px', color: idx === 0 ? theme.border : theme.muted, cursor: idx === 0 ? 'default' : 'pointer' }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>{idx + 1} / {artigos.length}</span>
            <button onClick={() => setIdx(i => Math.min(artigos.length - 1, i + 1))} disabled={idx === artigos.length - 1}
              aria-label="Próximo artigo"
              style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '5px 8px', color: idx === artigos.length - 1 ? theme.border : theme.muted, cursor: idx === artigos.length - 1 ? 'default' : 'pointer' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
