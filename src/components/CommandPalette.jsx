import { useState, useEffect, useMemo, useRef } from 'react'
import { Search } from 'lucide-react'
import { useTheme } from '../theme'
import { VIEWS } from '../data/views'

export default function CommandPalette({ onFechar, setView, isAdmin, isEditor, setPrefillEntry }) {
  const { theme } = useTheme()
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState(0)
  const inputRef = useRef(null)

  const itens = useMemo(() => {
    const base = [
      { label: 'Hoje', acao: () => setView(VIEWS.HOJE) },
      { label: 'Repositório', acao: () => setView(VIEWS.HOME) },
      { label: 'Dashboard', acao: () => setView(VIEWS.DASHBOARD) },
      { label: 'Legislação', acao: () => setView(VIEWS.LEG_VIEW) },
      { label: 'Índice remissivo', acao: () => setView(VIEWS.INDICE) },
      { label: 'Favoritos', acao: () => setView(VIEWS.FAVORITOS) },
      { label: 'Comparador de teses', acao: () => setView(VIEWS.COMPARAR) },
      { label: 'Alertas', acao: () => setView(VIEWS.ALERTAS) },
      { label: 'O que há de novo', acao: () => setView(VIEWS.NOVIDADES_APP) },
      { label: 'Configurações', acao: () => setView(VIEWS.CONFIG) },
    ]
    if (isEditor) {
      base.splice(2, 0, { label: 'Editor de peças', acao: () => setView(VIEWS.EDITOR) })
      base.splice(3, 0, { label: 'Nova entrada', acao: () => { setPrefillEntry?.(null); setView(VIEWS.ADD) } })
    }
    if (isAdmin) {
      base.push({ label: 'Membros', acao: () => setView(VIEWS.MEMBROS) })
      base.push({ label: 'Métricas', acao: () => setView(VIEWS.METRICAS) })
    }
    if (!busca.trim()) return base
    const q = busca.trim().toLowerCase()
    return base.filter(i => i.label.toLowerCase().includes(q))
  }, [busca, isAdmin, isEditor])

  useEffect(() => { setSelecionado(0) }, [busca])
  useEffect(() => { inputRef.current?.focus() }, [])

  function ativar(item) {
    if (!item) return
    item.acao()
    onFechar()
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') { onFechar(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelecionado(s => Math.min(s + 1, itens.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelecionado(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); ativar(itens[selecionado]) }
  }

  return (
    <div onClick={onFechar} data-testid="palette-overlay" style={{ position: 'fixed', inset: 0, background: '#000000aa', zIndex: 700, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: theme.surface, border: `1px solid ${theme.borderGold}`, borderRadius: 12, width: '100%', maxWidth: 440, margin: '0 20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
          <Search size={15} color={theme.muted} />
          <input ref={inputRef} value={busca} onChange={e => setBusca(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Ir para…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: theme.text, fontSize: 14, fontFamily: "Georgia, 'EB Garamond', serif" }} />
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: '6px 0' }}>
          {itens.length === 0 && (
            <div style={{ padding: '16px', fontSize: 13, color: theme.muted, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>Nada encontrado.</div>
          )}
          {itens.map((item, i) => (
            <div key={item.label} onClick={() => ativar(item)} onMouseEnter={() => setSelecionado(i)}
              style={{
                padding: '10px 16px', cursor: 'pointer', fontSize: 14,
                fontFamily: "Georgia, 'EB Garamond', serif",
                color: i === selecionado ? theme.gold : theme.text,
                background: i === selecionado ? theme.raised : 'transparent',
              }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
