import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

const TRIBUNAIS = [
  { id: 'todos', label: 'Todos os tribunais' },
  { id: 'STJ',   label: 'STJ' },
  { id: 'STF',   label: 'STF' },
  { id: 'TST',   label: 'TST' },
  { id: 'TRF',   label: 'TRFs' },
  { id: 'TJSP',  label: 'TJSP' },
  { id: 'TJRJ',  label: 'TJRJ' },
]

export default function Alertas({ session }) {
  const { theme, mode } = useTheme()
  const [alertas, setAlertas]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [tema, setTema]         = useState('')
  const [tribunal, setTribunal] = useState('todos')
  const [email, setEmail]       = useState(session?.user?.email || '')
  const [salvando, setSalvando] = useState(false)
  const [toast, setToast]       = useState(null)

  function notify(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function getToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  }

  async function carregar() {
    setLoading(true)
    const token = await getToken()
    const res = await fetch('/api/alertas', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const json = await res.json()
    setAlertas(json.alertas || [])
    setLoading(false)
  }

  useEffect(() => { if (session) carregar() }, [session])

  async function adicionar() {
    if (!tema.trim() || !email.trim()) return
    setSalvando(true)
    const token = await getToken()
    const res = await fetch('/api/alertas', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema: tema.trim(), tribunal, email: email.trim() }),
    })
    const json = await res.json()
    if (json.error) notify(json.error, 'err')
    else { notify('Alerta cadastrado.'); setTema(''); carregar() }
    setSalvando(false)
  }

  async function remover(id) {
    const token = await getToken()
    await fetch('/api/alertas', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    notify('Alerta removido.')
    carregar()
  }

  async function toggleAtivo(id, ativo) {
    const token = await getToken()
    await fetch('/api/alertas', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo }),
    })
    carregar()
  }

  const card = {
    background: theme.cardBg, border: `1px solid ${theme.border}`,
    borderRadius: 12, padding: 20, marginBottom: 16,
  }

  return (
    <div style={{ paddingBottom: 40, maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Alertas Jurisprudenciais
        </div>
        <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.6 }}>
          Cadastre temas que você monitora. Toda segunda-feira às 8h, o sistema pesquisa novas decisões e envia um resumo por e-mail.
        </div>
      </div>

      {/* ── Novo alerta ────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontFamily: 'IBM Plex Mono, monospace' }}>
          Novo Alerta
        </div>

        <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Tema a monitorar</div>
        <input
          value={tema}
          onChange={e => setTema(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adicionar()}
          placeholder="Ex: responsabilidade civil bancária, dano moral plano de saúde, crime informático"
          style={{ marginBottom: 12 }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Tribunal</div>
            <select value={tribunal} onChange={e => setTribunal(e.target.value)}>
              {TRIBUNAIS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Receber em</div>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <button onClick={adicionar} disabled={salvando || !tema.trim() || !email.trim()}
          style={{
            background: salvando || !tema.trim() || !email.trim() ? theme.border : theme.gold,
            color: salvando || !tema.trim() || !email.trim() ? theme.muted : '#0b0f1a',
            border: 'none', borderRadius: 8, padding: '10px 20px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'IBM Plex Mono, monospace',
          }}>
          {salvando ? 'Salvando...' : '+ Cadastrar Alerta'}
        </button>
      </div>

      {/* ── Lista de alertas ───────────────────────────────────────────── */}
      <div style={card}>
        <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontFamily: 'IBM Plex Mono, monospace' }}>
          Alertas Ativos ({alertas.filter(a => a.ativo).length} / {alertas.length})
        </div>

        {loading ? (
          <div style={{ color: theme.muted, fontSize: 13 }}>Carregando...</div>
        ) : alertas.length === 0 ? (
          <div style={{ color: theme.muted, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>🔔</div>
            Nenhum alerta cadastrado ainda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alertas.map(a => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', gap: 12,
                background: theme.raised, border: `1px solid ${a.ativo ? theme.gold + '33' : theme.border}`,
                borderLeft: `3px solid ${a.ativo ? theme.gold : theme.border}`,
                borderRadius: 8, opacity: a.ativo ? 1 : 0.55, transition: 'all .15s',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: theme.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.tema}
                  </div>
                  <div style={{ fontSize: 11, color: theme.muted, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span>{a.tribunal === 'todos' ? 'Todos os tribunais' : a.tribunal}</span>
                    <span>·</span>
                    <span>{a.email}</span>
                    {a.ultima_verificacao && (
                      <>
                        <span>·</span>
                        <span>Última verificação: {new Date(a.ultima_verificacao).toLocaleDateString('pt-BR')}</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {/* Toggle ativo/inativo */}
                  <button
                    onClick={() => toggleAtivo(a.id, !a.ativo)}
                    title={a.ativo ? 'Pausar alerta' : 'Reativar alerta'}
                    style={{
                      background: a.ativo ? theme.gold + '22' : theme.border + '44',
                      border: `1px solid ${a.ativo ? theme.gold + '44' : theme.border}`,
                      color: a.ativo ? theme.gold : theme.muted,
                      borderRadius: 6, padding: '5px 10px', fontSize: 11,
                      cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
                    }}>
                    {a.ativo ? '⏸ Pausar' : '▶ Ativar'}
                  </button>

                  {/* Remover */}
                  <button onClick={() => remover(a.id)}
                    title="Remover alerta"
                    style={{
                      background: 'none', border: 'none',
                      color: theme.error, cursor: 'pointer',
                      fontSize: 18, lineHeight: 1, padding: '2px 4px',
                    }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{
        background: mode === 'dark' ? '#0f1a2e' : '#f0f7ff',
        border: `1px solid ${theme.border}`, borderRadius: 10,
        padding: 14, fontSize: 12, color: theme.muted, lineHeight: 1.7,
      }}>
        <strong style={{ color: theme.text }}>Como funciona:</strong> toda segunda-feira às 8h, o sistema pesquisa automaticamente novas decisões do STJ, STF e demais tribunais para cada tema cadastrado.
        Os resultados chegam por e-mail com link direto para a decisão no portal oficial do tribunal.
        Você pode então importar as decisões relevantes diretamente para o repositório.
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: toast.type === 'err' ? theme.toastErr : theme.toastOk,
          border: `1px solid ${toast.type === 'err' ? theme.error : theme.success}`,
          borderRadius: 8, padding: '10px 16px', fontSize: 13, color: theme.text,
          boxShadow: theme.shadow, zIndex: 100,
        }}>
          {toast.type === 'err' ? '✕ ' : '✓ '}{toast.msg}
        </div>
      )}
    </div>
  )
}
