import { useState } from 'react'
import { BtnGold } from '../shared'

export default function BuscaPeca({ entradas }) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function buscar() {
    if (!query.trim() || loading) return
    setLoading(true)
    setResult('')
    try {
      const ctx = JSON.stringify(entradas.map(e => ({
        area: e.area, tema: e.tema, tipo: e.tipo,
        fonte: e.fonte, referencia: e.referencia, teses: e.teses,
      })))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: 'Você é um assistente de prática jurídica. Dado um repositório de teses em JSON, selecione as mais relevantes para a peça indicada. Para cada tese selecionada, indique: (1) tese/assunto, (2) fundamentação legal, (3) precedente, (4) como aplicar especificamente na peça. Seja técnico e objetivo. Formate em markdown com seções claras. Se faltar cobertura no repositório para algum ponto da peça, aponte a lacuna.',
          messages: [{ role: 'user', content: `Repositório:\n${ctx}\n\nPeça: ${query}` }],
        }),
      })
      const json = await res.json()
      setResult(json.content?.[0]?.text || 'Sem resposta.')
    } catch {
      setResult('Erro ao consultar a IA. Verifique a conexão.')
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
        <div style={{ fontSize: 18, fontWeight: 700, color: '#c9a452', fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>
          Busca para Peça
        </div>
        <div style={{ fontSize: 13, color: '#6b7fa3' }}>
          Descreva a peça e a IA seleciona as teses relevantes do repositório.
        </div>
      </div>

      <div style={{ background: '#1a2236', border: '1px solid #1e2d45', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ex: Petição inicial de ação indenizatória por acidente de trânsito com colisão traseira, pedido de danos morais e materiais, réu é empresa locadora, Comarca de Santos/SP..."
          rows={5}
          style={{ marginBottom: 12 }}
          onKeyDown={e => e.key === 'Enter' && e.ctrlKey && buscar()}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#6b7fa3' }}>
            {entradas.length} entradas no repositório
          </span>
          <BtnGold onClick={buscar} disabled={loading || !query.trim()}>
            {loading ? '✦ Buscando...' : '✦ Buscar Teses'}
          </BtnGold>
        </div>
      </div>

      {result && (
        <div style={{ background: '#1a2236', border: '1px solid #1e2d45', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#c9a452', textTransform: 'uppercase', letterSpacing: 2 }}>
              Teses Selecionadas
            </div>
            <button onClick={copyResult} style={{
              background: copied ? '#0f2b1a' : '#0b0f1a',
              border: `1px solid ${copied ? '#10b981' : '#1e2d45'}`,
              color: copied ? '#10b981' : '#6b7fa3',
              borderRadius: 6, padding: '6px 12px',
              fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
            }}>
              {copied ? '✓ Copiado' : '⎘ Copiar'}
            </button>
          </div>
          <div style={{
            fontSize: 13, color: '#e8dfc8', lineHeight: 1.8,
            whiteSpace: 'pre-wrap', fontFamily: 'monospace',
          }}>{result}</div>
        </div>
      )}
    </div>
  )
}
