import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import Auth from './components/Auth'
import EntradaList from './components/EntradaList'
import EntradaDetail from './components/EntradaDetail'
import EntradaForm from './components/EntradaForm'
import BuscaPeca from './components/BuscaPeca'
import { AREAS } from './shared'

const VIEWS = { HOME: 'home', ADD: 'add', EDIT: 'edit', DETAIL: 'detail', BUSCA: 'busca' }

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [entradas, setEntradas] = useState([])
  const [view, setView] = useState(VIEWS.HOME)
  const [areaFilter, setAreaFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // Load entradas
  const loadEntradas = useCallback(async () => {
    const { data, error } = await supabase
      .from('entradas')
      .select('*')
      .order('criado_em', { ascending: false })
    if (!error && data) setEntradas(data)
  }, [])

  useEffect(() => {
    if (!session) return
    loadEntradas()

    // Realtime
    const channel = supabase
      .channel('entradas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entradas' }, loadEntradas)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [session, loadEntradas])

  function notify(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Filtered
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

  // CRUD
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
      else { notify('Entrada salva com sucesso.'); setView(VIEWS.HOME) }
    } else if (view === VIEWS.EDIT) {
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

  const isMobile = window.innerWidth < 768

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f1a', color: '#c9a452', fontFamily: 'Playfair Display, serif', fontSize: 18 }}>
        Carregando...
      </div>
    )
  }

  if (!session) return <Auth />

  // ── Conteúdo principal por view ────────────────────────────────────────
  function renderContent() {
    switch (view) {
      case VIEWS.ADD:
        return (
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setView(VIEWS.HOME)} style={{ background: 'none', border: 'none', color: '#6b7fa3', cursor: 'pointer', fontSize: 20 }}>←</button>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#c9a452', fontFamily: 'Playfair Display, serif' }}>Nova Entrada</div>
            </div>
            <EntradaForm onSave={handleSave} onCancel={() => setView(VIEWS.HOME)} loading={saving} />
          </div>
        )
      case VIEWS.EDIT:
        return (
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setView(VIEWS.DETAIL)} style={{ background: 'none', border: 'none', color: '#6b7fa3', cursor: 'pointer', fontSize: 20 }}>←</button>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#c9a452', fontFamily: 'Playfair Display, serif' }}>Editar Entrada</div>
            </div>
            <EntradaForm initial={selected} onSave={handleSave} onCancel={() => setView(VIEWS.DETAIL)} loading={saving} />
          </div>
        )
      case VIEWS.DETAIL:
        return selected ? (
          <div className="fade-up">
            <button onClick={() => setView(VIEWS.HOME)} style={{ background: 'none', border: 'none', color: '#6b7fa3', cursor: 'pointer', fontSize: 13, marginBottom: 16, fontFamily: 'IBM Plex Mono, monospace' }}>
              ← Voltar à lista
            </button>
            <EntradaDetail
              entry={selected}
              onClose={() => setView(VIEWS.HOME)}
              onDelete={handleDelete}
              onEdit={() => setView(VIEWS.EDIT)}
            />
          </div>
        ) : null
      case VIEWS.BUSCA:
        return (
          <div className="fade-up">
            <BuscaPeca entradas={entradas} />
          </div>
        )
      default: // HOME
        return (
          <div>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7fa3', fontSize: 16 }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por tema, fonte, referência..."
                style={{ paddingLeft: 38 }}
              />
            </div>

            {/* Area tabs */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
              {[{ id: 'all', label: 'Todas', color: '#c9a452' }, ...Object.entries(AREAS).map(([k, v]) => ({ id: k, label: k, color: v.color, icon: v.icon }))].map(a => (
                <button
                  key={a.id}
                  onClick={() => setAreaFilter(a.id)}
                  style={{
                    flexShrink: 0,
                    background: areaFilter === a.id ? a.color + '22' : '#1a2236',
                    color: areaFilter === a.id ? a.color : '#6b7fa3',
                    border: `1px solid ${areaFilter === a.id ? a.color + '44' : '#1e2d45'}`,
                    borderRadius: 20,
                    padding: '5px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'IBM Plex Mono, monospace',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {a.icon ? `${a.icon} ` : ''}{a.label}
                  {' '}
                  <span style={{ opacity: 0.6, fontSize: 10 }}>
                    {a.id === 'all' ? entradas.length : entradas.filter(e => e.area === a.id).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Count */}
            <div style={{ fontSize: 11, color: '#6b7fa3', marginBottom: 12 }}>
              {filtered.length} entrada(s) encontrada(s)
            </div>

            <EntradaList
              entradas={filtered}
              onSelect={e => { setSelected(e); setView(VIEWS.DETAIL) }}
              search=""
            />
          </div>
        )
    }
  }

  // ── Layout Desktop ──────────────────────────────────────────────────────
  const desktopSidebar = (
    <div style={{
      width: 240, background: '#111827', borderRight: '1px solid #1e2d45',
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh',
    }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #1e2d45' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#c9a452', fontFamily: 'Playfair Display, serif' }}>📚 Repositório</div>
        <div style={{ fontSize: 10, color: '#6b7fa3', marginTop: 2 }}>Jurídico · {entradas.length} entradas</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        <div style={{ padding: '4px 12px 8px', fontSize: 9, color: '#6b7fa3', textTransform: 'uppercase', letterSpacing: 2 }}>Áreas</div>
        {[{ id: 'all', label: 'Todas as Áreas', color: '#c9a452' }, ...Object.entries(AREAS).map(([k, v]) => ({ id: k, label: k, color: v.color, icon: v.icon }))].map(n => (
          <button key={n.id}
            onClick={() => { setAreaFilter(n.id); setView(VIEWS.HOME) }}
            style={{
              width: '100%', background: areaFilter === n.id && view === VIEWS.HOME ? '#1a2236' : 'none',
              border: 'none', borderLeft: `2px solid ${areaFilter === n.id && view === VIEWS.HOME ? n.color : 'transparent'}`,
              padding: '9px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', color: areaFilter === n.id && view === VIEWS.HOME ? '#f0f4ff' : '#6b7fa3',
              fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', textAlign: 'left',
            }}
          >
            <span>{n.icon ? `${n.icon} ` : ''}{n.label}</span>
            <span style={{
              background: n.color + '33', color: n.color,
              borderRadius: 10, padding: '1px 7px', fontSize: 10,
            }}>
              {n.id === 'all' ? entradas.length : entradas.filter(e => e.area === n.id).length}
            </span>
          </button>
        ))}
        <div style={{ margin: '12px 0', borderTop: '1px solid #1e2d45' }} />
        <div style={{ padding: '4px 12px 8px', fontSize: 9, color: '#6b7fa3', textTransform: 'uppercase', letterSpacing: 2 }}>Ferramentas</div>
        {[{ id: VIEWS.ADD, label: '+ Nova Entrada' }, { id: VIEWS.BUSCA, label: '✦ Busca para Peça' }].map(n => (
          <button key={n.id} onClick={() => setView(n.id)}
            style={{
              width: '100%', background: view === n.id ? '#1a2236' : 'none',
              border: 'none', borderLeft: `2px solid ${view === n.id ? '#c9a452' : 'transparent'}`,
              padding: '9px 20px', textAlign: 'left', cursor: 'pointer',
              color: view === n.id ? '#c9a452' : '#6b7fa3', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace',
            }}
          >{n.label}</button>
        ))}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1e2d45' }}>
        <div style={{ fontSize: 10, color: '#6b7fa3', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {session.user.email}
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{
          width: '100%', background: '#1a2236', border: '1px solid #1e2d45',
          borderRadius: 6, padding: '7px', color: '#6b7fa3',
          fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
        }}>Sair</button>
      </div>
    </div>
  )

  // ── Layout Mobile ───────────────────────────────────────────────────────
  const mobileBottomNav = (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#111827', borderTop: '1px solid #1e2d45',
      display: 'flex', zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {[
        { v: VIEWS.HOME, label: 'Início', icon: '🏠' },
        { v: VIEWS.BUSCA, label: 'Busca IA', icon: '✦' },
        { v: VIEWS.ADD, label: 'Adicionar', icon: '+' },
      ].map(item => (
        <button key={item.v} onClick={() => setView(item.v)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 4px', background: 'none', border: 'none',
            color: view === item.v ? '#c9a452' : '#6b7fa3', cursor: 'pointer',
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 11,
          }}
        >
          <span style={{ fontSize: item.icon === '+' ? 22 : 18, lineHeight: 1, marginBottom: 2 }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar — só desktop */}
      <div style={{ display: isMobile ? 'none' : 'flex' }}>
        {desktopSidebar}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header mobile */}
        {isMobile && (
          <div style={{
            background: '#111827', borderBottom: '1px solid #1e2d45',
            padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 'calc(12px + env(safe-area-inset-top))',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#c9a452', fontFamily: 'Playfair Display, serif' }}>
              📚 Repositório Jurídico
            </div>
            <div style={{ fontSize: 10, color: '#6b7fa3' }}>{entradas.length} entradas</div>
          </div>
        )}

        {/* Content */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: isMobile ? '16px 16px 80px' : '28px',
        }}>
          {renderContent()}
        </div>

        {/* Bottom nav mobile */}
        {isMobile && mobileBottomNav}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: isMobile ? 80 : 24, right: 16,
          background: toast.type === 'err' ? '#3b0f0f' : '#0f2b1a',
          border: `1px solid ${toast.type === 'err' ? '#f87171' : '#10b981'}`,
          borderRadius: 8, padding: '10px 16px',
          color: '#f0f4ff', fontSize: 13,
          boxShadow: '0 8px 32px #00000088',
          zIndex: 100,
          animation: 'fadeUp 0.2s ease',
          maxWidth: 320,
        }}>
          {toast.type === 'err' ? '✕ ' : '✓ '}{toast.msg}
        </div>
      )}
    </div>
  )
}
