import { useState, useEffect } from 'react'
import { Check, Copy, X } from 'lucide-react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { ROLE_LABEL, ROLE_COR } from '../shared'

const ROLE_DESC = {
  admin:  'Controle total: adiciona, edita, remove entradas e gerencia membros.',
  editor: 'Pode adicionar e editar as próprias entradas. Não gerencia membros.',
  leitor: 'Somente consulta e usa a Busca para Peça.',
}

export default function Membros({ session }) {
  const { theme, mode } = useTheme()
  const [membros, setMembros]     = useState([])
  const [convites, setConvites]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [novoRole, setNovoRole]   = useState('leitor')
  const [novoEmail, setNovoEmail] = useState('')
  const [gerando, setGerando]     = useState(false)
  const [linkGerado, setLinkGerado] = useState('')
  const [copiado, setCopiado]     = useState(false)
  const [toast, setToast]         = useState(null)

  function notify(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function carregar() {
    setLoading(true)
    const [{ data: m }, { data: c }] = await Promise.all([
      supabase.from('membros').select('*').order('criado_em'),
      supabase.from('convites').select('*').eq('status', 'pendente').order('criado_em', { ascending: false }),
    ])
    setMembros(m || [])
    setConvites(c || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function gerarConvite() {
    setGerando(true)
    setLinkGerado('')
    const { data, error } = await supabase.from('convites').insert({
      role: novoRole,
      email: novoEmail.trim() || null,
      invited_by: session.user.id,
    }).select().single()

    if (error) { notify('Erro ao gerar convite.', 'err'); setGerando(false); return }
    const link = `${window.location.origin}/?convite=${data.token}`
    setLinkGerado(link)
    carregar()
    setGerando(false)
  }

  function copiarLink() {
    navigator.clipboard.writeText(linkGerado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function alterarRole(membro_id, role) {
    await supabase.from('membros').update({ role }).eq('id', membro_id)
    notify('Papel atualizado.')
    carregar()
  }

  async function removerMembro(user_id) {
    if (!confirm('Remover este membro? O acesso será revogado imediatamente.')) return
    await supabase.from('membros').delete().eq('user_id', user_id)
    notify('Membro removido.')
    carregar()
  }

  async function revogarConvite(id) {
    await supabase.from('convites').update({ status: 'aceito' }).eq('id', id) // marca como usado = revogado
    notify('Convite revogado.')
    carregar()
  }

  const card = {
    background: theme.cardBg, border: `1px solid ${theme.border}`,
    borderRadius: 10, padding: 20, marginBottom: 16,
  }

  const sectionLabel = {
    fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600,
    borderBottom: `1px solid ${theme.text}`, paddingBottom: 6, marginBottom: 16,
  }

  const selStyle = {
    background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 6,
    padding: '8px 12px', color: theme.text, fontSize: 13,
    fontFamily: "Georgia, 'EB Garamond', serif", outline: 'none', boxSizing: 'border-box',
  }

  if (loading) return (
    <div style={{ color: theme.muted, padding: 40, textAlign: 'center', fontStyle: 'italic', fontFamily: theme.fontSerif }}>
      Carregando…
    </div>
  )

  return (
    <div style={{ paddingBottom: 40, maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>
          Membros e acessos
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
          Gerencie quem tem acesso ao repositório e com qual nível de permissão.
        </div>
      </div>

      {/* ── Gerar convite ────────────────────────────────── */}
      <div style={card}>
        <div style={sectionLabel}>Convidar pessoa</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 14 }}>
          <input
            value={novoEmail}
            onChange={e => setNovoEmail(e.target.value)}
            placeholder="E-mail (opcional — apenas para referência)"
            style={selStyle}
          />
          <select value={novoRole} onChange={e => setNovoRole(e.target.value)}
            style={{ ...selStyle, width: 110 }}>
            <option value="leitor">Leitor</option>
            <option value="editor">Editor</option>
          </select>
        </div>

        <div style={{ fontSize: 12, color: theme.muted, marginBottom: 14, lineHeight: 1.6, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
          {ROLE_DESC[novoRole]}
        </div>

        <button onClick={gerarConvite} disabled={gerando}
          style={{
            background: gerando ? theme.border : theme.gold,
            color: gerando ? theme.muted : '#fdfbf7',
            border: 'none', borderRadius: 6, padding: '10px 20px',
            fontSize: 13, fontWeight: 600, cursor: gerando ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
          {gerando ? 'Gerando…' : 'Gerar link de convite'}
        </button>

        {/* Link gerado */}
        {linkGerado && (
          <div style={{
            marginTop: 16, background: mode === 'dark' ? '#0f2b1a' : '#f0fdf4',
            border: `1px solid ${theme.success}`, borderRadius: 8, padding: 14,
          }}>
            <div style={{ fontSize: 12, color: theme.success, fontStyle: 'italic', fontFamily: theme.fontSerif, marginBottom: 8 }}>
              Link gerado — válido por 7 dias
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                flex: 1, fontSize: 12, color: theme.text,
                background: theme.inputBg, border: `1px solid ${theme.border}`,
                borderRadius: 6, padding: '8px 12px', fontFamily: 'monospace',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {linkGerado}
              </div>
              <button onClick={copiarLink} style={{
                background: 'transparent',
                color: copiado ? theme.success : theme.textSub,
                border: `1px solid ${copiado ? theme.success : theme.border}`,
                borderRadius: 6, padding: '8px 14px', fontSize: 12,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {copiado ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
              </button>
            </div>
            <div style={{ fontSize: 12, color: theme.muted, marginTop: 8, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
              Envie este link por WhatsApp, e-mail ou como preferir. Ao acessar, a pessoa cria a conta e entra automaticamente.
            </div>
          </div>
        )}
      </div>

      {/* ── Membros ativos ───────────────────────────────── */}
      <div style={card}>
        <div style={sectionLabel}>Membros ativos ({membros.length})</div>
        {membros.length === 0 ? (
          <div style={{ color: theme.muted, fontSize: 13, fontStyle: 'italic', fontFamily: theme.fontSerif }}>Nenhum membro ainda.</div>
        ) : (
          <div>
            {membros.map((m, i) => {
              const ehVoce = m.user_id === session.user.id
              return (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', gap: 12,
                  borderBottom: i < membros.length - 1 ? `0.5px solid ${theme.border}` : 'none',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontSerif, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.nome || m.email || m.user_id.slice(0, 8) + '…'}
                      {ehVoce && <span style={{ fontSize: 11, color: theme.gold, marginLeft: 8, fontStyle: 'italic' }}>(você)</span>}
                    </div>
                    {m.email && m.nome && (
                      <div style={{ fontSize: 11, color: theme.muted, marginTop: 2, fontStyle: 'italic', fontFamily: theme.fontSerif }}>{m.email}</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {!ehVoce ? (
                      <select
                        value={m.role}
                        onChange={e => alterarRole(m.id, e.target.value)}
                        style={{ ...selStyle, color: ROLE_COR[m.role], padding: '5px 8px', fontSize: 12 }}>
                        <option value="leitor">Leitor</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span style={{ color: ROLE_COR[m.role], fontSize: 12, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
                        {ROLE_LABEL[m.role]}
                      </span>
                    )}

                    {!ehVoce && (
                      <button onClick={() => removerMembro(m.user_id)} style={{
                        background: 'none', border: 'none',
                        color: theme.penal, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', padding: 2,
                      }} title="Remover membro"><X size={15} /></button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Convites pendentes ───────────────────────────── */}
      {convites.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>Convites pendentes ({convites.length})</div>
          <div>
            {convites.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', gap: 12,
                borderBottom: i < convites.length - 1 ? `0.5px solid ${theme.border}` : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontSerif }}>
                    {c.email || 'Sem e-mail'}
                    <span style={{ marginLeft: 8, color: ROLE_COR[c.role], fontSize: 12, fontStyle: 'italic' }}>
                      {ROLE_LABEL[c.role]}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: theme.muted, marginTop: 3, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
                    Expira em {new Date(c.expires_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <button onClick={() => revogarConvite(c.id)} style={{
                  background: 'none', border: `1px solid ${theme.border}`,
                  color: theme.textSub, borderRadius: 6, padding: '5px 12px',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>Revogar</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: toast.type === 'err' ? theme.toastErr : theme.toastOk,
          border: `1px solid ${toast.type === 'err' ? theme.error : theme.success}`,
          borderRadius: 8, padding: '10px 16px', fontSize: 13, color: theme.text,
          boxShadow: theme.shadow, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: theme.fontSerif,
        }}>
          {toast.type === 'err' ? <X size={14} color={theme.error} /> : <Check size={14} color={theme.success} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
