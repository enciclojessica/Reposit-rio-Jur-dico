import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { BookOpen, Headphones, GalleryThumbnails, Play, Pause, ChevronDown, ChevronUp, FileText, Lock } from 'lucide-react'

const DISC_COR = {
  "Ética Profissional": "#7c3aed", "Direito Civil": "#16a34a",
  "Direito Constitucional": "#0284c7", "Direito Penal": "#e11d48",
  "Direito Processual Penal": "#a21caf", "Direito Processual Civil": "#2563eb",
  "Direito do Trabalho": "#d97706", "Direito Processual do Trabalho": "#b45309",
  "Direito Tributário": "#ea580c", "Direito Administrativo": "#be185d",
  "Direito Empresarial": "#64748b", "Direito Ambiental": "#15803d",
  "Direito Eleitoral": "#6d28d9", "Direito Previdenciário": "#0369a1",
  "Direito do Consumidor": "#047857", "Direito Internacional": "#1d4ed8",
  "Direito da Criança e do Adolescente": "#db2777",
  "Direito Financeiro": "#92400e", "Direito Digital e LGPD": "#4338ca",
  "Direitos Humanos": "#0891b2", "Filosofia do Direito": "#78716c",
}

function parseBucketPath(storagePath) {
  const idx = storagePath.indexOf('/')
  return { bucket: storagePath.slice(0, idx), path: storagePath.slice(idx + 1) }
}

// ── URL assinada com expiração de 1h ────────────────────────────────────────
async function getSignedUrl(bucket, path) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600) // expira em 1 hora
  if (error || !data?.signedUrl) {
    // fallback para URL pública se signed falhar
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
    return pub?.publicUrl || ''
  }
  return data.signedUrl
}

// ── Proteção: bloqueia clique direito e atalhos de teclado ──────────────────
const protecaoStyle = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
}

function onContextMenu(e) { e.preventDefault(); return false }
function onKeyDown(e) {
  // Bloquear Ctrl+S, Ctrl+U, F12, Ctrl+Shift+I
  if ((e.ctrlKey && ['s','u','p'].includes(e.key.toLowerCase())) ||
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()))) {
    e.preventDefault()
  }
}

