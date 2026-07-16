import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { DISC_COR } from '../data/disciplinas'
import { fmtData } from '../data/oabQuestoesConstants'
import { ChevronLeft, RefreshCw, TrendingUp, History } from 'lucide-react'

// ── Painel de Estatísticas Persistentes ─────────────────────────
export default function PainelStats({ session, theme, onVoltar }) {
  const [stats, setStats] = useState([])
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const { data } = await supabase
        .from('oab_respostas')
        .select('acertou, modo, sessao_oab_id, criado_em, questao_id, oab_questoes(disciplina, exame)')
        .eq('user_id', session.user.id)
        .order('criado_em', { ascending: false })

      if (!data) { setCarregando(false); return }

      // Stats por disciplina
      const porDisc = {}
      data.forEach(r => {
        const disc = r.oab_questoes?.disciplina || 'Desconhecida'
        if (!porDisc[disc]) porDisc[disc] = { total: 0, acertos: 0 }
        porDisc[disc].total++
        if (r.acertou) porDisc[disc].acertos++
      })
      const statsArr = Object.entries(porDisc)
        .map(([disc, d]) => ({ disc, ...d, pct: Math.round(d.acertos/d.total*100) }))
        .sort((a,b) => b.total - a.total)
      setStats(statsArr)

      // Histórico de sessões (simulado, estudo, bloco)
      const simulados = {}
      data.filter(r => r.sessao_oab_id).forEach(r => {
        const sid = r.sessao_oab_id
        if (!simulados[sid]) simulados[sid] = { id: sid, total: 0, acertos: 0, data: r.criado_em, modo: r.modo }
        simulados[sid].total++
        if (r.acertou) simulados[sid].acertos++
      })
      const histArr = Object.values(simulados)
        .map(s => ({ ...s, pct: Math.round(s.acertos/s.total*100) }))
        .sort((a,b) => new Date(b.data) - new Date(a.data))
        .slice(0, 10)
      setHistorico(histArr)

      setCarregando(false)
    }
    carregar()
  }, [session])

  if (carregando) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:60, color:theme.gold, gap:10 }}>
      <RefreshCw size={16} style={{ animation:'spin 1s linear infinite' }} />
      <span style={{ fontFamily:'Inter, sans-serif', fontSize:13 }}>Carregando estatísticas...</span>
    </div>
  )

  const totalGeral = stats.reduce((a,s) => a + s.total, 0)
  const acertosGeral = stats.reduce((a,s) => a + s.acertos, 0)
  const pctGeral = totalGeral ? Math.round(acertosGeral/totalGeral*100) : 0

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <button onClick={onVoltar} aria-label="Voltar" style={{ background:'none', border:'none', color:theme.muted, cursor:'pointer', padding:0 }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ fontSize:16, fontWeight:700, color:theme.gold, fontFamily:'Playfair Display, serif' }}>
          Estatísticas
        </div>
      </div>

      {/* Resumo geral */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:24 }}>
        {[
          { l:'Respondidas', v: totalGeral,    c: theme.gold },
          { l:'Acertos',     v: acertosGeral,  c: '#10b981'  },
          { l:'Aproveit.',   v: totalGeral ? `${pctGeral}%` : '—', c: pctGeral >= 70 ? '#10b981' : pctGeral >= 50 ? '#f59e0b' : '#ef4444' },
        ].map(k => (
          <div key={k.l} style={{ background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:10, padding:'12px 14px' }}>
            <div style={{ fontSize:10, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginBottom:4 }}>{k.l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:k.c, fontFamily:'IBM Plex Mono, monospace' }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Por disciplina — com gráfico de barras */}
      {stats.length > 0 && (
        <>
          <div style={{ fontSize:11, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginBottom:10 }}>
            <TrendingUp size={11} style={{ marginRight:5, verticalAlign:'middle' }} />Por disciplina
          </div>

          {/* Gráfico de barras SVG */}
          <div style={{ background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:10, padding:'16px 14px', marginBottom:16, overflowX:'auto' }}>
            <div style={{ fontSize:10, color:theme.muted, fontFamily:'IBM Plex Mono, monospace', marginBottom:10 }}>Aproveitamento por disciplina (%)</div>
            <svg width="100%" height={Math.max(180, stats.length * 28)} viewBox={`0 0 320 ${Math.max(180, stats.length * 28)}`} preserveAspectRatio="xMidYMid meet">
              {stats.map((s, i) => {
                const cor = s.pct >= 70 ? '#10b981' : s.pct >= 50 ? '#f59e0b' : '#ef4444'
                const barW = Math.max(2, (s.pct / 100) * 180)
                const y = i * 28 + 4
                const label = s.disc.replace('Direito ', 'D. ').replace('Processual ', 'Proc. ')
                return (
                  <g key={s.disc}>
                    <text x={0} y={y + 13} fontSize={8} fill={theme.muted} fontFamily="IBM Plex Mono, monospace">{label.slice(0,18)}</text>
                    <rect x={120} y={y + 4} width={barW} height={12} rx={3} fill={cor} opacity={0.85} />
                    <rect x={120} y={y + 4} width={180} height={12} rx={3} fill="none" stroke={theme.border} strokeWidth={0.5} />
                    <text x={120 + barW + 4} y={y + 14} fontSize={8} fill={cor} fontFamily="IBM Plex Mono, monospace" fontWeight="bold">{s.pct}%</text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Lista detalhada */}
          {stats.map(s => {
            const cor = DISC_COR[s.disc] || '#6b7280'
            return (
              <div key={s.disc} style={{ background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:8, padding:'10px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:cor }} />
                    <span style={{ fontSize:12, color:theme.text, fontFamily:'Inter, sans-serif' }}>{s.disc}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color: s.pct >= 70 ? '#10b981' : s.pct >= 50 ? '#f59e0b' : '#ef4444', fontFamily:'IBM Plex Mono, monospace' }}>
                    {s.acertos}/{s.total} ({s.pct}%)
                  </span>
                </div>
                <div style={{ height:4, background:theme.border, borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${s.pct}%`, background: s.pct >= 70 ? '#10b981' : s.pct >= 50 ? '#f59e0b' : '#ef4444', borderRadius:2, transition:'width .4s' }} />
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* Histórico de simulados */}
      {historico.length > 0 && (
        <>
          <div style={{ fontSize:11, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginTop:20, marginBottom:10 }}>
            <History size={11} style={{ marginRight:5, verticalAlign:'middle' }} />Sessões realizadas
          </div>
          {historico.map((s, i) => (
            <div key={s.id} style={{ background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:8, padding:'10px 14px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:12, color:theme.text, fontFamily:'Inter, sans-serif', fontWeight:600 }}>
                  {s.modo === 'simulado' ? 'Simulado' : s.modo === 'bloco' ? 'Bloco' : 'Estudo'} #{historico.length - i}
                </div>
                <div style={{ fontSize:10, color:theme.muted, fontFamily:'IBM Plex Mono, monospace', marginTop:2 }}>
                  {fmtData(s.data)} · {s.total} questões
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:18, fontWeight:700, color: s.pct >= 70 ? '#10b981' : s.pct >= 50 ? '#f59e0b' : '#ef4444', fontFamily:'IBM Plex Mono, monospace' }}>
                  {s.pct}%
                </div>
                <div style={{ fontSize:10, color:theme.muted, fontFamily:'IBM Plex Mono, monospace' }}>
                  {s.acertos}/{s.total}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {stats.length === 0 && (
        <div style={{ textAlign:'center', padding:40, color:theme.muted, fontFamily:'Inter, sans-serif', fontSize:13 }}>
          Nenhuma questão respondida ainda.
        </div>
      )}

      {/* Exportar relatório */}
      {stats.length > 0 && (
        <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${theme.border}` }}>
          <button onClick={async () => {
            const { data } = await supabase
              .from('oab_respostas')
              .select('acertou, oab_questoes(enunciado, disciplina, gabarito, justificativa, alternativa_a, alternativa_b, alternativa_c, alternativa_d)')
              .eq('user_id', session.user.id)
              .eq('acertou', false)
              .order('criado_em', { ascending: false })
              .limit(50)
            if (!data?.length) return alert('Nenhum erro registrado ainda.')
            const linhas = data.map((r,i) => {
              const q = r.oab_questoes
              const sep = Array(61).join('─')
              return (i+1)+'. ['+(q?.disciplina||'')+']\n'+(q?.enunciado||'')+'\n\nGabarito: '+(q?.gabarito||'')+(q?.justificativa ? '\nJustificativa: '+q.justificativa : '')+'\n'+sep
            }).join('\n\n')
            const cabecalho = 'RELATÓRIO DE ERROS — LEX.IA\nJéssica Farias Fusquiani\n'+new Date().toLocaleDateString('pt-BR')+'\n\n'+Array(61).join('═')+'\n\n'
            const blob = new Blob([cabecalho+linhas], { type: 'text/plain; charset=utf-8' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `erros_lexia_${new Date().toISOString().slice(0,10)}.txt`
            a.click()
          }}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'none', border:`1px solid ${theme.border}`, borderRadius:8, padding:'10px', fontSize:12, color:theme.muted, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
            ↓ Exportar relatório de erros (.txt)
          </button>
        </div>
      )}
    </div>
  )
}
