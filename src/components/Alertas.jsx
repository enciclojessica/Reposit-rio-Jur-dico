import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { Bell, BellOff, Trash2, RefreshCw, Clock, CheckCircle } from 'lucide-react'

// ── Radar de Atualizações ─────────────────────────────────────────────────────
// Lê entradas criadas nos últimos 7 dias no próprio banco de dados.
// O cron semanal lê receber_boletim: true para disparar e-mails.

export default function Alertas({ session, membro }) {
  const { theme, mode } = useTheme()

  // Estado de alertas (monitoramento externo, mantido para compatibilidade)
  const [alertas, setAlertas]       = useState([])
  const [loadingAlertas, setLoadingAlertas] = useState(true)
  const [tema, setTema]             = useState('')
  const [tribunal, setTribunal]     = useState('todos')
  const [email, setEmail]           = useState(session?.user?.email || '')
  const [salvando, setSalvando]     = useState(false)

  // Estado do radar — entradas recentes do banco interno
  const [recentes, setRecentes]     = useState([])
  const [loadingRecentes, setLoadingRecentes] = useState(true)
  const [abaAtiva, setAbaAtiva]     = useState('radar')

  // Boletim
  const [boletim, setBoletim]       = useState(membro?.receber_boletim !== false)
  const [salvandoBoletim, setSalvandoBoletim] = useState(false)

  const [toast, setToast]           = useState(null)

  function notify(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Carregar entradas dos últimos 7 dias ────────────────────────────────
  useEffect(() => {
    async function carregarRecentes() {
      setLoadingRecentes(true)
      const seteDiasAtras = new Date()
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

      const { data, error } = await supabase
        .from('entradas')
        .select('id, area, tipo, tema, fonte, referencia, criado_em, teses')
        .gte('criado_em', seteDiasAtras.toISOString())
        .order('criado_em', { ascending: false })
        .limit(50)

      if (!error) setRecentes(data || [])
      setLoadingRecentes(false)
    }
    carregarRecentes()
  }, [])

  // ── Carregar alertas externos ───────────────────────────────────────────
  async function carregarAlertas() {
    if (!session) return
    setLoadingAlertas(true)
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    const res = await fetch('/api/alertas', { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    setAlertas(json.alertas || [])
    setLoadingAlertas(false)
  }

  useEffect(() => { if (session) carregarAlertas() }, [session])

  // ── Ações de alertas ────────────────────────────────────────────────────
  async function adicionar() {
    if (!tema.trim() || !email.trim()) return
    setSalvando(true)
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    const res = await fetch('/api/alertas', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tema: tema.trim(), tribunal, email: email.trim() }),
    })
    const json = await res.json()
    if (json.error) notify(json.error, 'err')
    else { notify('Alerta cadastrado.'); setTema(''); carregarAlertas() }
    setSalvando(false)
  }

  async function remover(id) {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    await fetch('/api/alertas', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    notify('Alerta removido.')
    carregarAlertas()
  }

  async function toggleAtivo(id, ativo) {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    await fetch('/api/alertas', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo }),
    })
    carregarAlertas()
  }

  async function toggleBoletim(val) {
    if (!session) return
    setSalvandoBoletim(true)
    setBoletim(val)
    await supabase.from('membros').update({ receber_boletim: val }).eq('user_id', session.user.id)
    notify(val ? 'Boletim semanal ativado.' : 'Boletim semanal desativado.')
    setSalvandoBoletim(false)
  }

  // ── Helpers de UI ───────────────────────────────────────────────────────
  const AREA_COR = { Cível: '#1e3a8a', Penal: '#800020', Doutrina: '#581c87', Legislação: '#0ea5e9' }

  function tempoRelativo(iso) {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 60000)
    if (diff < 60) return `${diff}min atrás`
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`
    return `${Math.floor(diff / 1440)}d atrás`
  }

  const card = { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }

  const TRIBUNAIS = [
    { id: 'todos', label: 'Todos os tribunais' }, { id: 'STJ', label: 'STJ' },
    { id: 'STF', label: 'STF' }, { id: 'TST', label: 'TST' },
    { id: 'TRF', label: 'TRFs' }, { id: 'TJSP', label: 'TJSP' }, { id: 'TJRJ', label: 'TJRJ' },
  ]

  return (
    <div style={{ paddingBottom: 40, maxWidth: 720 }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Radar de Atualizações
        </div>
        <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
          Acompanhe as teses adicionadas nos últimos 7 dias e configure alertas de jurisprudência por e-mail.
        </div>
      </div>

      {/* Toggle boletim */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: theme.text, fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>Boletim semanal por e-mail</div>
          <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
            Recebe um resumo das novas teses toda segunda-feira às 8h.
          </div>
        </div>
        <button onClick={() => toggleBoletim(!boletim)} disabled={salvandoBoletim} style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: boletim ? theme.gold : theme.border, position: 'relative', transition: 'background .2s', flexShrink: 0,
        }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: boletim ? 23 : 3, transition: 'left .2s', boxShadow: '0 1px 4px #00000033' }} />
        </button>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, marginBottom: 20 }}>
        {[
          { id: 'radar',   label: `Radar (${recentes.length})` },
          { id: 'alertas', label: `Alertas (${alertas.length})` },
        ].map(a => (
          <button key={a.id} onClick={() => setAbaAtiva(a.id)} style={{
            padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: 13,
            fontFamily: 'Inter, sans-serif', fontWeight: abaAtiva === a.id ? 600 : 400,
            color: abaAtiva === a.id ? theme.gold : theme.muted,
            background: abaAtiva === a.id ? theme.gold + '11' : 'none',
            borderBottom: `2px solid ${abaAtiva === a.id ? theme.gold : 'transparent'}`,
          }}>{a.label}</button>
        ))}
      </div>

      {/* ── ABA RADAR ────────────────────────────────────────────────────── */}
      {abaAtiva === 'radar' && (
        <>
          {loadingRecentes ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: theme.muted, padding: '20px 0', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Carregando...
            </div>
          ) : recentes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: theme.muted }}>
              <Clock size={36} style={{ opacity: 0.3, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Nenhuma entrada nos últimos 7 dias.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentes.map(e => {
                const cor = AREA_COR[e.area] || theme.muted
                const teses = Array.isArray(e.teses) ? e.teses : []
                return (
                  <div key={e.id} style={{
                    background: theme.cardBg, border: `1px solid ${theme.border}`,
                    borderLeft: `3px solid ${cor}`, borderRadius: 10, padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ background: cor + '22', color: cor, border: `1px solid ${cor}44`, borderRadius: 4, padding: '1px 8px', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                            {e.area}
                          </span>
                          <span style={{ fontSize: 10, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>{e.tipo}</span>
                          {e.fonte && <span style={{ fontSize: 10, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>{e.fonte}</span>}
                        </div>
                        <div style={{ fontSize: 14, color: theme.text, fontFamily: 'Georgia, serif', lineHeight: 1.4, marginBottom: 4 }}>
                          {e.tema}
                        </div>
                        {teses[0]?.tese_assunto && (
                          <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                            {teses[0].tese_assunto.slice(0, 140)}{teses[0].tese_assunto.length > 140 ? '...' : ''}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: theme.muted, whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} /> {tempoRelativo(e.criado_em)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── ABA ALERTAS ──────────────────────────────────────────────────── */}
      {abaAtiva === 'alertas' && (
        <>
          {/* Novo alerta */}
          <div style={card}>
            <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Monitorar novo tema
            </div>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Tema</div>
            <input value={tema} onChange={e => setTema(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionar()}
              placeholder="Ex: dano moral plano de saúde, responsabilidade civil bancária"
              style={{ marginBottom: 12, fontFamily: 'Inter, sans-serif' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Tribunal</div>
                <select value={tribunal} onChange={e => setTribunal(e.target.value)} style={{ fontFamily: 'Inter, sans-serif' }}>
                  {TRIBUNAIS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Receber em</div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
            </div>
            <button onClick={adicionar} disabled={salvando || !tema.trim() || !email.trim()} style={{
              background: salvando || !tema.trim() || !email.trim() ? theme.border : theme.gold,
              color: salvando || !tema.trim() || !email.trim() ? theme.muted : (theme.isDark ? '#0f0a0b' : '#fff'),
              border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Bell size={14} /> {salvando ? 'Salvando...' : 'Cadastrar alerta'}
            </button>
          </div>

          {/* Lista de alertas */}
          {loadingAlertas ? (
            <div style={{ color: theme.muted, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Carregando...</div>
          ) : alertas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: theme.muted }}>
              <BellOff size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Nenhum alerta cadastrado.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alertas.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '12px 16px',
                  background: theme.cardBg, border: `1px solid ${a.ativo ? theme.gold + '33' : theme.border}`,
                  borderLeft: `3px solid ${a.ativo ? theme.gold : theme.border}`,
                  borderRadius: 10, opacity: a.ativo ? 1 : 0.55, transition: 'all .15s',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: theme.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif' }}>
                      {a.tema}
                    </div>
                    <div style={{ fontSize: 11, color: theme.muted, display: 'flex', gap: 8, flexWrap: 'wrap', fontFamily: 'Inter, sans-serif' }}>
                      <span>{a.tribunal === 'todos' ? 'Todos os tribunais' : a.tribunal}</span>
                      <span>·</span>
                      <span>{a.email}</span>
                      {a.ultima_verificacao && (
                        <><span>·</span><span>Verificado: {new Date(a.ultima_verificacao).toLocaleDateString('pt-BR')}</span></>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => toggleAtivo(a.id, !a.ativo)} title={a.ativo ? 'Pausar' : 'Ativar'} style={{
                      background: a.ativo ? theme.gold + '22' : theme.border + '44',
                      border: `1px solid ${a.ativo ? theme.gold + '44' : theme.border}`,
                      color: a.ativo ? theme.gold : theme.muted,
                      borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif',
                    }}>
                      {a.ativo ? <BellOff size={11} /> : <Bell size={11} />} {a.ativo ? 'Pausar' : 'Ativar'}
                    </button>
                    <button onClick={() => remover(a.id)} title="Remover" style={{ background: 'none', border: 'none', color: theme.error, cursor: 'pointer', padding: '5px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: toast.type === 'err' ? theme.toastErr : theme.toastOk,
          border: `1px solid ${toast.type === 'err' ? theme.error : theme.success}`,
          borderRadius: 8, padding: '10px 16px', fontSize: 13, color: theme.text,
          boxShadow: theme.shadow, display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Inter, sans-serif',
        }}>
          {toast.type === 'err' ? null : <CheckCircle size={14} color={theme.success} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
