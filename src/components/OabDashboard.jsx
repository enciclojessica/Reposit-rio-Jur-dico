import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import OabQuestoes from './OabQuestoes'
import CronogramaWizard from './CronogramaWizard'
import ModulosEstudo from './ModulosEstudo'
import SessaoCard from './OabSessaoCard'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { SESSIONS_PADRAO } from '../data/oabCronograma'
import { DISC_COR } from '../data/disciplinas'
import { DISCIPLINAS, MESES, fmt, getMes, diasAte, fmtTempo } from '../data/oabDashboardHelpers'
import { exportarCalendarOuICS } from '../utils/exportarCalendarOuICS'
import {
  CheckCircle, Target, Calendar,
  Filter, BarChart2, RefreshCw, BookOpen, LibraryBig, RotateCcw,
} from 'lucide-react'

export default function OabDashboard({ session }) {
  const { theme } = useTheme()
  const [dados, setDados]     = useState({})
  const [carregando, setCarregando] = useState(true)
  const [mostrarWizard, setMostrarWizard] = useState(false)
  const [sessoesDinamicas, setSessoesDinamicas] = useState(null) // null = usa SESSIONS_PADRAO
  const [aba, setAba] = useState(function() {
    try { return localStorage.getItem('lexia_oab_aba') || 'cronograma' } catch { return 'cronograma' }
  })

  function setAbaP(v) {
    setAba(v)
    try { localStorage.setItem('lexia_oab_aba', v) } catch {}
  }
  const [disciplinaFiltro, setDisciplinaFiltro] = useState(null)
  const [topicoFiltro, setTopicoFiltro]         = useState(null)
  const [modoSimulado, setModoSimulado]         = useState(false)
  const [fFase, setFFase]     = useState('Todas')
  const [fDisc, setFDisc]     = useState('Todas')
  const [fStatus, setFStatus] = useState('Todos')
  const [fMes, setFMes]       = useState('Todos')
  const [exportando, setExportando] = useState(false)

  // Persistência no Supabase
  useEffect(() => {
    if (session) {
      carregar()
      // Solicitar permissão de notificação PWA
      if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => Notification.requestPermission(), 3000)
      }
    }
  }, [session])


  async function resetCronograma() {
    setMostrarWizard(true)
  }

  async function onWizardConcluir(novasSessoes, config) {
    setSessoesDinamicas(novasSessoes)
    setMostrarWizard(false)
    setDados({})
    await carregar()
  }

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase
      .from('oab_sessoes')
      .select('session_id, status, acertos, anotacao, tempo_total')
      .eq('user_id', session.user.id)
    if (data) {
      const map = {}
      data.forEach(r => { map[r.session_id] = r })
      setDados(map)
    }
    setCarregando(false)
  }

  const atualizar = useCallback(async (id, patch) => {
    const novo = { ...dados, [id]: { ...(dados[id] || {}), ...patch } }
    setDados(novo)
    await supabase.from('oab_sessoes').upsert({
      user_id:    session.user.id,
      session_id: id,
      status:     novo[id].status || 'A Fazer',
      acertos:    novo[id].acertos ?? null,
      anotacao:   novo[id].anotacao || '',
      tempo_total: novo[id].tempo_total || 0,
      atualizado_em: new Date().toISOString(),
    }, { onConflict: 'user_id,session_id' })
  }, [dados, session])

  const SESSIONS = sessoesDinamicas || SESSIONS_PADRAO
  const filtradas = useMemo(() => SESSIONS.filter(s => {
    if (fFase   !== 'Todas'  && s.fase       !== fFase)   return false
    if (fDisc   !== 'Todas'  && s.disciplina !== fDisc)   return false
    if (fStatus !== 'Todos'  && (dados[s.id]?.status || 'A Fazer') !== fStatus) return false
    if (fMes    !== 'Todos'  && getMes(s.date) !== fMes) return false
    return true
  }), [fFase, fDisc, fStatus, fMes, dados])

  // Estatísticas
  const stats = useMemo(() => {
    const total = SESSIONS.length
    const conc  = SESSIONS.filter(s => dados[s.id]?.status === 'Concluído').length
    const em    = SESSIONS.filter(s => dados[s.id]?.status === 'Em Andamento').length
    const comAcertos = SESSIONS.filter(s => dados[s.id]?.acertos !== null && dados[s.id]?.acertos !== undefined)
    const media = comAcertos.length ? (comAcertos.reduce((a,s) => a + dados[s.id].acertos, 0) / comAcertos.length).toFixed(1) : null
    const tempoTotal = SESSIONS.reduce((a,s) => a + (dados[s.id]?.tempo_total || 0), 0)
    const porDisc = {}
    DISCIPLINAS.forEach(d => {
      const ds = SESSIONS.filter(s => s.disciplina === d)
      const c  = ds.filter(s => dados[s.id]?.status === 'Concluído').length
      const av = ds.filter(s => dados[s.id]?.acertos !== null && dados[s.id]?.acertos !== undefined)
      porDisc[d] = {
        total: ds.length, conc: c,
        pct: ds.length ? Math.round(c/ds.length*100) : 0,
        media: av.length ? (av.reduce((a,s) => a + dados[s.id].acertos, 0) / av.length).toFixed(1) : null,
        cor: DISC_COR[d] || '#6b7280',
      }
    })
    return { total, conc, em, media, pct: Math.round(conc/total*100), tempoTotal, porDisc }
  }, [dados])

  const hoje    = new Date().toISOString().split('T')[0]
  const proximas = SESSIONS.filter(s => s.date >= hoje && dados[s.id]?.status !== 'Concluído').slice(0,3)

  // Notificação da sessão do dia (após proximas estar disponível)
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && proximas.length > 0) {
    const hoje2 = new Date().toISOString().slice(0, 10)
    const jaNotificou = localStorage.getItem('lexia_notif_' + hoje2)
    if (!jaNotificou) {
      const sessaoHoje = proximas.find(s => s.date === hoje2)
      if (sessaoHoje) {
        setTimeout(() => {
          new Notification('Lex.IA — Sessão do dia', {
            body: sessaoHoje.disciplina + ': ' + sessaoHoje.topico.slice(0, 80),
            icon: '/icons/icon-192.png',
          })
          localStorage.setItem('lexia_notif_' + hoje2, '1')
        }, 2000)
      }
    }
  }

  if (carregando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: theme.gold, gap: 10 }}>
      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Carregando cronograma...</span>
    </div>
  )

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 2 }}>
            Estudos OAB — 48º Exame
          </div>
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
            1ª Fase: 10/01/2027 · 2ª Fase: 28/02/2027
          </div>
        </div>
        {/* Botão exportar Google Calendar */}
        <button
          onClick={() => { exportarCalendarOuICS(SESSIONS, dados); setExportando(true); setTimeout(() => setExportando(false), 2000) }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: exportando ? '#0f2b1a' : theme.raised, border: `1px solid ${exportando ? '#10b981' : theme.border}`, color: exportando ? '#10b981' : theme.text, borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .2s' }}>
          {exportando ? <CheckCircle size={14} /> : <Calendar size={14} />}
          {exportando ? 'Exportado!' : 'Exportar para Google Calendar'}
          </button>
          <button onClick={resetCronograma}
            title="Apagar progresso e recomeçar do zero"
            style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#ef4444', background:'#ef444411', border:'1px solid #ef444433', borderRadius:8, padding:'7px 12px', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600 }}>
            <RotateCcw size={13} /> Recomeçar
        </button>
      </div>

      {/* Countdown 1ª Fase */}
      {diasAte('2027-01-10') > 0 && (
        <div style={{ background: theme.raised, border: `1px solid ${theme.gold}44`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Target size={18} color={theme.gold} />
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace' }}>
              {diasAte('2027-01-10')} dias
            </span>
            <span style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', marginLeft: 8 }}>
              para a 1ª Fase OAB (10/01/2027) · {stats.pct}% do cronograma concluído
            </span>
          </div>
        </div>
      )}

      {/* Mini progresso por disciplina no cronograma */}
      {stats.total > 0 && stats.pct > 0 && (
        <div style={{ marginBottom: 16, background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
              Progresso por disciplina
            </div>
            <div style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
              {stats.conc}/{stats.total} sessões · {stats.pct}% concluído
            </div>
          </div>
          {Object.entries(stats.porDisc).filter(([,dp]) => dp.total > 0).map(([disc, dp]) => (
            <div key={disc} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: dp.cor, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{disc}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {dp.media > 0 && <span style={{ fontSize: 9, color: '#8b5cf6', fontFamily: 'IBM Plex Mono, monospace' }}>{dp.media}%✓</span>}
                  <span style={{ fontSize: 9, color: dp.pct===100 ? '#10b981' : theme.muted, fontFamily: 'IBM Plex Mono, monospace', fontWeight: dp.pct===100 ? 700 : 400 }}>
                    {dp.conc}/{dp.total}
                  </span>
                </div>
              </div>
              <div style={{ height: 3, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dp.pct}%`, background: dp.pct===100 ? '#10b981' : dp.cor, borderRadius: 2, transition: 'width .4s' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Próximas sessões */}
      {proximas.length > 0 && (
        <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Próximas sessões
          </div>
          {proximas.map(s => {
            const cor = DISC_COR[s.disciplina] || '#6b7280'
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: cor, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', width: 60, flexShrink: 0 }}>{fmt(s.date)}</span>
                <span style={{ fontSize: 12, color: theme.text, fontFamily: 'Inter, sans-serif', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.disciplina} — {s.topico}</span>
                {s.disciplina !== 'Simulado Geral' && (
                  <button
                    onClick={() => { setDisciplinaFiltro(s.disciplina); setTopicoFiltro(s.topico); setAbaP('questoes') }}
                    style={{ fontSize: 10, color: cor, background: cor+'15', border: `1px solid ${cor}33`, borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    Praticar ▶
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Abas */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, marginBottom: 16, gap: 0 }}>
        {[
          { id: 'cronograma', label: 'Cronograma',  icon: Calendar    },
          { id: 'questoes',   label: 'Questões',    icon: BookOpen    },
          { id: 'materiais',  label: 'Materiais',   icon: LibraryBig  },
          { id: 'stats',      label: 'Estatísticas',icon: BarChart2   },
        ].map(a => (
          <button key={a.id} onClick={() => setAbaP(a.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: aba === a.id ? 600 : 400, color: aba === a.id ? theme.gold : theme.muted, background: 'none', border: 'none', borderBottom: `2px solid ${aba === a.id ? theme.gold : 'transparent'}`, transition: 'all .15s' }}>
            <a.icon size={14} /> {a.label}
          </button>
        ))}
      </div>

      {/* ABA: Cronograma */}
      {aba === 'cronograma' && (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
            <Filter size={13} color={theme.muted} />
            {[
              { label: 'Fase', opts: ['Todas','1ª Fase','2ª Fase'], val: fFase, set: setFFase },
              { label: 'Mês',  opts: ['Todos', ...MESES],           val: fMes,  set: setFMes  },
              { label: 'Status', opts: ['Todos','A Fazer','Em Andamento','Concluído'], val: fStatus, set: setFStatus },
              { label: 'Disciplina', opts: ['Todas', ...DISCIPLINAS], val: fDisc, set: setFDisc },
            ].map(f => (
              <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
                style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.text, fontSize: 11, padding: '5px 10px', fontFamily: 'IBM Plex Mono, monospace', cursor: 'pointer', outline: 'none' }}>
                {f.opts.map(o => <option key={o} value={o}>{o === f.opts[0] ? `${f.label}: ${o}` : o}</option>)}
              </select>
            ))}
            <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', marginLeft: 'auto' }}>
              {filtradas.length} sessões
            </span>
          </div>

          {/* Lista de sessões */}
          {filtradas.map(s => (
            <SessaoCard key={s.id} s={s} dados={dados} onAtualizar={atualizar} onPraticar={(disc, top) => {
                  if (disc === '__simulado__') {
                    // Simulado geral — 80 questões todas as disciplinas
                    setDisciplinaFiltro(null)
                    setTopicoFiltro(null)
                    setModoSimulado(true)
                  } else if (disc.startsWith('__simulado_disc__')) {
                    // Simulado temático — todas as questões da disciplina
                    setDisciplinaFiltro(disc.replace('__simulado_disc__', ''))
                    setTopicoFiltro(null)
                    setModoSimulado(true)
                  } else {
                    setDisciplinaFiltro(disc)
                    setTopicoFiltro(top||null)
                    setModoSimulado(false)
                  }
                  setAbaP('questoes')
                }} theme={theme} />
          ))}
        </>
      )}

      {/* ABA: Questões */}
      {aba === 'questoes' && (
        <OabQuestoes session={session} disciplinaInicial={disciplinaFiltro} topicoSessao={topicoFiltro} modoInicial={modoSimulado ? 'simulado' : null} onSair={() => { setDisciplinaFiltro(null); setTopicoFiltro(null); setModoSimulado(false); setAbaP('cronograma') }} />
      )}

      {/* ABA: Estatísticas */}
      {aba === 'materiais' && (
        <ModulosEstudo theme={theme} session={session} />
      )}

      {aba === 'stats' && (
        <div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { l: 'Progresso geral',  v: `${stats.pct}%`,                      c: theme.gold     },
              { l: 'Sessões concluídas', v: `${stats.conc}/${stats.total}`,     c: '#10b981'      },
              { l: 'Em andamento',     v: stats.em,                             c: '#f59e0b'      },
              { l: 'Média de acertos', v: stats.media ? `${stats.media}%` : '—', c: '#3b82f6'    },
              { l: 'Tempo total estudo', v: fmtTempo(stats.tempoTotal),         c: '#8b5cf6'      },
            ].map(k => (
              <div key={k.l} style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderTop: `3px solid ${k.c}`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: 'IBM Plex Mono, monospace' }}>{k.l}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: k.c, fontFamily: 'IBM Plex Mono, monospace' }}>{k.v}</div>
              </div>
            ))}
          </div>

          {/* Progresso por disciplina */}
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontFamily: 'IBM Plex Mono, monospace' }}>
            Por disciplina
          </div>
          {DISCIPLINAS.map(d => {
            const dp = stats.porDisc[d]
            return (
              <div key={d} style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dp.cor }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{d}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>{dp.conc}/{dp.total}</span>
                    {dp.media && <span style={{ fontSize: 11, color: '#8b5cf6', fontFamily: 'IBM Plex Mono, monospace' }}>{dp.media}% acertos</span>}
                    <span style={{ fontSize: 14, fontWeight: 700, color: dp.pct===100 ? '#10b981' : theme.text, fontFamily: 'IBM Plex Mono, monospace' }}>{dp.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 5, background: theme.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dp.pct}%`, background: dp.pct===100 ? '#10b981' : dp.cor, borderRadius: 3, transition: 'width .4s' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 24, borderTop: `1px solid ${theme.border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
        <span>Lex.IA · Inteligência Jurídica · Farias Fusquiani</span>
        <span>48º Exame OAB · FGV · 1ª Fase 10/01/2027 · 2ª Fase 28/02/2027</span>
      </div>

      {/* Wizard de configuração do cronograma */}
      {mostrarWizard && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#00000066', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: theme.bg || theme.raised, border: `1px solid ${theme.border}`, borderRadius: 16, padding: '24px', maxWidth: 580, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px #00000044' }}>
            <CronogramaWizard session={session} theme={theme} onConcluir={onWizardConcluir} />
            <button onClick={() => setMostrarWizard(false)}
              style={{ marginTop: 12, width: '100%', background: 'none', border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
