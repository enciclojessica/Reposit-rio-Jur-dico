import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import {
  CheckCircle, XCircle, ChevronRight, RotateCcw,
  Timer, Trophy, BookOpen, Zap, RefreshCw,
  ChevronLeft, BarChart2, AlertCircle, Search,
  History, Target, TrendingUp, Bookmark, BookmarkCheck, Scissors
} from 'lucide-react'

const DISC_COR = {
  "Ética Profissional":     "#7c3aed",
  "Direito Civil":          "#16a34a",
  "Processo Civil":         "#2563eb",
  "Direito Constitucional": "#0284c7",
  "Direito Penal":          "#e11d48",
  "Processo Penal":         "#a21caf",
  "Direito do Trabalho":    "#d97706",
  "Direito Tributário":     "#ea580c",
  "Direito Administrativo": "#be185d",
  "Direito Empresarial":    "#64748b",
  "Direito Ambiental":      "#15803d",
  "Direito Internacional":  "#0369a1",
  "Direitos Humanos":       "#b45309",
  "Direito Financeiro":     "#7e22ce",
  "Direito Eleitoral":      "#be123c",
  "Direito Digital e LGPD": "#0f766e",
  "Filosofia do Direito":   "#92400e",
  "Direito Previdenciário": "#1d4ed8",
  "Direito Processual Civil":  "#2563eb",
  "Direito Processual Penal":  "#a21caf",
  "Direito Processual do Trabalho": "#d97706",
  "Direito do Consumidor":          "#047857",
  "Direito da Criança e do Adolescente": "#db2777",
}

const DISCIPLINAS = Object.keys(DISC_COR)
const EXAMES = ['Todos','38','39','40','41','42','43','44','45']
const MODOS  = [
  { id: 'estudo',    label: 'Estudo',    desc: 'Uma por vez com feedback imediato' },
  { id: 'bloco',     label: 'Bloco',     desc: 'Responda todas e veja o resultado' },
  { id: 'revisao',   label: 'Revisão',   desc: 'Só questões que você errou antes' },
  { id: 'favoritas', label: 'Favoritas', desc: 'Questões que você marcou com ★' },
  { id: 'simulado',  label: 'Simulado',  desc: '80 questões cronometradas — condições reais' },
]

const EXAME_ANO = {
  '38': '2023.1', '39': '2023.2', '40': '2024.1', '41': '2024.2',
  '42': '2024.3', '43': '2025.1', '44': '2025.2', '45': '2025.3',
}

function fmtTempo(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
}

function fmtData(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
}

