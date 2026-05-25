import { useState } from 'react'
import { AREAS, Badge } from '../shared'

export default function EntradaDetail({ entry, onClose, onDelete, onEdit }) {
  const [copied, setCopied] = useState(false)
  const am = AREAS[entry.area] || { color: '#6b7fa3' }

  function copyFichamento() {
    const lines = [
      `# ${entry.tema}`,
      `- Área: ${entry.area} | Tipo: ${entry.tipo}`,
      `- Fonte: ${entry.fonte}`,
      `- Referência: ${entry.referencia}`,
      entry.url ? `- URL: ${entry.url}` : '',
      '',
      ...(entry.teses || []).flatMap((t, i) => [
        `## Tese ${i + 1}: ${t.tese_assunto}`,
        `**Fundamentação:** ${t.fundamentacao_legal}`,
        `**Precedente:** ${t.precedente_sumula}`,
        `**Ratio:** ${t.ratio_decidendi}`,
        `**Aplicação:** ${t.aplicacao_pratica}`,
        '',
      ]),
    ].join('\n')
    navigator.clipboard.writeText(lines)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <Badge label={entry.area} color={am.color} />
          <Badge label={entry.tipo} color="#6b7fa3" />
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#e8dfc8',
          fontFamily: 'Playfair Display, serif',
          lineHeight: 1.3,
          marginBottom: 6,
        }}>{entry.tema}</div>
        <div style={{ fontSize: 11, color: '#6b7fa3' }}>
          {entry.fonte}{entry.referencia ? ` · ${entry.referencia}` : ''}
        </div>
        {entry.url && (
          <a href={entry.url} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: '#c9a452', wordBreak: 'break-all', display: 'block', marginTop: 4 }}>
            {entry.url}
          </a>
        )}
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={copyFichamento} style={{
          flex: 1,
          background: copied ? '#0f2b1a' : '#1a2236',
          border: `1px solid ${copied ? '#10b981' : '#1e2d45'}`,
          color: copied ? '#10b981' : '#6b7fa3',
          borderRadius: 8, padding: '8px 12px',
          fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
        }}>
          {copied ? '✓ Copiado' : '⎘ Copiar fichamento'}
        </button>
        <button onClick={onEdit} style={{
          flex: 1,
          background: '#1a2236', border: '1px solid #1e2d45',
          color: '#6b7fa3', borderRadius: 8, padding: '8px 12px',
          fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
        }}>✎ Editar</button>
        <button onClick={onDelete} style={{
          background: '#2a0f0f', border: '1px solid #5a1f1f',
          color: '#f87171', borderRadius: 8, padding: '8px 12px',
          fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
        }}>✕</button>
      </div>

      {/* Teses */}
      {(entry.teses || []).map((t, i) => (
        <div key={i} style={{
          background: '#1a2236', border: '1px solid #1e2d45',
          borderRadius: 12, padding: 16, marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, color: '#c9a452', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            Tese {i + 1}
          </div>
          {[
            ['Tese / Assunto', t.tese_assunto],
            ['Fundamentação Legal', t.fundamentacao_legal],
            ['Precedente / Súmula', t.precedente_sumula],
            ['Ratio Decidendi', t.ratio_decidendi],
            ['Aplicação Prática', t.aplicacao_pratica],
          ].map(([label, val]) => val ? (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#6b7fa3', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: '#e8dfc8', lineHeight: 1.6 }}>{val}</div>
            </div>
          ) : null)}
        </div>
      ))}
    </div>
  )
}
