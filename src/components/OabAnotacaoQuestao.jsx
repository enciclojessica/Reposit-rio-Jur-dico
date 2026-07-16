import { useState } from 'react'
import { PenLine } from 'lucide-react'

// ── Anotação por questão (localStorage) ─────────────────────────
export default function AnotacaoQuestao({ questaoId, theme }) {
  const key = `lexia_nota_${questaoId}`
  const [nota, setNota] = useState(() => {
    try { return localStorage.getItem(key) || '' } catch { return '' }
  })
  const [aberto, setAberto] = useState(false)

  function salvar(v) {
    setNota(v)
    try { v ? localStorage.setItem(key, v) : localStorage.removeItem(key) } catch {}
  }

  return (
    <div style={{ marginTop:10 }}>
      <button onClick={() => setAberto(a => !a)}
        style={{ fontSize:10, background:'none', border:`1px solid ${theme.border}`, borderRadius:6, color:nota ? theme.gold : theme.muted, padding:'4px 10px', cursor:'pointer', fontFamily:'IBM Plex Mono, monospace', display:'flex', alignItems:'center', gap:5 }}>
        <PenLine size={11} /> {nota ? 'Ver anotação' : 'Adicionar anotação'}
      </button>
      {aberto && (
        <textarea value={nota} onChange={e => salvar(e.target.value)}
          placeholder="Sua anotação sobre esta questão..."
          style={{ marginTop:6, width:'100%', minHeight:70, background:theme.raised, border:`1px solid ${nota ? theme.gold+'66' : theme.border}`, borderRadius:8, color:theme.text, fontSize:12, padding:'8px 10px', fontFamily:'Georgia, serif', lineHeight:1.5, resize:'vertical', outline:'none', boxSizing:'border-box' }}
        />
      )}
    </div>
  )
}
