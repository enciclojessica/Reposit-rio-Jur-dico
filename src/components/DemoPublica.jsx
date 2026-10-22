import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { AUTORIA } from '../data/autoria'
import { corDaArea, buscarTodasLinhas } from '../shared'
import { compararDispositivos } from '../../lib/ordemDispositivos'
import SeletorTema from './SeletorTema'
import { ChevronRight, ChevronDown, ArrowLeft, Search } from 'lucide-react'

const COR = { ouro: '#8f6d27', borda: '#e4ddd0', muted: '#736b62', texto: '#2c241b' }

function chipStyle(ativo, cor) {
  return {
    fontSize: 12, padding: '5px 12px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
    border: `1px solid ${ativo ? cor : COR.borda}`, background: ativo ? cor + '18' : 'transparent',
    color: ativo ? cor : COR.muted,
  }
}

// Agrupa as linhas de legislacao_publica por artigo (titulo distingue artigos
// com letra, como 7-A) e ordena os dispositivos de cada um.
export function agruparArtigos(linhas) {
  const mapa = new Map()
  for (const l of linhas || []) {
    const chave = l.titulo || `Art. ${l.numero}`
    if (!mapa.has(chave)) mapa.set(chave, { chave, numero: l.numero, titulo: l.titulo || `Art. ${l.numero}`, itens: [] })
    mapa.get(chave).itens.push(l)
  }
  const grupos = [...mapa.values()]
  for (const g of grupos) g.itens.sort(compararDispositivos)
  grupos.sort((a, b) => a.numero - b.numero || a.chave.localeCompare(b.chave, 'pt-BR', { numeric: true }))
  return grupos
}

function caputDe(grupo) {
  return grupo.itens.find(i => !i.inciso && !i.paragrafo) || grupo.itens[0]
}

