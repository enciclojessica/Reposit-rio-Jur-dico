import { useState } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { ANTHROPIC_MODEL } from '../../lib/anthropicModel'

const AREA_COR = {
  'Cível': '#3b82f6', 'Penal': '#ef4444',
  'Constitucional': '#8b5cf6', 'Trabalhista': '#f59e0b',
}

function ResultadoFts({ entradas, theme }) {
  if (!entradas.length) {
    return (
      <div style={{ padding: '24px 4px', color: theme.muted, fontSize: 13 }}>
        Nenhuma entrada encontrada com esses termos. Tente palavras mais genéricas
        (ex: "dano moral" em vez de "indenização por sofrimento psíquico").
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {entradas.map(e => (
        <div key={e.id} style={{
          background: theme.cardBg, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: 14,
        }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              color: AREA_COR[e.area] || theme.muted,
              background: (AREA_COR[e.area] || theme.muted) + '18',
              border: `1px solid ${(AREA_COR[e.area] || theme.muted)}44`,
              borderRadius: 4, padding: '2px 6px',
            }}>{e.area}</span>
            <span style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{e.tipo}</span>
            {e.status === 'superada' && (
              <span style={{ fontSize: 10, color: '#f59e0b' }}>⚠ superada</span>
            )}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 4 }}>{e.tema}</div>
          {e.fonte && <div style={{ fontSize: 11, color: theme.muted, marginBottom: 8 }}>{e.fonte}</div>}
          {Array.isArray(e.teses) && e.teses.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {e.teses.map((t, i) => (
                <li key={i} style={{ fontSize: 12.5, color: theme.text, lineHeight: 1.6, marginBottom: 4 }}>{t}</li>
              ))}
            </ul>
          )}
          {e.url && (
            <a href={e.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: theme.gold }}>Ver fonte ↗</a>
          )}
        </div>
      ))}
    </div>
  )
}

