import { useEffect, useState } from 'react'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { supabase } from '../supabase'

const FONTE = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
const FONTE_TITULO = "'Playfair Display', Georgia, serif"
const FONTE_TEXTO = "Georgia, 'Times New Roman', serif"

export const ABAS_AMOSTRA = [
  { id: 'jurisprudência', rotulo: 'Jurisprudência' },
  { id: 'doutrina', rotulo: 'Doutrina' },
  { id: 'lei', rotulo: 'Legislação' },
]

// Lê só entradas marcadas como públicas (a RLS já restringe o que o visitante
// pode ver) e devolve a primeira tese de cada uma. Nada é digitado à mão aqui:
// a amostra é sempre o que está no acervo, já conferido.
export function primeiraTese(entrada) {
  let teses = entrada?.teses
  if (typeof teses === 'string') {
    try { teses = JSON.parse(teses) } catch { teses = [] }
  }
  return Array.isArray(teses) && teses.length ? teses[0] : null
}

function sorteio(tamanho) {
  return tamanho > 0 ? Math.floor(Math.random() * tamanho) : 0
}

export default function AmostraAcervo({ theme, onCadastrar }) {
  const [porTipo, setPorTipo] = useState(null)
  const [erro, setErro] = useState(false)
  const [aba, setAba] = useState('jurisprudência')
  const [indice, setIndice] = useState({})

  useEffect(() => {
    let ativo = true
    Promise.all(ABAS_AMOSTRA.map(a =>
      supabase.from('entradas')
        .select('id, area, tipo, tema, fonte, referencia, teses')
        .eq('publica', true).eq('tipo', a.id)
        .order('criado_em', { ascending: false }).limit(12)
    )).then(resultados => {
      if (!ativo) return
      if (resultados.some(r => r.error)) { setErro(true); return }
      const mapa = {}
      const inicio = {}
      ABAS_AMOSTRA.forEach((a, i) => {
        mapa[a.id] = (resultados[i].data || []).filter(e => primeiraTese(e))
        inicio[a.id] = sorteio(mapa[a.id].length)
      })
      setPorTipo(mapa)
      setIndice(inicio)
    }).catch(() => { if (ativo) setErro(true) })
    return () => { ativo = false }
  }, [])

  const lista = porTipo?.[aba] || []
  const entrada = lista.length ? lista[(indice[aba] || 0) % lista.length] : null
  const tese = entrada ? primeiraTese(entrada) : null

  function outra() {
    setIndice(i => ({ ...i, [aba]: ((i[aba] || 0) + 1) % Math.max(lista.length, 1) }))
  }

  const rotulo = { fontFamily: FONTE, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.gold, margin: '0 0 6px' }
  const texto = { margin: 0, fontFamily: FONTE_TEXTO, fontSize: 16, lineHeight: 1.65, color: theme.textSub }

  return (
    <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: 2, width: 35, background: theme.gold, position: 'absolute', left: 24, top: 0 }} />

      <div role="tablist" aria-label="Tipo de fonte" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '22px 24px 0' }}>
        {ABAS_AMOSTRA.map(a => {
          const ativa = a.id === aba
          return (
            <button key={a.id} type="button" role="tab" aria-selected={ativa} onClick={() => setAba(a.id)}
              style={{
                fontFamily: FONTE, fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${ativa ? theme.gold : theme.border}`,
                background: ativa ? theme.gold + '18' : 'transparent',
                color: ativa ? theme.goldDark : theme.muted,
              }}>
              {a.rotulo}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '22px 24px 24px', minHeight: 260 }}>
        {!porTipo && !erro && <p style={{ ...texto, fontStyle: 'italic' }}>Carregando amostra…</p>}
        {erro && <p style={{ ...texto, fontStyle: 'italic' }}>Não foi possível carregar a amostra agora. Tente novamente em instantes.</p>}
        {porTipo && !entrada && <p style={{ ...texto, fontStyle: 'italic' }}>Ainda não há amostra pública deste tipo.</p>}

        {entrada && tese && (
          <>
            <div style={{ fontFamily: FONTE, fontSize: 12, color: theme.muted, marginBottom: 10 }}>
              {entrada.area}{entrada.fonte ? ` · ${entrada.fonte}` : ''}
            </div>
            <h3 style={{ margin: '0 0 18px', fontFamily: FONTE_TITULO, fontSize: 21, fontWeight: 600, lineHeight: 1.3, color: theme.text }}>
              {entrada.tema}
            </h3>

            {tese.ratio_decidendi && (
              <div style={{ marginBottom: 16 }}>
                <p style={rotulo}>Tese</p>
                <p style={texto}>{tese.ratio_decidendi}</p>
              </div>
            )}
            {tese.fundamentacao_legal && (
              <div style={{ marginBottom: 16 }}>
                <p style={rotulo}>Fundamento legal</p>
                <p style={texto}>{tese.fundamentacao_legal}</p>
              </div>
            )}
            {entrada.referencia && (
              <div style={{ paddingTop: 14, borderTop: `1px solid ${theme.border}` }}>
                <p style={rotulo}>Fonte</p>
                <p style={{ ...texto, fontSize: 14, color: theme.muted }}>{entrada.referencia}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: theme.bgDeep, borderTop: `1px solid ${theme.border}` }}>
        <button type="button" onClick={outra} disabled={lista.length < 2}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontFamily: FONTE, fontSize: 13, fontWeight: 600, color: lista.length < 2 ? theme.muted : theme.text, cursor: lista.length < 2 ? 'default' : 'pointer', padding: 0 }}>
          <RefreshCw size={14} strokeWidth={1.75} aria-hidden="true" /> Outra amostra
        </button>
        <button type="button" onClick={onCadastrar}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: theme.gold, border: 'none', borderRadius: 6, padding: '10px 16px', fontFamily: FONTE, fontSize: 13, fontWeight: 600, color: '#fdfbf7', cursor: 'pointer' }}>
          Ver o acervo completo <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
