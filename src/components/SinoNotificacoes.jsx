import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

const TIPO_ICONE = { alerta: '🔔', informativo: '📋', sistema: 'ℹ', auto: '✦' }
const TIPO_COR   = { alerta: '#f59e0b', informativo: '#10b981', sistema: '#6b7fa3', auto: '#c9a452' }

export default function SinoNotificacoes({ session, onNavegar }) {
  const { theme, mode } = useTheme()
  const [notifs, setNotifs]     = useState([])
  const [aberto, setAberto]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const painel = useRef()

  const naoLidas = notifs.filter(n => !n.lida).length

  async function getToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  }

  async function carregar() {
    if (!session) return
    setLoading(true)
    const token = await getToken()
    const res   = await fetch('/api/notificacoes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const json  = await res.json()
    setNotifs(json.notificacoes || [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    // Polling a cada 2 min quando logado
    if (!session) return
    const interval = setInterval(carregar, 120_000)
    return () => clearInterval(interval)
  }, [session])

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClick(e) {
      if (painel.current && !painel.current.contains(e.target)) setAberto(false)
    }
    if (aberto) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [aberto])

  // Realtime via Supabase
  useEffect(() => {
    if (!session) return
    const channel = supabase.channel('notificacoes-realtime')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notificacoes',
        filter: `user_id=eq.${session.user.id}`
      }, payload => {
        setNotifs(prev => [payload.new, ...prev])
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [session])

  async function marcarLida(id) {
    const token = await getToken()
    await fetch('/api/notificacoes', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
  }

  async function marcarTodasLidas() {
    const token = await getToken()
    await fetch('/api/notificacoes', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ todas: true }),
    })
    setNotifs(prev => prev.map(n => ({ ...n, lida: true })))
  }

  async function apagar(id) {
    const token = await getToken()
    await fetch('/api/notificacoes', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  function handleClick(notif) {
    marcarLida(notif.id)
    if (notif.tipo === 'alerta' && onNavegar)    onNavegar('alertas')
    if (notif.tipo === 'informativo' && onNavegar) onNavegar('informativos')
    setAberto(false)
  }

  function tempoRelativo(iso) {
    const diff = Date.now() - new Date(iso).getTime()
    const min  = Math.floor(diff / 60000)
    if (min < 1)  return 'agora'
    if (min < 60) return `${min}min atrás`
    const h = Math.floor(min / 60)
    if (h < 24)   return `${h}h atrás`
    const d = Math.floor(h / 24)
    return `${d}d atrás`
  }

  if (!session) return null

  return (
    <div ref={painel} style={{ position: 'relative' }}>
      {/* Botão do sino */}
      <button
        onClick={() => { setAberto(a => !a); if (!aberto) carregar() }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          position: 'relative', padding: '4px 6px', display: 'flex', alignItems: 'center',
        }}
        title="Notificações"
      >
        <span style={{ fontSize: 20 }}>🔔</span>
        {naoLidas > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: '#ef4444', color: '#fff',
            borderRadius: '50%', width: 16, height: 16,
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'IBM Plex Mono, monospace',
            border: `2px solid ${theme.surface}`,
          }}>
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {/* Painel dropdown */}
      {aberto && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 340, maxHeight: 480,
          background: theme.surface, border: `1px solid ${theme.borderGold}`,
          borderRadius: 14, boxShadow: theme.shadow,
          display: 'flex', flexDirection: 'column',
          zIndex: 300, overflow: 'hidden',
          animation: 'fadeUp .15s ease',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, fontFamily: 'IBM Plex Mono, monospace' }}>
              Notificações {naoLidas > 0 && <span style={{ color: '#ef4444', fontSize: 11 }}>· {naoLidas} nova{naoLidas !== 1 ? 's' : ''}</span>}
            </div>
            {naoLidas > 0 && (
              <button onClick={marcarTodasLidas}
                style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && notifs.length === 0 && (
              <div style={{ padding: '32px 0', textAlign: 'center', color: theme.muted, fontSize: 12 }}>Carregando...</div>
            )}
            {!loading && notifs.length === 0 && (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>🔔</div>
                <div style={{ fontSize: 13, color: theme.muted }}>Nenhuma notificação ainda.</div>
              </div>
            )}
            {notifs.map(n => {
              const cor  = TIPO_COR[n.tipo]  || theme.muted
              const icon = TIPO_ICONE[n.tipo] || '•'
              return (
                <div key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${theme.border}`,
                    background: n.lida ? 'transparent' : (mode === 'dark' ? cor + '0a' : cor + '08'),
                    cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.background = theme.raised}
                  onMouseLeave={ev => ev.currentTarget.style.background = n.lida ? 'transparent' : (mode === 'dark' ? cor + '0a' : cor + '08')}
                >
                  {/* Ícone + indicador não-lida */}
                  <div style={{ position: 'relative', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    {!n.lida && (
                      <div style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: `1px solid ${theme.surface}` }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: n.lida ? 400 : 700, color: theme.text, marginBottom: 2, lineHeight: 1.4 }}>
                      {n.titulo}
                    </div>
                    {n.corpo && (
                      <div style={{ fontSize: 11, color: theme.muted, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.corpo}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: theme.muted, marginTop: 4, opacity: 0.7 }}>
                      {tempoRelativo(n.criado_em)}
                    </div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); apagar(n.id) }}
                    style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 14, padding: '0 0 0 4px', flexShrink: 0, opacity: 0.5 }}
                    title="Apagar"
                  >×</button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