export default function BuscaPeca({ entradas, podeUsarIA }) {
  const { theme, mode } = useTheme()
  const [query, setQuery] = useState('')

  // Busca sem IA (full-text, gratuita) — padrão da tela
  const [buscandoFts, setBuscandoFts] = useState(false)
  const [resultadosFts, setResultadosFts] = useState(null) // null = ainda não buscou
  const [erroFts, setErroFts] = useState('')

  // Busca com IA (recurso pago) — opcional
  const [loadingIA, setLoadingIA] = useState(false)
  const [resultIA, setResultIA] = useState('')
  const [erroIA, setErroIA] = useState('')
  const [copied, setCopied] = useState(false)

  async function buscarSemIA() {
    if (!query.trim() || buscandoFts) return
    setBuscandoFts(true)
    setErroFts('')
    setResultIA('')
    setErroIA('')
    try {
      const { data, error } = await supabase.rpc('buscar_entradas_fts', {
        p_query: query, p_limit: 20,
      })
      if (error) throw error
      setResultadosFts(data || [])
    } catch (err) {
      setErroFts('Erro ao buscar: ' + err.message)
      setResultadosFts(null)
    }
    setBuscandoFts(false)
  }

  async function buscarComIA() {
    if (!query.trim() || loadingIA || !podeUsarIA) return
    setLoadingIA(true)
    setResultIA('')
    setErroIA('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada. Faça login novamente.')

      const ctx = JSON.stringify(entradas.map(e => ({
        area: e.area, tema: e.tema, tipo: e.tipo,
        fonte: e.fonte, referencia: e.referencia, teses: e.teses,
      })))

      const res = await fetch('/api/busca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({
          feature: 'busca-peca',
          model: ANTHROPIC_MODEL,
          max_tokens: 1500,
          system: 'Você é um assistente de prática jurídica. Dado um repositório de teses em JSON, selecione as mais relevantes para a peça indicada. Para cada tese: (1) tese/assunto, (2) fundamentação legal, (3) precedente, (4) como aplicar especificamente na peça. Técnico e objetivo. Formate em markdown. Se faltar cobertura no repositório, aponte as lacunas.',
          messages: [{ role: 'user', content: `Repositório:\n${ctx}\n\nPeça: ${query}` }],
        }),
      })

      const json = await res.json()
      if (json.error) throw new Error(json.error.message || json.error)
      setResultIA(json.content?.[0]?.text || 'Sem resposta.')
    } catch (err) {
      setErroIA('Erro ao consultar a IA: ' + err.message)
    }
    setLoadingIA(false)
  }

  function copyResult() {
    navigator.clipboard.writeText(resultIA)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 18, fontWeight: 700, color: theme.gold,
          fontFamily: 'Playfair Display, serif', marginBottom: 6,
        }}>
          Busca para Peça
        </div>
        <div style={{ fontSize: 13, color: theme.muted }}>
          Descreva a peça ou digite os termos e busque as teses relevantes do repositório.
        </div>
      </div>

      <div style={{
        background: theme.cardBg, border: `1px solid ${theme.border}`,
        borderRadius: 12, padding: 16, marginBottom: 16,
      }}>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ex: acidente de trânsito, colisão traseira, danos morais e materiais, réu empresa locadora..."
          rows={5}
          onKeyDown={e => e.key === 'Enter' && e.ctrlKey && buscarSemIA()}
          style={{
            background: theme.inputBg,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            marginBottom: 12,
          }}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontSize: 11, color: theme.muted }}>
            Ctrl+Enter para buscar · {entradas.length} entradas no repositório
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={buscarSemIA}
              disabled={buscandoFts || !query.trim()}
              style={{
                background: buscandoFts || !query.trim() ? theme.raised : theme.gold,
                color: buscandoFts || !query.trim() ? theme.muted : '#0b0f1a',
                border: 'none', borderRadius: 8, padding: '10px 18px',
                fontSize: 13, fontWeight: 700,
                fontFamily: 'IBM Plex Mono, monospace',
                cursor: buscandoFts || !query.trim() ? 'not-allowed' : 'pointer',
              }}>
              {buscandoFts ? '⟳ Buscando...' : '🔍 Buscar'}
            </button>
            <button
              onClick={buscarComIA}
              disabled={loadingIA || !query.trim() || !podeUsarIA}
              title={podeUsarIA ? '' : 'Recurso disponível apenas para membros com acesso à IA'}
              style={{
                background: !podeUsarIA
                  ? theme.raised
                  : (loadingIA || !query.trim() ? theme.raised : `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`),
                color: !podeUsarIA || loadingIA || !query.trim() ? theme.muted : '#0b0f1a',
                border: 'none', borderRadius: 8, padding: '10px 18px',
                fontSize: 13, fontWeight: 700,
                fontFamily: 'IBM Plex Mono, monospace',
                cursor: (!podeUsarIA || loadingIA || !query.trim()) ? 'not-allowed' : 'pointer',
                opacity: podeUsarIA ? 1 : 0.6,
              }}>
              {!podeUsarIA ? '🔒 Buscar com IA' : (loadingIA ? '⟳ Buscando...' : '✦ Buscar com IA')}
            </button>
          </div>
        </div>
        {!podeUsarIA && (
          <div style={{ fontSize: 11, color: theme.muted, marginTop: 8, textAlign: 'right' }}>
            A busca com IA interpreta sua descrição e explica como aplicar cada tese na peça. Disponível para membros com acesso liberado.
          </div>
        )}
      </div>

      {erroFts && (
        <div style={{
          background: mode === 'dark' ? '#3b0f0f' : '#fef2f2',
          border: '1px solid #f87171', borderRadius: 10,
          padding: 16, color: '#f87171', fontSize: 13, marginBottom: 16,
        }}>
          ✕ {erroFts}
        </div>
      )}

      {resultadosFts !== null && !resultIA && (
        <>
          <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
            {resultadosFts.length} resultado(s)
          </div>
          <ResultadoFts entradas={resultadosFts} theme={theme} />
        </>
      )}

      {erroIA && (
        <div style={{
          background: mode === 'dark' ? '#3b0f0f' : '#fef2f2',
          border: '1px solid #f87171', borderRadius: 10,
          padding: 16, color: '#f87171', fontSize: 13, marginBottom: 16,
        }}>
          ✕ {erroIA}
        </div>
      )}

      {resultIA && (
        <div style={{
          background: theme.cardBg, border: `1px solid ${theme.border}`,
          borderRadius: 12, padding: 16,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 14,
          }}>
            <div style={{
              fontSize: 11, color: theme.gold,
              textTransform: 'uppercase', letterSpacing: 2,
            }}>
              Teses Selecionadas (IA)
            </div>
            <button onClick={copyResult} style={{
              background: copied
                ? (mode === 'dark' ? '#0f2b1a' : '#f0fdf4')
                : theme.raised,
              border: `1px solid ${copied ? theme.success : theme.border}`,
              color: copied ? theme.success : theme.muted,
              borderRadius: 6, padding: '6px 12px', fontSize: 11,
              cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
            }}>
              {copied ? '✓ Copiado' : '⎘ Copiar'}
            </button>
          </div>
          {entradas.some(e => e.status === 'superada' && resultIA.includes(e.tema?.slice(0, 20) || '')) && (
            <div style={{ background: mode === 'dark' ? '#3b1a00' : '#fff7ed', border: '1px solid #f59e0b55', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#f59e0b' }}>
              ⚠ Algumas teses sugeridas podem estar marcadas como superadas no repositório. Verifique o status antes de usar.
            </div>
          )}
          <div style={{
            fontSize: 13, color: theme.text, lineHeight: 1.8,
            whiteSpace: 'pre-wrap', fontFamily: 'monospace',
          }}>{resultIA}</div>
        </div>
      )}
    </div>
  )
}
