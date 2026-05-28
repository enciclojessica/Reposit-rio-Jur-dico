import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

const CODIGOS_META = {
  cpc:     { label: 'CPC',          nome: 'Código de Processo Civil',       cor: '#0ea5e9' },
  cdc:     { label: 'CDC',          nome: 'Código de Defesa do Consumidor', cor: '#10b981' },
  cc:      { label: 'CC',           nome: 'Código Civil',                   cor: '#f59e0b' },
  cpp:     { label: 'CPP',          nome: 'Código de Processo Penal',       cor: '#ef4444' },
  cf:      { label: 'CF/88',        nome: 'Constituição Federal',           cor: '#c9a452' },
  lei9099: { label: 'Lei 9.099/95', nome: 'Juizados Especiais',             cor: '#a855f7' },
}

// ── Modal de detalhe ────────────────────────────────────────────────────────
function ArtigoModal({ artigo, onFechar }) {
  const { theme } = useTheme()
  const meta = CODIGOS_META[artigo.codigo] || { cor: '#888', label: artigo.codigo?.toUpperCase(), nome: artigo.codigo?.toUpperCase() }
  const [copiado, setCopiado] = useState(false)

  function copiar() {
    const t = `${artigo.codigo?.toUpperCase()} Art. ${artigo.numero}${artigo.inciso ? `, ${artigo.inciso}` : ''}${artigo.paragrafo ? `, ${artigo.paragrafo}` : ''}\n\n${artigo.texto}`
    navigator.clipboard.writeText(t)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <>
      <div onClick={onFechar} style={{ position: 'fixed', inset: 0, background: '#00000077', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw', maxWidth: 680, maxHeight: '85vh',
        background: theme.surface,
        border: `1px solid ${meta.cor}44`,
        borderRadius: 16,
        boxShadow: '0 24px 64px #00000099',
        zIndex: 201,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: meta.cor + '22', color: meta.cor, border: `1px solid ${meta.cor}44`, borderRadius: 6, padding: '2px 10px', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: theme.text, fontFamily: 'IBM Plex Mono, monospace' }}>
              Art. {artigo.numero}
              {artigo.inciso    ? `, ${artigo.inciso}`    : ''}
              {artigo.paragrafo ? `, ${artigo.paragrafo}` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copiar} style={{ background: copiado ? theme.success + '22' : theme.raised, color: copiado ? theme.success : theme.muted, border: `1px solid ${copiado ? theme.success + '44' : theme.border}`, borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
              {copiado ? '✓ Copiado' : '⎘ Copiar'}
            </button>
            <button onClick={onFechar} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '0 4px' }}>×</button>
          </div>
        </div>

        {/* Corpo */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>
          <div style={{ fontSize: 11, color: meta.cor, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, fontFamily: 'IBM Plex Mono, monospace' }}>
            {meta.nome}
          </div>
          <div style={{ fontSize: 15, color: theme.text, lineHeight: 1.8, fontFamily: 'Georgia, serif', marginBottom: 20 }}>
            {artigo.texto}
          </div>

          {(artigo.contexto || artigo.aplicacao_pratica || artigo.resultado || artigo.origem) && (
            <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'IBM Plex Mono, monospace' }}>Experiência prática</div>
              {artigo.contexto && (
                <div>
                  <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5, fontFamily: 'IBM Plex Mono, monospace' }}>Comentário Didático</div>
                  <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.6, fontStyle: 'italic' }}>{artigo.contexto}</div>
                </div>
              )}
              {artigo.aplicacao_pratica && (
                <div>
                  <div style={{ fontSize: 10, color: meta.cor, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5, fontFamily: 'IBM Plex Mono, monospace' }}>Como foi aplicado</div>
                  <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.6 }}>{artigo.aplicacao_pratica}</div>
                </div>
              )}
              {artigo.resultado && (
                <div>
                  <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5, fontFamily: 'IBM Plex Mono, monospace' }}>Resultado</div>
                  <div style={{ fontSize: 13, color: theme.success, fontWeight: 700 }}>{artigo.resultado}</div>
                </div>
              )}
              {artigo.origem && (
                <div style={{ background: theme.raised, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
                  📄 Extraído de: {artigo.origem}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Card do artigo ───────────────────────────────────────────────────────────
function ArtigoCard({ artigo, onAbrir }) {
  const { theme } = useTheme()
  const meta = CODIGOS_META[artigo.codigo] || { cor: theme.muted, label: artigo.codigo?.toUpperCase() }
  const [copiado, setCopiado] = useState(false)
  const [hover, setHover] = useState(false)

  function copiar(e) {
    e.stopPropagation()
    const t = `${artigo.codigo?.toUpperCase()} Art. ${artigo.numero}\n\n${artigo.texto}`
    navigator.clipboard.writeText(t)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div
      onClick={() => onAbrir(artigo)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: theme.cardBg,
        border: `1px solid ${hover ? meta.cor + '66' : theme.border}`,
        borderLeft: `3px solid ${meta.cor}`,
        borderRadius: 10, padding: '14px 16px',
        cursor: 'pointer', transition: 'all .15s',
        transform: hover ? 'translateY(-1px)' : 'none',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: meta.cor + '22', color: meta.cor, border: `1px solid ${meta.cor}44`, borderRadius: 4, padding: '1px 8px', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 12, color: theme.text, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>
              Art. {artigo.numero}
              {artigo.inciso    ? `, ${artigo.inciso}`    : ''}
              {artigo.paragrafo ? `, ${artigo.paragrafo}` : ''}
            </span>
          </div>
          <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.7, fontFamily: 'Georgia, serif' }}>
            {artigo.texto}
          </div>
          {(artigo.contexto || artigo.aplicacao_pratica) && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {artigo.contexto && (
                <div style={{ fontSize: 11, color: theme.muted }}>
                  <span style={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 9, fontFamily: 'IBM Plex Mono, monospace' }}>Comentário · </span>
                  {artigo.contexto}
                </div>
              )}
              {artigo.aplicacao_pratica && (
                <div style={{ fontSize: 11, color: theme.text }}>
                  <span style={{ color: meta.cor, textTransform: 'uppercase', letterSpacing: 1, fontSize: 9, fontFamily: 'IBM Plex Mono, monospace' }}>Aplicação · </span>
                  {artigo.aplicacao_pratica}
                </div>
              )}
              {artigo.resultado && (
                <div style={{ fontSize: 11, color: theme.success, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>
                  {artigo.resultado}
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={copiar}
          style={{ flexShrink: 0, background: copiado ? theme.success + '22' : theme.raised, color: copiado ? theme.success : theme.muted, border: `1px solid ${copiado ? theme.success + '44' : theme.border}`, borderRadius: 8, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap' }}>
          {copiado ? '✓' : '⎘'} {copiado ? '' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Legislacao() {
  const { theme } = useTheme()
  const [codigoAtivo, setCodigoAtivo]           = useState('todos')
  const [busca, setBusca]                        = useState('')
  const [artigos, setArtigos]                    = useState([])
  const [loading, setLoading]                    = useState(true)
  const [codigos, setCodigos]                    = useState([])
  const [total, setTotal]                        = useState(0)
  const [artigoSelecionado, setArtigoSelecionado] = useState(null)

  useEffect(() => {
    supabase.from('legislacao').select('codigo').eq('vigente', true).then(({ data }) => {
      if (data) {
        const uniq = [...new Set(data.map(d => d.codigo))]
        setCodigos(uniq)
        setTotal(data.length)
      }
    })
  }, [])

  useEffect(() => {
    const delay = setTimeout(buscarArtigos, 300)
    return () => clearTimeout(delay)
  }, [codigoAtivo, busca])

  async function buscarArtigos() {
    setLoading(true)
    let q = supabase.from('legislacao').select('*').eq('vigente', true)
      .order('numero',   { ascending: true })
      .order('inciso',    { ascending: true, nullsFirst: true })
      .order('paragrafo', { ascending: true, nullsFirst: true })
      .limit(100)

    if (codigoAtivo !== 'todos') q = q.eq('codigo', codigoAtivo)

    if (busca.trim()) {
      const num = parseInt(busca)
      if (!isNaN(num)) q = q.eq('numero', num)
      else              q = q.ilike('texto', `%${busca}%`)
    }

    const { data } = await q
    setArtigos(data || [])
    setLoading(false)
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Legislação
        </div>
        <div style={{ fontSize: 12, color: theme.muted }}>
          {total > 0 ? `${total} artigos importados · clique em qualquer artigo para ver detalhes` : 'Nenhum artigo importado — use § Importar Legislação'}
        </div>
      </div>

      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: theme.muted }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>§</div>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Nenhuma legislação importada.</div>
          <div style={{ fontSize: 12 }}>Use "§ Importar Legislação" na sidebar para adicionar o CPC, CDC e outros códigos.</div>
        </div>
      ) : (
        <>
          {/* Filtros por código */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <button onClick={() => setCodigoAtivo('todos')}
              style={{ background: codigoAtivo === 'todos' ? theme.gold + '22' : theme.raised, color: codigoAtivo === 'todos' ? theme.gold : theme.muted, border: `1px solid ${codigoAtivo === 'todos' ? theme.gold + '55' : theme.border}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', fontWeight: codigoAtivo === 'todos' ? 700 : 400 }}>
              Todos ({total})
            </button>
            {codigos.map(cod => {
              const meta = CODIGOS_META[cod] || { cor: theme.muted, label: cod.toUpperCase() }
              const ativo = codigoAtivo === cod
              return (
                <button key={cod} onClick={() => setCodigoAtivo(cod)}
                  style={{ background: ativo ? meta.cor + '22' : theme.raised, color: ativo ? meta.cor : theme.muted, border: `1px solid ${ativo ? meta.cor + '55' : theme.border}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', fontWeight: ativo ? 700 : 400 }}>
                  {meta.label}
                </button>
              )
            })}
          </div>

          {/* Busca */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.muted, pointerEvents: 'none' }}>🔍</span>
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Número do artigo (ex: 300) ou termo (ex: tutela urgência)..."
              style={{ paddingLeft: 38 }} />
          </div>

          <div style={{ fontSize: 11, color: theme.muted, marginBottom: 12, fontFamily: 'IBM Plex Mono, monospace' }}>
            {loading ? 'Buscando...' : `${artigos.length} artigo${artigos.length !== 1 ? 's' : ''} encontrado${artigos.length !== 1 ? 's' : ''}`}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {artigos.map((a, i) => (
              <ArtigoCard key={a.id || i} artigo={a} onAbrir={setArtigoSelecionado} />
            ))}
            {!loading && artigos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: theme.muted, fontSize: 13 }}>Nenhum artigo encontrado.</div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {artigoSelecionado && (
        <ArtigoModal artigo={artigoSelecionado} onFechar={() => setArtigoSelecionado(null)} />
      )}
    </div>
  )
}
