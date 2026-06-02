import { useEffect, useState, useCallback, Component, useMemo } from 'react'
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
import ImportarLegislacao from './components/ImportarLegislacao'
import ImportarHub from './components/ImportarHub'
import Legislacao from './components/Legislacao'
import ExtrairPeticao from './components/ExtrairPeticao'
import InstalarApp from './components/InstalarApp'
import FlashCards from './components/FlashCards'
import Configuracoes from './components/Configuracoes'
import { exportarPlanilhaTeses } from './utils/exportarTeses'
import { Lock } from 'lucide-react'
import SinoNotificacoes from './components/SinoNotificacoes'
import SeletorTema from './components/SeletorTema'
import { exportarRepositorioDocx } from './utils/exportarRepositorio'
import { AREAS } from './shared'
import { TagPill } from './components/TagInput'

class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  componentDidCatch(e, info) { console.error('EntradaDetail crash:', e, info) }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 24, color: '#ef4444', fontFamily: 'monospace', fontSize: 13, background: '#2a0f0f', borderRadius: 10, margin: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>Erro ao abrir entrada:</div>
        <div style={{ opacity: 0.8 }}>{String(this.state.error?.message || this.state.error)}</div>
        <button onClick={() => this.setState({ error: null })} style={{ marginTop: 12, padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'monospace' }}>
          Fechar
        </button>
      </div>
    )
    return this.props.children
  }
}

