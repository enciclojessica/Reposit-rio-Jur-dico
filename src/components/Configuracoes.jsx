import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { User, Lock, Bell, Upload, Check, AlertCircle, Radio, RefreshCw, Zap } from 'lucide-react'

function Aba({ id, label, icon: Icon, ativo, onClick }) {
  const { theme } = useTheme()
  return (
    <button onClick={() => onClick(id)} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px', cursor: 'pointer', fontSize: 13,
      fontFamily: 'Inter, sans-serif', fontWeight: ativo ? 600 : 400,
      color: ativo ? theme.gold : theme.muted,
      background: ativo ? theme.gold + '11' : 'none',
      border: 'none', borderBottom: `2px solid ${ativo ? theme.gold : 'transparent'}`,
      transition: 'all .15s',
    }}>
      <Icon size={15} /> {label}
    </button>
  )
}

function Campo({ label, children }) {
  const { theme } = useTheme()
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>{label}</div>
      {children}
    </div>
  )
}

// ── Aba Perfil ─────────────────────────────────────────────────────────────────
function TabPerfil({ session, membro }) {
  const { theme } = useTheme()
  const fileRef   = useRef()
  const [nome, setNome]           = useState(membro?.nome || '')
  const [oab, setOab]             = useState(membro?.oab_numero || '')
  const [uf, setUf]               = useState(membro?.oab_uf || '')
  const [avatarUrl, setAvatarUrl] = useState(membro?.avatar_url || '')
  const [salvando, setSalvando]   = useState(false)
  const [msg, setMsg]             = useState(null)
  const [uploading, setUploading] = useState(false)

  async function uploadAvatar(file) {
    if (!file || !session) return
    setUploading(true); setMsg(null)
    try {
      if (!file.type.startsWith('image/')) { setMsg({ tipo: 'erro', texto: 'Selecione um arquivo de imagem (JPG, PNG, WebP).' }); setUploading(false); return }
      if (file.size > 5 * 1024 * 1024) { setMsg({ tipo: 'erro', texto: 'Imagem muito grande. Máximo 5MB.' }); setUploading(false); return }
      const blob = await new Promise((resolve) => {
        const img = new Image(); const url = URL.createObjectURL(file)
        img.onload = () => {
          const size = 400; const canvas = document.createElement('canvas')
          canvas.width = size; canvas.height = size
          const ctx = canvas.getContext('2d')
          const ratio = Math.min(size / img.width, size / img.height)
          const w = img.width * ratio, h = img.height * ratio
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
          URL.revokeObjectURL(url); canvas.toBlob(resolve, 'image/jpeg', 0.85)
        }
        img.src = url
      })
      const path = `${session.user.id}/avatar.jpg`
      await supabase.storage.createBucket('Avatares', { public: true }).catch(() => {})
      const { error } = await supabase.storage.from('Avatares').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) { setMsg({ tipo: 'erro', texto: `Erro ao enviar foto: ${error.message}` }) }
      else {
        const { data } = supabase.storage.from('Avatares').getPublicUrl(path)
        setAvatarUrl(data.publicUrl + '?t=' + Date.now())
        setMsg({ tipo: 'ok', texto: 'Foto atualizada. Clique em Salvar para confirmar.' })
      }
    } catch (err) { setMsg({ tipo: 'erro', texto: `Erro inesperado: ${err.message}` }) }
    setUploading(false)
  }

  async function salvar() {
    if (!session) return
    setSalvando(true); setMsg(null)
    const { error } = await supabase.from('membros').update({ nome, oab_numero: oab, oab_uf: uf, avatar_url: avatarUrl }).eq('user_id', session.user.id)
    setMsg(error ? { tipo: 'erro', texto: error.message } : { tipo: 'ok', texto: 'Perfil atualizado.' })
    setSalvando(false)
  }

  const inp = (val, setVal, placeholder, tipo = 'text') => (
    <input type={tipo} value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px', color: theme.text, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
  )

  return (
    <div style={{ maxWidth: 520 }}>
      <Campo label="Foto de perfil">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: theme.raised, border: `2px solid ${theme.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={28} color={theme.muted} />}
          </div>
          <div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
              <Upload size={13} /> {uploading ? 'Enviando...' : 'Enviar foto'}
            </button>
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 4, fontFamily: 'Inter, sans-serif' }}>JPG, PNG ou GIF · máx. 2MB</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadAvatar(e.target.files?.[0])} />
        </div>
      </Campo>
      <Campo label="Nome completo">{inp(nome, setNome, 'Seu nome completo')}</Campo>
      <Campo label="E-mail">
        <input value={session?.user?.email || ''} disabled style={{ width: '100%', background: theme.bgDeep, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px', color: theme.muted, fontSize: 13, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', cursor: 'not-allowed' }} />
      </Campo>
      <Campo label="OAB">
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 2 }}>{inp(oab, setOab, 'Número (ex: 123456)')}</div>
          <div style={{ flex: 1 }}>
            <select value={uf} onChange={e => setUf(e.target.value)} style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px', color: uf ? theme.text : theme.muted, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}>
              <option value="">UF</option>
              {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Campo>
      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: msg.tipo === 'ok' ? theme.toastOk : theme.toastErr, color: msg.tipo === 'ok' ? theme.success : theme.error, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
          {msg.tipo === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />} {msg.texto}
        </div>
      )}
      <button onClick={salvar} disabled={salvando} style={{ background: theme.gold, color: theme.isDark ? '#0f0a0b' : '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
        {salvando ? 'Salvando...' : 'Salvar perfil'}
      </button>
    </div>
  )
}

// ── Aba Preferências ───────────────────────────────────────────────────────────
function TabPreferencias({ session, membro }) {
  const { theme } = useTheme()
  const [boletim, setBoletim] = useState(membro?.receber_boletim !== false)
  const [senha, setSenha]     = useState('')
  const [confirma, setConfirma] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg]           = useState(null)

  async function salvarBoletim(val) {
    setBoletim(val)
    await supabase.from('membros').update({ receber_boletim: val }).eq('user_id', session?.user?.id)
  }

  async function alterarSenha() {
    if (!senha || senha !== confirma) { setMsg({ tipo: 'erro', texto: 'As senhas não coincidem.' }); return }
    if (senha.length < 6) { setMsg({ tipo: 'erro', texto: 'Mínimo de 6 caracteres.' }); return }
    setSalvando(true); setMsg(null)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setMsg(error ? { tipo: 'erro', texto: error.message } : { tipo: 'ok', texto: 'Senha alterada.' })
    if (!error) { setSenha(''); setConfirma('') }
    setSalvando(false)
  }

  const inp = (val, setVal, placeholder) => (
    <input type="password" value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px', color: theme.text, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
  )

  return (
    <div style={{ maxWidth: 520 }}>
      <Campo label="Boletim semanal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '14px 16px' }}>
          <div>
            <div style={{ fontSize: 13, color: theme.text, fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>Receber boletim semanal</div>
            <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>Resumo das teses adicionadas nos últimos 7 dias, toda segunda-feira.</div>
          </div>
          <button onClick={() => salvarBoletim(!boletim)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, background: boletim ? theme.gold : theme.border, position: 'relative', transition: 'background .2s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: boletim ? 23 : 3, transition: 'left .2s', boxShadow: '0 1px 4px #00000033' }} />
          </button>
        </div>
      </Campo>
      <div style={{ height: 1, background: theme.border, margin: '24px 0' }} />
      <Campo label="Alterar senha">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {inp(senha, setSenha, 'Nova senha (mín. 6 caracteres)')}
          {inp(confirma, setConfirma, 'Confirmar nova senha')}
        </div>
      </Campo>
      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: msg.tipo === 'ok' ? theme.toastOk : theme.toastErr, color: msg.tipo === 'ok' ? theme.success : theme.error, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
          {msg.tipo === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />} {msg.texto}
        </div>
      )}
      <button onClick={alterarSenha} disabled={salvando || !senha} style={{ background: theme.gold, color: theme.isDark ? '#0f0a0b' : '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
        {salvando ? 'Alterando...' : 'Alterar senha'}
      </button>
    </div>
  )
}

// ── Aba Radar de Informativos (somente admin) ──────────────────────────────────
function TabRadar({ session }) {
  const { theme } = useTheme()
  const [status, setStatus]       = useState(null)  // { STJ: {ultimo_numero, atualizado_em}, STF: {...} }
  const [executando, setExecutando] = useState(false)
  const [resultado, setResultado]   = useState(null)
  const [erro, setErro]             = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregarStatus() }, [])

  async function carregarStatus() {
    setCarregando(true)
    try {
      const { data, error } = await supabase
        .from('radar_informativos')
        .select('tribunal, ultimo_numero, atualizado_em')
      if (!error && data) {
        const st = {}
        data.forEach(r => { st[r.tribunal] = r })
        setStatus(st)
      }
    } catch {}
    setCarregando(false)
  }

  async function executarRadar() {
    if (executando) return
    setExecutando(true); setResultado(null); setErro(null)
    try {
      // Buscar sessão atual — getSession() é síncrono e não falha
      const { data: { session: sessaoAtual } } = await supabase.auth.getSession()
      const token = sessaoAtual?.access_token

      if (!token) {
        throw new Error('Sessão não encontrada. Faça logout e login novamente.')
      }

      // Enviar user_id no body — servidor verifica admin direto no banco
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('Usuário não identificado. Faça logout e login novamente.')

      const res = await fetch('/api/radar-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })

      // Log para debug
      if (!res.ok) {
        const txt = await res.text()
        let msg = 'Erro ao executar radar'
        try { msg = JSON.parse(txt).error || msg } catch {}
        throw new Error(`HTTP ${res.status}: ${msg}`)
      }

      const json = await res.json()
      setResultado(json)
      await carregarStatus()
    } catch (err) {
      setErro(err.message)
    }
    setExecutando(false)
  }

  const cardTribunal = (sigla, cor) => {
    const dados = status?.[sigla]
    return (
      <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '14px 16px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cor }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.text, fontFamily: 'IBM Plex Mono, monospace' }}>{sigla}</span>
        </div>
        {carregando ? (
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>Carregando...</div>
        ) : dados ? (
          <>
            <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>Último processado</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 4 }}>
              {dados.ultimo_numero === 0 ? '—' : `Nº ${dados.ultimo_numero}`}
            </div>
            {dados.atualizado_em && (
              <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
                {new Date(dados.atualizado_em).toLocaleDateString('pt-BR')}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>Nenhum processado ainda</div>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Info */}
      <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderLeft: `3px solid ${theme.gold}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, marginBottom: 4 }}>RADAR AUTOMÁTICO</div>
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
          Toda segunda-feira às 09h o sistema verifica novos informativos do STJ e do STF,
          extrai as teses via IA e insere no repositório com status <b style={{ color: theme.gold }}>IA · Pendente de revisão</b>.
          Máximo de 3 informativos por tribunal por execução para controle de custo.
        </div>
      </div>

      {/* Status por tribunal */}
      <Campo label="Status por tribunal">
        <div style={{ display: 'flex', gap: 12 }}>
          {cardTribunal('STJ', '#3b82f6')}
          {cardTribunal('STF', '#a855f7')}
        </div>
      </Campo>

      {/* Resultado da última execução */}
      {resultado && (
        <div style={{ marginBottom: 16 }}>
          {resultado.processados?.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: theme.toastOk, borderRadius: 8, marginBottom: 6, fontSize: 12, color: theme.success, fontFamily: 'Inter, sans-serif' }}>
              <Check size={13} />
              <span><b>{p.tribunal}</b> — {p.novos?.length
                ? p.novos.map(n => `Informativo nº ${n.numero} (${n.teses} teses)`).join(', ')
                : 'Sem novidades'
              }</span>
            </div>
          ))}
          {resultado.erros?.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: theme.toastErr, borderRadius: 8, marginBottom: 6, fontSize: 12, color: theme.error, fontFamily: 'Inter, sans-serif' }}>
              <AlertCircle size={13} /> {e.tribunal}: {e.erro}
            </div>
          ))}
        </div>
      )}

      {erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: theme.toastErr, color: theme.error, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
          <AlertCircle size={14} /> {erro}
        </div>
      )}

      {/* Botão execução manual */}
      <button onClick={executarRadar} disabled={executando}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: executando ? theme.border : theme.gold, color: executando ? theme.muted : (theme.isDark ? '#0f0a0b' : '#fff'), border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 13, fontWeight: 600, cursor: executando ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .2s' }}>
        {executando
          ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Executando...</>
          : <><Zap size={14} /> Executar radar agora</>
        }
      </button>
      <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif', marginTop: 8 }}>
        Execução automática toda segunda-feira às 09h. Esta ação consome tokens da API.
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function Configuracoes({ session, membro }) {
  const { theme } = useTheme()
  const isAdmin = membro?.role === 'admin'
  const [aba, setAba] = useState('perfil')

  return (
    <div style={{ maxWidth: 700, paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Configurações
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
          Gerencie seu perfil, OAB e preferências da plataforma.
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, marginBottom: 24, flexWrap: 'wrap' }}>
        <Aba id="perfil"       label="Perfil"       icon={User}  ativo={aba === 'perfil'}       onClick={setAba} />
        <Aba id="preferencias" label="Preferências" icon={Bell}  ativo={aba === 'preferencias'} onClick={setAba} />
        <Aba id="seguranca"    label="Segurança"    icon={Lock}  ativo={aba === 'seguranca'}    onClick={setAba} />
        {isAdmin && (
          <Aba id="radar" label="Radar STJ/STF" icon={Radio} ativo={aba === 'radar'} onClick={setAba} />
        )}
      </div>

      {/* Conteúdo */}
      {aba === 'perfil'       && <TabPerfil session={session} membro={membro} />}
      {aba === 'preferencias' && <TabPreferencias session={session} membro={membro} />}
      {aba === 'seguranca'    && <TabPreferencias session={session} membro={membro} />}
      {aba === 'radar'        && isAdmin && <TabRadar session={session} />}
    </div>
  )
}
