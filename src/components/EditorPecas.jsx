import { useState, useRef, useCallback, useEffect } from 'react'
import { useTheme } from '../theme'
import { AREAS } from '../shared'
import { exportarDocx } from '../utils/exportarDocx'

// ── Formatar citação inline e ABNT ────────────────────────────────────────
function citacaoInline(entry, tese) {
  const ref = entry.referencia || entry.fonte || entry.tema
  return `(${entry.fonte?.toUpperCase() || 'FONTE'}, ${ref})`
}

function citacaoABNT(entry) {
  const fonte  = (entry.fonte  || '').toUpperCase()
  const tema   = entry.tema    || ''
  const ref    = entry.referencia || ''
  const url    = entry.url     || ''
  const acesso = new Date().toLocaleDateString('pt-BR')
  const tipo   = entry.tipo    || 'jurisprudência'

  if (tipo === 'lei')       return `BRASIL. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'doutrina')  return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'súmula')    return `${fonte}. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
}

// ── Inserir texto no cursor do textarea ───────────────────────────────────
function inserirNoCursor(ref, conteudo, setConteudo, texto) {
  const el    = ref.current
  if (!el) return
  const start = el.selectionStart
  const end   = el.selectionEnd
  const novo  = conteudo.slice(0, start) + texto + conteudo.slice(end)
  setConteudo(novo)
  setTimeout(() => {
    el.selectionStart = el.selectionEnd = start + texto.length
    el.focus()
  }, 0)
}