// ── Player de áudio ─────────────────────────────────────────────────────────
function AudioPlayer({ url, theme }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [carregando, setCarregando] = useState(false)

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00'
    return Math.floor(s / 60) + ':' + Math.floor(s % 60).toString().padStart(2, '0')
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  function onSeek(e) {
    if (!audioRef.current || !duracao) return
    const rect = e.currentTarget.getBoundingClientRect()
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duracao
  }

  return (
    <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 14px' }}
      onContextMenu={onContextMenu} style2={protecaoStyle}>
      <audio ref={audioRef} src={url}
        onTimeUpdate={() => setProgresso(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={e => setDuracao(e.target.duration)}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setCarregando(true)}
        onCanPlay={() => setCarregando(false)}
        preload="metadata"
        controlsList="nodownload"
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...protecaoStyle }}>
        <button onClick={togglePlay}
          style={{ width: 38, height: 38, borderRadius: '50%', background: theme.gold, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {carregando ? <span style={{ fontSize: 10, color: '#000' }}>...</span>
            : playing ? <Pause size={16} color="#000" fill="#000" />
            : <Play size={16} color="#000" fill="#000" />}
        </button>
        <div style={{ flex: 1 }}>
          <div onClick={onSeek}
            style={{ height: 4, background: theme.border, borderRadius: 2, cursor: 'pointer', marginBottom: 4, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 2, background: theme.gold, width: `${duracao ? (progresso / duracao) * 100 : 0}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
            <span>{fmt(progresso)}</span><span>{fmt(duracao)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Viewer protegido (PDF e PPTX) ───────────────────────────────────────────
function MaterialViewer({ url, titulo, tipo, cor, theme }) {
  const [aberto, setAberto] = useState(false)

  const viewerUrl = tipo === 'manual'
    ? 'https://docs.google.com/viewer?url=' + encodeURIComponent(url) + '&embedded=true'
    : 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(url)

  const labelAbrir = tipo === 'manual' ? '▶ Visualizar manual' : '▶ Visualizar slides'
  const labelFechar = tipo === 'manual' ? '▲ Fechar manual' : '▲ Fechar apresentação'

  return (
    <div>
      <button onClick={function() { setAberto(function(a) { return !a }) }}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: cor + '18', border: '1px solid ' + cor + '44', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', marginTop: 4 }}>
        <span style={{ fontSize: 12, color: cor, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          {aberto ? labelFechar : labelAbrir}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
          <Lock size={9} /> protegido
        </span>
      </button>
      {aberto && (
        <div
          onContextMenu={onContextMenu}
          onKeyDown={onKeyDown}
          style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', border: '1px solid ' + cor + '44', position: 'relative', ...protecaoStyle }}>
          {/* Overlay transparente bloqueia clique direito no iframe */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, cursor: 'default' }}
            onContextMenu={onContextMenu} />
          <iframe
            src={viewerUrl}
            width="100%"
            height={tipo === 'manual' ? '520' : '420'}
            frameBorder="0"
            title={titulo}
            sandbox="allow-scripts allow-same-origin"
            style={{ display: 'block', pointerEvents: 'auto' }}
          />
        </div>
      )}
    </div>
  )
}

// ── Card de material ────────────────────────────────────────────────────────
function MaterialCard({ material, userEmail, theme }) {
  const { bucket, path } = parseBucketPath(material.storage_path)
  const [url, setUrl] = useState('')

  useEffect(function() {
    getSignedUrl(bucket, path).then(setUrl)
  }, [bucket, path])

  const cor = material.tipo === 'manual' ? theme.gold : material.tipo === 'audio' ? '#10b981' : '#a78bfa'
  const Icone = material.tipo === 'manual' ? FileText : material.tipo === 'audio' ? Headphones : GalleryThumbnails
  const label = material.tipo === 'manual' ? 'Manual PDF' : material.tipo === 'audio' ? 'Aula em Áudio' : 'Slides PPTX'

  if (!url) {
    return (
      <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10, color: theme.muted, fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
        Carregando material...
      </div>
    )
  }

  return (
    <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: cor + '18', border: '1px solid ' + cor + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icone size={15} color={cor} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{material.titulo}</div>
          <div style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
          <Lock size={9} /> URL expira em 1h
        </div>
      </div>

      {/* Conteúdo por tipo */}
      <div style={{ marginTop: 10 }}>
        {material.tipo === 'audio' && <AudioPlayer url={url} theme={theme} />}
        {(material.tipo === 'manual' || material.tipo === 'slide') && (
          <MaterialViewer url={url} titulo={material.titulo} tipo={material.tipo} cor={cor} theme={theme} />
        )}
      </div>
    </div>
  )
}

// ── Card de módulo ──────────────────────────────────────────────────────────
function ModuloCard({ modulo, materiais, userEmail, theme }) {
  const [aberto, setAberto] = useState(false)
  const cor = DISC_COR[modulo.disciplina] || '#6b7280'

  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
      <button onClick={function() { setAberto(function(a) { return !a }) }}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: theme.raised, border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: cor, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{modulo.titulo}</div>
          <div style={{ fontSize: 11, color: cor, fontFamily: 'IBM Plex Mono, monospace', marginTop: 2 }}>
            {modulo.disciplina}{modulo.subtema ? ' · ' + modulo.subtema : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
            {materiais.length} {materiais.length === 1 ? 'material' : 'materiais'}
          </span>
          {aberto ? <ChevronUp size={14} color={theme.muted} /> : <ChevronDown size={14} color={theme.muted} />}
        </div>
      </button>
      {aberto && (
        <div style={{ padding: '12px 16px', background: theme.bg || theme.raised, borderTop: `1px solid ${theme.border}` }}>
          {modulo.descricao && (
            <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Georgia, serif', lineHeight: 1.6, marginBottom: 12, fontStyle: 'italic' }}>
              {modulo.descricao}
            </div>
          )}
          {materiais.map(function(m) {
            return <MaterialCard key={m.id} material={m} userEmail={userEmail} theme={theme} />
          })}
        </div>
      )}
    </div>
  )
}

// ── Componente principal ────────────────────────────────────────────────────
export default function ModulosEstudo({ theme, session }) {
  const [modulos, setModulos]     = useState([])
  const [materiais, setMateriais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro]       = useState('Todos')
  const userEmail = session?.user?.email || ''

  useEffect(function() {
    async function carregar() {
      const [{ data: mods }, { data: mats }] = await Promise.all([
        supabase.from('modulos_estudo').select('*').order('disciplina').order('ordem'),
        supabase.from('material_estudo').select('*').order('ordem'),
      ])
      setModulos(mods || [])
      setMateriais(mats || [])
      setCarregando(false)
    }
    carregar()
  }, [])

  const disciplinas = ['Todos', ...Array.from(new Set(modulos.map(function(m) { return m.disciplina })))]
  const modulosFiltrados = filtro === 'Todos' ? modulos : modulos.filter(function(m) { return m.disciplina === filtro })

  if (carregando) {
    return <div style={{ textAlign: 'center', padding: 60, color: theme.muted, fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Carregando módulos...</div>
  }

  if (!modulos.length) {
    return <div style={{ textAlign: 'center', padding: 60, color: theme.muted, fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Nenhum módulo disponível ainda.</div>
  }

  return (
    <div onContextMenu={onContextMenu} onKeyDown={onKeyDown}>
      {disciplinas.length > 2 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {disciplinas.map(function(d) {
            const cor = DISC_COR[d] || '#6b7280'
            const ativo = filtro === d
            return (
              <button key={d} onClick={function() { setFiltro(d) }}
                style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid ' + (ativo ? cor : theme.border), background: ativo ? cor + '18' : 'none', color: ativo ? cor : theme.muted, fontWeight: ativo ? 700 : 400 }}>
                {d}
              </button>
            )
          })}
        </div>
      )}
      {modulosFiltrados.map(function(m) {
        return (
          <ModuloCard
            key={m.id}
            modulo={m}
            materiais={materiais.filter(function(mat) { return mat.modulo_id === m.id })}
            userEmail={userEmail}
            theme={theme}
          />
        )
      })}
    </div>
  )
}
