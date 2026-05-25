import { useState } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

export default function BuscaPeca({ entradas }) {
  const { theme } = useTheme()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function buscar() {
    if (!query.trim() || loading) return
    setLoading(true)
    setResult('')
    setError('')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('busca-peca', {
        body: { query, entradas },
      })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)
      setResult(data?.result || 'Sem resposta.')
    } catch (err) {
      setError('Erro ao consultar: ' + err.message + '. Verifique se a Edge Function está ativa.')
    }
    setLoading(false)
  }

  function copyResult() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>
          Busca para Peça
        </div>
        <div style={{ fontSize: 13, color: theme.muted }}>
          Descreva a peça e a IA seleciona as teses relevantes do repositório.
        </div>
      </div>

      <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ex: Petição inicial de ação indenizatória por acidente de trânsito com colisão traseira, pedido de danos morais e materiais, réu é empresa locadora, Comarca de Santos/SP..."
          rows={5}
          onKeyDown={e => e.key === 'Enter' && e.ctrlKey && buscar()}
          style={{
            background: theme.inputBg,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            marginBottom: 12,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, color: theme.muted }}>
            Ctrl+Enter para buscar · {entradas.length} entradas no repositório
          </span>
          <button onClick={buscar} disabled={loading || !query.trim()} style={{
            background: loading || !query.trim()
              ? theme.raised
              : `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`,
            color: loading || !query.trim() ? theme.muted : '#0b0f1a',
            border: 'none', borderRadius: 8, padding: '10px 20px',
            fontSize: 13, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace',
            cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
            boxShadow: loading || !query.trim() ? 'none' : `0 4px 12px ${theme.gold}44`,
          }}>
            {loading ? '⟳ Buscando...' : '✦ Buscar Teses'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#3b0f0f', border: '1px solid #f87171',
          borderRadius: 10, padding: 16, color: '#f87171', fontSize: 13, marginBottom: 16,
        }}>
          ✕ {error}
        </div>
      )}

      {result && (
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2 }}>
              Teses Selecionadas
            </div>
            <button onClick={copyResult} style={{
              background: copied ? (theme === 'dark' ? '#0f2b1a' : '#f0fdf4') : theme.raised,
              border: `1px solid ${copied ? theme.success : theme.border}`,
              color: copied ? theme.success : theme.muted,
              borderRadius: 6, padding: '6px 12px',
              fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
            }}>
              {copied ? '✓ Copiado' : '⎘ Copiar'}
            </button>
          </div>
          <div style={{
            fontSize: 13, color: theme.text, lineHeight: 1.8,
            whiteSpace: 'pre-wrap', fontFamily: 'monospace',
          }}>{result}</div>
        </div>
      )}
    </div>
  )
}
