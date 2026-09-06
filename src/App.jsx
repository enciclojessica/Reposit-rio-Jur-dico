import { useEffect, useState, useCallback, Component } from 'react'
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
import IndiceRemissivo from './components/IndiceRemissivo'
import ComparadorTeses from './components/ComparadorTeses'
import PainelMetricas from './components/PainelMetricas'
import NovidadesApp from './components/NovidadesApp'
import { NOVIDADES_APP } from './data/novidadesApp'
import TourBoasVindas from './components/TourBoasVindas'
import Hoje from './components/Hoje'
import RedefinirSenha from './components/RedefinirSenha'
import EntradaPublica from './components/EntradaPublica'
import LegislacaoPublica from './components/LegislacaoPublica'
import PaginaLegal from './components/PaginaLegal'
import Landing from './components/Landing'
import { TERMOS_DE_USO, POLITICA_PRIVACIDADE } from './data/textosLegais'
import ImportacaoLote from './components/ImportacaoLote'
import ImportarLegislacao from './components/ImportarLegislacao'
import ImportarHub from './components/ImportarHub'
import Legislacao from './components/Legislacao'
import ExtrairPeticao from './components/ExtrairPeticao'
import InstalarApp from './components/InstalarApp'
import JurisprudenciaSearch from './components/JurisprudenciaSearch'
import Configuracoes from './components/Configuracoes'
import { exportarPlanilhaTeses } from './utils/exportarTeses'
import { Lock, LogOut, Download, Trash2, AlertTriangle } from 'lucide-react'
import SinoNotificacoes from './components/SinoNotificacoes'
import SeletorTema from './components/SeletorTema'
import { exportarRepositorioDocx } from './utils/exportarRepositorio'
import { AREAS, ROLE_COR, ROLE_LABEL } from './shared'
import { TagPill } from './components/TagInput'
import { VIEWS } from './data/views'
import Sidebar from './components/Sidebar'
import MobileHeader from './components/MobileHeader'
import MobileNav from './components/MobileNav'

class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  componentDidCatch(e, info) { console.error('EntradaDetail crash:', e, info) }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 24, color: '#991b1b', fontFamily: 'monospace', fontSize: 13, background: '#fee2e2', borderRadius: 10, margin: 16 }}>
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

// VIEWS importado de ./data/views.js


function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

