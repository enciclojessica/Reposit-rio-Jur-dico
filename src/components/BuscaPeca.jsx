import { useState } from 'react'
import { useTheme } from '../theme'
import { STATUS_META } from '../shared'

export default function BuscaPeca({ entradas }) {
  const { theme, mode } = useTheme()
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
      const ctx = JSON.stringify(entradas.map(e => ({
        area: e.area, tema: e.tema, tipo: e.tipo,
        fonte: e.fonte, referencia: e.referencia, teses: e.teses,
      })))

      const res = await fetch('/api/busca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1500,
          system: 'Você é um assistente de prática jurídica. Dado um repositório de teses em JSON, selecione as mais relevantes para a peça indicada. Para cada tese: (1) tese/assunto, (2) fundamentação legal, (3) precedente, (4) como aplicar especificamente na peça. Técnico e objetivo. Formate em markdown. Se faltar cobertura no repositório, aponte as lacunas.',
          messages: [{ role: 'user', content: `Repositório:\n${ctx}\n\nPeça: ${query}` }],
        }),
      })

      const json = await res.json()
      if (json.error) throw new Error(json.error.message || json.error)
      setResult(json.content?.[0]?.text || 'Sem resposta.')
    } catch (err) {
      setError('Erro ao consultar a IA: ' + err.message)
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
        <div style={{
          fontSize: 18, fontWeight: 700, color: theme.gold,
          fontFamily: 'Playfair Display, serif', marginBottom: 6,
        }}>
          Busca para Peça
        </div>
        <div style={{ fontSize: 13, color: theme.muted }}>
          Descreva a peça e a IA seleciona as teses relevantes do repositório.
        </div>
      </div>

      <div style={{
        background: theme.cardBg, border: `1px solid ${theme.border}`,
        borderRadius: 12, padding: 16, marginBottom: 16,
      }}>
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
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontSize: 11, color: theme.muted }}>
            Ctrl+Enter para buscar · {entradas.length} entradas no repositório
          </span>
          <button
            onClick={buscar}
            disabled={loading || !query.trim()}
            style={{
              background: loading || !query.trim()
                ? theme.raised
                : `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`,
              color: loading || !query.trim() ? theme.muted : '#0b0f1a',
              border: 'none', borderRadius: 8, padding: '10px 20px',
              fontSize: 13, fontWeight: 700,
              fontFamily: 'IBM Plex Mono, monospace',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              boxShadow: loading || !query.trim() ? 'none' : `0 4px 12px ${theme.gold}44`,
            }}>
            {loading ? '⟳ Buscando...' : '✦ Buscar Teses'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: mode === 'dark' ? '#3b0f0f' : '#fef2f2',
          border: '1px solid #f87171', borderRadius: 10,
          padding: 16, color: '#f87171', fontSize: 13, marginBottom: 16,
        }}>
          ✕ {error}
        </div>
      )}

      {result && (
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
              Teses Selecionadas
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
          {/* Aviso de entradas superadas na busca */}
          {entradas.some(e => e.status === 'superada' && result.includes(e.tema?.slice(0, 20) || '')) && (
            <div style={{ background: mode === 'dark' ? '#3b1a00' : '#fff7ed', border: '1px solid #f59e0b55', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#f59e0b' }}>
              ⚠ Algumas teses sugeridas podem estar marcadas como superadas no repositório. Verifique o status antes de usar.
            </div>
          )}
          <div style={{
            fontSize: 13, color: theme.text, lineHeight: 1.8,
            whiteSpace: 'pre-wrap', fontFamily: 'monospace',
          }}>{result}</div>
        </div>
      )}
    </div>
  )
}
