import { useState, useEffect, useMemo } from 'react'
import { Download, Search, Check, Copy, Link2 } from 'lucide-react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

const CODIGOS_META = {
  cpc:     { label: 'CPC',          nome: 'Código de Processo Civil',       cor: '#2c5a6e' },
  cdc:     { label: 'CDC',          nome: 'Código de Defesa do Consumidor', cor: '#5a4a7a' },
  cc:      { label: 'CC',           nome: 'Código Civil',                   cor: '#2c4a6e' },
  cpp:     { label: 'CPP',          nome: 'Código de Processo Penal',       cor: '#7a1128' },
  cf:      { label: 'CF/88',        nome: 'Constituição Federal',           cor: '#3f4a7a' },
  lei9099: { label: 'Lei 9.099/95', nome: 'Juizados Especiais',             cor: '#8a5a2e' },
}

// ── Modal de detalhe ────────────────────────────────────────────────────────
function ArtigoModal({ grupo, onFechar }) {
  const { theme } = useTheme()
  const meta = CODIGOS_META[grupo.codigo] || { cor: theme.muted, label: grupo.codigo?.toUpperCase(), nome: grupo.codigo?.toUpperCase() }
  const [copiado, setCopiado] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const caput = grupo.caput

  function copiar() {
    const corpo = grupo.itens.map(i => i.texto).join('\n')
    const t = `${grupo.codigo?.toUpperCase()} ${grupo.titulo || `Art. ${grupo.numero}`}\n\n${corpo}`
    navigator.clipboard.writeText(t)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function compartilharLink() {
    const url = `${window.location.origin}/?lei=${grupo.codigo}&art=${grupo.numero}`
    navigator.clipboard.writeText(url)
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 2500)
  }

  const rotuloSecao = { fontSize: 12, color: theme.gold, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif", marginBottom: 5 }

  return (
    <>
      <div onClick={onFechar} style={{ position: 'fixed', inset: 0, background: '#00000077', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw', maxWidth: 680, maxHeight: '85vh',
        background: theme.surface,
        border: `1px solid ${meta.cor}44`,
        borderRadius: 10,
        boxShadow: theme.shadow,
        zIndex: 201,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ color: meta.cor, fontSize: 13, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 17, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle }}>
              {grupo.titulo || `Art. ${grupo.numero}`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={compartilharLink} style={{ background: 'transparent', color: linkCopiado ? theme.success : theme.gold, border: `1px solid ${linkCopiado ? theme.success : theme.border}`, borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              {linkCopiado ? <><Check size={13} /> Copiado</> : <><Link2 size={13} /> Compartilhar</>}
            </button>
            <button onClick={copiar} style={{ background: 'transparent', color: copiado ? theme.success : theme.textSub, border: `1px solid ${copiado ? theme.success : theme.border}`, borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              {copiado ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
            </button>
            <button onClick={onFechar} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '0 4px' }}>×</button>
          </div>
        </div>

        {/* Corpo */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>
          <div style={{ fontSize: 12, color: meta.cor, fontStyle: 'italic', marginBottom: 12, fontFamily: "Georgia, 'EB Garamond', serif" }}>
            {meta.nome}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {grupo.itens.map((item, i) => (
              <div key={i} style={{ fontSize: 15, color: theme.text, lineHeight: 1.8, fontFamily: "Georgia, 'EB Garamond', serif", paddingLeft: (item.inciso || item.paragrafo) ? 16 : 0 }}>
                {item.texto}
              </div>
            ))}
          </div>

          {(caput?.contexto || caput?.aplicacao_pratica || caput?.resultado) && (
            <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600 }}>Experiência prática</div>
              {caput.contexto && (
                <div>
                  <div style={rotuloSecao}>Comentário didático</div>
                  <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.6, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>{caput.contexto}</div>
                </div>
              )}
              {caput.aplicacao_pratica && (
                <div>
                  <div style={{ ...rotuloSecao, color: meta.cor }}>Aplicação prática</div>
                  <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.6, fontFamily: "Georgia, 'EB Garamond', serif" }}>{caput.aplicacao_pratica}</div>
                  <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', marginTop: 6, fontFamily: "Georgia, 'EB Garamond', serif" }}>
                    Um exemplo de aplicação, entre outras hipóteses possíveis de incidência do dispositivo.
                  </div>
                </div>
              )}
              {caput.resultado && (
                <div>
                  <div style={rotuloSecao}>Resultado</div>
                  <div style={{ fontSize: 13, color: theme.success, fontFamily: "Georgia, 'EB Garamond', serif" }}>{caput.resultado}</div>
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
function ArtigoCard({ grupo, onAbrir }) {
  const { theme } = useTheme()
  const meta = CODIGOS_META[grupo.codigo] || { cor: theme.muted, label: grupo.codigo?.toUpperCase() }
  const [copiado, setCopiado] = useState(false)
  const [hover, setHover] = useState(false)
  const caput = grupo.caput
  const numSubItens = grupo.itens.length - 1

  function copiar(e) {
    e.stopPropagation()
    const corpo = grupo.itens.map(i => i.texto).join('\n')
    const t = `${grupo.codigo?.toUpperCase()} Art. ${grupo.numero}\n\n${corpo}`
    navigator.clipboard.writeText(t)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div
      onClick={() => onAbrir(grupo)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: theme.cardBg,
        border: `1px solid ${hover ? meta.cor + '66' : theme.border}`,
        borderTop: `2px solid ${meta.cor}`,
        borderRadius: 6, padding: '14px 16px',
        cursor: 'pointer', transition: 'all .15s',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span style={{ color: meta.cor, fontSize: 12, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 13, color: theme.text, fontWeight: 600, fontFamily: theme.fontTitle }}>
              {grupo.titulo || `Art. ${grupo.numero}`}
            </span>
            {numSubItens > 0 && (
              <span style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
                +{numSubItens} inciso{numSubItens !== 1 ? 's' : ''}/parágrafo{numSubItens !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.7, fontFamily: "Georgia, 'EB Garamond', serif" }}>
            {caput?.texto}
          </div>
          {(caput?.contexto || caput?.aplicacao_pratica) && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {caput.contexto && (
                <div style={{ fontSize: 12, color: theme.muted, fontFamily: "Georgia, 'EB Garamond', serif" }}>
                  <span style={{ fontStyle: 'italic', color: theme.gold }}>Comentário: </span>
                  {caput.contexto}
                </div>
              )}
              {caput.aplicacao_pratica && (
                <div style={{ fontSize: 12, color: theme.text, fontFamily: "Georgia, 'EB Garamond', serif" }}>
                  <span style={{ color: meta.cor, fontStyle: 'italic' }}>Aplicação: </span>
                  {caput.aplicacao_pratica}
                </div>
              )}
              {caput.resultado && (
                <div style={{ fontSize: 12, color: theme.success, fontFamily: "Georgia, 'EB Garamond', serif" }}>
                  {caput.resultado}
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={copiar}
          style={{ flexShrink: 0, background: 'transparent', color: copiado ? theme.success : theme.muted, border: `1px solid ${copiado ? theme.success : theme.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
          {copiado ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Legislacao({ preFiltro, onPreFiltroConsumido }) {
  const { theme } = useTheme()
  const [codigoAtivo, setCodigoAtivo]           = useState(preFiltro?.codigo || 'todos')
  const [busca, setBusca]                        = useState(preFiltro?.numero ? String(preFiltro.numero) : '')
  const [artigos, setArtigos]                    = useState([])
  const [loading, setLoading]                    = useState(true)
  const [codigos, setCodigos]                    = useState([])
  const [total, setTotal]                        = useState(0)
  const [artigoSelecionado, setArtigoSelecionado] = useState(null)
  const [exportando, setExportando] = useState(false)

  useEffect(() => {
    if (!preFiltro) return
    setCodigoAtivo(preFiltro.codigo || 'todos')
    setBusca(preFiltro.numero ? String(preFiltro.numero) : '')
    onPreFiltroConsumido?.()
  }, [preFiltro])

  useEffect(() => {
    supabase.from('legislacao').select('codigo').eq('vigente', true).then(({ data }) => {
      if (data) {
        const uniq = [...new Set(data.map(d => d.codigo))]
        setCodigos(uniq)
        setTotal(data.length)
      }
    })
  }, [])

  // Agrupa as linhas (caput + incisos + parágrafos) por artigo real, pra
  // exibir um card único por artigo em vez de um card por linha granular.
  const gruposArtigos = useMemo(() => {
    const mapa = new Map()
    for (const item of artigos) {
      const chave = `${item.codigo}|${item.numero}|${item.titulo || ''}`
      if (!mapa.has(chave)) mapa.set(chave, { chave, codigo: item.codigo, numero: item.numero, titulo: item.titulo, itens: [] })
      mapa.get(chave).itens.push(item)
    }
    const grupos = [...mapa.values()]
    for (const g of grupos) {
      g.itens.sort((a, b) => {
        const pa = a.paragrafo === 'único' ? 0.5 : parseFloat(a.paragrafo) || 0
        const pb = b.paragrafo === 'único' ? 0.5 : parseFloat(b.paragrafo) || 0
        if (pa !== pb) return pa - pb
        if (!a.inciso && b.inciso) return -1
        if (a.inciso && !b.inciso) return 1
        return 0
      })
      g.caput = g.itens.find(i => !i.inciso && !i.paragrafo) || g.itens[0]
    }
    return grupos
  }, [artigos])

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
      .limit(500)

    if (codigoAtivo !== 'todos') q = q.eq('codigo', codigoAtivo)

    if (busca.trim()) {
      const num = parseInt(busca)
      if (!isNaN(num)) q = q.eq('numero', num)
      else              q = q.textSearch('texto', busca, { type: 'websearch', config: 'portuguese' })
    }

    const { data } = await q
    setArtigos(data || [])
    setLoading(false)
  }

  async function exportarPlanilha() {
    setExportando(true)
    try {
      let q = supabase.from('legislacao').select('*').eq('vigente', true)
        .order('codigo', { ascending: true })
        .order('numero', { ascending: true })
        .order('inciso',    { ascending: true, nullsFirst: true })
        .order('paragrafo', { ascending: true, nullsFirst: true })

      if (codigoAtivo !== 'todos') q = q.eq('codigo', codigoAtivo)

      const { data } = await q
      if (!data || data.length === 0) { setExportando(false); return }

      const meta = CODIGOS_META
      const sep = ';'
      const nl = String.fromCharCode(13) + String.fromCharCode(10)
      const bom = String.fromCharCode(0xFEFF)

      function escapeCsv(val) {
        const s = String(val || '').split(String.fromCharCode(10)).join(' ').split(String.fromCharCode(13)).join(' ')
        return '"' + s.split('"').join('""') + '"'
      }

      const cabecalho = ['Codigo', 'Diploma', 'Artigo', 'Inciso', 'Paragrafo', 'Texto']
      const linhas = data.map(function(a) {
        return [
          (a.codigo || '').toUpperCase(),
          (meta[a.codigo] && meta[a.codigo].nome) ? meta[a.codigo].nome : (a.codigo || '').toUpperCase(),
          'Art. ' + a.numero,
          a.inciso    || '',
          a.paragrafo || '',
          a.texto     || '',
        ]
      })

      const rows = [cabecalho].concat(linhas)
      const csv = bom + rows.map(function(row) {
        return row.map(escapeCsv).join(sep)
      }).join(nl)

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const nome = codigoAtivo === 'todos' ? 'legislacao_completa' : ('legislacao_' + codigoAtivo)
      a.href     = url
      a.download = nome + '.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
    setExportando(false)
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>
            Legislação
          </div>
          <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
            {total > 0 ? `${total} artigos importados, clique em qualquer um para ver detalhes` : 'Nenhum artigo importado — use Importar, na navegação'}
          </div>
        </div>
        {total > 0 && (
          <button
            onClick={exportarPlanilha}
            disabled={exportando}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '8px 14px', color: exportando ? theme.muted : theme.gold, fontSize: 13, cursor: exportando ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
            <Download size={13} />
            {exportando ? 'Gerando…' : 'Exportar .csv'}
          </button>
        )}
      </div>

      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: theme.muted }}>
          <div style={{ fontSize: 14, marginBottom: 6, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>Nenhuma legislação importada.</div>
          <div style={{ fontSize: 12, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>Use "Importar", na navegação, para adicionar o CPC, CDC e outros códigos.</div>
        </div>
      ) : (
        <>
          {/* Filtros por código */}
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 16, borderBottom: `1px solid ${theme.border}`, paddingBottom: 2 }}>
            <span onClick={() => setCodigoAtivo('todos')}
              style={{ color: codigoAtivo === 'todos' ? theme.text : theme.muted, borderBottom: codigoAtivo === 'todos' ? `1.5px solid ${theme.gold}` : '1.5px solid transparent', paddingBottom: 8, fontSize: 13, cursor: 'pointer', fontFamily: "Georgia, 'EB Garamond', serif", fontStyle: codigoAtivo === 'todos' ? 'normal' : 'italic' }}>
              Todos ({total})
            </span>
            {codigos.map(cod => {
              const meta = CODIGOS_META[cod] || { cor: theme.muted, label: cod.toUpperCase() }
              const ativo = codigoAtivo === cod
              return (
                <span key={cod} onClick={() => setCodigoAtivo(cod)}
                  style={{ color: ativo ? meta.cor : theme.muted, borderBottom: ativo ? `1.5px solid ${meta.cor}` : '1.5px solid transparent', paddingBottom: 8, fontSize: 13, cursor: 'pointer', fontFamily: "Georgia, 'EB Garamond', serif", fontStyle: ativo ? 'normal' : 'italic' }}>
                  {meta.label}
                </span>
              )
            })}
          </div>

          {/* Busca */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.muted, pointerEvents: 'none', display: 'flex' }}><Search size={14} /></span>
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Número do artigo (ex: 300) ou termo (ex: tutela urgência)…"
              style={{ paddingLeft: 38 }} />
          </div>

          <div style={{ fontSize: 12, color: theme.muted, marginBottom: 12, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
            {loading ? 'Buscando…' : `${gruposArtigos.length} artigo${gruposArtigos.length !== 1 ? 's' : ''} encontrado${gruposArtigos.length !== 1 ? 's' : ''}`}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {gruposArtigos.map((g) => (
              <ArtigoCard key={g.chave} grupo={g} onAbrir={setArtigoSelecionado} />
            ))}
            {!loading && gruposArtigos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: theme.muted, fontSize: 13, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>Nenhum artigo encontrado.</div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {artigoSelecionado && (
        <ArtigoModal grupo={artigoSelecionado} onFechar={() => setArtigoSelecionado(null)} />
      )}
    </div>
  )
}
