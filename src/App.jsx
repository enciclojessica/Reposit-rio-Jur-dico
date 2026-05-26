import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import { useTheme } from './theme'
import Auth from './components/Auth'
import EntradaList from './components/EntradaList'
import EntradaDetail from './components/EntradaDetail'
import EntradaForm from './components/EntradaForm'
import BuscaPeca from './components/BuscaPeca'
import PesquisaJuri from './components/PesquisaJuri'
import Membros from './components/Membros'
import Alertas from './components/Alertas'
import EditorPecas from './components/EditorPecas'
import Dashboard from './components/Dashboard'
import { AREAS } from './shared'
import { TagPill } from './components/TagInput'

const VIEWS = {
  ALERTAS: 'alertas',
  EDITOR:     'editor',
  DASHBOARD: 'dashboard',
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
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState(null)
  const [showLogin, setShowLogin]   = useState(false)
  const [prefillEntry, setPrefillEntry] = useState(null)
  const [conviteToken, setConviteToken] = useState(null)
  const [aceitandoConvite, setAceitandoConvite] = useState(false)
  const isMobile = useIsMobile()

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
      // Limpar da URL sem reload
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

  function notify(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const todasAsTags = [...new Set(entradas.flatMap(e => e.tags || []))].sort()

  const filtered = entradas.filter(e => {
    const areaOk = areaFilter === 'all' || e.area === areaFilter
    if (!areaOk) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.tema?.toLowerCase().includes(q) ||
      e.fonte?.toLowerCase().includes(q) ||
      e.referencia?.toLowerCase().includes(q) ||
      e.teses?.some(t => t.tese_assunto?.toLowerCase().includes(q))
    )
  })

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
      {/* Logo */}
      <div style={{ padding: 16, borderBottom: `1px solid ${theme.borderGold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: theme.logoBg, borderRadius: 8, padding: '8px 12px 6px', boxShadow: theme.shadow, border: mode === 'light' ? `1px solid ${theme.border}` : 'none' }}>
          <img src="/logo.png" alt="Farias Fusquiani" style={{ height: 52, width: 'auto', display: 'block' }}/>
        </div>
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
          { v: VIEWS.DASHBOARD, label: '◈ Dashboard' },
        { v: VIEWS.PESQUISA, label: '⌕ Pesquisar Jurisprudência' },
          { v: VIEWS.BUSCA,    label: '✦ Busca para Peça' },
        { v: VIEWS.EDITOR,   label: '✎ Editor de Peças' },
        { v: VIEWS.ALERTAS,  label: '🔔 Alertas' },
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
          <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 0 0 8px' }}>
            {mode === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
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
        <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>{mode === 'dark' ? '☀️' : '🌙'}</button>
        {session
          ? <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>Sair</button>
          : <button onClick={() => setShowLogin(true)} style={{ background: `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`, border: 'none', borderRadius: 6, padding: '5px 10px', color: '#0b0f1a', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>🔒 Login</button>
        }
      </div>
    </div>
  )

  // ── Mobile bottom nav ──────────────────────────────────────────────────
  const MobileNav = () => (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: theme.surface, borderTop: `1px solid ${theme.borderGold}`, display: 'flex', zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {[
        { v: VIEWS.HOME,     label: 'Início',    icon: '🏠' },
        { v: VIEWS.PESQUISA, label: 'Pesquisar', icon: '⌕' },
        { v: VIEWS.BUSCA,    label: 'Busca IA',  icon: '✦' },
        { v: VIEWS.DASHBOARD, label: 'Dashboard', icon: '◈' },
        { v: VIEWS.ALERTAS,  label: 'Alertas',   icon: '🔔' },
        { v: VIEWS.EDITOR,   label: 'Editor',    icon: '✎' },
        ...(isEditor ? [{ v: VIEWS.ADD, label: 'Adicionar', icon: '+' }] : []),
        ...(isAdmin  ? [{ v: VIEWS.MEMBROS, label: 'Membros', icon: '👥' }] : []),
      ].map(item => (
        <button key={item.v} onClick={() => setView(item.v)}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px', background: 'none', border: 'none', color: view === item.v ? theme.gold : theme.muted, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, borderTop: view === item.v ? `2px solid ${theme.gold}` : '2px solid transparent' }}>
          <span style={{ fontSize: item.icon === '+' ? 20 : 16, lineHeight: 1, marginBottom: 2 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
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
              readOnly={!isEditor}
            />
          </div>
        ) : null

      case VIEWS.BUSCA:
        return <div className="fade-up"><BuscaPeca entradas={entradas}/></div>

      default:
        return (
          <div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.muted }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por tema, fonte, referência..." style={{ paddingLeft: 38 }}/>
            </div>
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
            <div style={{ fontSize: 11, color: theme.muted, marginBottom: 12 }}>{filtered.length} entrada(s){tagFilter ? ` com tag #${tagFilter}` : ''}</div>
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

      {toast && (
        <div style={{ position: 'fixed', bottom: isMobile ? 80 : 24, right: 16, background: toast.type === 'err' ? theme.toastErr : theme.toastOk, border: `1px solid ${toast.type === 'err' ? theme.error : theme.success}`, borderRadius: 8, padding: '10px 16px', color: theme.text, fontSize: 13, boxShadow: theme.shadow, zIndex: 100, maxWidth: 320 }}>
          {toast.type === 'err' ? '✕ ' : '✓ '}{toast.msg}
        </div>
      )}
    </div>
  )
}
