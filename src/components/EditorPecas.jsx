import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../theme'
import { AREAS } from '../shared'
import { exportarDocx } from '../utils/exportarDocx'
import {
  Copy, Check, Download, FileText, X, Sparkles,
  RotateCcw, BookOpen, ChevronDown, Save
} from 'lucide-react'

// ── Citações ─────────────────────────────────────────────────────────────────
function citacaoInline(entry) {
  const ref = entry.referencia || entry.fonte || entry.tema
  return `(${(entry.fonte || 'FONTE').toUpperCase()}, ${ref})`
}
function citacaoABNT(entry) {
  const fonte  = (entry.fonte  || '').toUpperCase()
  const tema   = entry.tema    || ''
  const ref    = entry.referencia || ''
  const url    = entry.url     || ''
  const acesso = new Date().toLocaleDateString('pt-BR')
  const tipo   = entry.tipo    || 'jurisprudência'
  if (tipo === 'lei')      return `BRASIL. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'doutrina') return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'súmula')   return `${fonte}. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
}

// Inserir texto no cursor do textarea
function inserirNoCursor(ref, conteudo, setConteudo, texto) {
  const el = ref.current
  if (!el) return
  const start = el.selectionStart
  const end   = el.selectionEnd
  const novo  = conteudo.slice(0, start) + texto + conteudo.slice(end)
  setConteudo(novo)
  setTimeout(() => { el.selectionStart = el.selectionEnd = start + texto.length; el.focus() }, 0)
}

// Registrar uso da tese (fire-and-forget)
async function registrarUsoTese(entryId) {
  try {
    const { supabase } = await import('../supabase')
    const { data } = await supabase.from('entradas').select('uso_count').eq('id', entryId).single()
    await supabase.from('entradas').update({ uso_count: (data?.uso_count || 0) + 1 }).eq('id', entryId)
  } catch {}
}

// Rascunhos no localStorage
const DRAFTS_KEY = 'sintese_drafts_v1'
function carregarRascunhos() { try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]') } catch { return [] } }
function salvarRascunhos(lista) { localStorage.setItem(DRAFTS_KEY, JSON.stringify(lista)) }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