const VIEWS = {
  ALERTAS: 'alertas',
  EDITOR:     'editor',
  DASHBOARD: 'dashboard',
  IMPORTAR:   'importar',
  LEGISLACAO:    'legislacao',
  LEG_VIEW:      'leg_view',
  EXTRAIR:       'extrair',
  FLASHCARDS:   'flashcards',
  HOME: 'home', ADD: 'add', EDIT: 'edit', DETAIL: 'detail',
  BUSCA: 'busca', MEMBROS: 'membros',
  CONFIG: 'config',
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
  const { theme, mode, isDark, toggle } = useTheme()
  const [session, setSession]       = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [membro, setMembro]         = useState(null)   // { role, nome, email }
  const [membroLoading, setMembroLoading] = useState(false)
  const [entradas, setEntradas]     = useState([])
  const [view, setView]             = useState(VIEWS.HOME)
  const [areaFilter, setAreaFilter] = useState('all')
  const [tipoFilter, setTipoFilter]   = useState('all')
  const [importarAba, setImportarAba]   = useState('planilha')
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
  const [exportandoTeses, setExportandoTeses] = useState(false)
  const [confirmLimpar, setConfirmLimpar]   = useState(false)
  const [limpandoRepo, setLimpandoRepo]     = useState(false)
  const [countLegislacao, setCountLegislacao] = useState(0)

  useEffect(() => {
    supabase.from('legislacao').select('id', { count: 'exact', head: true })
      .eq('vigente', true)
      .then(({ count }) => setCountLegislacao(count || 0))
  }, [])
  const isMobile = useIsMobile()
  const [maisAberto, setMaisAberto] = useState(false)

  // Se logado mas sem registro em membros (migração ainda não aplicada),
  // concede acesso de editor como fallback para não bloquear o uso.
  const role     = membro?.role || (session && !membroLoading ? 'editor' : null)
  const isOwner  = session?.user?.email === 'foxjessica01@gmail.com'
  const isAdmin  = role === 'admin' || isOwner
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

  // exportarRepo e notify movidos para antes do useMemo — evitar TDZ

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
      const tipoOk = tipoFilter === 'all' || e.tipo === tipoFilter
      if (!tipoOk) return false
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
      ia_status: entry.ia_status || 'manual',
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

  async function limparTodoRepositorio() {
    const OWNER = 'foxjessica01@gmail.com'
    if (session?.user?.email !== OWNER) { notify('Apenas a proprietaria pode limpar o repositorio.', 'err'); return }
    setLimpandoRepo(true)
    try {
      const { error } = await supabase.from('entradas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) { notify('Erro ao limpar repositório.', 'err') }
      else {
        setEntradas([])
        setSelected(null)
        setView(VIEWS.HOME)
        notify('Repositório limpo. Todas as entradas foram removidas.')
      }
    } catch (e) { notify('Erro inesperado.', 'err') }
    setLimpandoRepo(false)
    setConfirmLimpar(false)
  }

  function handleImportarPesquisa(entrada) {
    if (!isEditor) { notify('Apenas editores podem importar entradas.', 'err'); return }
    setPrefillEntry(entrada)
    setView(VIEWS.ADD)
    notify('Complete as teses e salve.')
  }

  // ── Funções declaradas ANTES do useMemo — evitar TDZ ─────────────────────
  function notify(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function exportarTesesPlanilha() {
    if (exportandoTeses || !entradas.length) return
    setExportandoTeses(true)
    try { exportarPlanilhaTeses(entradas) }
    catch (e) { console.error(e); notify('Erro ao exportar planilha.', 'err') }
    setExportandoTeses(false)
  }

  async function exportarRepo() {
    if (exportandoRepo || !entradas.length) return
    setExportandoRepo(true)
    try { await exportarRepositorioDocx(entradas) }
    catch (e) { console.error(e); notify('Erro ao exportar.', 'err') }
    setExportandoRepo(false)
  }

    // Constantes de role — declaradas antes do useMemo para evitar TDZ
  const ROLE_COR   = { admin: '#c9a452', editor: '#3b82f6', leitor: '#10b981' }
  const ROLE_LABEL = { admin: 'Admin', editor: 'Editor', leitor: 'Leitor' }

  // ── Sidebar (useMemo ANTES dos early returns — React rule of hooks) ────────
  const SidebarEl = useMemo(() => (
    <div style={{
      width: 220, background: theme.surface,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0,
    }}>
      {/* Logo Lexia — Têmis */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          border: '2px solid #C5A059',
          background: '#800020',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 12px #80002044',
          position: 'relative',
        }}>
          <img
            src="/logo-temis.png"
            alt="Lexia"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <span style={{
            display: 'none', position: 'absolute', inset: 0,
            alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 18,
          }}>FF</span>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, fontFamily: theme.fontTitle, lineHeight: 1.2 }}>
            Lexia
          </div>
          <div style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2.5, marginTop: 2 }}>
            Inteligência Jurídica
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {[
          { id: 'home',   label: 'Início',          action: () => { setAreaFilter('all'); setTipoFilter('all'); setView(VIEWS.HOME) }, active: view === VIEWS.HOME },
          { id: 'editor', label: 'Editor de Peças', action: () => setView(VIEWS.EDITOR),    active: view === VIEWS.EDITOR },
          { id: 'leg',    label: 'Legislação',      action: () => setView(VIEWS.LEG_VIEW),  active: view === VIEWS.LEG_VIEW },
          { id: 'dash',   label: 'Dashboard',       action: () => setView(VIEWS.DASHBOARD), active: view === VIEWS.DASHBOARD },
          { id: 'import', label: 'Importar',        action: () => setView(VIEWS.IMPORTAR),  active: [VIEWS.IMPORTAR, VIEWS.LEGISLACAO, VIEWS.EXTRAIR].includes(view) },
          { id: 'config', label: 'Configurações',   action: () => setView(VIEWS.CONFIG),    active: view === VIEWS.CONFIG },
        ].map(n => (
          <button key={n.id} onClick={n.action} style={{
            width: '100%', background: n.active ? theme.gold + '12' : 'none',
            border: 'none', borderLeft: `3px solid ${n.active ? theme.gold : 'transparent'}`,
            padding: '11px 20px', display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', color: n.active ? theme.text : theme.muted,
            fontSize: 13, textAlign: 'left', transition: 'all .15s',
            fontFamily: 'Inter, sans-serif',
          }}>
            {n.label}
          </button>
        ))}

        {isAdmin && (
          <button onClick={() => setView(VIEWS.MEMBROS)} style={{
            width: '100%', background: view === VIEWS.MEMBROS ? theme.gold + '12' : 'none',
            border: 'none', borderLeft: `3px solid ${view === VIEWS.MEMBROS ? theme.gold : 'transparent'}`,
            padding: '11px 20px', textAlign: 'left', cursor: 'pointer',
            color: view === VIEWS.MEMBROS ? theme.text : theme.muted, fontSize: 13,
            fontFamily: 'Inter, sans-serif', transition: 'all .15s',
          }}>Membros</button>
        )}

        {isEditor && (
          <>
            <div style={{ margin: '8px 16px', borderTop: `1px solid ${theme.border}` }}/>
            <button onClick={() => { setPrefillEntry(null); setView(VIEWS.ADD) }} style={{
              width: '100%', background: view === VIEWS.ADD ? theme.gold + '12' : 'none',
              border: 'none', borderLeft: `3px solid ${view === VIEWS.ADD ? theme.gold : 'transparent'}`,
              padding: '11px 20px', textAlign: 'left', cursor: 'pointer',
              color: view === VIEWS.ADD ? theme.gold : theme.gold, fontSize: 13,
              fontFamily: 'Inter, sans-serif', fontWeight: 600, transition: 'all .15s',
            }}>+ Nova Entrada</button>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: `1px solid ${theme.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 9, color: theme.muted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>Plataforma e Curadoria</div>
          <div style={{ fontSize: 11, color: theme.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, fontFamily: theme.fontTitle }}>Farias Fusquiani</div>
        </div>
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
        </div>
        {isOwner && entradas.length > 0 && (
          <button onClick={exportarTesesPlanilha} disabled={exportandoTeses}
            style={{ width: '100%', background: theme.raised, border: '1px solid ' + theme.border, borderRadius: 6, padding: 7, color: exportandoTeses ? theme.muted : theme.gold, fontSize: 11, cursor: exportandoTeses ? 'not-allowed' : 'pointer', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 6 }}>
            {exportandoTeses ? 'Exportando...' : 'Exportar planilha'}
          </button>
        )}
        {isAdmin && (
          <button onClick={() => setConfirmLimpar(true)}
            style={{ width: '100%', background: '#1a0808', border: '1px solid #3a1010', borderRadius: 6, padding: 7, color: '#c0504d', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            Limpar repositorio
          </button>
        )}
        {session
          ? <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, padding: 7, color: theme.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>Sair</button>
          : <button onClick={() => setShowLogin(true)} style={{ width: '100%', background: `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`, border: 'none', borderRadius: 6, padding: 7, color: '#0b0f1a', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Lock size={11} /> Acesso Interno</button>
        }
      </div>
    </div>
  ), [theme, view, areaFilter, isAdmin, isEditor, session, role, entradas, confirmLimpar])

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
      count: k === 'Legislação' ? countLegislacao : entradas.filter(e => e.area === k).length,
    }))
  ]

  // ── Sidebar ────────────────────────────────────────────────────────────

  // ── Mobile header ──────────────────────────────────────────────────────
  const MobileHeader = () => (
    <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.borderGold}`, padding: '10px 16px', paddingTop: 'calc(10px + env(safe-area-inset-top))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#800020', border: '2px solid #C5A059',
          overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/logo-temis.png" alt="Lexia"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color:#C5A059;font-family:serif;font-weight:700;font-size:14px">FF</span>' }}
          />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>Lexia</div>
          <div style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'Inter, sans-serif' }}>Inteligência Jurídica</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {role && <span style={{ fontSize: 9, color: ROLE_COR[role], textTransform: 'uppercase', letterSpacing: 1 }}>{ROLE_LABEL[role]}</span>}
        <SeletorTema compact />
        {session
          ? <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>Sair</button>
          : <button onClick={() => setShowLogin(true)} style={{ background: theme.gold, border: 'none', borderRadius: 6, padding: '5px 14px', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={11} /> Acesso Interno</button>
        }
      </div>
    </div>
  )

  // ── Mobile bottom nav ──────────────────────────────────────────────────
  // Itens fixos no mobile nav
  const navFixos = [
    { v: VIEWS.HOME,   label: 'Início',  icon: 'home' },
    { v: VIEWS.BUSCA,  label: 'Busca IA', icon: '*' },
    { v: VIEWS.EDITOR, label: 'Editor',   icon: 'edit' },
    ...(isEditor ? [{ v: VIEWS.ADD, label: 'Nova' }] : []),
  ]
  // Itens no menu "mais"
  const navMais = [
    { v: VIEWS.DASHBOARD,   label: 'Dashboard' },
    { v: VIEWS.LEG_VIEW,    label: 'Legislação' },
    { v: VIEWS.ALERTAS,     label: 'Alertas' },
    { v: VIEWS.FLASHCARDS,  label: 'Flashcards' },
    ...(isEditor ? [{ v: VIEWS.IMPORTAR, label: 'Importar' }] : []),
    ...(isAdmin  ? [{ v: VIEWS.MEMBROS,  label: 'Membros' }]  : []),
    ...(session  ? [{ v: VIEWS.CONFIG,   label: 'Configuracoes' }] : []),
    ...(isOwner && entradas.length > 0 ? [{ v: 'exportar_teses', label: 'Exportar planilha', action: exportarTesesPlanilha }] : []),
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
              onClick={() => { if (item.action) { item.action(); setMaisAberto(false) } else { setView(item.v); setMaisAberto(false) } }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '10px 4px', background: view === item.v ? theme.gold + '22' : 'none',
                border: `1px solid ${view === item.v ? theme.gold + '44' : 'transparent'}`,
                borderRadius: 8,
                color: view === item.v ? theme.gold : theme.muted,
                cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
              }}>
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

case VIEWS.FLASHCARDS:
        return <div className="fade-up"><FlashCards entradas={entradas} /></div>



      case VIEWS.CONFIG:
        return (
          <div className="fade-up">
            <Configuracoes session={session} membro={membro} />
          </div>
        )

      case VIEWS.LEG_VIEW:
        return <div className="fade-up"><Legislacao /></div>



      case VIEWS.EXTRAIR:
      case VIEWS.LEGISLACAO:
      case VIEWS.IMPORTAR:
        return <ImportarHub key="importar-hub" session={session} initialTab={importarAba} onAbaChange={setImportarAba} setView={setView} theme={theme} />

      case VIEWS.DASHBOARD:
        return <div className="fade-up"><Dashboard entradas={entradas} countLegislacao={countLegislacao}/></div>

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
            <ErrorBoundary>
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
            </ErrorBoundary>
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
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.muted, fontSize: 13, lineHeight: 1 }}>⌕</span>
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
                    style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: buscandoSem ? theme.border : theme.gold, color: buscandoSem ? theme.muted : (theme.isDark ? '#0f0a0b' : '#fff'), border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 600, cursor: buscandoSem ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    {buscandoSem ? '~' : '✦ Buscar'}
                  </button>
                )}
              </div>
              {/* Toggle exata / semântica */}
              <button onClick={() => { setModoSemantico(m => !m); setResultadosSem(null); setErroSem('') }}
                title={modoSemantico ? 'Modo: busca semântica (IA) — clique para voltar à busca exata' : 'Modo: busca exata — clique para ativar busca semântica por IA'}
                style={{ flexShrink: 0, background: modoSemantico ? theme.gold + '18' : 'transparent', color: modoSemantico ? theme.gold : theme.muted, border: `1px solid ${modoSemantico ? theme.gold + '55' : theme.border}`, borderRadius: 8, padding: '0 16px', height: 40, fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: modoSemantico ? 600 : 400, whiteSpace: 'nowrap' }}>
                {modoSemantico ? 'IA' : 'IA'}
              </button>
            </div>
            {erroSem && <div style={{ background: theme.toastErr, border: `1px solid ${theme.error}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, color: theme.error, marginBottom: 12 }}>✕ {erroSem}</div>}
            {/* Filtro Linha 1 — Área */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {[
                { id: 'all', label: 'Todas' },
                ...Object.keys(AREAS).map(a => ({ id: a, label: a })),
              ].map(a => (
                <button key={a.id} onClick={() => setAreaFilter(a.id)} style={{
                  flexShrink: 0,
                  background: areaFilter === a.id ? theme.gold + '18' : 'transparent',
                  color: areaFilter === a.id ? theme.gold : theme.muted,
                  border: `1px solid ${areaFilter === a.id ? theme.gold + '55' : theme.border}`,
                  borderRadius: 20, padding: '5px 16px', fontSize: 12, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontWeight: areaFilter === a.id ? 600 : 400,
                  transition: 'all .15s',
                }}>
                  {a.label}{' '}
                  <span style={{ opacity: 0.5, fontSize: 10 }}>{a.id === 'all' ? entradas.length : entradas.filter(e => e.area === a.id).length}</span>
                </button>
              ))}
            </div>
            {/* Filtro Linha 2 — Tipo */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                { id: 'all',            label: 'Todos os tipos' },
                { id: 'jurisprudência', label: 'Jurisprudência' },
                { id: 'doutrina',       label: 'Doutrina' },
                { id: 'súmula',         label: 'Súmula' },
                { id: 'lei',            label: 'Lei' },
              ].map(f => (
                <button key={f.id} onClick={() => setTipoFilter(f.id)} style={{
                  flexShrink: 0,
                  background: tipoFilter === f.id ? theme.gold + '18' : 'transparent',
                  color: tipoFilter === f.id ? theme.gold : theme.muted,
                  border: `1px solid ${tipoFilter === f.id ? theme.gold + '55' : theme.border}`,
                  borderRadius: 20, padding: '3px 14px', fontSize: 11, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontWeight: tipoFilter === f.id ? 600 : 400,
                  transition: 'all .15s',
                }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Filtro por tag — select compacto */}
            {todasAsTags.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <select
                  value={tagFilter || ''}
                  onChange={ev => setTagFilter(ev.target.value || null)}
                  style={{ width: '100%', background: tagFilter ? theme.gold + '12' : theme.raised, border: `1px solid ${tagFilter ? theme.gold + '55' : theme.border}`, borderRadius: 8, padding: '7px 12px', color: tagFilter ? theme.gold : theme.muted, fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', cursor: 'pointer', outline: 'none' }}>
                  <option value=''>Filtrar por tag...</option>
                  {todasAsTags.map(t => (
                    <option key={t} value={t}>#{t}</option>
                  ))}
                </select>
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
            <EntradaList entradas={filtered} onSelect={e => { setSelected(e); setView(VIEWS.DETAIL) }} onImportar={aba => { setImportarAba(aba || 'planilha'); setView(VIEWS.IMPORTAR) }}
              isAdmin={isAdmin}
              onDeleteMultiple={isAdmin ? async (ids) => {
                const OWNER = 'foxjessica01@gmail.com'
                if (session?.user?.email !== OWNER) { notify('Sem permissao para esta acao.', 'err'); return }
                const { error } = await supabase.from('entradas').delete().in('id', ids)
                if (error) notify('Erro ao excluir entradas.', 'err')
                else { notify(ids.length + ' entrada(s) removida(s).'); }
              } : null}/>
          </div>
        )
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: theme.bg }}>
      {!isMobile && SidebarEl}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar desktop */}
        {!isMobile && (
          <div style={{
            height: 56, background: theme.surface, borderBottom: `1px solid ${theme.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: '0 28px', gap: 12, flexShrink: 0,
          }}>
            {session ? (
              <>
                <SeletorTema compact />
                <div style={{ width: 1, height: 20, background: theme.border }} />
                <SinoNotificacoes
                  session={session}
                  onNavegar={v => setView(VIEWS[v.toUpperCase()] || VIEWS.HOME)}
                />
                <div style={{ width: 1, height: 20, background: theme.border }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {membro?.avatar_url ? (
                    <img src={membro.avatar_url} alt="avatar"
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${theme.border}` }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: theme.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: theme.fontTitle }}>
                        {(membro?.nome || session.user.email || 'JF').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span style={{ fontSize: 13, color: theme.text, fontFamily: 'Inter, sans-serif' }}>
                    {membro?.nome || session.user.email?.split('@')[0] || ''}
                  </span>
                </div>
              </>
            ) : (
              <button onClick={() => setShowLogin(true)} style={{
                background: theme.gold, color: '#fff', border: 'none',
                borderRadius: 8, padding: '7px 18px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Lock size={13} /> Acesso Interno
              </button>
            )}
          </div>
        )}
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

      {/* Modal — Limpar todo o repositório */}
      {confirmLimpar && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000099', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: theme.surface, border: '1px solid #5a1f1f', borderRadius: 14, padding: 32, maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 16px 48px #000000cc' }}>
            <div style={{ fontSize: 36, marginBottom: 14, color: '#c0504d' }}>⚠</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: theme.text, fontFamily: 'Playfair Display, serif', marginBottom: 10 }}>
              Limpar todo o repositório?
            </div>
            <div style={{ fontSize: 12, color: theme.muted, marginBottom: 24, lineHeight: 1.7 }}>
              Esta ação remove <span style={{ color: '#c0504d', fontWeight: 700 }}>{entradas.length} entrada(s)</span> permanentemente do banco de dados. Exporte um backup antes se necessário.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmLimpar(false)}
                style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontFamily: 'IBM Plex Mono, monospace' }}>
                Cancelar
              </button>
              <button onClick={limparTodoRepositorio} disabled={limpandoRepo}
                style={{ background: '#3b0f0f', border: '1px solid #c0504d', color: '#c0504d', borderRadius: 8, padding: '10px 22px', cursor: limpandoRepo ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>
                {limpandoRepo ? 'Limpando...' : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
