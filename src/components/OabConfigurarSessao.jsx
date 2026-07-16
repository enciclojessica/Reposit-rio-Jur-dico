import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { DISCIPLINAS, EXAMES, MODOS } from '../data/oabQuestoesConstants'
import { BarChart2, RotateCcw, Search, Zap } from 'lucide-react'

// ── Tela de configuração ────────────────────────────────────────
export default function ConfigurarSessao({ onIniciar, onZerar, onStats, stats, disciplinaInicial, buscaInicial, theme }) {
  const [modo, setModo]         = useState('estudo')
  const [disciplina, setDisc]   = useState(disciplinaInicial || 'Todas')
  const [exame, setExame]       = useState('Todos')
  const [qtdCustom, setQtdCustom] = useState(10)
  const [busca, setBusca]       = useState(buscaInicial || '')
  const [topico, setTopico]     = useState('Todos')
  const [topicos, setTopicos]   = useState([])

  // Buscar tópicos quando disciplina muda
  useEffect(() => {
    if (disciplina === 'Todas') { setTopicos([]); setTopico('Todos'); return }
    supabase.from('oab_questoes').select('topico').eq('disciplina', disciplina).not('topico','is',null)
      .then(({ data }) => {
        const uniq = [...new Set((data||[]).map(r=>r.topico).filter(Boolean))].sort()
        setTopicos(uniq); setTopico('Todos')
      })
  }, [disciplina])

  // Atualizar disciplina se vier do cronograma
  useEffect(() => { if (disciplinaInicial) setDisc(disciplinaInicial) }, [disciplinaInicial])

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
        <div style={{ fontSize:18, fontWeight:700, color:theme.gold, fontFamily:'Playfair Display, serif' }}>
          Banco de Questões OAB
        </div>
        <button onClick={onStats}
          style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:`1px solid ${theme.border}`, borderRadius:7, padding:'5px 10px', color:theme.muted, fontSize:11, cursor:'pointer', fontFamily:'IBM Plex Mono, monospace' }}>
          <BarChart2 size={12} /> Estatísticas
        </button>
      </div>
      <div style={{ fontSize:12, color:theme.muted, fontFamily:'Inter, sans-serif', marginBottom:20 }}>
        Exames 38º ao 45º — {633} questões FGV
      </div>

      {/* Stats rápidos */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
        {[
          { l:'Respondidas', v: stats.total,    c: theme.gold  },
          { l:'Acertos',     v: stats.acertos,  c: '#10b981'   },
          { l:'Aproveit.',   v: stats.total ? `${Math.round(stats.acertos/stats.total*100)}%` : '—', c: '#3b82f6' },
        ].map(k => (
          <div key={k.l} style={{ background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:10, padding:'12px 14px' }}>
            <div style={{ fontSize:10, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginBottom:4 }}>{k.l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:k.c, fontFamily:'IBM Plex Mono, monospace' }}>{k.v}</div>
          </div>
        ))}
      </div>

      {stats.total > 0 && (
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12, marginTop:-8 }}>
          <button onClick={onZerar}
            style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:`1px solid #ef444433`, borderRadius:6, padding:'4px 12px', color:'#ef4444', fontSize:11, cursor:'pointer', fontFamily:'IBM Plex Mono, monospace' }}>
            <RotateCcw size={11} /> Zerar estatísticas
          </button>
        </div>
      )}

      {/* Busca por palavra-chave */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginBottom:6 }}>Busca por palavra-chave</div>
        <div style={{ position:'relative' }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:theme.muted }} />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Ex: sigilo profissional, usucapião..."
            style={{ width:'100%', background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:8, color:theme.text, fontSize:12, padding:'8px 10px 8px 30px', fontFamily:'Inter, sans-serif', outline:'none', boxSizing:'border-box' }}
          />
        </div>
      </div>

      {/* Modo */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginBottom:8 }}>Modo</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {MODOS.map(m => (
            <button key={m.id} onClick={() => setModo(m.id)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background: modo===m.id ? theme.gold+'11' : theme.raised, border:`1px solid ${modo===m.id ? theme.gold+'66' : theme.border}`, borderRadius:10, cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: modo===m.id ? theme.gold : theme.border, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:13, fontWeight:600, color: modo===m.id ? theme.gold : theme.text, fontFamily:'Inter, sans-serif' }}>{m.label}</div>
                <div style={{ fontSize:11, color:theme.muted, fontFamily:'Inter, sans-serif' }}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros — ocultos no modo revisão e favoritas */}
      {modo !== 'revisao' && modo !== 'favoritas' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginBottom:6 }}>Disciplina</div>
              <select value={disciplina} onChange={e => setDisc(e.target.value)}
                style={{ width:'100%', background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:8, color:theme.text, fontSize:12, padding:'8px 10px', fontFamily:'Inter, sans-serif', outline:'none' }}>
                <option value="Todas">Todas</option>
                {DISCIPLINAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginBottom:6 }}>Exame</div>
              <select value={exame} onChange={e => setExame(e.target.value)}
                style={{ width:'100%', background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:8, color:theme.text, fontSize:12, padding:'8px 10px', fontFamily:'Inter, sans-serif', outline:'none' }}>
                {EXAMES.map(e => <option key={e} value={e}>{e==='Todos' ? 'Todos' : `${e}º Exame`}</option>)}
              </select>
            </div>
          </div>
          {disciplina !== 'Todas' && topicos.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginBottom:6 }}>Tópico</div>
              <select value={topico} onChange={e => setTopico(e.target.value)}
                style={{ width:'100%', background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:8, color:theme.text, fontSize:12, padding:'8px 10px', fontFamily:'Inter, sans-serif', outline:'none' }}>
                <option value="Todos">Todos os tópicos</option>
                {topicos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>
      )}


      {/* Nota sobre o simulado */}
      {modo === 'simulado' && (
        <div style={{ marginBottom:12, padding:'8px 12px', background:'#B8930A11', border:'1px solid #B8930A33', borderRadius:8, fontSize:11, color:'#B8930A', fontFamily:'IBM Plex Mono, monospace' }}>
          80 questões cronometradas. Use o filtro de disciplina acima para simular uma prova temática.
        </div>
      )}

      {/* Quantidade — só estudo e bloco */}
      {(modo === 'estudo' || modo === 'bloco') && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:theme.muted, textTransform:'uppercase', letterSpacing:1, fontFamily:'IBM Plex Mono, monospace', marginBottom:8 }}>Quantidade de questões</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[5, 10, 15, 20, 30].map(n => (
              <button key={n} onClick={() => setQtdCustom(n)}
                style={{ padding:'7px 16px', borderRadius:8, border:`1px solid ${qtdCustom===n ? theme.gold+'66' : theme.border}`, background: qtdCustom===n ? theme.gold+'11' : theme.raised, color: qtdCustom===n ? theme.gold : theme.muted, fontSize:13, fontWeight: qtdCustom===n ? 700 : 400, cursor:'pointer', fontFamily:'IBM Plex Mono, monospace' }}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => onIniciar({ modo, disciplina, exame, topico, qtdCustom, busca: busca.trim() })}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:theme.gold, border:'none', borderRadius:10, padding:'13px', fontSize:14, fontWeight:700, color:'#0b0f1a', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
        <Zap size={16} /> Iniciar sessão
      </button>
    </div>
  )
}
