import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { fmtTempo } from '../data/oabQuestoesConstants'
import {
  CheckCircle, ChevronRight, RefreshCw,
  ChevronLeft, AlertCircle, Timer, Zap, BookOpen,
} from 'lucide-react'
import PainelStats from './OabPainelStats'
import ConfigurarSessao from './OabConfigurarSessao'
import QuestaoCard from './OabQuestaoCard'
import Resultado from './OabResultado'

export default function OabQuestoes({ session, sessaoOabId, disciplinaInicial, topicoSessao, modoInicial, simuladoAuto, onSair }) {
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

  // Simulado disparado direto do card do cronograma — pula a tela de
  // configuração e já busca com a quantidade/disciplinas do tópico.
  useEffect(() => {
    if (simuladoAuto) {
      iniciarSessao({
        modo: 'simulado',
        disciplina: 'Todas',
        disciplinas: simuladoAuto.disciplinas,
        qtdSimulado: simuladoAuto.quantidade,
        exame: 'Todos',
        topico: 'Todos',
        busca: '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simuladoAuto])

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

    // Simulado geral = 80 questões (ou qtdSimulado, se vier do cronograma);
    // simulado temático (com disciplina) = todas da disciplina
    const qtd = cfg.modo === 'simulado'
      ? (cfg.qtdSimulado || (cfg.disciplina && cfg.disciplina !== 'Todas' ? 9999 : 80))
      : (cfg.qtdCustom || 10)
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
        if (cfg.disciplinas?.length)        q = q.in('disciplina', cfg.disciplinas)
        else if (cfg.disciplina !== 'Todas') q = q.eq('disciplina', cfg.disciplina)
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
            {config?.modo === 'rapida' && (
              <span style={{ fontSize:10, color:'#a78bfa', background:'#a78bfa18', border:'1px solid #a78bfa33', borderRadius:4, padding:'2px 7px', fontFamily:'IBM Plex Mono, monospace', display:'inline-flex', alignItems:'center', gap:4 }}>
                <Zap size={10} /> RÁPIDA
              </span>
            )}
          </div>

          {config?.modo === 'rapida' ? (
            /* Modo revisão rápida — só justificativa, sem responder */
            <div style={{ background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:14, padding:'18px 20px' }}>
              <div style={{ fontSize:11, color:'#a78bfa', fontFamily:'IBM Plex Mono, monospace', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
                {questaoAtual.disciplina} · {questaoAtual.topico}
              </div>
              <div style={{ fontSize:13.5, color:theme.text, fontFamily:'Georgia, serif', lineHeight:1.7, marginBottom:16 }}>
                {questaoAtual.enunciado}
              </div>
              <div style={{ borderTop:`1px solid ${theme.border}`, paddingTop:14, marginTop:4 }}>
                <div style={{ fontSize:10, color:'#10b981', fontFamily:'IBM Plex Mono, monospace', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
                  Gabarito: {questaoAtual.gabarito}
                </div>
                {questaoAtual.justificativa && (
                  <div style={{ fontSize:12.5, color:theme.muted, fontFamily:'Georgia, serif', lineHeight:1.7 }}>
                    {questaoAtual.justificativa}
                  </div>
                )}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
                <button onClick={() => setIdx(i => i + 1)}
                  style={{ display:'flex', alignItems:'center', gap:6, background:theme.gold, border:'none', borderRadius:8, padding:'9px 18px', fontSize:13, fontWeight:700, color:'#0b0f1a', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                  Próxima →
                </button>
              </div>
            </div>
          ) : (
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
          )}

          {/* Opção 2: Entradas sugeridas do repositório após erro */}
          {entradasSugeridas.length > 0 && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: theme.raised, border: `1px solid ${theme.gold}44`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={12} /> No seu repositório sobre este tema:
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
                style={{ display:'flex', alignItems:'center', gap:6, background:theme.toastOk, border:`1px solid ${theme.success}`, color:theme.success, borderRadius:8, padding:'10px 20px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter, sans-serif', marginLeft:'auto' }}>
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
