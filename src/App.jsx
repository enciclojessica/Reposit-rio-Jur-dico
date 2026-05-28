import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import { useTheme } from './theme'
import Auth from './components/Auth'
import EntradaList from './components/EntradaList'
import EntradaDetail from './components/EntradaDetail'
import EntradaForm from './components/EntradaForm'
import BuscaPeca from './components/BuscaPeca'
import Membros from './components/Membros'
import Alertas from './components/Alertas'
import EditorPecas from './components/EditorPecas'
import Dashboard from './components/Dashboard'
import EntradaPublica from './components/EntradaPublica'
import ImportacaoLote from './components/ImportacaoLote'
import InstalarApp from './components/InstalarApp'
import FlashCards from './components/FlashCards'
import SinoNotificacoes from './components/SinoNotificacoes'
import SeletorTema from './components/SeletorTema'
import { exportarRepositorioDocx } from './utils/exportarRepositorio'
import { AREAS } from './shared'
import { TagPill } from './components/TagInput'

const VIEWS = {
  ALERTAS: 'alertas',
  EDITOR:     'editor',
  DASHBOARD: 'dashboard',
  IMPORTAR:   'importar',
  FLASHCARDS:   'flashcards',
  HOME: 'home', ADD: 'add', EDIT: 'edit', DETAIL: 'detail',
  BUSCA: 'busca', PESQUISA: 'pesquisa', MEMBROS: 'membros',
}

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

