import { useState, useRef } from 'react'
import { useTheme } from '../theme'

// Paleta cíclica para tags — versões mais escuras no tema claro (senão
// cores como ciano/amarelo ficam claras demais sobre fundo branco).
const TAG_CORES_ESCURO = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#f97316', '#ec4899']
const TAG_CORES_CLARO  = ['#1e3a8a', '#065f46', '#92400e', '#991b1b', '#6b21a8', '#155e75', '#9a3412', '#9d174d']

function corParaTag(tag, isDark) {
  let hash = 0
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  const paleta = isDark ? TAG_CORES_ESCURO : TAG_CORES_CLARO
  return paleta[Math.abs(hash) % paleta.length]
}

export function TagPill({ tag, onRemove, pequena }) {
  const { isDark } = useTheme()
  const cor = corParaTag(tag, isDark)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cor + '1a', color: cor, fontWeight: 700,
      border: `1px solid ${cor}55`,
      borderRadius: 20, padding: pequena ? '1px 8px' : '3px 10px',
      fontSize: pequena ? 10 : 11,
      fontFamily: "Georgia, 'EB Garamond', serif",
      whiteSpace: 'nowrap',
    }}>
      #{tag}
      {onRemove && (
        <button onClick={() => onRemove(tag)} style={{
          background: 'none', border: 'none', color: cor,
          cursor: 'pointer', fontSize: 12, lineHeight: 1,
          padding: 0, display: 'flex', alignItems: 'center',
        }}>×</button>
      )}
    </span>
  )
}


// Diplomas legais sugeridos como tags
const TAGS_SUGERIDAS = [
  'CC','CDC','CPC','CPP','CF','CTB','CP','CLT',
  'STJ','STF','TJSP','TJRJ','TJMG',
  'Lei 9.099','Lei 9.870','Lei 10.741','Lei 11.343','Lei 13.964',
]

export default function TagInput({ tags = [], onChange, todasAsTags = [] }) {
  const { theme } = useTheme()
  const [input, setInput]       = useState('')
  const [foco, setFoco]         = useState(false)
  const inputRef = useRef()

  const sugestoes = [...new Set([...TAGS_SUGERIDAS, ...todasAsTags])]
    .filter(t => !tags.includes(t) && t.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 8)

  function adicionar(tagDigitada) {
    const limpa = tagDigitada.trim().replace(/[^a-zA-Z0-9À-ÿ\-_.]/g, '')
    if (!limpa || tags.length >= 10) return
    // Evita duplicar por causa de maiúsculas/minúsculas (ex: "CDC" vs "cdc"
    // virarem duas tags "iguais" só com grafia diferente).
    if (tags.some(t => t.toLowerCase() === limpa.toLowerCase())) return
    const jaSugerida = [...TAGS_SUGERIDAS, ...todasAsTags].find(t => t.toLowerCase() === limpa.toLowerCase())
    onChange([...tags, jaSugerida || limpa])
    setInput('')
  }

  function remover(tag) { onChange(tags.filter(t => t !== tag)) }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); adicionar(input) }
    if (e.key === 'Backspace' && !input && tags.length) remover(tags[tags.length - 1])
  }

  return (
    <div>
      {/* Tags existentes + input */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          background: theme.inputBg, border: `1px solid ${foco ? theme.gold : theme.border}`,
          borderRadius: 6, padding: '8px 10px', cursor: 'text',
          minHeight: 40, transition: 'border-color .15s',
        }}>
        {tags.map(t => <TagPill key={t} tag={t} onRemove={remover} />)}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => setFoco(true)}
          onBlur={() => setTimeout(() => setFoco(false), 150)}
          placeholder={tags.length === 0 ? 'Adicionar tags (Enter ou vírgula)' : ''}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            color: theme.text, fontSize: 12,
            fontFamily: "Georgia, 'EB Garamond', serif",
            flex: 1, minWidth: 120, padding: 0,
          }}
        />
      </div>

      {/* Sugestões */}
      {foco && (input || sugestoes.length > 0) && (
        <div style={{
          background: theme.cardBg, border: `1px solid ${theme.border}`,
          borderRadius: 8, marginTop: 4, overflow: 'hidden',
          boxShadow: theme.shadow,
        }}>
          {/* Tags existentes como sugestão */}
          {sugestoes.length > 0 && (
            <div style={{ padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sugestoes.map(t => (
                <button key={t} onMouseDown={() => adicionar(t)}
                  style={{
                    background: 'none', border: `1px solid ${theme.border}`,
                    borderRadius: 20, padding: '2px 10px', cursor: 'pointer',
                    fontSize: 11, color: theme.muted,
                    fontFamily: "Georgia, 'EB Garamond', serif",
                  }}>#{t}</button>
              ))}
            </div>
          )}
          {/* Criar nova */}
          {input.trim() && !tags.some(t => t.toLowerCase() === input.trim().toLowerCase()) && (
            <div
              onMouseDown={() => adicionar(input)}
              style={{
                padding: '8px 12px', fontSize: 12, color: theme.gold,
                cursor: 'pointer', borderTop: sugestoes.length ? `1px solid ${theme.border}` : 'none',
                fontFamily: "Georgia, 'EB Garamond', serif",
              }}>
              + Criar tag <strong>#{input.trim().toLowerCase()}</strong>
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 10, color: theme.muted, marginTop: 4 }}>
        {tags.length}/10 · Enter ou vírgula para adicionar · Backspace para remover
      </div>
    </div>
  )
}
