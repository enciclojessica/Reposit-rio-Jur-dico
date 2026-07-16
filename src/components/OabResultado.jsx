import { DISC_COR } from '../data/disciplinas'
import { fmtTempo } from '../data/oabQuestoesConstants'
import { Trophy, XCircle, Target, RotateCcw } from 'lucide-react'

// ── Resultado final ─────────────────────────────────────────────
export default function Resultado({ respostas, questoes, tempo, onReiniciar, onRevisao, theme }) {
  const total    = questoes.length
  const acertos  = questoes.filter(q => respostas[q.id] === q.gabarito).length
  const erros    = questoes.filter(q => respostas[q.id] && respostas[q.id] !== q.gabarito).length
  const pct      = Math.round(acertos/total*100)
  const aprovado = pct >= 50

  const porDisc = {}
  questoes.forEach(q => {
    if (!porDisc[q.disciplina]) porDisc[q.disciplina] = { total:0, acertos:0 }
    porDisc[q.disciplina].total++
    if (respostas[q.id] === q.gabarito) porDisc[q.disciplina].acertos++
  })

  return (
    <div>
      <div style={{ background: aprovado ? '#0f2b1a' : '#2a0810', border:`1px solid ${aprovado ? '#10b981' : '#ef4444'}`, borderRadius:12, padding:'20px', marginBottom:20, textAlign:'center' }}>
        {aprovado ? <Trophy size={32} color="#10b981" style={{ marginBottom:10 }} /> : <XCircle size={32} color="#ef4444" style={{ marginBottom:10 }} />}
        <div style={{ fontSize:42, fontWeight:700, color: aprovado ? '#10b981' : '#ef4444', fontFamily:'IBM Plex Mono, monospace' }}>{pct}%</div>
        <div style={{ fontSize:14, color:theme.text, fontFamily:'Inter, sans-serif', marginTop:4 }}>
          {acertos} de {total} questões corretas
        </div>
        {tempo > 0 && (
          <div style={{ fontSize:12, color:theme.muted, fontFamily:'IBM Plex Mono, monospace', marginTop:6 }}>
            Tempo: {fmtTempo(tempo)}
          </div>
        )}
      </div>

      <div style={{ fontSize:11, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginBottom:10 }}>Por disciplina</div>
      {Object.entries(porDisc).map(([disc, dp]) => {
        const cor = DISC_COR[disc] || '#6b7280'
        const p   = Math.round(dp.acertos/dp.total*100)
        return (
          <div key={disc} style={{ background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:8, padding:'10px 14px', marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:cor }} />
                <span style={{ fontSize:13, color:theme.text, fontFamily:'Inter, sans-serif' }}>{disc}</span>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color: p>=70?'#10b981':p>=50?'#f59e0b':'#ef4444', fontFamily:'IBM Plex Mono, monospace' }}>
                {dp.acertos}/{dp.total} ({p}%)
              </span>
            </div>
            <div style={{ height:4, background:theme.border, borderRadius:2 }}>
              <div style={{ height:'100%', width:`${p}%`, background: p>=70?'#10b981':p>=50?'#f59e0b':'#ef4444', borderRadius:2, transition:'width .4s' }} />
            </div>
          </div>
        )
      })}

      <div style={{ display:'flex', gap:10, marginTop:16 }}>
        {erros > 0 && (
          <button onClick={onRevisao}
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'none', border:`1px solid ${theme.gold}66`, borderRadius:10, padding:'12px', fontSize:13, fontWeight:600, color:theme.gold, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
            <Target size={15} /> Revisar {erros} erro{erros > 1 ? 's' : ''}
          </button>
        )}
        <button onClick={onReiniciar}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:theme.gold, border:'none', borderRadius:10, padding:'12px', fontSize:13, fontWeight:700, color:'#0b0f1a', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
          <RotateCcw size={15} /> Nova sessão
        </button>
      </div>
    </div>
  )
}
