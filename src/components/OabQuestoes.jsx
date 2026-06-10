import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import {
  CheckCircle, XCircle, ChevronRight, RotateCcw,
  Timer, Trophy, BookOpen, Zap, Filter, RefreshCw,
  ChevronLeft, BarChart2, AlertCircle
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
}

const DISCIPLINAS = Object.keys(DISC_COR)
const EXAMES = ['Todos','39','40','41','42','43','44','45','46','47','48']
const MODOS  = [
  { id: 'estudo',   label: 'Estudo',   desc: 'Uma por vez com feedback imediato' },
  { id: 'bloco',    label: 'Bloco',    desc: '10 questões — responda e veja resultado' },
  { id: 'simulado', label: 'Simulado', desc: '80 questões cronometradas — condições reais' },
]

function fmtTempo(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
}

// ── Tela de configuração ────────────────────────────────────────
function ConfigurarSessao({ onIniciar, stats, theme }) {
  const [modo, setModo]       = useState('estudo')
  const [disciplina, setDisc] = useState('Todas')
  const [exame, setExame]     = useState('Todos')

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
        Banco de Questões OAB
      </div>
      <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
        Questões no padrão FGV — Exames 39º ao 48º
      </div>

      {/* Stats rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'Respondidas', v: stats.total,    c: theme.gold  },
          { l: 'Acertos',     v: stats.acertos,  c: '#10b981'   },
          { l: 'Aproveit.',   v: stats.total ? `${Math.round(stats.acertos/stats.total*100)}%` : '—', c: '#3b82f6' },
        ].map(k => (
          <div key={k.l} style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.c, fontFamily: 'IBM Plex Mono, monospace' }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Modo */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 8 }}>Modo</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MODOS.map(m => (
            <button key={m.id} onClick={() => setModo(m.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: modo === m.id ? theme.gold+'11' : theme.raised, border: `1px solid ${modo === m.id ? theme.gold+'66' : theme.border}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: modo === m.id ? theme.gold : theme.border, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: modo === m.id ? theme.gold : theme.text, fontFamily: 'Inter, sans-serif' }}>{m.label}</div>
                <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 6 }}>Disciplina</div>
          <select value={disciplina} onChange={e => setDisc(e.target.value)}
            style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 12, padding: '8px 10px', fontFamily: 'Inter, sans-serif', outline: 'none' }}>
            <option value="Todas">Todas</option>
            {DISCIPLINAS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 6 }}>Exame</div>
          <select value={exame} onChange={e => setExame(e.target.value)}
            style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, fontSize: 12, padding: '8px 10px', fontFamily: 'Inter, sans-serif', outline: 'none' }}>
            {EXAMES.map(e => <option key={e} value={e}>{e === 'Todos' ? 'Todos' : `${e}º Exame`}</option>)}
          </select>
        </div>
      </div>

      <button onClick={() => onIniciar({ modo, disciplina, exame })}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: theme.gold, border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 700, color: '#0b0f1a', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
        <Zap size={16} /> Iniciar sessão
      </button>
    </div>
  )
}

// ── Card de questão ─────────────────────────────────────────────

const EXAME_ANO = {
  '38': '2023.1', '39': '2023.2', '40': '2024.1', '41': '2024.2',
  '42': '2024.3', '43': '2025.1', '44': '2025.2', '45': '2025.3',
  '46': '2026.1', '47': '2026.2', '48': '2026.3',
  '46-simulado': '2026.1 Sim.',
}

function QuestaoCard({ questao, idx, total, respondida, onResponder, mostrarGabarito, theme }) {
  const [selecionada, setSelecionada] = useState(null)
  const cor = DISC_COR[questao.disciplina] || '#6b7280'
  const alts = ['A','B','C','D']

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
    <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '18px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: cor, background: cor+'18', border: `1px solid ${cor}33`, borderRadius: 4, padding: '2px 7px', fontFamily: 'IBM Plex Mono, monospace' }}>
          {questao.disciplina}
        </span>
        {questao.exame && (
          <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', background: '#94a3b818', border: '1px solid #94a3b833', borderRadius: 4, padding: '2px 7px', fontFamily: 'IBM Plex Mono, monospace' }}>
            {questao.exame.includes('simulado') ? 'Simulado' : `${questao.exame}º Exame`}
            {EXAME_ANO[questao.exame] ? ` · ${EXAME_ANO[questao.exame]}` : ''}
          </span>
        )}
        {questao.topico && (
          <span style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
            {questao.topico}
          </span>
        )}
        <span style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', marginLeft: 'auto' }}>
          {idx+1}/{total}
        </span>
      </div>

      {/* Enunciado */}
      <div style={{ fontSize: 14, color: theme.text, fontFamily: 'Georgia, serif', lineHeight: 1.7, marginBottom: 16 }}>
        {questao.enunciado}
      </div>

      {/* Alternativas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {alts.map(alt => {
          const texto = questao[`alternativa_${alt.toLowerCase()}`]
          if (!texto) return null
          const isCorreta  = respondida && alt === questao.gabarito
          const isErrada   = respondida && alt === selecionada && alt !== questao.gabarito
          const isSelecionada = selecionada === alt

          let bg = theme.cardBg, border = theme.border, textCor = theme.text
          if (isCorreta)    { bg = '#0f2b1a'; border = '#10b981'; textCor = '#10b981' }
          else if (isErrada){ bg = '#2a0810'; border = '#ef4444'; textCor = '#ef4444' }
          else if (isSelecionada && !respondida) { bg = theme.gold+'11'; border = theme.gold+'66'; textCor = theme.gold }

          return (
            <button key={alt} onClick={() => escolher(alt)} disabled={respondida}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: bg, border: `1px solid ${border}`, borderRadius: 8, cursor: respondida ? 'default' : 'pointer', textAlign: 'left', transition: 'all .15s' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: isSelecionada || isCorreta || isErrada ? border : theme.border, color: isSelecionada || isCorreta || isErrada ? '#fff' : theme.muted, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'IBM Plex Mono, monospace' }}>
                {isCorreta ? '✓' : isErrada ? '✗' : alt}
              </span>
              <span style={{ fontSize: 13, color: textCor, fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>{texto}</span>
            </button>
          )
        })}
      </div>

      {/* Botão confirmar (modo estudo) */}
      {!respondida && !mostrarGabarito && selecionada && (
        <button onClick={confirmar}
          style={{ width: '100%', background: theme.gold, border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, color: '#0b0f1a', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          Confirmar resposta
        </button>
      )}

      {/* Feedback */}
      {respondida && (
        <div style={{ marginTop: 12, padding: '12px 14px', background: acertou ? '#0f2b1a' : '#2a0810', border: `1px solid ${acertou ? '#10b981' : '#ef4444'}`, borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {acertou ? <CheckCircle size={15} color="#10b981" /> : <XCircle size={15} color="#ef4444" />}
            <span style={{ fontSize: 13, fontWeight: 700, color: acertou ? '#10b981' : '#ef4444', fontFamily: 'Inter, sans-serif' }}>
              {acertou ? 'Correto!' : `Errado — Gabarito: ${questao.gabarito}`}
            </span>
          </div>
          {questao.justificativa && (
            <div style={{ fontSize: 12, color: theme.text, fontFamily: 'Georgia, serif', lineHeight: 1.6 }}>
              {questao.justificativa}
            </div>
          )}
          {questao.dispositivo && (
            <div style={{ fontSize: 11, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', marginTop: 6 }}>
              Base: {questao.dispositivo}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Resultado final ─────────────────────────────────────────────
function Resultado({ respostas, questoes, tempo, onReiniciar, theme }) {
  const total   = questoes.length
  const acertos = questoes.filter(q => respostas[q.id] === q.gabarito).length
  const pct     = Math.round(acertos/total*100)
  const aprovado = pct >= 50

  const porDisc = {}
  questoes.forEach(q => {
    if (!porDisc[q.disciplina]) porDisc[q.disciplina] = { total: 0, acertos: 0 }
    porDisc[q.disciplina].total++
    if (respostas[q.id] === q.gabarito) porDisc[q.disciplina].acertos++
  })

  return (
    <div>
      {/* Header resultado */}
      <div style={{ background: aprovado ? '#0f2b1a' : '#2a0810', border: `1px solid ${aprovado ? '#10b981' : '#ef4444'}`, borderRadius: 12, padding: '20px', marginBottom: 20, textAlign: 'center' }}>
        {aprovado ? <Trophy size={32} color="#10b981" style={{ marginBottom: 10 }} /> : <XCircle size={32} color="#ef4444" style={{ marginBottom: 10 }} />}
        <div style={{ fontSize: 42, fontWeight: 700, color: aprovado ? '#10b981' : '#ef4444', fontFamily: 'IBM Plex Mono, monospace' }}>{pct}%</div>
        <div style={{ fontSize: 14, color: theme.text, fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
          {acertos} de {total} questões corretas
        </div>
        {tempo > 0 && (
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', marginTop: 6 }}>
            Tempo: {fmtTempo(tempo)}
          </div>
        )}
      </div>

      {/* Por disciplina */}
      <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 10 }}>Por disciplina</div>
      {Object.entries(porDisc).map(([disc, dp]) => {
        const cor = DISC_COR[disc] || '#6b7280'
        const p   = Math.round(dp.acertos/dp.total*100)
        return (
          <div key={disc} style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cor }} />
                <span style={{ fontSize: 13, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{disc}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: p >= 70 ? '#10b981' : p >= 50 ? '#f59e0b' : '#ef4444', fontFamily: 'IBM Plex Mono, monospace' }}>
                {dp.acertos}/{dp.total} ({p}%)
              </span>
            </div>
            <div style={{ height: 4, background: theme.border, borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${p}%`, background: p >= 70 ? '#10b981' : p >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 2, transition: 'width .4s' }} />
            </div>
          </div>
        )
      })}

      <button onClick={onReiniciar}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, background: theme.gold, border: 'none', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700, color: '#0b0f1a', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
        <RotateCcw size={15} /> Nova sessão
      </button>
    </div>
  )
}

