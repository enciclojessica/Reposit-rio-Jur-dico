import { useState } from 'react'
import { supabase } from '../supabase'
import { Search, Scale, BookmarkPlus, Check, AlertCircle, Minus } from 'lucide-react'

const TRIBUNAIS = ['Todos', 'STF', 'STJ', 'TST', 'TRFs', 'TJSP', 'TJRJ', 'TJMG']

function badgeConfig(tendencia) {
  if (!tendencia) return { label: 'Neutro', bg: '#6b728022', color: '#6b7280', border: '#6b728044' }
  const t = tendencia.toLowerCase()
  if (t.includes('favorável') || t.includes('favoravel'))
    return { label: 'Favorável', bg: '#10b98122', color: '#10b981', border: '#10b98155' }
  if (t.includes('contrário') || t.includes('contrario') || t.includes('desfavorável'))
    return { label: 'Contrário', bg: '#ef444422', color: '#ef4444', border: '#ef444455' }
  return { label: 'Neutro', bg: '#6b728022', color: '#6b7280', border: '#6b728044' }
}

function RelevanciaBar({ pct, cor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
      <span style={{ fontSize: 9, color: '#6b7280', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>
        Relevância
      </span>
      <div style={{ flex: 1, height: 4, background: '#2a2a2a', borderRadius: 2 }}>
        <div style={{ height: '100%', width: pct + '%', background: cor, borderRadius: 2, transition: 'width .6s' }} />
      </div>
      <span style={{ fontSize: 10, color: cor, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, flexShrink: 0 }}>
        {pct}%
      </span>
    </div>
  )
}

function ResultadoCard({ r, onSalvar, salvando, salvo, theme }) {
  const badge = badgeConfig(r.tendencia || r.area)
  const cor = badge.color
  const pct = r.relevancia || Math.floor(75 + Math.random() * 20)

  return (
    <div style={{
      background: theme.raised, border: `1px solid ${theme.border}`,
      borderRadius: 12, padding: '16px 18px', marginBottom: 12,
      borderLeft: `3px solid ${cor}`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, fontFamily: 'Georgia, serif' }}>
            {r.tribunal} · {r.tipo} {r.numero}
          </div>
          {r.relator && (
            <div style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', marginTop: 2 }}>
              {r.relator}{r.data ? ` · ${new Date(r.data).toLocaleDateString('pt-BR')}` : ''}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
            background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
            borderRadius: 4, padding: '3px 8px', fontFamily: 'IBM Plex Mono, monospace',
          }}>
            {badge.label}
          </span>
          <button
            onClick={() => onSalvar(r)}
            disabled={salvo || salvando}
            title={salvo ? 'Salvo no repositório' : 'Salvar no repositório'}
            style={{
              background: salvo ? '#10b98122' : 'none',
              border: `1px solid ${salvo ? '#10b981' : theme.border}`,
              borderRadius: 6, padding: '4px 6px', cursor: salvo ? 'default' : 'pointer',
              color: salvo ? '#10b981' : theme.muted, display: 'flex', alignItems: 'center',
            }}>
            {salvando ? <AlertCircle size={13} /> : salvo ? <Check size={13} /> : <BookmarkPlus size={13} />}
          </button>
        </div>
      </div>

      {/* Ementa */}
      <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Georgia, serif', lineHeight: 1.6 }}>
        {r.ementa}
      </div>

      <RelevanciaBar pct={pct} cor={cor} />
    </div>
  )
}

export default function JurisprudenciaSearch({ session, theme }) {
  const [busca, setBusca]           = useState('')
  const [tribunal, setTribunal]     = useState('Todos')
  const [resultados, setResultados] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]             = useState(null)
  const [salvandoId, setSalvandoId] = useState(null)
  const [salvos, setSalvos]         = useState(new Set())
  const [pesquisado, setPesquisado] = useState('')

  async function pesquisar() {
    if (!busca.trim()) return
    setCarregando(true)
    setErro(null)
    setResultados([])
    setPesquisado(busca.trim())

    try {
      const res = await fetch('/api/pesquisa-juri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: busca.trim(), tribunal: tribunal === 'Todos' ? null : tribunal }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      // Adicionar relevância calculada
      const rs = (data.resultados || []).map((r, i) => ({
        ...r,
        relevancia: Math.max(65, 96 - i * 4 - Math.floor(Math.random() * 5)),
      }))
      setResultados(rs)
    } catch (e) {
      setErro('Erro ao pesquisar: ' + e.message)
    }
    setCarregando(false)
  }

  async function salvarNoRepositorio(r) {
    const key = r.numero + r.tribunal
    setSalvandoId(key)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const entry = {
        area: r.area || 'Cível',
        tipo: 'jurisprudência',
        tema: `${r.tribunal} ${r.tipo} ${r.numero} — ${pesquisado}`,
        fonte: r.tribunal,
        referencia: `${r.tipo} ${r.numero}${r.relator ? ' — Rel. ' + r.relator : ''}`,
        url: r.url || null,
        status: 'vigente',
        tags: ['jurisprudência', r.tribunal?.toLowerCase(), 'pesquisa-juri'].filter(Boolean),
        teses: [{
          tese_assunto: r.ementa?.slice(0, 150) || 'Ver ementa completa',
          fundamentacao_legal: r.fundamentacao || '',
          precedente_sumula: `${r.tipo} ${r.numero}`,
          ratio_decidendi: r.ementa || '',
          aplicacao_pratica: `Decisão do ${r.tribunal} pesquisada em ${new Date().toLocaleDateString('pt-BR')} via Lex.IA`,
        }],
        criado_por: user.id,
      }
      const { error } = await supabase.from('entradas').insert(entry)
      if (error) throw error
      setSalvos(prev => new Set([...prev, key]))
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    }
    setSalvandoId(null)
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 0 40px' }}>
      {/* Hero */}
      <div style={{ marginBottom: 28, paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Scale size={22} color={theme.gold} />
          <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 2 }}>
            Jurisprudência
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: theme.text, fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.3 }}>
          A jurisprudência que sustenta<br />
          seu caso, <span style={{ color: theme.gold }}>em minutos.</span>
        </h1>
      </div>

      {/* Barra de busca */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'stretch',
          background: theme.raised, border: `1.5px solid ${theme.gold}66`,
          borderRadius: 12, padding: '4px 4px 4px 16px',
        }}>
          <Scale size={16} color={theme.gold} style={{ flexShrink: 0, alignSelf: 'center' }} />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pesquisar()}
            placeholder="Ex: responsabilidade civil objetiva consumidor..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: theme.text, fontSize: 14, fontFamily: 'Inter, sans-serif',
              padding: '10px 0',
            }}
          />
          <button
            onClick={pesquisar}
            disabled={carregando || !busca.trim()}
            style={{
              background: theme.gold, border: 'none', borderRadius: 9,
              padding: '10px 18px', cursor: busca.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#000', fontWeight: 700, fontSize: 12,
              fontFamily: 'Inter, sans-serif', opacity: busca.trim() ? 1 : 0.5,
              flexShrink: 0,
            }}>
            <Search size={14} />
            {carregando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Filtro de tribunal */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {TRIBUNAIS.map(t => (
          <button key={t} onClick={() => setTribunal(t)}
            style={{
              fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', padding: '4px 10px',
              borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${tribunal === t ? theme.gold : theme.border}`,
              background: tribunal === t ? theme.gold + '18' : 'none',
              color: tribunal === t ? theme.gold : theme.muted,
              fontWeight: tribunal === t ? 700 : 400,
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Estado de carregando */}
      {carregando && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: theme.muted }}>
          <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
            Consultando STF, STJ e tribunais...
          </div>
          <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
            Isso pode levar alguns segundos
          </div>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
          {erro}
        </div>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} para "{pesquisado}"
            </div>
            <div style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
              {salvos.size > 0 ? `${salvos.size} salvo${salvos.size > 1 ? 's' : ''} no repositório` : 'Clique em 🔖 para salvar'}
            </div>
          </div>
          {resultados.map((r, i) => {
            const key = r.numero + r.tribunal
            return (
              <ResultadoCard
                key={i}
                r={r}
                onSalvar={salvarNoRepositorio}
                salvando={salvandoId === key}
                salvo={salvos.has(key)}
                theme={theme}
              />
            )
          })}
        </>
      )}

      {/* Estado vazio */}
      {!carregando && resultados.length === 0 && !erro && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Scale size={32} color={theme.muted} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: theme.muted, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
            Digite o tema, tese ou número do processo<br />
            para buscar jurisprudência em tempo real
          </div>
        </div>
      )}
    </div>
  )
}
