import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { AlertTriangle, ScrollText, ChevronRight } from 'lucide-react'
import { disciplinasFracas } from '../utils/disciplinasFracas'
import { DISCIPLINA_CODIGO, NOME_CODIGO } from '../data/legislacaoNomes'

// ── Pontos fracos + Lei Seca sugerida ────────────────────────────
// Cruza o desempenho real (stats já calculadas em PainelStats) com o banco
// de legislação: para cada disciplina fraca com código mapeado, busca uns
// poucos artigos reais já cadastrados. Nunca gera conteúdo — só aponta o
// que já existe no Repositório para revisão.
export default function OabPontosFracos({ stats, theme }) {
  const fracas = disciplinasFracas(stats)
  const [artigosPorDisc, setArtigosPorDisc] = useState({})

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      const resultado = {}
      for (const d of fracas) {
        const codigo = DISCIPLINA_CODIGO[d.disc]
        if (!codigo) { resultado[d.disc] = { codigo: null, artigos: [] }; continue }
        const { data } = await supabase
          .from('legislacao').select('*')
          .eq('codigo', codigo).eq('vigente', true)
          .order('numero', { ascending: true })
          .limit(5)
        resultado[d.disc] = { codigo, artigos: data || [] }
      }
      if (!cancelado) setArtigosPorDisc(resultado)
    }
    if (fracas.length) carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(fracas.map(d => d.disc))])

  if (fracas.length === 0) return null

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <AlertTriangle size={12} /> Pontos fracos — reforce com a Lei Seca
      </div>
      {fracas.map(d => {
        const info = artigosPorDisc[d.disc]
        return (
          <div key={d.disc} style={{ background: theme.raised, border: `1px solid ${theme.error}33`, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: info?.artigos?.length ? 8 : 0 }}>
              <span style={{ fontSize: 13, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{d.disc}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: theme.error, fontFamily: 'IBM Plex Mono, monospace' }}>{d.pct}% de acerto ({d.acertos}/{d.total})</span>
            </div>

            {!info && <div style={{ fontSize: 11, color: theme.muted }}>Verificando legislação...</div>}

            {info && !info.codigo && (
              <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
                Ainda não há legislação cadastrada para esta disciplina no Repositório.
              </div>
            )}

            {info?.codigo && info.artigos.length === 0 && (
              <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
                {NOME_CODIGO[info.codigo]} — nenhum artigo cadastrado ainda.
              </div>
            )}

            {info?.artigos?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: theme.muted, marginBottom: 6, fontFamily: 'IBM Plex Mono, monospace' }}>
                  <ScrollText size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {NOME_CODIGO[info.codigo]}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {info.artigos.map(a => (
                    <span key={a.id} title={a.titulo || a.texto?.slice(0, 80)}
                      style={{ fontSize: 10, color: theme.gold, background: theme.gold + '12', border: `1px solid ${theme.gold}33`, borderRadius: 4, padding: '2px 8px', fontFamily: 'IBM Plex Mono, monospace', display: 'flex', alignItems: 'center', gap: 2 }}>
                      Art. {a.numero}{a.paragrafo ? `, §${a.paragrafo}` : ''} <ChevronRight size={9} />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