// ── Componente principal ────────────────────────────────────────
export default function OabQuestoes({ session, sessaoOabId }) {
  const { theme } = useTheme()
  const [tela, setTela]         = useState(() => {
    try { return localStorage.getItem('oab_tela') || 'config' } catch { return 'config' }
  })
  const [questoes, setQuestoes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('oab_questoes') || '[]') } catch { return [] }
  })
  const [respostas, setRespostas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('oab_respostas') || '{}') } catch { return {} }
  })
  const [idx, setIdx]           = useState(() => {
    try { return parseInt(localStorage.getItem('oab_idx') || '0', 10) } catch { return 0 }
  })
  const [config, setConfig]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('oab_config') || 'null') } catch { return null }
  })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]         = useState(null)
  const [tempo, setTempo]       = useState(0)
  const [rodando, setRodando]   = useState(false)
  const timerRef = useRef(null)
  const [statsGerais, setStatsGerais] = useState({ total: 0, acertos: 0 })

  useEffect(() => {
    if (session) carregarStats()
  }, [session])

  useEffect(() => {
    if (rodando) {
      timerRef.current = setInterval(() => setTempo(t => t+1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [rodando])

  // Persistência da sessão no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oab_tela', tela)
      localStorage.setItem('oab_questoes', JSON.stringify(questoes))
      localStorage.setItem('oab_respostas', JSON.stringify(respostas))
      localStorage.setItem('oab_idx', String(idx))
      localStorage.setItem('oab_config', JSON.stringify(config))
    } catch {}
  }, [tela, questoes, respostas, idx, config])

  async function carregarStats() {
    const { data } = await supabase
      .from('oab_respostas')
      .select('acertou')
      .eq('user_id', session.user.id)
    if (data) {
      setStatsGerais({ total: data.length, acertos: data.filter(r => r.acertou).length })
    }
  }

  async function iniciarSessao(cfg) {
    setConfig(cfg)
    setCarregando(true)
    setErro(null)

    const qtd = cfg.modo === 'simulado' ? 80 : cfg.modo === 'bloco' ? 10 : 1

    // Buscar questões do banco
    let query = supabase.from('oab_questoes').select('*')
    if (cfg.disciplina !== 'Todas') query = query.eq('disciplina', cfg.disciplina)
    if (cfg.exame !== 'Todos')      query = query.eq('exame', cfg.exame)

    const { data: existentes, count } = await query
      .order('id', { ascending: false })
      .limit(qtd * 3)

    // Se não há questões suficientes, gerar via API
    if (!existentes || existentes.length < qtd) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        await fetch('/api/gerar-questoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id:     user.id,
            disciplina:  cfg.disciplina,
            exame:       cfg.exame,
            quantidade:  Math.max(qtd, 20),
          }),
        })

        // Buscar novamente
        let q2 = supabase.from('oab_questoes').select('*')
        if (cfg.disciplina !== 'Todas') q2 = q2.eq('disciplina', cfg.disciplina)
        if (cfg.exame !== 'Todos')      q2 = q2.eq('exame', cfg.exame)
        const { data: novas } = await q2.limit(qtd * 3)

        if (!novas || !novas.length) {
          setErro('Não foi possível gerar questões para este filtro.')
          setCarregando(false)
          return
        }

        // Embaralhar e pegar qtd
        const embaralhadas = novas.sort(() => Math.random() - 0.5).slice(0, qtd)
        setQuestoes(embaralhadas)
      } catch (err) {
        setErro('Erro ao gerar questões: ' + err.message)
        setCarregando(false)
        return
      }
    } else {
      // Embaralhar as existentes
      const embaralhadas = existentes.sort(() => Math.random() - 0.5).slice(0, qtd)
      setQuestoes(embaralhadas)
    }

    setRespostas({})
    setIdx(0)
    setTempo(0)
    setTela('questoes')
    // Limpar cache de sessão anterior
    try { localStorage.removeItem('oab_tela'); localStorage.removeItem('oab_questoes'); localStorage.removeItem('oab_respostas'); localStorage.removeItem('oab_idx'); localStorage.removeItem('oab_config') } catch {}
    if (cfg.modo === 'simulado') setRodando(true)
    setCarregando(false)
  }

  async function registrarResposta(questaoId, alternativa) {
    const questao  = questoes.find(q => q.id === questaoId)
    const acertou  = alternativa === questao?.gabarito
    setRespostas(r => ({ ...r, [questaoId]: alternativa }))

    // Salvar no banco
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('oab_respostas').insert({
      user_id:      user.id,
      questao_id:   questaoId,
      alternativa:  alternativa,
      acertou,
      modo:         config?.modo,
      sessao_oab_id: sessaoOabId || null,
    })

    // Avançar automaticamente no modo estudo após 1.5s
    if (config?.modo === 'estudo') {
      setTimeout(() => {
        if (idx < questoes.length - 1) setIdx(i => i+1)
        else finalizarSessao()
      }, 1800)
    }
  }

  function finalizarSessao() {
    setRodando(false)
    setTela('resultado')
    carregarStats()
  }

  const questaoAtual = questoes[idx]
  const todasRespondidas = questoes.length > 0 && questoes.every(q => respostas[q.id])

  if (carregando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: theme.gold, gap: 10 }}>
      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Preparando questões...</span>
    </div>
  )

  if (erro) return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: theme.toastErr, border: `1px solid ${theme.error}`, borderRadius: 8, marginBottom: 16, color: theme.error, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
        <AlertCircle size={15} /> {erro}
      </div>
      <button onClick={() => { setErro(null); setTela('config') }}
        style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
        Voltar
      </button>
    </div>
  )

  return (
    <div style={{ paddingBottom: 40 }}>

      {tela === 'config' && (
        <ConfigurarSessao onIniciar={iniciarSessao} stats={statsGerais} theme={theme} />
      )}

      {tela === 'questoes' && questaoAtual && (
        <>
          {/* Barra de progresso + timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <button onClick={() => setTela('config')}
              style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', padding: 0 }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ flex: 1, height: 4, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((idx+1)/questoes.length)*100}%`, background: theme.gold, borderRadius: 2, transition: 'width .3s' }} />
            </div>
            <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0 }}>
              {idx+1}/{questoes.length}
            </span>
            {config?.modo === 'simulado' && (
              <span style={{ fontSize: 13, fontWeight: 700, color: tempo > 4.5*3600 ? '#ef4444' : theme.gold, fontFamily: 'IBM Plex Mono, monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Timer size={13} /> {fmtTempo(tempo)}
              </span>
            )}
          </div>

          <QuestaoCard
            questao={questaoAtual}
            idx={idx}
            total={questoes.length}
            respondida={!!respostas[questaoAtual.id]}
            onResponder={registrarResposta}
            mostrarGabarito={config?.modo !== 'bloco' && config?.modo !== 'simulado'}
            theme={theme}
          />

          {/* Navegação */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            {idx > 0 && (
              <button onClick={() => setIdx(i => i-1)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.raised, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                <ChevronLeft size={14} /> Anterior
              </button>
            )}
            {idx < questoes.length - 1 ? (
              <button onClick={() => setIdx(i => i+1)}
                disabled={config?.modo === 'estudo' && !respostas[questaoAtual.id]}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 8, padding: '10px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginLeft: 'auto', opacity: config?.modo === 'estudo' && !respostas[questaoAtual.id] ? 0.5 : 1 }}>
                Próxima <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={finalizarSessao}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0f2b1a', border: '1px solid #10b981', color: '#10b981', borderRadius: 8, padding: '10px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginLeft: 'auto' }}>
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
          theme={theme}
        />
      )}
    </div>
  )
}