// ── Painel de citações ────────────────────────────────────────────────────
function PainelCitacoes({ entradas, onInserir, editorRef, conteudo, setConteudo }) {
  const { theme, mode } = useTheme()
  const [busca, setBusca]         = useState('')
  const [sugerindo, setSugerindo] = useState(false)
  const [sugestoes, setSugestoes] = useState([])
  const [erroBusca, setErroBusca] = useState('')
  const [formato, setFormato]     = useState('inline') // inline | abnt | tese

  const filtradas = entradas.filter(e => {
    if (!busca) return true
    const q = busca.toLowerCase()
    return (
      e.tema?.toLowerCase().includes(q) ||
      e.fonte?.toLowerCase().includes(q) ||
      e.referencia?.toLowerCase().includes(q) ||
      e.teses?.some(t => t.tese_assunto?.toLowerCase().includes(q))
    )
  })

  async function sugerirParaTrecho() {
    // Pegar seleção ou último parágrafo do editor
    const el = editorRef.current
    let trecho = ''
    if (el && el.selectionStart !== el.selectionEnd) {
      trecho = conteudo.slice(el.selectionStart, el.selectionEnd)
    } else {
      // Último parágrafo não vazio
      const paras = conteudo.split('\n').filter(p => p.trim())
      trecho = paras[paras.length - 1] || conteudo.slice(-300)
    }
    if (!trecho.trim()) return

    setSugerindo(true)
    setSugestoes([])
    setErroBusca('')

    try {
      const ctx = JSON.stringify(entradas.map(e => ({
        id: e.id, tema: e.tema, fonte: e.fonte, referencia: e.referencia,
        tipo: e.tipo, teses: e.teses?.map(t => t.tese_assunto),
      })))

      const res = await fetch('/api/busca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: `Você é um assistente de prática jurídica. Dado um trecho de peça processual e um repositório de teses, identifique quais teses do repositório são relevantes para aquele trecho. Retorne APENAS um array JSON com os IDs relevantes (máx. 5), ordenados por relevância: ["id1","id2",...]. Sem texto adicional.`,
          messages: [{ role: 'user', content: `Trecho: "${trecho}"\n\nRepositório: ${ctx}` }],
        }),
      })
      const json = await res.json()
      const text = (json.content || []).find(b => b.type === 'text')?.text || '[]'
      const match = text.match(/\[[\s\S]*?\]/)
      const ids = match ? JSON.parse(match[0]) : []
      const encontradas = ids.map(id => entradas.find(e => e.id === id)).filter(Boolean)
      setSugestoes(encontradas)
      if (!encontradas.length) setErroBusca('Nenhuma tese relevante encontrada para este trecho.')
    } catch {
      setErroBusca('Erro ao consultar a IA.')
    }
    setSugerindo(false)
  }

  function inserir(entry, tese) {
    let texto = ''
    if (formato === 'abnt') {
      texto = citacaoABNT(entry)
    } else if (formato === 'tese' && tese) {
      texto = `${tese.tese_assunto} ${citacaoInline(entry, tese)}`
    } else {
      texto = citacaoInline(entry, tese)
    }
    inserirNoCursor(editorRef, conteudo, setConteudo, texto)
  }

  const lista = sugestoes.length > 0 ? sugestoes : filtradas

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Cabeçalho do painel */}
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontFamily: 'IBM Plex Mono, monospace' }}>
          Citações
        </div>

        {/* Formato de inserção */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {[
            { id: 'inline', label: 'Inline' },
            { id: 'tese',   label: 'Tese + ref.' },
            { id: 'abnt',   label: 'ABNT' },
          ].map(f => (
            <button key={f.id} onClick={() => setFormato(f.id)}
              style={{
                flex: 1, background: formato === f.id ? theme.gold + '22' : theme.raised,
                color: formato === f.id ? theme.gold : theme.muted,
                border: `1px solid ${formato === f.id ? theme.gold + '55' : theme.border}`,
                borderRadius: 6, padding: '5px 0', fontSize: 10, cursor: 'pointer',
                fontFamily: 'IBM Plex Mono, monospace', textAlign: 'center',
              }}>{f.label}</button>
          ))}
        </div>

        {/* Busca */}
        <input
          value={busca}
          onChange={e => { setBusca(e.target.value); setSugestoes([]) }}
          placeholder="Buscar tese..."
          style={{ marginBottom: 8, fontSize: 12 }}
        />

        {/* Sugerir para trecho */}
        <button onClick={sugerirParaTrecho} disabled={sugerindo || !conteudo.trim()}
          style={{
            width: '100%', background: sugerindo ? theme.border : `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`,
            color: sugerindo ? theme.muted : '#0b0f1a', border: 'none',
            borderRadius: 6, padding: '8px 0', fontSize: 11, fontWeight: 700,
            cursor: sugerindo ? 'not-allowed' : 'pointer',
            fontFamily: 'IBM Plex Mono, monospace',
          }}>
          {sugerindo ? '⟳ Analisando...' : '✦ Sugerir para este trecho'}
        </button>
        {sugestoes.length > 0 && (
          <div style={{ fontSize: 10, color: theme.gold, textAlign: 'center', marginTop: 6 }}>
            {sugestoes.length} sugestão(ões) · <button onClick={() => setSugestoes([])} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 10 }}>limpar</button>
          </div>
        )}
        {erroBusca && <div style={{ fontSize: 11, color: theme.muted, marginTop: 6 }}>{erroBusca}</div>}
      </div>

      {/* Lista de entradas */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {lista.length === 0 ? (
          <div style={{ padding: 16, color: theme.muted, fontSize: 12, textAlign: 'center' }}>
            {busca ? 'Nenhuma entrada encontrada.' : 'Repositório vazio.'}
          </div>
        ) : lista.map(entry => {
          const cor = AREAS[entry.area]?.color || theme.muted
          return (
            <div key={entry.id} style={{
              borderBottom: `1px solid ${theme.border}`,
              padding: '10px 14px',
            }}>
              {/* Tema */}
              <div style={{
                fontSize: 12, color: theme.text, marginBottom: 6,
                fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1.4,
              }}>
                <span style={{ color: cor, marginRight: 6, fontSize: 10 }}>▌</span>
                {entry.tema}
              </div>

              {/* Teses */}
              {(entry.teses || []).map((t, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  {t.tese_assunto && (
                    <div style={{ fontSize: 11, color: theme.muted, marginBottom: 4, lineHeight: 1.4, paddingLeft: 10 }}>
                      {t.tese_assunto.slice(0, 120)}{t.tese_assunto.length > 120 ? '...' : ''}
                    </div>
                  )}
                  <button onClick={() => inserir(entry, t)}
                    style={{
                      marginLeft: 10, background: theme.raised,
                      border: `1px solid ${theme.border}`,
                      color: theme.gold, borderRadius: 4, padding: '3px 8px',
                      fontSize: 10, cursor: 'pointer',
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}>
                    ↩ Inserir
                  </button>
                </div>
              ))}

              {/* Inserir só referência */}
              {(!entry.teses?.length || formato === 'abnt') && (
                <button onClick={() => inserir(entry, null)}
                  style={{
                    background: theme.raised, border: `1px solid ${theme.border}`,
                    color: theme.gold, borderRadius: 4, padding: '3px 8px',
                    fontSize: 10, cursor: 'pointer',
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}>
                  ↩ Inserir referência
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Gerenciador de rascunhos (localStorage) ───────────────────────────────
const DRAFTS_KEY = 'rj_drafts_v2'

function carregarRascunhos() {
  try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]') } catch { return [] }
}
function salvarRascunhos(lista) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(lista))
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

// ── Painel de histórico de rascunhos ─────────────────────────────────────
function PainelRascunhos({ rascunhos, rascunhoAtualId, onCarregar, onNovo, onExcluir, onFechar }) {
  const { theme, mode } = useTheme()

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#00000066', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onFechar}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.surface, border: `1px solid ${theme.borderGold}`,
        borderRadius: 16, width: '100%', maxWidth: 540,
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: theme.shadow, margin: 16,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif' }}>
            Rascunhos salvos
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onNovo} style={{
              background: theme.gold, color: '#0b0f1a', border: 'none',
              borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
            }}>+ Novo rascunho</button>
            <button onClick={onFechar} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 20 }}>×</button>
          </div>
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {rascunhos.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: theme.muted, fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>📝</div>
              Nenhum rascunho salvo ainda.
            </div>
          ) : rascunhos.map(r => {
            const ativo = r.id === rascunhoAtualId
            const palavras = r.conteudo?.trim() ? r.conteudo.trim().split(/\s+/).length : 0
            const data = new Date(r.atualizado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            return (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 10, marginBottom: 6,
                background: ativo ? theme.gold + '11' : theme.cardBg,
                border: `1px solid ${ativo ? theme.gold + '44' : theme.border}`,
                cursor: 'pointer', transition: 'all .15s',
              }} onClick={() => onCarregar(r)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: theme.text, fontWeight: ativo ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                    {r.titulo || 'Sem título'}
                    {ativo && <span style={{ marginLeft: 8, fontSize: 9, color: theme.gold, textTransform: 'uppercase', letterSpacing: 1 }}>atual</span>}
                  </div>
                  <div style={{ fontSize: 11, color: theme.muted, display: 'flex', gap: 10 }}>
                    <span>{palavras} palavra{palavras !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{data}</span>
                  </div>
                  {r.conteudo?.trim() && (
                    <div style={{ fontSize: 11, color: theme.muted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.7 }}>
                      {r.conteudo.trim().slice(0, 80)}...
                    </div>
                  )}
                </div>
                <button onClick={e => { e.stopPropagation(); onExcluir(r.id) }}
                  style={{ background: 'none', border: 'none', color: theme.error, cursor: 'pointer', fontSize: 16, padding: '4px', flexShrink: 0 }}
                  title="Excluir rascunho">✕</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Editor principal ──────────────────────────────────────────────────────
export default function EditorPecas({ entradas }) {
  const { theme, mode } = useTheme()
  const [conteudo, setConteudo]       = useState('')
  const [titulo, setTitulo]           = useState('')
  const [rascunhoAtualId, setRascunhoAtualId] = useState(null)
  const [rascunhos, setRascunhos]     = useState(carregarRascunhos)
  const [copiado, setCopiado]         = useState(false)
  const [exportando, setExportando]   = useState(false)
  const [painelAberto, setPainelAberto] = useState(true)
  const [mostrarRascunhos, setMostrarRascunhos] = useState(false)
  const [autoSalvo, setAutoSalvo]     = useState(false)
  const editorRef = useRef()

  // Auto-salvar rascunho atual a cada 1 segundo de inatividade
  useEffect(() => {
    if (!conteudo.trim() && !titulo.trim()) return
    const timeout = setTimeout(() => {
      setRascunhos(prev => {
        const agora = new Date().toISOString()
        let lista
        if (rascunhoAtualId) {
          lista = prev.map(r => r.id === rascunhoAtualId
            ? { ...r, titulo, conteudo, atualizado_em: agora }
            : r
          )
        } else {
          const novoId = uid()
          setRascunhoAtualId(novoId)
          lista = [{ id: novoId, titulo, conteudo, criado_em: agora, atualizado_em: agora }, ...prev]
        }
        salvarRascunhos(lista)
        return lista
      })
      setAutoSalvo(true)
      setTimeout(() => setAutoSalvo(false), 2000)
    }, 1000)
    return () => clearTimeout(timeout)
  }, [titulo, conteudo, rascunhoAtualId])

  function copiarTudo() {
    const texto = titulo ? `${titulo}\n\n${conteudo}` : conteudo
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function baixarDocx() {
    if (!conteudo.trim() || exportando) return
    setExportando(true)
    try { await exportarDocx({ titulo, conteudo, entradas }) }
    catch (e) { console.error('Erro ao exportar .docx', e) }
    setExportando(false)
  }

  function baixarTxt() {
    const texto = titulo ? `${titulo}\n\n${conteudo}` : conteudo
    const nome  = (titulo || 'peca').replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').replace(/\s+/g, '_').slice(0, 40)
    const blob  = new Blob([texto], { type: 'text/plain;charset=utf-8' })
    const url   = URL.createObjectURL(blob)
    const a     = document.createElement('a')
    a.href = url; a.download = `${nome}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  function novoRascunho() {
    if (conteudo.trim() && !confirm('Abrir novo rascunho? O atual já está salvo no histórico.')) return
    setTitulo('')
    setConteudo('')
    setRascunhoAtualId(null)
    setMostrarRascunhos(false)
  }

  function carregarRascunho(r) {
    setTitulo(r.titulo || '')
    setConteudo(r.conteudo || '')
    setRascunhoAtualId(r.id)
    setMostrarRascunhos(false)
  }

  function excluirRascunho(id) {
    if (!confirm('Excluir este rascunho permanentemente?')) return
    setRascunhos(prev => {
      const lista = prev.filter(r => r.id !== id)
      salvarRascunhos(lista)
      return lista
    })
    if (rascunhoAtualId === id) {
      setTitulo(''); setConteudo(''); setRascunhoAtualId(null)
    }
  }

  const palavras = conteudo.trim() ? conteudo.trim().split(/\s+/).length : 0
  const chars    = conteudo.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0 14px', flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', flex: 1 }}>
          Editor de Peças
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {/* Rascunhos */}
          <button onClick={() => setMostrarRascunhos(true)}
            style={{ background: theme.raised, color: theme.muted, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', display: 'flex', alignItems: 'center', gap: 5 }}>
            📝 Rascunhos <span style={{ background: theme.border, borderRadius: 10, padding: '1px 6px', fontSize: 9 }}>{rascunhos.length}</span>
          </button>
          <button onClick={() => setPainelAberto(p => !p)}
            style={{ background: painelAberto ? theme.gold + '22' : theme.raised, color: painelAberto ? theme.gold : theme.muted, border: `1px solid ${painelAberto ? theme.gold + '44' : theme.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
            {painelAberto ? '← Citações' : '→ Citações'}
          </button>
          <button onClick={copiarTudo} disabled={!conteudo.trim()}
            style={{ background: copiado ? theme.success + '22' : theme.raised, color: copiado ? theme.success : theme.muted, border: `1px solid ${copiado ? theme.success + '44' : theme.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
            {copiado ? '✓ Copiado' : '⎘ Copiar'}
          </button>
          <button onClick={baixarDocx} disabled={!conteudo.trim() || exportando}
            style={{ background: exportando ? theme.border : theme.raised, color: exportando ? theme.muted : theme.gold, border: `1px solid ${exportando ? theme.border : theme.gold + '55'}`, borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: !conteudo.trim() || exportando ? 'not-allowed' : 'pointer', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
            {exportando ? '⟳ Gerando...' : '↓ .docx'}
          </button>
          <button onClick={baixarTxt} disabled={!conteudo.trim()}
            style={{ background: theme.raised, color: theme.muted, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
            ↓ .txt
          </button>
          <button onClick={novoRascunho}
            style={{ background: 'none', color: theme.muted, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
            ✕ Novo
          </button>
        </div>
      </div>

      {/* ── Área principal ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, gap: 0, overflow: 'hidden', border: `1px solid ${theme.border}`, borderRadius: 12 }}>

        {/* Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Título da peça (opcional)"
            style={{ border: 'none', borderBottom: `1px solid ${theme.border}`, borderRadius: '12px 12px 0 0', background: theme.cardBg, fontSize: 15, fontWeight: 700, padding: '14px 20px', color: theme.text, fontFamily: 'Playfair Display, Georgia, serif', outline: 'none', width: '100%', boxSizing: 'border-box' }}
          />
          <textarea
            ref={editorRef}
            value={conteudo}
            onChange={e => setConteudo(e.target.value)}
            placeholder={`Redija a peça aqui.\n\n• Selecione um trecho → "✦ Sugerir para este trecho" para receber teses relevantes do repositório.\n• Clique em "↩ Inserir" em qualquer tese para inserí-la no cursor.\n• Use ## para seções e **negrito** — o .docx preserva a formatação.\n\nRascunho salvo automaticamente.`}
            style={{ flex: 1, border: 'none', background: theme.cardBg, padding: '20px', color: theme.text, fontSize: 14, lineHeight: 1.9, resize: 'none', outline: 'none', fontFamily: 'Georgia, serif', borderRadius: '0 0 0 12px', boxSizing: 'border-box', width: '100%' }}
            spellCheck
          />

          {/* Status bar */}
          <div style={{ borderTop: `1px solid ${theme.border}`, padding: '6px 16px', display: 'flex', gap: 16, fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', background: theme.cardBg, borderRadius: '0 0 0 12px', flexShrink: 0 }}>
            <span>{palavras} palavra{palavras !== 1 ? 's' : ''}</span>
            <span>{chars} caracteres</span>
            {rascunhoAtualId && (
              <span style={{ color: theme.muted, opacity: 0.6 }}>
                rascunho #{rascunhos.findIndex(r => r.id === rascunhoAtualId) + 1}
              </span>
            )}
            <span style={{ marginLeft: 'auto', color: autoSalvo ? theme.success : theme.muted, opacity: autoSalvo ? 1 : 0.5, transition: 'all .3s' }}>
              {autoSalvo ? '✓ salvo' : '💾 auto-save'}
            </span>
          </div>
        </div>

        {/* Painel de citações */}
        {painelAberto && (
          <div style={{ width: 300, borderLeft: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '0 12px 12px 0', flexShrink: 0 }}>
            <PainelCitacoes entradas={entradas} editorRef={editorRef} conteudo={conteudo} setConteudo={setConteudo} />
          </div>
        )}
      </div>

      {/* ── Modal de rascunhos ──────────────────────────────────────────── */}
      {mostrarRascunhos && (
        <PainelRascunhos
          rascunhos={rascunhos}
          rascunhoAtualId={rascunhoAtualId}
          onCarregar={carregarRascunho}
          onNovo={novoRascunho}
          onExcluir={excluirRascunho}
          onFechar={() => setMostrarRascunhos(false)}
        />
      )}
    </div>
  )
}