// Demonstração pública (/?demo=1): somente leitura, sem login e sem dados de
// usuário. Entradas marcadas como públicas (RLS, role anon) e a Lei 9.099
// pela visão legislacao_publica, que só devolve comentários nas linhas com
// comentario_publico = true.
export default function DemoPublica({ onAbrirEntrada, onEntrar }) {
  const { theme } = useTheme()
  const [aba, setAba] = useState('acervo')
  const [entradas, setEntradas] = useState(null)
  const [areaFiltro, setAreaFiltro] = useState('todas')
  const [soJec, setSoJec] = useState(false)
  const [linhas, setLinhas] = useState(null)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(null)

  useEffect(() => {
    buscarTodasLinhas(() => supabase
      .from('entradas')
      .select('id, area, tipo, tema, fonte, tags')
      .order('criado_em', { ascending: false })
    ).then(data => setEntradas(data || []))
      .catch(() => { setEntradas([]); setErro('Não foi possível carregar o acervo agora.') })
  }, [])

  useEffect(() => {
    if (aba !== 'lei' || linhas) return
    buscarTodasLinhas(() => supabase
      .from('legislacao_publica').select('*')
      .eq('codigo', 'lei9099').eq('vigente', true)
      .order('numero', { ascending: true })
    ).then(data => setLinhas(data || []))
      .catch(() => { setLinhas([]); setErro('Não foi possível carregar a Lei 9.099 agora.') })
  }, [aba, linhas])

  const areas = useMemo(() => entradas ? [...new Set(entradas.map(e => e.area))].sort() : [], [entradas])
  const temJec = useMemo(() => !!entradas && entradas.some(e => (e.tags || []).includes('jec')), [entradas])
  const filtradas = useMemo(() => (entradas || []).filter(e =>
    (areaFiltro === 'todas' || e.area === areaFiltro) && (!soJec || (e.tags || []).includes('jec'))
  ), [entradas, areaFiltro, soJec])

  const artigos = useMemo(() => agruparArtigos(linhas), [linhas])
  const artigosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return artigos
    const soNumero = q.replace(/^art\.?\s*/, '')
    return artigos.filter(g =>
      g.titulo.toLowerCase() === `art. ${soNumero}` ||
      g.itens.some(i => (i.texto || '').toLowerCase().includes(q))
    )
  }, [artigos, busca])
  const comentados = useMemo(() => artigos.filter(g => caputDe(g)?.contexto).length, [artigos])

  const abaStyle = (ativa) => ({
    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
    padding: '10px 4px', marginRight: 22, color: ativa ? COR.texto : COR.muted,
    borderBottom: `2px solid ${ativa ? COR.ouro : 'transparent'}`, fontWeight: ativa ? 600 : 400,
  })
  const rotuloSecao = { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: COR.ouro, marginBottom: 4 }

  return (
    <div style={{ minHeight: '100vh', background: '#fdfbf7', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fdfbf7ee', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', paddingTop: 'calc(16px + env(safe-area-inset-top))', borderBottom: `1px solid ${COR.borda}` }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: COR.muted, fontSize: 13, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Themis Jur
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <SeletorTema compact />
          <button onClick={onEntrar} style={{ background: 'none', border: 'none', color: COR.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Já tenho acesso
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 80px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 30, color: COR.texto, marginBottom: 8 }}>
          Demonstração do Themis Jur
        </div>
        <div style={{ fontSize: 14, color: COR.muted, marginBottom: 24, lineHeight: 1.6 }}>
          Navegação livre, somente leitura, sem login. Aqui você vê uma amostra do acervo (teses, jurisprudência e doutrina com síntese e aplicação) e a Lei 9.099/95 comentada artigo por artigo. O acervo completo, o Editor de peças e o Caderno de Estudos ficam para quem tem acesso.
        </div>

        <div style={{ display: 'flex', borderBottom: `1px solid ${COR.borda}`, marginBottom: 24 }}>
          <button onClick={() => setAba('acervo')} style={abaStyle(aba === 'acervo')}>Acervo</button>
          <button onClick={() => setAba('lei')} style={abaStyle(aba === 'lei')}>Lei 9.099/95 comentada</button>
        </div>

        {erro && <div style={{ fontSize: 13, color: '#800020', marginBottom: 16 }}>{erro}</div>}

        {aba === 'acervo' && (
          <>
            {entradas && entradas.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                <button onClick={() => setAreaFiltro('todas')} style={chipStyle(areaFiltro === 'todas', COR.ouro)}>Todas</button>
                {areas.map(a => (
                  <button key={a} onClick={() => setAreaFiltro(a)} style={chipStyle(areaFiltro === a, corDaArea(a, theme))}>{a}</button>
                ))}
                {temJec && (
                  <button onClick={() => setSoJec(v => !v)} style={chipStyle(soJec, '#800020')}>#jec</button>
                )}
              </div>
            )}
            {!entradas && <div style={{ fontSize: 13, color: COR.muted }}>Carregando…</div>}
            {entradas && filtradas.length === 0 && <div style={{ fontSize: 13, color: COR.muted }}>Nenhuma entrada pública nesse filtro.</div>}
            {filtradas.map(e => (
              <div key={e.id} onClick={() => onAbrirEntrada(e.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 0', borderBottom: '1px solid #e4ddd0', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 11 }}>
                    <span style={{ color: corDaArea(e.area, theme) }}>{e.area}</span>
                    <span style={{ color: COR.muted }}>· {e.tipo}</span>
                    {(e.tags || []).includes('jec') && <span style={{ color: '#800020' }}>#jec</span>}
                  </div>
                  <div style={{ fontSize: 15, color: COR.texto }}>{e.tema}</div>
                  {e.fonte && <div style={{ fontSize: 12, color: COR.muted, marginTop: 3 }}>{e.fonte}</div>}
                </div>
                <ChevronRight size={16} color={COR.muted} style={{ flexShrink: 0 }} />
              </div>
            ))}
          </>
        )}

        {aba === 'lei' && (
          <>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <Search size={14} color={COR.muted} style={{ position: 'absolute', left: 12, top: 12 }} />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por número do artigo ou palavra"
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 34px', fontSize: 14, border: `1px solid ${COR.borda}`, borderRadius: 6, background: '#fff', color: COR.texto, fontFamily: 'inherit', outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = '#c9a452' }} onBlur={e => { e.target.style.borderColor = COR.borda }} />
            </div>
            {linhas && (
              <div style={{ fontSize: 12, color: COR.muted, marginBottom: 16 }}>
                Lei 9.099, de 26/09/1995 (Juizados Especiais Cíveis e Criminais). {artigos.length} artigos vigentes; {comentados} com comentário didático e aplicação prática nesta demonstração.
              </div>
            )}
            {!linhas && <div style={{ fontSize: 13, color: COR.muted }}>Carregando…</div>}
            {linhas && artigosFiltrados.length === 0 && <div style={{ fontSize: 13, color: COR.muted }}>Nenhum artigo encontrado.</div>}
            {artigosFiltrados.map(g => {
              const caput = caputDe(g)
              const aberta = aberto === g.chave
              return (
                <div key={g.chave} style={{ borderBottom: `1px solid ${COR.borda}` }}>
                  <div onClick={() => setAberto(aberta ? null : g.chave)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', cursor: 'pointer' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: COR.texto }}>
                        {g.titulo}
                        {caput?.rotulo && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 400, color: COR.muted, marginLeft: 10 }}>{caput.rotulo}</span>}
                      </div>
                      {!aberta && <div style={{ fontSize: 13, color: COR.muted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{caput?.texto}</div>}
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {caput?.contexto && <span style={{ fontSize: 10, color: COR.ouro, border: `1px solid ${COR.ouro}55`, borderRadius: 10, padding: '2px 8px' }}>comentado</span>}
                      {aberta ? <ChevronDown size={16} color={COR.muted} /> : <ChevronRight size={16} color={COR.muted} />}
                    </span>
                  </div>
                  {aberta && (
                    <div style={{ paddingBottom: 20 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {g.itens.map((i, k) => (
                          <div key={k} style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: COR.texto, lineHeight: 1.8, paddingLeft: (i.inciso || i.paragrafo) ? 16 : 0 }}>{i.texto}</div>
                        ))}
                      </div>
                      {(caput?.contexto || caput?.aplicacao_pratica) && (
                        <div style={{ marginTop: 16, padding: '14px 16px', border: `1px solid ${COR.borda}`, borderRadius: 8, background: '#faf5ea', display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {caput.contexto && (<div><div style={rotuloSecao}>Comentário didático</div><div style={{ fontSize: 13, color: COR.texto, lineHeight: 1.7 }}>{caput.contexto}</div></div>)}
                          {caput.aplicacao_pratica && (<div><div style={rotuloSecao}>Aplicação prática</div><div style={{ fontSize: 13, color: COR.texto, lineHeight: 1.7 }}>{caput.aplicacao_pratica}</div></div>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {linhas && (
              <div style={{ fontSize: 11, color: COR.muted, fontStyle: 'italic', marginTop: 20 }}>
                Texto de lei em domínio público, conforme o compilado do Planalto. Confira sempre a redação vigente na fonte oficial antes de usar em peça.
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 48, padding: '28px 24px', background: '#f6ede0', borderRadius: 10 }}>
          <div style={{ fontSize: 14, color: '#3a3128', marginBottom: 16 }}>
            Gostou? O acervo completo, o Editor de peças e o Caderno de Estudos são gratuitos, com cadastro aprovado pela curadoria.
          </div>
          <button onClick={onEntrar} style={{ background: COR.ouro, border: 'none', color: '#fff', fontSize: 14, fontWeight: 'bold', padding: '12px 32px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
            Solicitar acesso gratuito
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 11, color: COR.muted }}>{AUTORIA}</div>
      </div>
    </div>
  )
}