async function gerarPlanilhaTeses() {
  // Busca todas as entradas do repositório e gera planilha XLSX
  const { data } = await supabase
    .from('entradas').select('area,tipo,tema,fonte,referencia,teses,tags,status').order('area')
  if (!data?.length) { alert('Nenhuma entrada no repositório.'); return }

  const XLSX = (await import('xlsx'))
  const linhas = []
  data.forEach(e => {
    const teses = Array.isArray(e.teses) ? e.teses : []
    if (teses.length === 0) {
      linhas.push({ Área: e.area, Tipo: e.tipo, Tema: e.tema, Fonte: e.fonte,
        Referência: e.referencia, Tese: '', Fundamento: '', Aplicação: '', Status: e.status,
        Tags: (e.tags||[]).join(', ') })
    } else {
      teses.forEach(t => {
        linhas.push({ Área: e.area, Tipo: e.tipo, Tema: e.tema, Fonte: e.fonte,
          Referência: e.referencia,
          Tese: t.tese_assunto || t.ratio_decidendi || '',
          Fundamento: t.fundamentacao_legal || '',
          Aplicação: t.aplicacao_pratica || '',
          Status: e.status, Tags: (e.tags||[]).join(', ') })
      })
    }
  })

  const ws = XLSX.utils.json_to_sheet(linhas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Teses')
  // Largura das colunas
  ws['!cols'] = [8,8,30,12,18,40,25,25,8,20].map(w => ({ wch: w }))
  XLSX.writeFile(wb, `themisjur_teses_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export default function App() {
  const { theme, mode, isDark, toggle } = useTheme()
  const [session, setSession]       = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [membro, setMembro]         = useState(null)   // { role, nome, email }
  const [membroLoading, setMembroLoading] = useState(false)
  const [entradas, setEntradas]     = useState([])
  const [favoritos, setFavoritos]   = useState(new Set())
  const [view, setView]             = useState(VIEWS.HOJE)
  const [areaFilter, setAreaFilter] = useState('all')
  const [tipoFilter, setTipoFilter]   = useState('all')
  const [importarAba, setImportarAba]   = useState('planilha')
  const [tagFilter, setTagFilter]   = useState(null)
  const [ordenacao, setOrdenacao]    = useState('data_desc')
  const [search, setSearch]         = useState('')
  const [modoSemantico, setModoSemantico] = useState(false)
  const [historicoBusca, setHistoricoBusca] = useState([])
  const [showHistorico, setShowHistorico] = useState(false)
  const [buscandoSem, setBuscandoSem]   = useState(false)
  const [resultadosSem, setResultadosSem] = useState(null) // null = não buscado ainda
  const [erroSem, setErroSem]           = useState('')
  const [selected, setSelected]     = useState(null)
  const [legislacaoPreFiltro, setLegislacaoPreFiltro] = useState(null)
  const [comparadorPrefilA, setComparadorPrefilA] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState(null)
  const [showLogin, setShowLogin]   = useState(false)
  const [prefillEntry, setPrefillEntry] = useState(null)
  const [temaAlertaPrefill, setTemaAlertaPrefill] = useState(null)
  const [recuperandoSenha, setRecuperandoSenha] = useState(false)
  const [entradaPublicaId, setEntradaPublicaId] = useState(null)
  const [legislacaoPublica, setLegislacaoPublica] = useState(null)
  const [paginaLegal, setPaginaLegal] = useState(null) // 'termos' | 'privacidade' | null
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
  const ultimaNovidade = NOVIDADES_APP[0]?.data
  const temNovidadeNaoVista = !!ultimaNovidade && (!membro?.novidades_vista_em || membro.novidades_vista_em.slice(0, 10) < ultimaNovidade)
  const isEditor = role === 'editor' || isAdmin
  const isMembro = !!membro
  // Recursos de IA opcionais (ex: Busca para Peça com IA): admin sempre tem
  // acesso; demais membros só se marcados manualmente como pago=true.
  const podeUsarIA = isAdmin || !!membro?.pago

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
    const leiParam = params.get('lei')
    const artParam = params.get('art')
    if (leiParam && artParam) {
      setLegislacaoPublica({ codigo: leiParam, numero: parseInt(artParam, 10) })
      window.history.replaceState({}, '', window.location.pathname)
    }
    const paginaParam = params.get('pagina')
    if (paginaParam === 'termos' || paginaParam === 'privacidade') {
      setPaginaLegal(paginaParam)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // ── Auth ───────────────────────────────────────────────────────────────
  useEffect(() => {
    // Se getSession() nunca responder (rede instável, service worker preso
    // numa versão antiga), a tela de "Carregando..." travava pra sempre —
    // sem limite de tempo, sem saída. Trava real vista em produção. Depois
    // de 8s sem resposta, segue sem sessão em vez de ficar preso.
    let resolvido = false
    const timeoutSeguranca = setTimeout(() => {
      if (!resolvido) { resolvido = true; setAuthLoading(false) }
    }, 8000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (resolvido) return
      resolvido = true
      clearTimeout(timeoutSeguranca)
      setSession(session)
      setAuthLoading(false)
    }).catch(() => {
      if (resolvido) return
      resolvido = true
      clearTimeout(timeoutSeguranca)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'PASSWORD_RECOVERY') setRecuperandoSenha(true)
      else if (s) setShowLogin(false)
    })
    return () => { subscription.unsubscribe(); clearTimeout(timeoutSeguranca) }
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
          } else {
            notify(json.error || 'Não foi possível aceitar o convite.', 'err')
            setConviteToken(null)
          }
        } catch {
          notify('Erro ao aceitar o convite. Tente novamente.', 'err')
          setConviteToken(null)
        }
        setAceitandoConvite(false)
      }

      setMembroLoading(false)
    }

    verificarMembro()
  }, [session, conviteToken])

  // ── Carregar favoritos do usuário logado ────────────────────────────────
  useEffect(() => {
    if (!session) { setFavoritos(new Set()); return }
    supabase.from('favoritos').select('entrada_id').eq('user_id', session.user.id)
      .then(({ data }) => setFavoritos(new Set((data || []).map(f => f.entrada_id))))
  }, [session])

  // ── Carregar histórico de busca, migrando o legado do localStorage ─────
  useEffect(() => {
    if (!session?.user?.id) { setHistoricoBusca([]); return }
    async function carregar() {
      const { data } = await supabase.from('historico_busca')
        .select('termo').eq('user_id', session.user.id)
        .order('buscado_em', { ascending: false }).limit(5)

      if (data && data.length > 0) {
        setHistoricoBusca(data.map(d => d.termo))
        return
      }

      // Sem histórico no Supabase ainda: migra o que tiver no localStorage.
      let legado = []
      try { legado = JSON.parse(localStorage.getItem('rj_busca_historico') || '[]') } catch {}
      if (legado.length > 0) {
        setHistoricoBusca(legado)
        await supabase.from('historico_busca').upsert(
          legado.map(termo => ({ user_id: session.user.id, termo })),
          { onConflict: 'user_id,termo' }
        )
        localStorage.removeItem('rj_busca_historico')
      }
    }
    carregar()
  }, [session?.user?.id])

  async function alternarFavorito(entradaId) {
    if (!session) return
    const jaFavoritado = favoritos.has(entradaId)
    if (jaFavoritado) {
      await supabase.from('favoritos').delete().eq('user_id', session.user.id).eq('entrada_id', entradaId)
      setFavoritos(prev => { const next = new Set(prev); next.delete(entradaId); return next })
    } else {
      await supabase.from('favoritos').insert({ user_id: session.user.id, entrada_id: entradaId })
      setFavoritos(prev => new Set(prev).add(entradaId))
    }
  }

  // ── Entradas (leitura pública) ─────────────────────────────────────────
  // Atalhos de teclado globais
  useEffect(() => {
    function handler(e) {
      const tag = document.activeElement?.tagName
      const editando = ['INPUT','TEXTAREA','SELECT'].includes(tag)
      if (editando) return

      // / — focar busca
      // Ctrl+G ou Ctrl+Shift+G: gerar planilha de teses global
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        gerarPlanilhaTeses()
        return
      }
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


  async function buscarSemantico() {
    if (!search.trim() || buscandoSem) return
    setBuscandoSem(true)
    setResultadosSem(null)
    setErroSem('')
    // Salvar no histórico
    setHistoricoBusca(prev => [search, ...prev.filter(h => h !== search)].slice(0, 5))
    if (session?.user?.id) {
      supabase.from('historico_busca').upsert(
        { user_id: session.user.id, termo: search, buscado_em: new Date().toISOString() },
        { onConflict: 'user_id,termo' }
      )
    }
    try {
      const { data: { session: sessaoAtual } } = await supabase.auth.getSession()
      if (!sessaoAtual) throw new Error('Sessão expirada. Faça login novamente.')

      const res = await fetch('/api/busca-semantica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessaoAtual.access_token,
        },
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
        (Array.isArray(e.teses) && e.teses.some(t => t.tese_assunto?.toLowerCase().includes(q)))
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
    const autor = membro?.nome || session.user.email
    if (view === VIEWS.ADD) {
      payload.historico = [{ data: new Date().toISOString(), descricao: `Criada por ${autor}` }]
      const { error } = await supabase.from('entradas').insert(payload)
      if (error) notify('Erro ao salvar.', 'err')
      else { notify('Entrada salva.'); setPrefillEntry(null); setView(VIEWS.HOME) }
    } else {
      const CAMPOS = { area: 'Área', tema: 'Tema', tipo: 'Tipo', fonte: 'Fonte', referencia: 'Referência', url: 'URL' }
      const alterados = Object.keys(CAMPOS).filter(c => (selected?.[c] || '') !== (entry[c] || '')).map(c => CAMPOS[c])
      if (JSON.stringify(selected?.teses || []) !== JSON.stringify(entry.teses || [])) alterados.push('Teses')
      const descricao = alterados.length ? `${alterados.join(', ')} alterado(s) por ${autor}` : `Editada por ${autor}`
      payload.historico = [...(selected?.historico || []), { data: new Date().toISOString(), descricao }]

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
    if (session?.user?.email !== OWNER) { notify('Apenas a proprietária pode limpar o repositório.', 'err'); return }
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

  // ── Loading states ─────────────────────────────────────────────────────
  // Vista pública de entrada compartilhada — sem autenticação
  if (entradaPublicaId) return (
    <EntradaPublica
      entradaId={entradaPublicaId}
      onFechar={() => setEntradaPublicaId(null)}
    />
  )

  if (legislacaoPublica) return (
    <LegislacaoPublica
      codigo={legislacaoPublica.codigo}
      numero={legislacaoPublica.numero}
      onFechar={() => setLegislacaoPublica(null)}
    />
  )

  if (paginaLegal) return (
    <PaginaLegal
      documento={paginaLegal === 'termos' ? TERMOS_DE_USO : POLITICA_PRIVACIDADE}
      onFechar={() => setPaginaLegal(null)}
    />
  )

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, color: theme.gold, fontFamily: 'Playfair Display, serif', fontSize: 18 }}>
      Carregando...
    </div>
  )

  if (recuperandoSenha) return (
    <RedefinirSenha onConcluido={() => { setRecuperandoSenha(false); notify('Senha atualizada. Você já pode continuar.') }} />
  )

  if (aceitandoConvite) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, color: theme.gold, fontFamily: 'Playfair Display, serif', fontSize: 16, flexDirection: 'column', gap: 16 }}>
      Ativando seu acesso…
    </div>
  )

  if (showLogin) return (
    <div>
      <button onClick={() => setShowLogin(false)} style={{
        position: 'fixed', top: 16, left: 16, zIndex: 200,
        background: theme.raised, border: `1px solid ${theme.border}`,
        borderRadius: 8, padding: '8px 14px', color: theme.muted,
        fontSize: 13, cursor: 'pointer', fontFamily: "Georgia, 'EB Garamond', serif",
      }}>← Voltar</button>
      <Auth conviteToken={conviteToken} />
    </div>
  )

  // Visitante sem conta, sem ter clicado em entrar ainda: página de
  // apresentação, não o shell do app. Os deep links (?entrada=, ?lei=,
  // ?pagina=) já foram tratados mais acima e nunca chegam aqui.
  if (!session && !showLogin) return (
    <Landing onEntrar={() => setShowLogin(true)} />
  )

  const sidebarItems = [
    { id: 'all', label: 'Todas as Áreas', count: entradas.length, color: theme.gold },
    ...Object.entries(AREAS).map(([k, v]) => ({
      id: k, label: k, color: v.color, icon: v.icon,
      count: k === 'Legislação' ? countLegislacao : entradas.filter(e => e.area === k).length,
    }))
  ]

  // ── Sidebar ────────────────────────────────────────────────────────────

  // MobileHeader e MobileNav extraídos para src/components/

  // ── Conteúdo ───────────────────────────────────────────────────────────
  function renderContent() {
    switch (view) {
      case VIEWS.MEMBROS:
        return isAdmin
          ? <div className="fade-up"><Membros session={session} /></div>
          : null

case VIEWS.JURISPRUDENCIA:
        return (
          <div className="fade-up" style={{ padding: '20px 24px' }}>
            <JurisprudenciaSearch session={session} theme={theme} />
          </div>
        )

      case VIEWS.CONFIG:
        return (
          <div className="fade-up">
            <Configuracoes session={session} membro={membro} entradas={entradas} />
          </div>
        )

      case VIEWS.LEG_VIEW:
        return <div className="fade-up"><Legislacao preFiltro={legislacaoPreFiltro} onPreFiltroConsumido={() => setLegislacaoPreFiltro(null)} /></div>



      case VIEWS.EXTRAIR:
      case VIEWS.LEGISLACAO:
      case VIEWS.IMPORTAR:
        return <ImportarHub key="importar-hub" session={session} initialTab={importarAba} onAbaChange={setImportarAba} setView={setView} theme={theme} onImportar={handleImportarPesquisa} isEditor={isEditor} todasEntradas={entradas} onAtualizar={loadEntradas} />

      case VIEWS.HOJE:
        return <div className="fade-up"><Hoje entradas={entradas} session={session}
          onSelectEntrada={e => { setSelected(e); setView(VIEWS.DETAIL) }}
        /></div>

      case VIEWS.DASHBOARD:
        return <div className="fade-up"><Dashboard entradas={entradas} countLegislacao={countLegislacao} session={session}
          onCriarAlerta={area => { setTemaAlertaPrefill(area); setView(VIEWS.ALERTAS) }}
          onSelecionarArea={area => { setAreaFilter(area); setTipoFilter('all'); setView(VIEWS.HOME) }}
          onIrParaLegislacao={() => setView(VIEWS.LEG_VIEW)}
        /></div>

      case VIEWS.INDICE:
        return <div className="fade-up"><IndiceRemissivo entradas={entradas}
          onSelecionarTag={tag => { setTagFilter(tag); setAreaFilter('all'); setTipoFilter('all'); setView(VIEWS.HOME) }}
        /></div>

      case VIEWS.FAVORITOS:
        return (
          <div className="fade-up">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>Favoritos</div>
              <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
                Entradas que você marcou manualmente, só sua conta vê essa lista
              </div>
            </div>
            <EntradaList entradas={entradas.filter(e => favoritos.has(e.id))}
              onSelect={e => { setSelected(e); setView(VIEWS.DETAIL) }}
              isAdmin={isAdmin}
              favoritos={favoritos}
              onAlternarFavorito={alternarFavorito}
            />
          </div>
        )

      case VIEWS.COMPARAR:
        return <div className="fade-up"><ComparadorTeses entradas={entradas} prefilA={comparadorPrefilA} /></div>

      case VIEWS.METRICAS:
        if (!isAdmin) return <div className="fade-up"><div style={{ color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>Sem permissão pra ver esta tela.</div></div>
        return <div className="fade-up"><PainelMetricas /></div>

      case VIEWS.NOVIDADES_APP:
        return <div className="fade-up"><NovidadesApp session={session} /></div>

      case VIEWS.EDITOR:
        return (
          <div className="fade-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <EditorPecas entradas={entradas} session={session}/>
          </div>
        )

      case VIEWS.ALERTAS:
        return (
          <div className="fade-up"><Alertas session={session} membro={membro}
            temaPrefill={temaAlertaPrefill} onTemaPrefillConsumido={() => setTemaAlertaPrefill(null)}
          /></div>
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
            <button onClick={() => setView(VIEWS.HOME)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 13, marginBottom: 16, fontFamily: "Georgia, 'EB Garamond', serif" }}>← Voltar à lista</button>
            <ErrorBoundary>
              <EntradaDetail
                entry={selected}
                session={session}
                todasEntradas={entradas}
                onSelecionarRelacionada={(e) => setSelected(e)}
                onClose={() => setView(VIEWS.HOME)}
                onDelete={isAdmin ? handleDelete : null}
                onEdit={isEditor ? () => setView(VIEWS.EDIT) : null}
                onDuplicar={isEditor ? handleDuplicar : null}
                readOnly={!isEditor}
                onStatusChange={(id, novoStatus) => {
                  setEntradas(prev => prev.map(e => e.id === id ? { ...e, status: novoStatus } : e))
                }}
                onAbrirArtigoLegislacao={(codigo, numero) => {
                  setLegislacaoPreFiltro({ codigo, numero })
                  setView(VIEWS.LEG_VIEW)
                }}
                favorito={favoritos.has(selected.id)}
                onAlternarFavorito={alternarFavorito}
                onComparar={(entrada) => { setComparadorPrefilA(entrada); setView(VIEWS.COMPARAR) }}
              />
            </ErrorBoundary>
          </div>
        ) : null

      case VIEWS.BUSCA:
        return <div className="fade-up"><BuscaPeca entradas={entradas} podeUsarIA={podeUsarIA}/></div>

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
                  style={{ paddingLeft: 38, paddingRight: modoSemantico ? 100 : 12, background: theme.raised, color: theme.text, borderColor: theme.border }}
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
                  style={{ width: '100%', background: tagFilter ? theme.gold + '12' : theme.raised, border: `1px solid ${tagFilter ? theme.gold + '55' : theme.border}`, borderRadius: 8, padding: '7px 12px', color: tagFilter ? theme.gold : theme.muted, fontSize: 12, fontFamily: "Georgia, 'EB Garamond', serif", cursor: 'pointer', outline: 'none' }}>
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
              favoritos={favoritos}
              onAlternarFavorito={alternarFavorito}
              onDeleteMultiple={isAdmin ? async (ids) => {
                const OWNER = 'foxjessica01@gmail.com'
                if (session?.user?.email !== OWNER) { notify('Sem permissão para esta ação.', 'err'); return }
                const { error } = await supabase.from('entradas').delete().in('id', ids)
                if (error) notify('Erro ao excluir entradas.', 'err')
                else { notify(ids.length + ' entrada(s) removida(s).'); }
              } : null}/>
          </div>
        )
    }
  }

  return (
    <>
    {membro && !membro.tour_visto && (
      <TourBoasVindas onFechar={async () => {
        setMembro(prev => ({ ...prev, tour_visto: true }))
        await supabase.from('membros').update({ tour_visto: true }).eq('user_id', session.user.id)
      }} />
    )}
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: theme.bg }}>
      {!isMobile && (
        <Sidebar
          theme={theme} view={view} setView={setView}
          setAreaFilter={setAreaFilter} setTipoFilter={setTipoFilter}
          isAdmin={isAdmin} isEditor={isEditor} setPrefillEntry={setPrefillEntry}
          temNovidadeNaoVista={temNovidadeNaoVista}
        />
      )}
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
                {isOwner && entradas.length > 0 && (
                  <button onClick={exportarTesesPlanilha} disabled={exportandoTeses} title="Exportar planilha"
                    style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', color: exportandoTeses ? theme.muted : theme.text, cursor: exportandoTeses ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: "Georgia, 'EB Garamond', serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Download size={13} /> {exportandoTeses ? 'Exportando...' : 'Exportar'}
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => setConfirmLimpar(true)} title="Limpar repositório"
                    style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', color: theme.error, cursor: 'pointer', fontSize: 12, fontFamily: "Georgia, 'EB Garamond', serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Trash2 size={13} />
                  </button>
                )}
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
                  <div>
                    <div style={{ fontSize: 13, color: theme.text, fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>
                      {membro?.nome || session.user.email?.split('@')[0] || ''}
                    </div>
                    {role && (
                      <div style={{ fontSize: 9, color: ROLE_COR[role], textTransform: 'uppercase', letterSpacing: 1 }}>
                        {ROLE_LABEL[role]}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => supabase.auth.signOut()} title="Sair"
                  style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 12, fontFamily: "Georgia, 'EB Garamond', serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LogOut size={14} /> Sair
                </button>
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
        {isMobile && (
          <MobileHeader
            theme={theme} role={role} session={session} membro={membro} setShowLogin={setShowLogin}
            setAreaFilter={setAreaFilter} setTipoFilter={setTipoFilter} setView={setView}
          />
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 16px 80px' : 28 }}>
          {renderContent()}
        </div>
        {isMobile && (
          <MobileNav
            theme={theme} view={view} setView={setView}
            maisAberto={maisAberto} setMaisAberto={setMaisAberto}
            isEditor={isEditor} isAdmin={isAdmin} session={session}
            entradas={entradas} isOwner={isOwner} exportarTesesPlanilha={exportarTesesPlanilha}
            temNovidadeNaoVista={temNovidadeNaoVista}
          />
        )}
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
            <div style={{ marginBottom: 14, color: theme.penal, display: 'flex', justifyContent: 'center' }}><AlertTriangle size={32} /></div>
            <div style={{ fontSize: 17, fontWeight: 700, color: theme.text, fontFamily: 'Playfair Display, serif', marginBottom: 10 }}>
              Limpar todo o repositório?
            </div>
            <div style={{ fontSize: 12, color: theme.muted, marginBottom: 24, lineHeight: 1.7 }}>
              Esta ação remove <span style={{ color: theme.penal, fontWeight: 700 }}>{entradas.length} entrada(s)</span> permanentemente do banco de dados. Exporte um backup antes se necessário.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmLimpar(false)}
                style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontFamily: "Georgia, 'EB Garamond', serif" }}>
                Cancelar
              </button>
              <button onClick={limparTodoRepositorio} disabled={limpandoRepo}
                style={{ background: (mode === 'dark' ? '#2a0f10' : '#fff0f0'), border: `1px solid ${theme.penal}`, color: theme.penal, borderRadius: 8, padding: '10px 22px', cursor: limpandoRepo ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: "Georgia, 'EB Garamond', serif" }}>
                {limpandoRepo ? 'Limpando...' : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