// ── Painel de Estatísticas Persistentes ─────────────────────────
function PainelStats({ session, theme, onVoltar }) {
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
        <button onClick={onVoltar} style={{ background:'none', border:'none', color:theme.muted, cursor:'pointer', padding:0 }}>
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
                    <text x={0} y={y + 13} fontSize={8} fill="#9b8b7a" fontFamily="IBM Plex Mono, monospace">{label.slice(0,18)}</text>
                    <rect x={120} y={y + 4} width={barW} height={12} rx={3} fill={cor} opacity={0.85} />
                    <rect x={120} y={y + 4} width={180} height={12} rx={3} fill="none" stroke="#2a2a2a" strokeWidth={0.5} />
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

// ── Tela de configuração ────────────────────────────────────────
function ConfigurarSessao({ onIniciar, onZerar, onStats, stats, disciplinaInicial, buscaInicial, theme }) {
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

      {/* Filtros — ocultos no modo revisão, favoritas e simulado */}
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

// ── Card de questão ─────────────────────────────────────────────
// ── Anotação por questão (localStorage) ─────────────────────────
function AnotacaoQuestao({ questaoId, theme }) {
  const key = `lexia_nota_${questaoId}`
  const [nota, setNota] = useState(() => {
    try { return localStorage.getItem(key) || '' } catch { return '' }
  })
  const [aberto, setAberto] = useState(false)

  function salvar(v) {
    setNota(v)
    try { v ? localStorage.setItem(key, v) : localStorage.removeItem(key) } catch {}
  }

  return (
    <div style={{ marginTop:10 }}>
      <button onClick={() => setAberto(a => !a)}
        style={{ fontSize:10, background:'none', border:`1px solid ${theme.border}`, borderRadius:6, color:nota ? theme.gold : theme.muted, padding:'4px 10px', cursor:'pointer', fontFamily:'IBM Plex Mono, monospace', display:'flex', alignItems:'center', gap:5 }}>
        ✍️ {nota ? 'Ver anotação' : 'Adicionar anotação'}
      </button>
      {aberto && (
        <textarea value={nota} onChange={e => salvar(e.target.value)}
          placeholder="Sua anotação sobre esta questão..."
          style={{ marginTop:6, width:'100%', minHeight:70, background:theme.raised, border:`1px solid ${nota ? theme.gold+'66' : theme.border}`, borderRadius:8, color:theme.text, fontSize:12, padding:'8px 10px', fontFamily:'Georgia, serif', lineHeight:1.5, resize:'vertical', outline:'none', boxSizing:'border-box' }}
        />
      )}
    </div>
  )
}

function QuestaoCard({ questao, idx, total, respondida, respostaDada, onResponder, mostrarGabarito, favorita, onFavoritar, isAdmin, onReclassificar, theme }) {
  const [selecionada, setSelecionada] = useState(respostaDada || null)
  const [eliminadas, setEliminadas]   = useState(new Set())

  function toggleEliminar(alt) {
    if (respondida) return
    setEliminadas(prev => {
      const novo = new Set(prev)
      novo.has(alt) ? novo.delete(alt) : novo.add(alt)
      return novo
    })
  }
  const [editando, setEditando]       = useState(false)
  const [editDisc, setEditDisc]       = useState(questao.disciplina)
  const [editTopico, setEditTopico]   = useState(questao.topico || '')
  const [salvando, setSalvando]       = useState(false)
  const [sugerindo, setSugerindo]     = useState(false)
  const cor = DISC_COR[questao.disciplina] || '#6b7280'
  const alts = ['A','B','C','D']

  async function salvarEdicao() {
    setSalvando(true)
    await supabase.from('oab_questoes').update({ disciplina: editDisc, topico: editTopico || null }).eq('id', questao.id)
    setSalvando(false)
    setEditando(false)
    const disciplinaOriginal = questao.disciplina
    questao.disciplina = editDisc
    questao.topico = editTopico || null
    // Se a disciplina mudou, notificar o pai para remover da sessão atual
    if (editDisc !== disciplinaOriginal && onReclassificar) {
      onReclassificar(questao.id)
    }
  }

  async function sugerirClassificacao() {
    setSugerindo(true)
    try {
      const res = await fetch('/api/busca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          messages: [{ role: 'user', content:
            `Classifique esta questão jurídica OAB/FGV com a disciplina e tópico corretos.\n\nEnunciado: ${questao.enunciado.slice(0,500)}\n\nDisciplinas possíveis: ${Object.keys(DISC_COR).filter(d=>d!=='Simulado Geral').join(', ')}\n\nResponda SOMENTE com JSON: {"disciplina":"...","topico":"..."}` }]
        })
      })
      const data = await res.json()
      const txt = data.content?.[0]?.text || ''
      const clean = txt.replace(/```json/g,'').replace(/```/g,'').trim()
      const parsed = JSON.parse(clean)
      if (parsed.disciplina) setEditDisc(parsed.disciplina)
      if (parsed.topico)     setEditTopico(parsed.topico)
    } catch { /* silencioso */ }
    setSugerindo(false)
  }

  // Sincronizar selecionada quando muda de questão
  useEffect(() => { setSelecionada(respostaDada || null) }, [questao.id, respostaDada])

  function escolher(alt) {
    if (respondida) return
    setSelecionada(alt)
    if (mostrarGabarito) onResponder(questao.id, alt)
  }

  function confirmar() {
    if (!selecionada || respondida) return
    onResponder(questao.id, selecionada)
  }

  const acertou = respondida && selecionada === questao.gabarito

  return (
    <div style={{ background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:12, padding:'18px 16px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {editando ? (
          <>
            <select value={editDisc} onChange={e => setEditDisc(e.target.value)}
              style={{ fontSize:11, background:'#1a0608', border:'1px solid #B8930A', borderRadius:6, color:'#F5F0E8', padding:'3px 8px', fontFamily:'IBM Plex Mono, monospace' }}>
              {Object.keys(DISC_COR).filter(d => d !== 'Simulado Geral').map(d =>
                <option key={d} value={d}>{d}</option>
              )}
            </select>
            <input value={editTopico} onChange={e => setEditTopico(e.target.value)}
              placeholder="Tópico..."
              style={{ fontSize:11, background:'#1a0608', border:'1px solid #B8930A', borderRadius:6, color:'#F5F0E8', padding:'3px 8px', fontFamily:'IBM Plex Mono, monospace', width:160 }} />
            <button onClick={sugerirClassificacao} disabled={sugerindo}
              title="Deixar a IA sugerir a classificação correta"
              style={{ fontSize:10, background:'#1a1a2e', border:'1px solid #7C3AED', borderRadius:5, color:'#7C3AED', padding:'3px 8px', cursor:'pointer' }}>
              {sugerindo ? '...' : '✨ IA'}
            </button>
            <button onClick={salvarEdicao} disabled={salvando}
              style={{ fontSize:10, background:'#B8930A', border:'none', borderRadius:5, color:'#000', padding:'3px 10px', cursor:'pointer', fontWeight:700 }}>
              {salvando ? '...' : 'Salvar'}
            </button>
            <button onClick={() => setEditando(false)}
              style={{ fontSize:10, background:'none', border:'1px solid #6b7280', borderRadius:5, color:'#6b7280', padding:'3px 8px', cursor:'pointer' }}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize:10, fontWeight:600, color:cor, background:cor+'18', border:`1px solid ${cor}33`, borderRadius:4, padding:'2px 7px', fontFamily:'IBM Plex Mono, monospace' }}>
              {questao.disciplina}
            </span>
            {questao.topico && (
              <span style={{ fontSize:10, color:'#94a3b8', background:'#94a3b810', border:'1px solid #94a3b822', borderRadius:4, padding:'2px 7px', fontFamily:'IBM Plex Mono, monospace' }}>
                {questao.topico}
              </span>
            )}
            {questao.exame && (
              <span style={{ fontSize:10, fontWeight:600, color:'#94a3b8', background:'#94a3b818', border:'1px solid #94a3b833', borderRadius:4, padding:'2px 7px', fontFamily:'IBM Plex Mono, monospace' }}>
                {`${questao.exame}º Exame`}{EXAME_ANO[questao.exame] ? ` · ${EXAME_ANO[questao.exame]}` : ''}
              </span>
            )}
            {isAdmin && (
              <button onClick={() => { setEditDisc(questao.disciplina); setEditTopico(questao.topico||''); setEditando(true) }}
                title="Editar classificação"
                style={{ fontSize:9, background:'none', border:'1px solid #6b728044', borderRadius:4, color:'#6b7280', padding:'2px 6px', cursor:'pointer', fontFamily:'IBM Plex Mono, monospace' }}>
                ✏️ editar
              </button>
            )}
          </>
        )}
        <span style={{ fontSize:10, color:theme.muted, fontFamily:'IBM Plex Mono, monospace', marginLeft:'auto' }}>
          {idx+1}/{total}
        </span>
        <button onClick={() => onFavoritar && onFavoritar(questao.id)}
          title={favorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 4px', color: favorita ? theme.gold : theme.muted, flexShrink:0 }}>
          {favorita ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      {/* Enunciado com highlight de busca */}
      <div style={{ fontSize:14, color:theme.text, fontFamily:'Georgia, serif', lineHeight:1.7, marginBottom:16 }}>
        {questao._busca ? (() => {
          const termos = questao._busca.split(/\s+/).filter(t => t.length > 2)
          if (!termos.length) return questao.enunciado
          const regex = new RegExp(`(${termos.map(t => t.replace(/[.*+?^${}()|[\]\\]/g,'\\')).join('|')})`, 'gi')
          const partes = questao.enunciado.split(regex)
          return partes.map((p, i) => regex.test(p)
            ? <mark key={i} style={{ background:'#B8930A33', color:theme.gold, borderRadius:2, padding:'0 2px' }}>{p}</mark>
            : p
          )
        })() : questao.enunciado}
      </div>

      {/* Alternativas */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
        {alts.map(alt => {
          const texto = questao[`alternativa_${alt.toLowerCase()}`]
          if (!texto) return null
          const isCorreta    = respondida && alt === questao.gabarito
          const isErrada     = respondida && alt === selecionada && alt !== questao.gabarito
          const isSelecionada = selecionada === alt
          const isEliminada  = eliminadas.has(alt)

          let bg = theme.cardBg, border = theme.border, textCor = theme.text
          if (isCorreta)    { bg = '#0f2b1a'; border = '#10b981'; textCor = '#10b981' }
          else if (isErrada){ bg = '#2a0810'; border = '#ef4444'; textCor = '#ef4444' }
          else if (isSelecionada && !respondida) { bg = theme.gold+'11'; border = theme.gold+'66'; textCor = theme.gold }
          else if (isEliminada && !respondida)   { bg = theme.raised; border = theme.border; textCor = theme.muted }

          return (
            <div key={alt} style={{ display:'flex', alignItems:'flex-start', gap:6 }}>
              {/* Tesoura — só antes de responder */}
              {!respondida && (
                <button
                  onClick={() => toggleEliminar(alt)}
                  title={isEliminada ? 'Restaurar alternativa' : 'Eliminar alternativa'}
                  style={{ flexShrink:0, marginTop:8, background:'none', border:'none', cursor:'pointer', color: isEliminada ? '#ef4444' : theme.muted, opacity: isEliminada ? 1 : 0.4, padding:'2px', transition:'all .15s' }}>
                  <Scissors size={13} />
                </button>
              )}
              <button onClick={() => !isEliminada && escolher(alt)} disabled={respondida || isEliminada}
                style={{ flex:1, display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', background:bg, border:`1px solid ${border}`, borderRadius:8, cursor: respondida || isEliminada ? 'default' : 'pointer', textAlign:'left', transition:'all .15s', opacity: isEliminada ? 0.45 : 1 }}>
                <span style={{ width:22, height:22, borderRadius:'50%', background: isSelecionada||isCorreta||isErrada ? border : theme.border, color: isSelecionada||isCorreta||isErrada ? '#fff' : theme.muted, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'IBM Plex Mono, monospace' }}>
                  {isCorreta ? '✓' : isErrada ? '✗' : alt}
                </span>
                <span style={{ fontSize:13, color:textCor, fontFamily:'Georgia, serif', lineHeight:1.5, textDecoration: isEliminada ? 'line-through' : 'none' }}>{texto}</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Confirmar (bloco) */}
      {!respondida && !mostrarGabarito && selecionada && (
        <button onClick={confirmar}
          style={{ width:'100%', background:theme.gold, border:'none', borderRadius:8, padding:'10px', fontSize:13, fontWeight:700, color:'#0b0f1a', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
          Confirmar resposta
        </button>
      )}

      {/* Feedback */}
      {respondida && (
        <div style={{ marginTop:12, padding:'12px 14px', background: acertou ? '#0f2b1a' : '#2a0810', border:`1px solid ${acertou ? '#10b981' : '#ef4444'}`, borderRadius:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: questao.justificativa ? 8 : 0 }}>
            {acertou ? <CheckCircle size={15} color="#10b981" /> : <XCircle size={15} color="#ef4444" />}
            <span style={{ fontSize:13, fontWeight:700, color: acertou ? '#10b981' : '#ef4444', fontFamily:'Inter, sans-serif' }}>
              {acertou ? 'Correto!' : `Errado — Gabarito: ${questao.gabarito}`}
            </span>
          </div>
          {questao.justificativa && (
            <div style={{ fontSize:12, color:'#e2e8f0', fontFamily:'Georgia, serif', lineHeight:1.6 }}>
              {questao.justificativa}
            </div>
          )}
          {questao.dispositivo && (
            <div style={{ fontSize:11, color:theme.gold, fontFamily:'IBM Plex Mono, monospace', marginTop:6 }}>
              Base: {questao.dispositivo}
            </div>
          )}
        </div>
      )}

      {/* Anotação pessoal */}
      {respondida && <AnotacaoQuestao questaoId={questao.id} theme={theme} />}
    </div>
  )
}

// ── Resultado final ─────────────────────────────────────────────
function Resultado({ respostas, questoes, tempo, onReiniciar, onRevisao, theme }) {
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

// ── Componente principal ────────────────────────────────────────
export default function OabQuestoes({ session, sessaoOabId, disciplinaInicial, topicoSessao }) {
  const { theme } = useTheme()
  const [tela, setTela]       = useState(() => { try { return localStorage.getItem('oab_tela') || 'config' } catch { return 'config' } })
  const [questoes, setQuestoes] = useState(() => { try { return JSON.parse(localStorage.getItem('oab_questoes') || '[]') } catch { return [] } })
  const [respostas, setRespostas] = useState(() => { try { return JSON.parse(localStorage.getItem('oab_respostas') || '{}') } catch { return {} } })
  const [idx, setIdx]         = useState(() => { try { return parseInt(localStorage.getItem('oab_idx') || '0', 10) } catch { return 0 } })
  const [config, setConfig]   = useState(() => { try { return JSON.parse(localStorage.getItem('oab_config') || 'null') } catch { return null } })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]       = useState(null)
  const [tempo, setTempo]     = useState(() => { try { return parseInt(localStorage.getItem('oab_tempo') || '0', 10) } catch { return 0 } })
  const [rodando, setRodando] = useState(false)
  const timerRef = useRef(null)
  const [statsGerais, setStatsGerais] = useState({ total:0, acertos:0 })
  const [favoritas, setFavoritas] = useState(new Set())
  const [entradasSugeridas, setEntradasSugeridas] = useState([])
  const [isAdmin, setIsAdmin]     = useState(false)

  // Verificar se é admin
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('membros').select('role').eq('user_id', user.id).single()
        .then(({ data }) => { if (data?.role === 'admin') setIsAdmin(true) })
    })
  }, [])

  // Extrair palavras-chave do tópico descritivo do cronograma
  function extrairBusca(topicoDescritivo) {
    if (!topicoDescritivo) return ''
    // Remover referências a artigos (arts. X–Y, Lei XXXX/XX) e pegar os temas principais
    const semArtigos = topicoDescritivo
      .replace(/CC\/\d+\s+arts?\.\s*[\d–\-–]+[^:;,]*/gi, '')
      .replace(/CF\/\d+\s+arts?\.\s*[\d§°–\-]+[^:;,]*/gi, '')
      .replace(/CPC\/\d+\s+arts?\.\s*[\d–\-]+[^:;,]*/gi, '')
      .replace(/CP\s+arts?\.\s*[\d–\-]+[^:;,]*/gi, '')
      .replace(/CPP\s+arts?\.\s*[\d–\-]+[^:;,]*/gi, '')
      .replace(/CLT\s+arts?\.\s*[\d–\-]+[^:;,]*/gi, '')
      .replace(/Lei\s+[\d.]+\/\d+[^:;,]*/gi, '')
      .replace(/Resolução\s+OAB[^:;,]*/gi, '')
      .replace(/arts?\.\s*[\d§°–\-,\s]+/gi, '')
      .replace(/Súmulas?\s+STJ\/STF/gi, '')
      .replace(/Questões\s+FGV/gi, '')
      .replace(/Lei\s+Seca/gi, '')
    // Pegar a parte após ":" se existir (geralmente é o resumo do tema)
    const partes = semArtigos.split(':')
    const tema = (partes.length > 1 ? partes.slice(1).join(':') : partes[0])
      .replace(/[—\-–]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    // Pegar as 3 primeiras palavras significativas
    const palavras = tema.split(/[,;]+/)[0].trim().split(' ').filter(p => p.length > 3).slice(0, 3)
    return palavras.join(' ')
  }

  // Se veio do cronograma com disciplina pré-selecionada, iniciar direto
  useEffect(() => {
    if (disciplinaInicial) {
      setTela('config')
      setQuestoes([])
      setRespostas({})
      setIdx(0)
    }
  }, [disciplinaInicial])

  useEffect(() => { if (session) { carregarStats(); carregarFavoritas() } }, [session])

  useEffect(() => {
    if (rodando) { timerRef.current = setInterval(() => setTempo(t => t+1), 1000) }
    else { clearInterval(timerRef.current) }
    return () => clearInterval(timerRef.current)
  }, [rodando])

  useEffect(() => {
    try {
      localStorage.setItem('oab_tela', tela)
      localStorage.setItem('oab_questoes', JSON.stringify(questoes))
      localStorage.setItem('oab_respostas', JSON.stringify(respostas))
      localStorage.setItem('oab_idx', String(idx))
      localStorage.setItem('oab_config', JSON.stringify(config))
      localStorage.setItem('oab_tempo', String(tempo))
    } catch {}
  }, [tela, questoes, respostas, idx, config, tempo])

  async function carregarStats() {
    const { data } = await supabase.from('oab_respostas').select('acertou').eq('user_id', session.user.id)
    if (data) setStatsGerais({ total: data.length, acertos: data.filter(r => r.acertou).length })
  }

  async function carregarFavoritas() {
    const { data } = await supabase
      .from('oab_favoritas')
      .select('questao_id')
      .eq('user_id', session.user.id)
    if (data) setFavoritas(new Set(data.map(f => f.questao_id)))
  }

  async function toggleFavorita(questaoId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (favoritas.has(questaoId)) {
      await supabase.from('oab_favoritas')
        .delete()
        .eq('user_id', user.id)
        .eq('questao_id', questaoId)
      setFavoritas(prev => { const s = new Set(prev); s.delete(questaoId); return s })
    } else {
      await supabase.from('oab_favoritas')
        .insert({ user_id: user.id, questao_id: questaoId })
      setFavoritas(prev => new Set([...prev, questaoId]))
    }
  }

  async function zerarEstatisticas() {
    if (!window.confirm('Zerar todas as estatísticas? Esta ação não pode ser desfeita.')) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('oab_respostas').delete().eq('user_id', user.id)
    setStatsGerais({ total:0, acertos:0 })
  }

  async function iniciarSessao(cfg) {
    setConfig(cfg)
    setCarregando(true)
    setErro(null)

    const qtd = cfg.modo === 'simulado' ? 80 : (cfg.qtdCustom || 10)
    let selecionadas = []

    try {
      // ── Modo Favoritas ──
      if (cfg.modo === 'favoritas') {
        if (favoritas.size === 0) {
          setErro('Você ainda não marcou nenhuma questão como favorita. Use o ★ durante a sessão.')
          setCarregando(false)
          return
        }
        const { data: questoesFav } = await supabase
          .from('oab_questoes')
          .select('*')
          .in('id', [...favoritas].slice(0, 200))

        if (!questoesFav || questoesFav.length === 0) {
          setErro('Não foi possível carregar as questões favoritas.')
          setCarregando(false)
          return
        }
        selecionadas = questoesFav.sort(() => Math.random() - 0.5)

      // ── Modo Revisão ──
      } else if (cfg.modo === 'revisao') {
        const { data: { user } } = await supabase.auth.getUser()

        // Buscar IDs das questões erradas (última resposta por questão)
        const { data: resps } = await supabase
          .from('oab_respostas')
          .select('questao_id, acertou, criado_em')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false })

        if (!resps || resps.length === 0) {
          setErro('Nenhuma questão respondida ainda. Responda algumas questões primeiro.')
          setCarregando(false)
          return
        }

        // Última resposta por questão
        const ultimaResp = {}
        resps.forEach(r => { if (!ultimaResp[r.questao_id]) ultimaResp[r.questao_id] = r })
        const idsErradas = Object.values(ultimaResp).filter(r => !r.acertou).map(r => r.questao_id)

        if (idsErradas.length === 0) {
          setErro('Parabéns! Você não tem questões erradas para revisar.')
          setCarregando(false)
          return
        }

        let qRev = supabase.from('oab_questoes').select('*').in('id', idsErradas.slice(0, 200))
        if (cfg.disciplina && cfg.disciplina !== 'Todas') qRev = qRev.eq('disciplina', cfg.disciplina)
        const { data: questoesErradas } = await qRev

        selecionadas = (questoesErradas || []).sort(() => Math.random() - 0.5).slice(0, qtd)

      // ── Busca por palavra-chave ──
      } else if (cfg.busca) {
        let q = supabase.from('oab_questoes').select('*')
          .ilike('enunciado', `%${cfg.busca}%`)
        if (cfg.disciplina !== 'Todas') q = q.eq('disciplina', cfg.disciplina)
        if (cfg.exame !== 'Todos')      q = q.eq('exame', cfg.exame)
        if (cfg.topico && cfg.topico !== 'Todos') q = q.eq('topico', cfg.topico)
        const { data } = await q.limit(qtd * 3)

        if (!data || data.length === 0) {
          setErro(`Nenhuma questão encontrada para "${cfg.busca}".`)
          setCarregando(false)
          return
        }
        selecionadas = data.sort(() => Math.random() - 0.5).slice(0, qtd)

      // ── Modo normal ──
      } else {
        let q = supabase.from('oab_questoes').select('*')
        if (cfg.disciplina !== 'Todas') q = q.eq('disciplina', cfg.disciplina)
        if (cfg.exame !== 'Todos')      q = q.eq('exame', cfg.exame)
        if (cfg.topico && cfg.topico !== 'Todos') q = q.eq('topico', cfg.topico)
        const { data } = await q.order('id', { ascending: false }).limit(qtd * 3)

        if (!data || data.length === 0) {
          setErro('Nenhuma questão encontrada para este filtro.')
          setCarregando(false)
          return
        }
        selecionadas = data.sort(() => Math.random() - 0.5).slice(0, qtd)
      }

      setQuestoes(selecionadas)
      setRespostas({})
      setIdx(0)
      setTempo(0)
      setTela('questoes')
      if (cfg.modo === 'simulado') setRodando(true)
    } catch (err) {
      setErro('Erro ao carregar questões: ' + err.message)
    }
    setCarregando(false)
  }

  function handleReclassificar(questaoId) {
    // Remove a questão da sessão atual e ajusta o índice
    setQuestoes(prev => {
      const novas = prev.filter(q => q.id !== questaoId)
      // Ajustar idx se necessário
      const novoIdx = Math.min(idx, Math.max(0, novas.length - 1))
      setIdx(novoIdx)
      return novas
    })
    // Remover a resposta dessa questão das stats (não conta)
    setRespostas(prev => {
      const novo = { ...prev }
      delete novo[questaoId]
      return novo
    })
  }

  async function registrarResposta(questaoId, alternativa) {
    const questao = questoes.find(q => q.id === questaoId)
    const acertou = alternativa === questao?.gabarito
    setRespostas(r => ({ ...r, [questaoId]: alternativa }))

    // Opção 2: se errou, buscar entradas do repositório sobre a disciplina
    if (!acertou && questao?.disciplina) {
      const { data: entradas } = await supabase
        .from('entradas')
        .select('id, tema, area, tipo')
        .or(`area.ilike.%${questao.disciplina}%,tema.ilike.%${questao.disciplina}%`)
        .limit(3)
      setEntradasSugeridas(entradas || [])
    } else {
      setEntradasSugeridas([])
    }

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('oab_respostas').insert({
      user_id:       user.id,
      questao_id:    questaoId,
      alternativa,
      acertou,
      modo:          config?.modo,
      sessao_oab_id: sessaoOabId || null,
    })

    if (config?.modo === 'estudo') {
      setTimeout(() => {
        setEntradasSugeridas([])
        if (idx < questoes.length - 1) setIdx(i => i+1)
        else finalizarSessao()
      }, 3500)
    }
  }

  function finalizarSessao() {
    setRodando(false)
    setTela('resultado')
    carregarStats()
  }

  // Iniciar revisão das questões erradas desta sessão
  function iniciarRevisaoDaSessao() {
    const erradas = questoes.filter(q => respostas[q.id] && respostas[q.id] !== q.gabarito)
    if (erradas.length === 0) return
    setQuestoes(erradas)
    setRespostas({})
    setIdx(0)
    setTempo(0)
    setConfig(c => ({ ...c, modo: 'estudo' }))
    setTela('questoes')
  }

  const questaoAtual = questoes[idx]

  // Guard: estado corrompido
  if (tela === 'questoes' && !questaoAtual && !carregando && !erro) {
    setTela('config')
    return null
  }

  if (carregando) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:60, color:theme.gold, gap:10 }}>
      <RefreshCw size={18} style={{ animation:'spin 1s linear infinite' }} />
      <span style={{ fontFamily:'Inter, sans-serif', fontSize:13 }}>Preparando questões...</span>
    </div>
  )

  if (erro) return (
    <div style={{ padding:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', background:theme.toastErr||'#2a0810', border:`1px solid ${theme.error||'#ef4444'}`, borderRadius:8, marginBottom:16, color:theme.error||'#ef4444', fontSize:13, fontFamily:'Inter, sans-serif' }}>
        <AlertCircle size={15} /> {erro}
      </div>
      <button onClick={() => { setErro(null); setTela('config') }}
        style={{ background:theme.raised, border:`1px solid ${theme.border}`, color:theme.text, borderRadius:8, padding:'8px 16px', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
        Voltar
      </button>
    </div>
  )

  return (
    <div style={{ paddingBottom:40 }}>

      {tela === 'stats' && (
        <PainelStats session={session} theme={theme} onVoltar={() => setTela('config')} />
      )}

      {tela === 'config' && (
        <ConfigurarSessao
          onIniciar={iniciarSessao}
          onZerar={zerarEstatisticas}
          onStats={() => setTela('stats')}
          stats={statsGerais}
          disciplinaInicial={disciplinaInicial}
          buscaInicial={topicoSessao ? extrairBusca(topicoSessao) : ''}
          theme={theme}
        />
      )}

      {tela === 'questoes' && questaoAtual && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <button onClick={() => setTela('config')} style={{ background:'none', border:'none', color:theme.muted, cursor:'pointer', padding:0 }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ flex:1, height:4, background:theme.border, borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${((idx+1)/questoes.length)*100}%`, background:theme.gold, borderRadius:2, transition:'width .3s' }} />
            </div>
            <span style={{ fontSize:11, color:theme.muted, fontFamily:'IBM Plex Mono, monospace', flexShrink:0 }}>
              {idx+1}/{questoes.length}
            </span>
            <span style={{ fontSize:13, fontWeight:700, color: config?.modo==='simulado' && tempo>4.5*3600 ? '#ef4444' : theme.gold, fontFamily:'IBM Plex Mono, monospace', display:'flex', alignItems:'center', gap:4 }}
              title={config?.modo==='simulado' ? 'Tempo restante' : 'Tempo de estudo'}>
              <Timer size={13} /> {fmtTempo(tempo)}
            </span>
            {config?.modo === 'revisao' && (
              <span style={{ fontSize:10, color:'#f59e0b', background:'#f59e0b18', border:'1px solid #f59e0b33', borderRadius:4, padding:'2px 7px', fontFamily:'IBM Plex Mono, monospace' }}>
                REVISÃO
              </span>
            )}
            {config?.modo === 'favoritas' && (
              <span style={{ fontSize:10, color:theme.gold, background:theme.gold+'18', border:`1px solid ${theme.gold}33`, borderRadius:4, padding:'2px 7px', fontFamily:'IBM Plex Mono, monospace' }}>
                ★ FAVORITAS
              </span>
            )}
          </div>

          <QuestaoCard
            key={questaoAtual.id}
            questao={questaoAtual}
            idx={idx}
            total={questoes.length}
            respondida={!!respostas[questaoAtual.id]}
            respostaDada={respostas[questaoAtual.id] || null}
            onResponder={registrarResposta}
            mostrarGabarito={config?.modo !== 'bloco' && config?.modo !== 'simulado'}
            favorita={favoritas.has(questaoAtual.id)}
            onFavoritar={toggleFavorita}
            isAdmin={isAdmin}
            onReclassificar={handleReclassificar}
            theme={theme}
          />

          {/* Opção 2: Entradas sugeridas do repositório após erro */}
          {entradasSugeridas.length > 0 && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: theme.raised, border: `1px solid ${theme.gold}44`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                📚 No seu repositório sobre este tema:
              </div>
              {entradasSugeridas.map(e => (
                <div key={e.id}
                  onClick={() => window.location.href = `/?entrada=${e.id}`}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:`1px solid ${theme.border}`, cursor:'pointer' }}>
                  <BookOpen size={12} color={theme.gold} />
                  <div>
                    <div style={{ fontSize:12, color:theme.text, fontFamily:'Inter, sans-serif' }}>{e.tema}</div>
                    <div style={{ fontSize:10, color:theme.muted, fontFamily:'IBM Plex Mono, monospace' }}>{e.area} · {e.tipo}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:'flex', gap:10, marginTop:14 }}>
            {idx > 0 && (
              <button onClick={() => setIdx(i => i-1)}
                style={{ display:'flex', alignItems:'center', gap:6, background:theme.raised, border:`1px solid ${theme.border}`, color:theme.text, borderRadius:8, padding:'10px 16px', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                <ChevronLeft size={14} /> Anterior
              </button>
            )}
            {idx < questoes.length - 1 ? (
              <button onClick={() => setIdx(i => i+1)}
                disabled={config?.modo === 'estudo' && !respostas[questaoAtual.id]}
                style={{ display:'flex', alignItems:'center', gap:6, background:theme.gold, border:'none', color:'#0b0f1a', borderRadius:8, padding:'10px 20px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter, sans-serif', marginLeft:'auto', opacity: config?.modo === 'estudo' && !respostas[questaoAtual.id] ? 0.5 : 1 }}>
                Próxima <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={finalizarSessao}
                style={{ display:'flex', alignItems:'center', gap:6, background:'#0f2b1a', border:'1px solid #10b981', color:'#10b981', borderRadius:8, padding:'10px 20px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter, sans-serif', marginLeft:'auto' }}>
                <CheckCircle size={14} /> Ver resultado
              </button>
            )}
          </div>
        </>
      )}

      {tela === 'resultado' && (
        <Resultado
          respostas={respostas}
          questoes={questoes}
          tempo={tempo}
          onReiniciar={() => setTela('config')}
          onRevisao={iniciarRevisaoDaSessao}
          theme={theme}
        />
      )}
    </div>
  )
}