export default function App() {
  const { theme, mode, toggle } = useTheme()
  const [session, setSession]       = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [membro, setMembro]         = useState(null)   // { role, nome, email }
  const [membroLoading, setMembroLoading] = useState(false)
  const [entradas, setEntradas]     = useState([])
  const [view, setView]             = useState(VIEWS.HOME)
  const [areaFilter, setAreaFilter] = useState('all')
  const [tagFilter, setTagFilter]   = useState(null)
  const [ordenacao, setOrdenacao]    = useState('data_desc')
  const [search, setSearch]         = useState('')
  const [modoSemantico, setModoSemantico] = useState(false)
  const [historicoBusca, setHistoricoBusca] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rj_busca_historico') || '[]') } catch { return [] }
  })
  const [showHistorico, setShowHistorico] = useState(false)
  const [buscandoSem, setBuscandoSem]   = useState(false)
  const [resultadosSem, setResultadosSem] = useState(null) // null = não buscado ainda
  const [erroSem, setErroSem]           = useState('')
  const [selected, setSelected]     = useState(null)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState(null)
  const [showLogin, setShowLogin]   = useState(false)
  const [prefillEntry, setPrefillEntry] = useState(null)
  const [entradaPublicaId, setEntradaPublicaId] = useState(null)
  const [conviteToken, setConviteToken] = useState(null)
  const [aceitandoConvite, setAceitandoConvite] = useState(false)
  const [exportandoRepo, setExportandoRepo] = useState(false)
  const isMobile = useIsMobile()
  const [maisAberto, setMaisAberto] = useState(false)

  // Se logado mas sem registro em membros (migração ainda não aplicada),
  // concede acesso de editor como fallback para não bloquear o uso.
  const role     = membro?.role || (session && !membroLoading ? 'editor' : null)
  const isAdmin  = role === 'admin'
  const isEditor = role === 'editor' || isAdmin
  const isMembro = !!membro

  // ── Ler token de convite na URL ────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('convite')
    if (token) {
      setConviteToken(token)
      window.history.replaceState({}, '', window.location.pathname)
    }
    const entradaParam = params.get('entrada')
    if (entradaParam) {
      setEntradaPublicaId(entradaParam)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // ── Auth ───────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s)
      if (s) setShowLogin(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Carregar perfil de membro após login ───────────────────────────────
  useEffect(() => {
    if (!session) { setMembro(null); return }
    setMembroLoading(true)

    async function verificarMembro() {
      const { data } = await supabase
        .from('membros').select('*').eq('user_id', session.user.id).single()

      if (data) {
        setMembro(data)
        setMembroLoading(false)
        return
      }

      // Não é membro — verificar se tem convite pendente
      if (conviteToken) {
        setAceitandoConvite(true)
        try {
          const res = await fetch('/api/aceitar-convite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: conviteToken,
              user_id: session.user.id,
              email: session.user.email,
              nome: session.user.user_metadata?.full_name || null,
            }),
          })
          const json = await res.json()
          if (json.ok) {
            // Buscar membro recém-criado
            const { data: novoMembro } = await supabase
              .from('membros').select('*').eq('user_id', session.user.id).single()
            setMembro(novoMembro)
            setConviteToken(null)
          }
        } catch {}
        setAceitandoConvite(false)
      }

      setMembroLoading(false)
    }

    verificarMembro()
  }, [session, conviteToken])

  // ── Entradas (leitura pública) ─────────────────────────────────────────
  // Atalhos de teclado globais
  useEffect(() => {
    function handler(e) {
      const tag = document.activeElement?.tagName
      const editando = ['INPUT','TEXTAREA','SELECT'].includes(tag)
      if (editando) return

      // / — focar busca
      if (e.key === '/' && view === VIEWS.HOME) {
        e.preventDefault()
        document.querySelector('input[placeholder*="Buscar"]')?.focus()
      }
      // N — nova entrada
      if ((e.key === 'n' || e.key === 'N') && isEditor && view !== VIEWS.ADD) {
        e.preventDefault()
        setPrefillEntry(null); setView(VIEWS.ADD)
      }
      // Esc — voltar à lista ou fechar mais
      if (e.key === 'Escape') {
        if (maisAberto) { setMaisAberto(false); return }
        if (view !== VIEWS.HOME) setView(VIEWS.HOME)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [view, isEditor, maisAberto])

  const loadEntradas = useCallback(async () => {
    const { data } = await supabase
      .from('entradas').select('*').order('criado_em', { ascending: false })
    if (data) setEntradas(data)
  }, [])

  useEffect(() => {
    if (authLoading) return
    loadEntradas()
    const channel = supabase.channel('entradas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entradas' }, loadEntradas)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [authLoading, loadEntradas])

  async function exportarRepo() {
    if (exportandoRepo || !entradas.length) return
    setExportandoRepo(true)
    try { await exportarRepositorioDocx(entradas) }
    catch (e) { console.error(e); notify('Erro ao exportar.', 'err') }
    setExportandoRepo(false)
  }

  function notify(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function buscarSemantico() {
    if (!search.trim() || buscandoSem) return
    setBuscandoSem(true)
    setResultadosSem(null)
    setErroSem('')
    // Salvar no histórico
    setHistoricoBusca(prev => {
      const nova = [search, ...prev.filter(h => h !== search)].slice(0, 5)
      localStorage.setItem('rj_busca_historico', JSON.stringify(nova))
      return nova
    })
    try {
      const res = await fetch('/api/busca-semantica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: search, entradas }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setResultadosSem(json.resultados || [])
    } catch (err) {
      setErroSem('Erro na busca: ' + err.message)
    }
    setBuscandoSem(false)
  }

  // Limpar resultados semânticos ao trocar modo ou limpar busca
  function handleSearchChange(val) {
    setSearch(val)
    if (resultadosSem !== null) setResultadosSem(null)
  }

  const todasAsTags = [...new Set(entradas.flatMap(e => e.tags || []))].sort()

  function ordenarEntradas(lista) {
    const l = [...lista]
    switch (ordenacao) {
      case 'data_asc':  return l.sort((a,b) => new Date(a.criado_em) - new Date(b.criado_em))
      case 'tema_az':   return l.sort((a,b) => (a.tema||'').localeCompare(b.tema||'', 'pt-BR'))
      case 'tema_za':   return l.sort((a,b) => (b.tema||'').localeCompare(a.tema||'', 'pt-BR'))
      case 'fonte':     return l.sort((a,b) => (a.fonte||'').localeCompare(b.fonte||'', 'pt-BR'))
      default:          return l.sort((a,b) => new Date(b.criado_em) - new Date(a.criado_em))
    }
  }

  // No modo semântico com resultado, usar ordem e IDs retornados pela IA
  const filteredSemantico = resultadosSem !== null
    ? resultadosSem
        .map(r => ({ ...entradas.find(e => e.id === r.id), _relevancia: r.relevancia, _motivo: r.motivo }))
        .filter(e => e.id)
    : null

  const filteredRaw = filteredSemantico !== null
    ? filteredSemantico
    : entradas.filter(e => {
      const areaOk = areaFilter === 'all' || e.area === areaFilter
      if (!areaOk) return false
      const tag = !tagFilter || (e.tags || []).includes(tagFilter)
      if (!tag) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        e.tema?.toLowerCase().includes(q) ||
        e.fonte?.toLowerCase().includes(q) ||
        e.referencia?.toLowerCase().includes(q) ||
        e.teses?.some(t => t.tese_assunto?.toLowerCase().includes(q))
      )
    })

  const filtered = filteredSemantico !== null ? filteredRaw : ordenarEntradas(filteredRaw)

  function requireEditor(action) {
    if (!isEditor) { notify('Permissão insuficiente.', 'err'); return false }
    action(); return true
  }

async function handleSave(entry) {
    setSaving(true)
    const payload = {
      area: entry.area, tema: entry.tema, tipo: entry.tipo,
      fonte: entry.fonte, referencia: entry.referencia, url: entry.url,
      teses: entry.teses, criado_por: session.user.id,
    }
    if (view === VIEWS.ADD) {
      const { error } = await supabase.from('entradas').insert(payload)
      if (error) notify('Erro ao salvar.', 'err')
      else { notify('Entrada salva.'); setPrefillEntry(null); setView(VIEWS.HOME) }
    } else {
      const { error } = await supabase.from('entradas').update(payload).eq('id', selected.id)
      if (error) notify('Erro ao editar.', 'err')
      else { notify('Entrada atualizada.'); setView(VIEWS.DETAIL) }
    }
    setSaving(false)
  }

  async function handleDuplicar(entry) {
    const payload = {
      area: entry.area, tipo: entry.tipo,
      tema: `${entry.tema} (cópia)`,
      fonte: entry.fonte, referencia: entry.referencia,
      url: entry.url, teses: entry.teses,
      status: 'vigente', tags: entry.tags || [],
      criado_por: session.user.id,
    }
    const { data, error } = await supabase.from('entradas').insert(payload).select().single()
    if (error) notify('Erro ao duplicar.', 'err')
    else {
      notify('Entrada duplicada.')
      setSelected(data)
      setView(VIEWS.DETAIL)
    }
  }

  async function handleDelete() {
    if (!confirm('Remover esta entrada permanentemente?')) return
    const { error } = await supabase.from('entradas').delete().eq('id', selected.id)
    if (error) notify('Erro ao remover.', 'err')
    else { notify('Entrada removida.'); setSelected(null); setView(VIEWS.HOME) }
  }

  function handleImportarPesquisa(entrada) {
    if (!isEditor) { notify('Apenas editores podem importar entradas.', 'err'); return }
    setPrefillEntry(entrada)
    setView(VIEWS.ADD)
    notify('Complete as teses e salve.')
  }

  // ── Loading states ─────────────────────────────────────────────────────
  // Vista pública de entrada compartilhada — sem autenticação
  if (entradaPublicaId) return (
    <EntradaPublica
      entradaId={entradaPublicaId}
      onFechar={() => setEntradaPublicaId(null)}
    />
  )

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, color: theme.gold, fontFamily: 'Playfair Display, serif', fontSize: 18 }}>
      Carregando...
    </div>
  )

  if (aceitandoConvite) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, color: theme.gold, fontFamily: 'Playfair Display, serif', fontSize: 16, flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 32 }}>✦</div>
      Ativando seu acesso...
    </div>
  )

  if (showLogin) return (
    <div>
      <button onClick={() => setShowLogin(false)} style={{
        position: 'fixed', top: 16, left: 16, zIndex: 200,
        background: theme.raised, border: `1px solid ${theme.border}`,
        borderRadius: 8, padding: '8px 14px', color: theme.muted,
        fontSize: 13, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
      }}>← Voltar</button>
      <Auth conviteToken={conviteToken} />
    </div>
  )

  const sidebarItems = [
    { id: 'all', label: 'Todas as Áreas', count: entradas.length, color: theme.gold },
    ...Object.entries(AREAS).map(([k, v]) => ({
      id: k, label: k, color: v.color, icon: v.icon,
      count: entradas.filter(e => e.area === k).length,
    }))
  ]

  // ── Badge de papel ─────────────────────────────────────────────────────
  const ROLE_COR = { admin: '#c9a452', editor: '#3b82f6', leitor: '#10b981' }
  const ROLE_LABEL = { admin: 'Admin', editor: 'Editor', leitor: 'Leitor' }

  // ── Sidebar ────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div style={{
      width: 240, background: theme.surface,
      borderRight: `1px solid ${theme.borderGold}`,
      display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0,
    }}>
      {/* Logo + SeletorTema */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.borderGold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ background: theme.logoBg, borderRadius: 8, padding: '6px 10px 4px', boxShadow: theme.shadow, border: mode === 'light' ? `1px solid ${theme.border}` : 'none', flexShrink: 0 }}>
          <img src="/logo.png" alt="Farias Fusquiani" style={{ height: 40, width: 'auto', display: 'block' }}/>
        </div>
        <SeletorTema />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {/* Áreas */}
        <div style={{ padding: '4px 16px 8px', fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2 }}>Áreas</div>
        {sidebarItems.map(n => {
          const active = areaFilter === n.id && view === VIEWS.HOME
          return (
            <button key={n.id} onClick={() => { setAreaFilter(n.id); setView(VIEWS.HOME) }}
              style={{
                width: '100%', background: active ? n.color + '11' : 'none',
                border: 'none', borderLeft: `2px solid ${active ? n.color : 'transparent'}`,
                padding: '9px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', color: active ? theme.text : theme.muted,
                fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', textAlign: 'left', transition: 'all .15s',
              }}>
              <span>{n.icon ? `${n.icon} ` : ''}{n.label}</span>
              <span style={{ background: active ? n.color + '33' : theme.border + '66', color: active ? n.color : theme.muted, borderRadius: 10, padding: '1px 7px', fontSize: 10 }}>{n.count}</span>
            </button>
          )
        })}

        <div style={{ margin: '12px 0', borderTop: `1px solid ${theme.border}` }}/>
        <div style={{ padding: '4px 16px 8px', fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2 }}>Ferramentas</div>

        {[
          { v: VIEWS.DASHBOARD,    label: '◈ Dashboard' },
            { v: VIEWS.IMPORTAR,     label: '⇪ Importar Planilha' },
          { v: VIEWS.BUSCA,        label: '✦ Busca para Peça' },
          { v: VIEWS.EDITOR,       label: '✎ Editor de Peças' },
          { v: VIEWS.ALERTAS,      label: '🔔 Alertas' },
          { v: VIEWS.FLASHCARDS,   label: '🃏 Flashcards' },
        ].map(item => (
          <button key={item.v} onClick={() => setView(item.v)}
            style={{
              width: '100%', background: view === item.v ? theme.gold + '11' : 'none',
              border: 'none', borderLeft: `2px solid ${view === item.v ? theme.gold : 'transparent'}`,
              padding: '9px 16px', textAlign: 'left', cursor: 'pointer',
              color: view === item.v ? theme.gold : theme.muted, fontSize: 12,
              fontFamily: 'IBM Plex Mono, monospace', transition: 'all .15s',
            }}>{item.label}</button>
        ))}

        {/* Ações que exigem membro */}
        {isEditor && (
          <button onClick={() => { setPrefillEntry(null); setView(VIEWS.ADD) }}
            style={{
              width: '100%', background: view === VIEWS.ADD ? theme.gold + '11' : 'none',
              border: 'none', borderLeft: `2px solid ${view === VIEWS.ADD ? theme.gold : 'transparent'}`,
              padding: '9px 16px', textAlign: 'left', cursor: 'pointer',
              color: view === VIEWS.ADD ? theme.gold : theme.muted, fontSize: 12,
              fontFamily: 'IBM Plex Mono, monospace', transition: 'all .15s',
            }}>+ Nova Entrada</button>
        )}

        {isAdmin && (
          <>
            <div style={{ margin: '12px 0', borderTop: `1px solid ${theme.border}` }}/>
            <div style={{ padding: '4px 16px 8px', fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2 }}>Administração</div>
            <button onClick={() => setView(VIEWS.MEMBROS)}
              style={{
                width: '100%', background: view === VIEWS.MEMBROS ? theme.gold + '11' : 'none',
                border: 'none', borderLeft: `2px solid ${view === VIEWS.MEMBROS ? theme.gold : 'transparent'}`,
                padding: '9px 16px', textAlign: 'left', cursor: 'pointer',
                color: view === VIEWS.MEMBROS ? theme.gold : theme.muted, fontSize: 12,
                fontFamily: 'IBM Plex Mono, monospace', transition: 'all .15s',
              }}>👥 Membros</button>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.borderGold}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session ? session.user.email : 'Acesso público'}
            </div>
            {role && (
              <div style={{ fontSize: 9, color: ROLE_COR[role], textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
                {ROLE_LABEL[role]}
              </div>
            )}
          </div>
          <SinoNotificacoes
            session={session}
            onNavegar={v => setView(VIEWS[v.toUpperCase()] || VIEWS.HOME)}
          />
          <SeletorTema />
        </div>
        {isEditor && (
          <button onClick={exportarRepo} disabled={exportandoRepo || !entradas.length}
            title="Exportar repositório completo em .docx"
            style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, padding: 7, color: exportandoRepo ? theme.muted : theme.gold, fontSize: 11, cursor: exportandoRepo ? 'not-allowed' : 'pointer', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 6 }}>
            {exportandoRepo ? '⟳ Exportando...' : '↓ Exportar repositório .docx'}
          </button>
        )}
        {session
          ? <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, padding: 7, color: theme.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>Sair</button>
          : <button onClick={() => setShowLogin(true)} style={{ width: '100%', background: `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`, border: 'none', borderRadius: 6, padding: 7, color: '#0b0f1a', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>🔒 Acesso Interno</button>
        }
      </div>
    </div>
  )

  // ── Mobile header ──────────────────────────────────────────────────────
  const MobileHeader = () => (
    <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.borderGold}`, padding: '10px 16px', paddingTop: 'calc(10px + env(safe-area-inset-top))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ background: theme.logoBg, borderRadius: 6, padding: '4px 8px 3px', border: mode === 'light' ? `1px solid ${theme.border}` : 'none' }}>
        <img src="/logo.png" alt="Farias Fusquiani" style={{ height: 32, width: 'auto', display: 'block' }}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {role && <span style={{ fontSize: 9, color: ROLE_COR[role], textTransform: 'uppercase', letterSpacing: 1 }}>{ROLE_LABEL[role]}</span>}
        <SeletorTema />
        {isEditor && (
          <button onClick={exportarRepo} disabled={exportandoRepo || !entradas.length}
            title="Exportar repositório completo em .docx"
            style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, padding: 7, color: exportandoRepo ? theme.muted : theme.gold, fontSize: 11, cursor: exportandoRepo ? 'not-allowed' : 'pointer', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 6 }}>
            {exportandoRepo ? '⟳ Exportando...' : '↓ Exportar repositório .docx'}
          </button>
        )}
        {session
          ? <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>Sair</button>
          : <button onClick={() => setShowLogin(true)} style={{ background: `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`, border: 'none', borderRadius: 6, padding: '5px 10px', color: '#0b0f1a', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>🔒 Login</button>
        }
      </div>
    </div>
  )

  // ── Mobile bottom nav ──────────────────────────────────────────────────
  // Itens fixos no mobile nav
  const navFixos = [
    { v: VIEWS.HOME,   label: 'Início',  icon: '🏠' },
    { v: VIEWS.BUSCA,  label: 'Busca IA', icon: '✦' },
    { v: VIEWS.EDITOR, label: 'Editor',   icon: '✎' },
    ...(isEditor ? [{ v: VIEWS.ADD, label: 'Nova', icon: '+' }] : []),
  ]
  // Itens no menu "mais"
  const navMais = [
    { v: VIEWS.PESQUISA,    label: 'Pesquisar',    icon: '⌕' },
    { v: VIEWS.DASHBOARD,   label: 'Dashboard',    icon: '◈' },
    { v: VIEWS.ALERTAS,     label: 'Alertas',      icon: '🔔' },
    { v: VIEWS.FLASHCARDS,  label: 'Flashcards',   icon: '🃏' },
    ...(isEditor ? [{ v: VIEWS.IMPORTAR, label: 'Importar', icon: '⇪' }] : []),
    ...(isAdmin  ? [{ v: VIEWS.MEMBROS,  label: 'Membros',  icon: '👥' }] : []),
  ]
  const maisAtivo = navMais.some(n => n.v === view)

  const MobileNav = () => (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}>
      {/* Drawer do menu "mais" */}
      {maisAberto && (
        <div
          onClick={() => setMaisAberto(false)}
          style={{ position: 'fixed', inset: 0, background: '#00000055', zIndex: 49 }}
        />
      )}
      {maisAberto && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, right: 0,
          background: theme.surface, borderTop: `1px solid ${theme.borderGold}`,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '12px 8px', gap: 4, zIndex: 51,
          boxShadow: '0 -8px 32px #00000033',
        }}>
          {navMais.map(item => (
            <button key={item.v}
              onClick={() => { setView(item.v); setMaisAberto(false) }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '10px 4px', background: view === item.v ? theme.gold + '22' : 'none',
                border: `1px solid ${view === item.v ? theme.gold + '44' : 'transparent'}`,
                borderRadius: 8,
                color: view === item.v ? theme.gold : theme.muted,
                cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
              }}>
              <span style={{ fontSize: 18, lineHeight: 1, marginBottom: 4 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Barra principal */}
      <div style={{
        background: theme.surface, borderTop: `1px solid ${theme.borderGold}`,
        display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {navFixos.map(item => (
          <button key={item.v}
            onClick={() => { setView(item.v); setMaisAberto(false) }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 4px', background: 'none', border: 'none',
              color: view === item.v ? theme.gold : theme.muted,
              cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
              borderTop: view === item.v ? `2px solid ${theme.gold}` : '2px solid transparent',
            }}>
            <span style={{ fontSize: item.icon === '+' ? 20 : 16, lineHeight: 1, marginBottom: 2 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
        {/* Botão "mais" */}
        <button
          onClick={() => setMaisAberto(m => !m)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 4px', background: 'none', border: 'none',
            color: maisAtivo ? theme.gold : theme.muted,
            cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
            borderTop: maisAtivo ? `2px solid ${theme.gold}` : '2px solid transparent',
          }}>
          <span style={{ fontSize: 16, lineHeight: 1, marginBottom: 2 }}>⋯</span>
          Mais
        </button>
      </div>
    </div>
  )

  // ── Conteúdo ───────────────────────────────────────────────────────────
  function renderContent() {
    switch (view) {
      case VIEWS.MEMBROS:
        return isAdmin
          ? <div className="fade-up"><Membros session={session} /></div>
          : null

      case VIEWS.PESQUISA:
        return <div className="fade-up"><PesquisaJuri onImportar={handleImportarPesquisa} /></div>

case VIEWS.FLASHCARDS:
        return <div className="fade-up"><FlashCards entradas={entradas} /></div>

      case VIEWS.IMPORTAR:
        return isEditor ? (
          <div className="fade-up"><ImportacaoLote session={session} /></div>
        ) : null

      case VIEWS.DASHBOARD:
        return <div className="fade-up"><Dashboard entradas={entradas}/></div>

      case VIEWS.EDITOR:
        return (
          <div className="fade-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <EditorPecas entradas={entradas}/>
          </div>
        )

      case VIEWS.ALERTAS:
        return (
          <div className="fade-up"><Alertas session={session} /></div>
        )

      case VIEWS.ADD:
        if (!isEditor) return null
        return (
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setView(VIEWS.HOME)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 20 }}>←</button>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif' }}>
                {prefillEntry ? 'Importar Jurisprudência' : 'Nova Entrada'}
              </div>
            </div>
            <EntradaForm initial={prefillEntry} onSave={handleSave} onCancel={() => { setPrefillEntry(null); setView(VIEWS.HOME) }} loading={saving}/>
          </div>
        )

      case VIEWS.EDIT:
        if (!isEditor) return null
        return (
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setView(VIEWS.DETAIL)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 20 }}>←</button>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif' }}>Editar Entrada</div>
            </div>
            <EntradaForm initial={selected} onSave={handleSave} onCancel={() => setView(VIEWS.DETAIL)} loading={saving}/>
          </div>
        )

      case VIEWS.DETAIL:
        return selected ? (
          <div className="fade-up">
            <button onClick={() => setView(VIEWS.HOME)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 13, marginBottom: 16, fontFamily: 'IBM Plex Mono, monospace' }}>← Voltar à lista</button>
            <EntradaDetail
              entry={selected}
              onClose={() => setView(VIEWS.HOME)}
              onDelete={isAdmin ? handleDelete : null}
              onEdit={isEditor ? () => setView(VIEWS.EDIT) : null}
              onDuplicar={isEditor ? handleDuplicar : null}
              readOnly={!isEditor}
              onStatusChange={(id, novoStatus) => {
                setEntradas(prev => prev.map(e => e.id === id ? { ...e, status: novoStatus } : e))
              }}
            />
          </div>
        ) : null

      case VIEWS.BUSCA:
        return <div className="fade-up"><BuscaPeca entradas={entradas}/></div>

      default:
        return (
          <div>
            {/* Barra de busca com toggle semântico */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.muted }}>🔍</span>
                <input
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && modoSemantico && buscarSemantico()}
                  onFocus={() => setShowHistorico(true)}
                  onBlur={() => setTimeout(() => setShowHistorico(false), 150)}
                  placeholder={modoSemantico ? 'Descreva o que procura em linguagem natural...' : 'Buscar por tema, fonte, referência...'}
                  style={{ paddingLeft: 38, paddingRight: modoSemantico ? 100 : 12 }}
                />
                {showHistorico && !search && historicoBusca.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                    background: theme.surface, border: `1px solid ${theme.border}`,
                    borderRadius: 8, marginTop: 4, overflow: 'hidden',
                    boxShadow: theme.shadow,
                  }}>
                    <div style={{ padding: '6px 12px', fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: `1px solid ${theme.border}` }}>
                      Buscas recentes
                    </div>
                    {historicoBusca.map((h, i) => (
                      <div key={i}
                        onMouseDown={() => { handleSearchChange(h); setShowHistorico(false) }}
                        style={{
                          padding: '8px 12px', fontSize: 12, color: theme.text,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                          borderBottom: i < historicoBusca.length - 1 ? `1px solid ${theme.border}22` : 'none',
                        }}
                        onMouseEnter={ev => ev.currentTarget.style.background = theme.raised}
                        onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                        <span style={{ color: theme.muted, fontSize: 12 }}>⟳</span>
                        {h}
                      </div>
                    ))}
                  </div>
                )}
                {modoSemantico && search.trim() && (
                  <button onClick={buscarSemantico} disabled={buscandoSem}
                    style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: buscandoSem ? theme.border : theme.gold, color: buscandoSem ? theme.muted : '#0b0f1a', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: buscandoSem ? 'not-allowed' : 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {buscandoSem ? '⟳' : '✦ Buscar'}
                  </button>
                )}
              </div>
              {/* Toggle exata / semântica */}
              <button onClick={() => { setModoSemantico(m => !m); setResultadosSem(null); setErroSem('') }}
                title={modoSemantico ? 'Modo: busca semântica (IA) — clique para voltar à busca exata' : 'Modo: busca exata — clique para ativar busca semântica por IA'}
                style={{ flexShrink: 0, background: modoSemantico ? theme.gold + '22' : theme.raised, color: modoSemantico ? theme.gold : theme.muted, border: `1px solid ${modoSemantico ? theme.gold + '55' : theme.border}`, borderRadius: 8, padding: '0 14px', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', fontWeight: modoSemantico ? 700 : 400, whiteSpace: 'nowrap' }}>
                {modoSemantico ? '✦ Semântica' : '✦ Semântica'}
              </button>
            </div>
            {erroSem && <div style={{ background: theme.toastErr, border: `1px solid ${theme.error}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, color: theme.error, marginBottom: 12 }}>✕ {erroSem}</div>}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
              {[{ id: 'all', label: 'Todas', color: theme.gold }, ...Object.entries(AREAS).map(([k, v]) => ({ id: k, label: k, color: v.color, icon: v.icon }))].map(a => (
                <button key={a.id} onClick={() => setAreaFilter(a.id)}
                  style={{ flexShrink: 0, background: areaFilter === a.id ? a.color + '22' : theme.raised, color: areaFilter === a.id ? a.color : theme.muted, border: `1px solid ${areaFilter === a.id ? a.color + '66' : theme.border}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap', transition: 'all .15s' }}>
                  {a.icon ? `${a.icon} ` : ''}{a.label}{' '}
                  <span style={{ opacity: 0.6, fontSize: 10 }}>{a.id === 'all' ? entradas.length : entradas.filter(e => e.area === a.id).length}</span>
                </button>
              ))}
            </div>

            {/* Filtro por tag */}
            {todasAsTags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4, flexWrap: 'wrap' }}>
                <button onClick={() => setTagFilter(null)}
                  style={{ flexShrink: 0, background: !tagFilter ? theme.gold + '22' : theme.raised, color: !tagFilter ? theme.gold : theme.muted, border: `1px solid ${!tagFilter ? theme.gold + '66' : theme.border}`, borderRadius: 20, padding: '4px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
                  todas as tags
                </button>
                {todasAsTags.map(t => (
                  <button key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)}
                    style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <TagPill tag={t} pequena style={{ opacity: tagFilter && tagFilter !== t ? 0.45 : 1 }} />
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: theme.muted }}>
                {filteredSemantico !== null
                  ? `${filtered.length} resultado(s) semântico(s) para "${search}"`
                  : `${filtered.length} entrada(s)${tagFilter ? ` com tag #${tagFilter}` : ''}`
                }
              </div>
              {filteredSemantico === null && (
                <select
                  value={ordenacao}
                  onChange={e => setOrdenacao(e.target.value)}
                  style={{ width: 'auto', fontSize: 11, padding: '4px 8px', background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted }}>
                  <option value="data_desc">Mais recentes</option>
                  <option value="data_asc">Mais antigas</option>
                  <option value="tema_az">Tema A-Z</option>
                  <option value="tema_za">Tema Z-A</option>
                  <option value="fonte">Fonte A-Z</option>
                </select>
              )}
            </div>
            <EntradaList entradas={filtered} onSelect={e => { setSelected(e); setView(VIEWS.DETAIL) }}/>
          </div>
        )
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: theme.bg }}>
      {!isMobile && <Sidebar/>}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {isMobile && <MobileHeader/>}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 16px 80px' : 28 }}>
          {renderContent()}
        </div>
        {isMobile && <MobileNav/>}
      </div>

      <InstalarApp />

      {toast && (
        <div style={{ position: 'fixed', bottom: isMobile ? 80 : 24, right: 16, background: toast.type === 'err' ? theme.toastErr : theme.toastOk, border: `1px solid ${toast.type === 'err' ? theme.error : theme.success}`, borderRadius: 8, padding: '10px 16px', color: theme.text, fontSize: 13, boxShadow: theme.shadow, zIndex: 100, maxWidth: 320 }}>
          {toast.type === 'err' ? '✕ ' : '✓ '}{toast.msg}
        </div>
      )}
    </div>
  )
}
