import { useState, useRef } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { User, Lock, Bell, Upload, Check, AlertCircle, Database, Download } from 'lucide-react'

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

// ── Aba Perfil ────────────────────────────────────────────────────────────────
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
    setUploading(true)
    setMsg(null)

    try {
      // Validar tipo e tamanho
      if (!file.type.startsWith('image/')) {
        setMsg({ tipo: 'erro', texto: 'Selecione um arquivo de imagem (JPG, PNG, WebP).' })
        setUploading(false); return
      }
      if (file.size > 5 * 1024 * 1024) {
        setMsg({ tipo: 'erro', texto: 'Imagem muito grande. Máximo 5MB.' })
        setUploading(false); return
      }

      // Redimensionar para 400x400 no browser antes de enviar
      const blob = await new Promise((resolve) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
          const size = 400
          const canvas = document.createElement('canvas')
          canvas.width = size; canvas.height = size
          const ctx = canvas.getContext('2d')
          const ratio = Math.min(size / img.width, size / img.height)
          const w = img.width * ratio, h = img.height * ratio
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
          URL.revokeObjectURL(url)
          canvas.toBlob(resolve, 'image/jpeg', 0.85)
        }
        img.src = url
      })

      const path = `${session.user.id}/avatar.jpg`

      // Tentar criar bucket se não existir
      await supabase.storage.createBucket('avatares', { public: true }).catch(() => {})

      const { error } = await supabase.storage.from('avatares').upload(path, blob, {
        upsert: true,
        contentType: 'image/jpeg',
      })

      if (error) {
        setMsg({ tipo: 'erro', texto: `Erro ao enviar foto: ${error.message}` })
      } else {
        const { data } = supabase.storage.from('avatares').getPublicUrl(path)
        // Adicionar timestamp para forçar reload do cache
        setAvatarUrl(data.publicUrl + '?t=' + Date.now())
        setMsg({ tipo: 'ok', texto: 'Foto atualizada. Clique em Salvar para confirmar.' })
      }
    } catch (err) {
      setMsg({ tipo: 'erro', texto: `Erro inesperado: ${err.message}` })
    }

    setUploading(false)
  }

  async function salvar() {
    if (!session) return
    setSalvando(true); setMsg(null)
    const { error } = await supabase.from('membros').update({
      nome, oab_numero: oab, oab_uf: uf, avatar_url: avatarUrl,
    }).eq('user_id', session.user.id)
    setMsg(error ? { tipo: 'erro', texto: error.message } : { tipo: 'ok', texto: 'Perfil atualizado.' })
    setSalvando(false)
  }

  const inp = (val, setVal, placeholder, tipo = 'text') => (
    <input type={tipo} value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px', color: theme.text, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }} />
  )

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Avatar */}
      <Campo label="Foto de perfil">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: theme.raised, border: `2px solid ${theme.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={28} color={theme.muted} />
            )}
          </div>
          <div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
              <Upload size={13} /> {uploading ? 'Enviando...' : 'Enviar foto'}
            </button>
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 4, fontFamily: 'Inter, sans-serif' }}>JPG, PNG ou GIF · máx. 2MB</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => uploadAvatar(e.target.files?.[0])} />
        </div>
      </Campo>

      <Campo label="Nome completo">{inp(nome, setNome, 'Seu nome completo')}</Campo>

      <Campo label="E-mail">
        <input value={session?.user?.email || ''} disabled
          style={{ width: '100%', background: theme.bgDeep, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px', color: theme.muted, fontSize: 13, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', cursor: 'not-allowed' }} />
      </Campo>

      <Campo label="OAB (opcional)">
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

// ── Aba Preferências ──────────────────────────────────────────────────────────
function TabPreferencias({ session, membro }) {
  const { theme } = useTheme()
  const [boletim, setBoletim]       = useState(membro?.receber_boletim !== false)
  const [senha, setSenha]           = useState('')
  const [confirma, setConfirma]     = useState('')
  const [salvando, setSalvando]     = useState(false)
  const [msg, setMsg]               = useState(null)

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
          <button onClick={() => salvarBoletim(!boletim)} style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: boletim ? theme.gold : theme.border, position: 'relative', transition: 'background .2s',
          }}>
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


// ── Aba Backup ────────────────────────────────────────────────────────────────
function TabBackup({ session, entradas }) {
  const { theme } = useTheme()
  const [status, setStatus] = useState(null) // null | 'carregando' | 'ok' | 'erro'
  const [msg, setMsg]       = useState('')
  const [ultimo, setUltimo] = useState(() => {
    try { return localStorage.getItem('lexia_ultimo_backup') || null } catch { return null }
  })
  const [statusNotas, setStatusNotas] = useState(null) // null | 'carregando' | 'ok' | 'erro'
  const [msgNotas, setMsgNotas]       = useState('')

  async function exportarNotas() {
    setStatusNotas('carregando')
    setMsgNotas('Reunindo suas anotações...')
    try {
      const { exportarAnotacoesDocx } = await import('../utils/exportarAnotacoes')
      const total = await exportarAnotacoesDocx(entradas || [])
      setStatusNotas('ok')
      setMsgNotas(`${total} anotação(ões) exportada(s) para o Word.`)
    } catch (err) {
      setStatusNotas('erro')
      setMsgNotas(err.message || 'Erro ao exportar anotações.')
    }
  }

  async function fazerBackup() {
    setStatus('carregando')
    setMsg('Coletando dados do banco...')

    try {
      // 1. Buscar todas as tabelas
      const tabelas = ['entradas', 'legislacao', 'membros', 'alertas', 'oab_questoes', 'flashcards']
      const backup = { gerado_em: new Date().toISOString(), tabelas: {} }

      for (const tabela of tabelas) {
        setMsg(`Exportando ${tabela}...`)
        const { data, error } = await supabase.from(tabela).select('*')
        if (!error) backup.tabelas[tabela] = data || []
      }

      const totalRegistros = Object.values(backup.tabelas).reduce((a, t) => a + t.length, 0)
      setMsg(`${totalRegistros} registros coletados. Enviando para o Google Drive...`)

      // 2. Gerar JSON
      const json = JSON.stringify(backup, null, 2)
      const blob = new Blob([json], { type: 'application/json' })

      // 3. Baixar localmente (fallback sempre disponível)
      const dataStr = new Date().toISOString().split('T')[0]
      const nomeArquivo = `themisjur_backup_${dataStr}.json`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomeArquivo
      a.click()
      URL.revokeObjectURL(url)

      // 4. Salvar data do último backup
      const agora = new Date().toLocaleString('pt-BR')
      localStorage.setItem('lexia_ultimo_backup', agora)
      setUltimo(agora)

      setStatus('ok')
      setMsg(`Backup concluído! ${totalRegistros} registros exportados para ${nomeArquivo}. Salve o arquivo no seu Google Drive.`)
    } catch (err) {
      setStatus('erro')
      setMsg(`Erro ao gerar backup: ${err.message}`)
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Card principal */}
      <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '20px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Database size={18} color={theme.gold} />
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, fontFamily: 'Inter, sans-serif' }}>
            Backup do banco de dados
          </div>
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', lineHeight: 1.6, marginBottom: 16 }}>
          Exporta todas as entradas, legislação, questões OAB e flashcards em um arquivo JSON.
          Salve o arquivo no seu Google Drive para ter uma cópia de segurança.
        </div>

        {ultimo && (
          <div style={{ fontSize: 11, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 16, padding: '6px 10px', background: theme.gold + '11', borderRadius: 6 }}>
            Último backup: {ultimo}
          </div>
        )}

        <button
          onClick={fazerBackup}
          disabled={status === 'carregando'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: status === 'carregando' ? theme.border : theme.gold,
            color: status === 'carregando' ? theme.muted : '#0b0f1a',
            border: 'none', borderRadius: 8, padding: '10px 20px',
            fontSize: 13, fontWeight: 600, cursor: status === 'carregando' ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
          <Download size={14} />
          {status === 'carregando' ? 'Gerando backup...' : 'Gerar backup agora'}
        </button>
      </div>

      {/* Card: Caderno de Estudos */}
      <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '20px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Download size={18} color={theme.gold} />
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, fontFamily: 'Inter, sans-serif' }}>
            Meu Caderno de Estudos
          </div>
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', lineHeight: 1.6, marginBottom: 16 }}>
          Exporta todas as suas anotações pessoais (do Repositório e das Questões OAB) em um único documento Word, organizado por tema. Como as anotações ficam salvas neste navegador, só as deste dispositivo são exportadas.
        </div>

        <button
          onClick={exportarNotas}
          disabled={statusNotas === 'carregando'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: statusNotas === 'carregando' ? theme.border : theme.gold,
            color: statusNotas === 'carregando' ? theme.muted : '#0b0f1a',
            border: 'none', borderRadius: 8, padding: '10px 20px',
            fontSize: 13, fontWeight: 600, cursor: statusNotas === 'carregando' ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
          <Download size={14} />
          {statusNotas === 'carregando' ? 'Gerando documento...' : 'Exportar anotações (.docx)'}
        </button>

        {msgNotas && (
          <div style={{
            marginTop: 14, padding: '12px 14px', borderRadius: 8, fontSize: 12,
            fontFamily: 'Inter, sans-serif', lineHeight: 1.6,
            background: statusNotas === 'erro' ? theme.toastErr : statusNotas === 'ok' ? theme.toastOk : theme.raised,
            color: statusNotas === 'erro' ? theme.error : statusNotas === 'ok' ? theme.success : theme.muted,
            border: `1px solid ${statusNotas === 'erro' ? theme.error + '44' : statusNotas === 'ok' ? theme.success + '44' : theme.border}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {statusNotas === 'ok' && <Check size={14} />}
            {statusNotas === 'erro' && <AlertCircle size={14} />}
            {msgNotas}
          </div>
        )}
      </div>

      {/* Status */}
      {msg && (
        <div style={{
          padding: '12px 14px', borderRadius: 8, fontSize: 12,
          fontFamily: 'Inter, sans-serif', lineHeight: 1.6,
          background: status === 'erro' ? theme.toastErr : status === 'ok' ? theme.toastOk : theme.raised,
          color: status === 'erro' ? theme.error : status === 'ok' ? theme.success : theme.muted,
          border: `1px solid ${status === 'erro' ? theme.error + '44' : status === 'ok' ? theme.success + '44' : theme.border}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {status === 'ok' && <Check size={14} />}
          {status === 'erro' && <AlertCircle size={14} />}
          {msg}
        </div>
      )}

      {/* Instruções */}
      <div style={{ marginTop: 20, padding: '14px 16px', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10 }}>
        <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 10 }}>
          Como fazer backup semanal
        </div>
        {[
          '1. Clique em "Gerar backup agora"',
          '2. O arquivo JSON será baixado automaticamente',
          '3. Acesse drive.google.com',
          '4. Faça upload do arquivo na pasta Themis Jur',
          '5. Recomendado: toda segunda-feira',
        ].map((s, i) => (
          <div key={i} style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>{s}</div>
        ))}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Configuracoes({ session, membro, entradas }) {
  const { theme } = useTheme()
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
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, marginBottom: 24 }}>
        <Aba id="perfil"       label="Perfil"       icon={User}  ativo={aba === 'perfil'}       onClick={setAba} />
        <Aba id="preferencias" label="Preferências" icon={Bell}  ativo={aba === 'preferencias'} onClick={setAba} />
        <Aba id="seguranca"    label="Segurança"    icon={Lock}  ativo={aba === 'seguranca'}    onClick={setAba} />
        <Aba id="backup"       label="Backup"       icon={Database} ativo={aba === 'backup'}    onClick={setAba} />
      </div>

      {/* Conteúdo */}
      {aba === 'perfil'       && <TabPerfil session={session} membro={membro} />}
      {aba === 'preferencias' && <TabPreferencias session={session} membro={membro} />}
      {aba === 'seguranca'    && <TabPreferencias session={session} membro={membro} />}
      {aba === 'backup'       && <TabBackup session={session} entradas={entradas} />}
    </div>
  )
}
