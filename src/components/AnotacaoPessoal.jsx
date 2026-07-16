import { useState } from 'react'
import { PenLine } from 'lucide-react'

// ── Anotação pessoal (localStorage), reutilizável em qualquer tela ──────
// namespace evita colisão de chave entre diferentes tabelas com o mesmo id
// (ex: uma questão OAB e uma entrada do Repositório nunca têm o mesmo
// prefixo de chave, mesmo que os ids numéricos coincidissem por acaso).
export default function AnotacaoPessoal({ itemId, theme, namespace = 'geral', placeholder = 'Sua anotação...' }) {
  const key = `lexia_nota_${namespace}_${itemId}`
  const chaveAntiga = `lexia_nota_${itemId}`
  const [nota, setNota] = useState(() => {
    try {
      const atual = localStorage.getItem(key)
      if (atual) return atual
      // migração: versão anterior não tinha namespace na chave
      const legado = localStorage.getItem(chaveAntiga)
      if (legado) { localStorage.setItem(key, legado); localStorage.removeItem(chaveAntiga); return legado }
      return ''
    } catch { return '' }
  })
  const [aberto, setAberto] = useState(false)

  function salvar(v) {
    setNota(v)
    try { v ? localStorage.setItem(key, v) : localStorage.removeItem(key) } catch {}
  }

  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={() => setAberto(a => !a)}
        style={{ fontSize: 10, background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, color: nota ? theme.gold : theme.muted, padding: '4px 10px', cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', display: 'flex', alignItems: 'center', gap: 5 }}>
        <PenLine size={11} /> {nota ? 'Ver anotação' : 'Adicionar anotação'}
      </button>
      {aberto && (
        <textarea value={nota} onChange={e => salvar(e.target.value)}
          placeholder={placeholder}
          style={{ marginTop: 6, width: '100%', minHeight: 70, background: theme.raised, border: `1px solid ${nota ? theme.gold + '66' : theme.border}`, borderRadius: 8, color: theme.text, fontSize: 12, padding: '8px 10px', fontFamily: 'Georgia, serif', lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
        />
      )}
    </div>
  )
}