// ── Painel de citações ────────────────────────────────────────────────────────
function PainelCitacoes({ entradas, editorRef, conteudo, setConteudo, rito }) {
  const { theme } = useTheme()
  const [busca, setBusca]         = useState('')
  const [sugerindo, setSugerindo] = useState(false)
  const [sugestoes, setSugestoes] = useState([])
  const [erro, setErro]           = useState('')
  const [formato, setFormato]     = useState('inline')

  const filtradas = entradas.filter(e => {
    if (!busca) return true
    const q = busca.toLowerCase()
    return (
      e.tema?.toLowerCase().includes(q) ||
      e.fonte?.toLowerCase().includes(q) ||
      (e.teses || []).some(t => t.tese_assunto?.toLowerCase().includes(q))
    )
  })

  async function sugerirParaTrecho() {
    const el = editorRef.current
    let trecho = el && el.selectionStart !== el.selectionEnd
      ? conteudo.slice(el.selectionStart, el.selectionEnd)
      : conteudo.split('\n').filter(p => p.trim()).slice(-1)[0] || conteudo.slice(-300)
    if (!trecho.trim()) return
    setSugerindo(true); setSugestoes([]); setErro('')
    try {
      const ctx = JSON.stringify(entradas.map(e => ({
        id: e.id, tema: e.tema, fonte: e.fonte, tipo: e.tipo,
        teses: (e.teses || []).map(t => t.tese_assunto),
      })))
      const ritoCtx = rito ? `Rito processual: ${rito}. ` : ''
      const res  = await fetch('/api/busca', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5', max_tokens: 600,
          system: `Você é assistente de prática jurídica. ${ritoCtx}Dado o trecho de peça e o repositório de teses, retorne APENAS um array JSON com os IDs mais relevantes (máx 5), ordenados por relevância: ["id1","id2",...]. Sem texto adicional.`,
          messages: [{ role: 'user', content: `Trecho: "${trecho}"\n\nRepositório: ${ctx}` }],
        }),
      })
      const json = await res.json()
      const text = (json.content || []).find(b => b.type === 'text')?.text || '[]'
      const ids  = JSON.parse((text.match(/\[[\s\S]*?\]/) || ['[]'])[0])
      const found = ids.map(id => entradas.find(e => e.id === id)).filter(Boolean)
      setSugestoes(found)
      if (!found.length) setErro('Nenhuma tese relevante encontrada.')
    } catch { setErro('Erro ao consultar a IA.') }
    setSugerindo(false)
  }

  function inserir(entry, tese) {
    let texto = ''
    if (formato === 'abnt') texto = citacaoABNT(entry)
    else if (formato === 'tese' && tese) texto = `${tese.tese_assunto} ${citacaoInline(entry)}`
    else texto = citacaoInline(entry)
    inserirNoCursor(editorRef, conteudo, setConteudo, texto)
    registrarUsoTese(entry.id)
  }

  const lista = sugestoes.length > 0 ? sugestoes : filtradas

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Citações
        </div>
        {/* Formato */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {[{ id: 'inline', label: 'Inline' }, { id: 'tese', label: 'Tese+ref' }, { id: 'abnt', label: 'ABNT' }].map(f => (
            <button key={f.id} onClick={() => setFormato(f.id)} style={{
              flex: 1, background: formato === f.id ? theme.gold + '22' : theme.raised,
              color: formato === f.id ? theme.gold : theme.muted,
              border: `1px solid ${formato === f.id ? theme.gold + '55' : theme.border}`,
              borderRadius: 6, padding: '5px 0', fontSize: 10, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}>{f.label}</button>
          ))}
        </div>
        <input value={busca} onChange={e => { setBusca(e.target.value); setSugestoes([]) }}
          placeholder="Buscar tese..." style={{ marginBottom: 8, fontSize: 12 }} />
        <button onClick={sugerirParaTrecho} disabled={sugerindo || !conteudo.trim()} style={{
          width: '100%', background: sugerindo ? theme.border : theme.gold,
          color: sugerindo ? theme.muted : (theme.isDark ? '#0f0a0b' : '#fff'),
          border: 'none', borderRadius: 6, padding: '8px 0', fontSize: 11, fontWeight: 600,
          cursor: sugerindo ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontFamily: 'Inter, sans-serif',
        }}>
          {sugerindo ? <><RotateCcw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Analisando...</> : <><Sparkles size={12} /> Sugerir para este trecho</>}
        </button>
        {sugestoes.length > 0 && (
          <div style={{ fontSize: 10, color: theme.gold, textAlign: 'center', marginTop: 6 }}>
            {sugestoes.length} sugestão(ões) · <button onClick={() => setSugestoes([])} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 10 }}>limpar</button>
          </div>
        )}
        {erro && <div style={{ fontSize: 11, color: theme.muted, marginTop: 6 }}>{erro}</div>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {lista.length === 0 ? (
          <div style={{ padding: 16, color: theme.muted, fontSize: 12, textAlign: 'center' }}>
            {busca ? 'Nenhuma entrada.' : 'Repositório vazio.'}
          </div>
        ) : lista.map(entry => {
          const cor = AREAS[entry.area]?.color || theme.muted
          return (
            <div key={entry.id} style={{ borderBottom: `1px solid ${theme.border}`, padding: '10px 14px' }}>
              <div style={{ fontSize: 12, color: theme.text, marginBottom: 6, lineHeight: 1.4, fontFamily: 'Georgia, serif' }}>
                <span style={{ color: cor, marginRight: 6, fontSize: 10 }}>▌</span>{entry.tema}
              </div>
              {(entry.teses || []).map((t, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  {t.tese_assunto && (
                    <div style={{ fontSize: 11, color: theme.muted, marginBottom: 4, paddingLeft: 10, lineHeight: 1.4 }}>
                      {t.tese_assunto.slice(0, 120)}{t.tese_assunto.length > 120 ? '...' : ''}
                    </div>
                  )}
                  <button onClick={() => inserir(entry, t)} style={{
                    marginLeft: 10, background: theme.raised, border: `1px solid ${theme.border}`,
                    color: theme.gold, borderRadius: 4, padding: '3px 8px', fontSize: 10, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}>↩ Inserir</button>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Modal de rascunhos ────────────────────────────────────────────────────────
function ModalRascunhos({ rascunhos, atualId, onCarregar, onNovo, onExcluir, onFechar }) {
  const { theme } = useTheme()
  return (
    <div onClick={onFechar} style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#00000066', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', boxShadow: theme.shadow, margin: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif' }}>Rascunhos</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onNovo} style={{ background: theme.gold, color: theme.isDark ? '#0f0a0b' : '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>+ Novo</button>
            <button onClick={onFechar} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer' }}><X size={18} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {rascunhos.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: theme.muted, fontSize: 13 }}>
              <BookOpen size={32} style={{ opacity: 0.3, marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
              Nenhum rascunho salvo.
            </div>
          ) : rascunhos.map(r => {
            const ativo = r.id === atualId
            const palavras = r.conteudo?.trim().split(/\s+/).filter(Boolean).length || 0
            const data = new Date(r.atualizado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            return (
              <div key={r.id} onClick={() => onCarregar(r)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                background: ativo ? theme.gold + '11' : theme.cardBg,
                border: `1px solid ${ativo ? theme.gold + '44' : theme.border}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: theme.text, fontWeight: ativo ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif' }}>
                    {r.titulo || 'Sem título'}{ativo && <span style={{ marginLeft: 8, fontSize: 9, color: theme.gold, fontFamily: 'Inter, sans-serif' }}>ATUAL</span>}
                  </div>
                  <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>{palavras} palavras · {data}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); onExcluir(r.id) }} style={{ background: 'none', border: 'none', color: theme.error, cursor: 'pointer' }}><X size={14} /></button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Editor principal ──────────────────────────────────────────────────────────
export default function EditorPecas({ entradas }) {
  const { theme } = useTheme()
  const editorRef = useRef()

  // ── Estado do editor ──────────────────────────────────────────────────
  const [conteudo, setConteudo]             = useState('')
  const [titulo, setTitulo]                 = useState('')
  const [rito, setRito]                     = useState('')
  const [rascunhoAtualId, setRascunhoAtualId] = useState(null)
  const [rascunhos, setRascunhos]           = useState(carregarRascunhos)
  const [copiado, setCopiado]               = useState(false)
  const [exportando, setExportando]         = useState(false)
  const [painelAberto, setPainelAberto]     = useState(true)
  const [mostrarRascunhos, setMostrarRascunhos] = useState(false)
  const [autoSalvo, setAutoSalvo]           = useState(false)

  // ── Estado dos slash commands ─────────────────────────────────────────
  const [slashCmd, setSlashCmd]             = useState('')
  const [slashOpts, setSlashOpts]           = useState([])
  const [slashLoading, setSlashLoading]     = useState(false)

  // ── Auto-save ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conteudo.trim() && !titulo.trim()) return
    const timeout = setTimeout(() => {
      setRascunhos(prev => {
        const agora = new Date().toISOString()
        let lista
        if (rascunhoAtualId) {
          lista = prev.map(r => r.id === rascunhoAtualId ? { ...r, titulo, conteudo, atualizado_em: agora } : r)
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

  // ── Slash commands ────────────────────────────────────────────────────
  async function handleSlashInput(texto, posicaoCursor) {
    const match = texto.slice(0, posicaoCursor).match(/\/([a-z0-9]+)(?:\s+(\S+))?$/)
    if (!match) { setSlashCmd(''); setSlashOpts([]); return }
    const [, cmd, arg] = match
    const CODIGOS = ['cpc', 'cdc', 'cc', 'cpp', 'cf', 'lei9099', 'leg']
    if (!CODIGOS.includes(cmd)) { setSlashCmd(''); setSlashOpts([]); return }
    setSlashCmd(cmd)
    if (!arg || arg.length < 1) return
    setSlashLoading(true)
    try {
      const url = cmd === 'leg'
        ? `/api/legislacao?q=${encodeURIComponent(arg)}`
        : /^\d+$/.test(arg) ? `/api/legislacao?codigo=${cmd}&numero=${arg}` : null
      if (!url) { setSlashLoading(false); return }
      const res  = await fetch(url)
      const json = await res.json()
      setSlashOpts(json.artigos || [])
    } catch {}
    setSlashLoading(false)
  }

  function inserirArtigo(artigo) {
    const texto = artigo.titulo ? `**${artigo.titulo}**\n${artigo.texto}` : artigo.texto
    setConteudo(prev => {
      const el = editorRef.current
      if (!el) return prev + '\n\n' + texto + '\n\n'
      const pos   = el.selectionStart
      const antes = prev.slice(0, pos)
      const match = antes.match(/\/\w+(?:\s+\S+)?$/)
      if (!match) return prev + '\n\n' + texto + '\n\n'
      return prev.slice(0, pos - match[0].length) + texto + '\n\n' + prev.slice(pos)
    })
    setSlashCmd(''); setSlashOpts([])
  }

  // ── Ações do editor ───────────────────────────────────────────────────
  function copiarTudo() {
    navigator.clipboard.writeText(titulo ? `${titulo}\n\n${conteudo}` : conteudo)
    setCopiado(true); setTimeout(() => setCopiado(false), 2000)
  }

  async function baixarDocx() {
    if (!conteudo.trim() || exportando) return
    setExportando(true)
    try { await exportarDocx({ titulo, conteudo, entradas }) } catch (e) { console.error(e) }
    setExportando(false)
  }

  function baixarTxt() {
    const texto = titulo ? `${titulo}\n\n${conteudo}` : conteudo
    const nome  = (titulo || 'peca').replace(/[^\w\s]/g, '').replace(/\s+/g, '_').slice(0, 40)
    const blob  = new Blob([texto], { type: 'text/plain;charset=utf-8' })
    const url   = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${nome}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  function novoRascunho() {
    if (conteudo.trim() && !confirm('Abrir novo rascunho? O atual está salvo no histórico.')) return
    setTitulo(''); setConteudo(''); setRito(''); setRascunhoAtualId(null); setMostrarRascunhos(false)
  }

  function carregarRascunho(r) {
    setTitulo(r.titulo || ''); setConteudo(r.conteudo || '')
    setRascunhoAtualId(r.id); setMostrarRascunhos(false)
  }

  function excluirRascunho(id) {
    if (!confirm('Excluir este rascunho?')) return
    setRascunhos(prev => { const l = prev.filter(r => r.id !== id); salvarRascunhos(l); return l })
    if (rascunhoAtualId === id) { setTitulo(''); setConteudo(''); setRascunhoAtualId(null) }
  }

  const palavras = conteudo.trim() ? conteudo.trim().split(/\s+/).length : 0

  const btnBase = {
    display: 'flex', alignItems: 'center', gap: 5,
    border: `1px solid ${theme.border}`, borderRadius: 6,
    padding: '6px 11px', fontSize: 11, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', background: theme.raised, color: theme.muted,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0 14px', flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', flex: 1 }}>
          Editor de Peças
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setMostrarRascunhos(true)} style={btnBase}>
            <BookOpen size={13} /> Rascunhos
            <span style={{ background: theme.border, borderRadius: 10, padding: '1px 6px', fontSize: 9 }}>{rascunhos.length}</span>
          </button>
          <button onClick={() => setPainelAberto(p => !p)} style={{ ...btnBase, color: painelAberto ? theme.gold : theme.muted, background: painelAberto ? theme.gold + '11' : theme.raised, borderColor: painelAberto ? theme.gold + '44' : theme.border }}>
            <ChevronDown size={13} /> Citações
          </button>
          <button onClick={copiarTudo} disabled={!conteudo.trim()} style={{ ...btnBase, color: copiado ? theme.success : theme.muted }}>
            {copiado ? <Check size={13} /> : <Copy size={13} />} {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <button onClick={baixarDocx} disabled={!conteudo.trim() || exportando} style={{ ...btnBase, color: theme.gold, borderColor: theme.gold + '44' }}>
            {exportando ? <RotateCcw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={13} />} .docx
          </button>
          <button onClick={baixarTxt} disabled={!conteudo.trim()} style={btnBase}>
            <FileText size={13} /> .txt
          </button>
          <button onClick={novoRascunho} style={btnBase}>
            <X size={13} /> Novo
          </button>
        </div>
      </div>

      {/* Área principal */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', border: `1px solid ${theme.border}`, borderRadius: 12, gap: 0 }}>

        {/* Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

          {/* Cabeçalho do editor: título + rito */}
          <div style={{ borderBottom: `1px solid ${theme.border}`, background: theme.cardBg, padding: '12px 16px', display: 'flex', gap: 10, flexShrink: 0 }}>
            <input value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Título da peça (ex: Petição Inicial — Indenização por Dano Moral)"
              style={{ flex: 2, border: 'none', background: 'transparent', fontSize: 14, fontWeight: 700, color: theme.text, fontFamily: 'Playfair Display, Georgia, serif', outline: 'none' }} />
            <select value={rito} onChange={e => setRito(e.target.value)}
              style={{ flex: 1, border: `1px solid ${theme.border}`, borderRadius: 6, background: theme.raised, color: rito ? theme.text : theme.muted, fontSize: 12, padding: '4px 10px', fontFamily: 'Inter, sans-serif', outline: 'none', maxWidth: 180 }}>
              <option value="">Rito processual...</option>
              <option value="JEC — Lei 9.099/95">JEC — Lei 9.099/95</option>
              <option value="Rito Ordinário — CPC">Rito Ordinário — CPC</option>
              <option value="Rito Sumaríssimo — CLT">Rito Sumaríssimo — CLT</option>
              <option value="Ação Penal Pública">Ação Penal Pública</option>
              <option value="Ação Penal Privada">Ação Penal Privada</option>
            </select>
          </div>

          {/* Popup slash command */}
          {slashCmd && slashOpts.length > 0 && (
            <div style={{
              position: 'absolute', top: 72, left: 16, right: painelAberto ? 316 : 16,
              background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 10, boxShadow: theme.shadow, zIndex: 50,
              maxHeight: 240, overflowY: 'auto',
            }}>
              <div style={{ padding: '6px 12px', fontSize: 10, color: theme.gold, fontFamily: 'Inter, sans-serif', borderBottom: `1px solid ${theme.border}` }}>
                {slashLoading ? 'Buscando...' : `${slashOpts.length} artigo(s)`}
              </div>
              {slashOpts.map((a, i) => (
                <div key={i} onClick={() => inserirArtigo(a)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}22` }}
                  onMouseEnter={ev => ev.currentTarget.style.background = theme.raised}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.gold, marginBottom: 2, fontFamily: 'Inter, monospace' }}>
                    {a.codigo?.toUpperCase()} Art. {a.numero}{a.inciso ? `, ${a.inciso}` : ''}{a.paragrafo ? `, ${a.paragrafo}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: theme.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.texto?.slice(0, 120)}...
                  </div>
                </div>
              ))}
            </div>
          )}

          <textarea ref={editorRef} value={conteudo} onChange={e => setConteudo(e.target.value)}
            onKeyUp={e => handleSlashInput(e.target.value, e.target.selectionStart)}
            placeholder={`Redija a peça aqui.\n\n• Selecione um trecho → "Sugerir para este trecho" para receber teses do repositório.\n• Use /cpc 300, /cdc 14, /lei9099 3 para inserir artigos direto do banco.\n• Use ## para seções e **negrito** — o .docx preserva a formatação.\n\nRascunho salvo automaticamente.`}
            style={{ flex: 1, border: 'none', background: theme.cardBg, padding: '20px', color: theme.text, fontSize: 14, lineHeight: 1.9, resize: 'none', outline: 'none', fontFamily: 'Georgia, serif', boxSizing: 'border-box', width: '100%' }}
            spellCheck />

          {/* Status bar */}
          <div style={{ borderTop: `1px solid ${theme.border}`, padding: '6px 16px', display: 'flex', gap: 16, fontSize: 10, color: theme.muted, fontFamily: 'Inter, sans-serif', background: theme.cardBg, flexShrink: 0 }}>
            <span>{palavras} palavras</span>
            <span>{conteudo.length} chars</span>
            {rito && <span style={{ color: theme.gold }}>⚖ {rito}</span>}
            <span style={{ marginLeft: 'auto', color: autoSalvo ? theme.success : theme.muted, transition: 'all .3s' }}>
              {autoSalvo ? <><Check size={10} style={{ display: 'inline' }} /> salvo</> : <><Save size={10} style={{ display: 'inline' }} /> auto-save</>}
            </span>
          </div>
        </div>

        {/* Painel citações */}
        {painelAberto && (
          <div style={{ width: 300, borderLeft: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
            <PainelCitacoes entradas={entradas} editorRef={editorRef} conteudo={conteudo} setConteudo={setConteudo} rito={rito} />
          </div>
        )}
      </div>

      {/* Modal rascunhos */}
      {mostrarRascunhos && (
        <ModalRascunhos rascunhos={rascunhos} atualId={rascunhoAtualId}
          onCarregar={carregarRascunho} onNovo={novoRascunho}
          onExcluir={excluirRascunho} onFechar={() => setMostrarRascunhos(false)} />
      )}
    </div>
  )
}
