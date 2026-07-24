import { useState } from 'react'
import { supabase } from '../supabase'
import { Calendar, Clock, BookOpen, ChevronRight, ChevronLeft, Check, RotateCcw, Zap, Lightbulb, GripVertical } from 'lucide-react'

const TODAS_DISCIPLINAS = [
  { id: 'etica',    nome: 'Ética Profissional',   peso: 10, cor: '#7c3aed' },
  { id: 'civil',    nome: 'Direito Civil',          peso: 14, cor: '#16a34a' },
  { id: 'procc',    nome: 'Processo Civil',         peso: 13, cor: '#2563eb' },
  { id: 'const',    nome: 'Direito Constitucional', peso: 10, cor: '#0284c7' },
  { id: 'penal',    nome: 'Direito Penal',           peso: 11, cor: '#e11d48' },
  { id: 'procp',    nome: 'Processo Penal',          peso: 8,  cor: '#a21caf' },
  { id: 'trab',     nome: 'Direito do Trabalho',     peso: 8,  cor: '#d97706' },
  { id: 'trib',     nome: 'Direito Tributário',      peso: 8,  cor: '#ea580c' },
  { id: 'emp',      nome: 'Direito Empresarial',     peso: 8,  cor: '#64748b' },
  { id: 'adm',      nome: 'Direito Administrativo',  peso: 8,  cor: '#be185d' },
  { id: 'simulado', nome: 'Simulados',               peso: 6,  cor: '#0891b2' },
]

const DIAS_SEMANA = [
  { id: 0, label: 'Dom', full: 'Domingo' },
  { id: 1, label: 'Seg', full: 'Segunda' },
  { id: 2, label: 'Ter', full: 'Terça' },
  { id: 3, label: 'Qua', full: 'Quarta' },
  { id: 4, label: 'Qui', full: 'Quinta' },
  { id: 5, label: 'Sex', full: 'Sexta' },
  { id: 6, label: 'Sáb', full: 'Sábado' },
]

// Gera as sessões dinamicamente com base nas preferências
export function gerarSessoes(config) {
  const { dataInicio, diasSemana, horasPorDia, disciplinasPrioridade, dataFimFase1, dataFimFase2 } = config

  const inicio = new Date(dataInicio + 'T12:00:00')
  const fimFase1 = new Date(dataFimFase1 + 'T12:00:00')
  const fimFase2 = new Date(dataFimFase2 + 'T12:00:00')

  // Calcular sessões por disciplina baseado no peso e prioridade
  const discComPeso = TODAS_DISCIPLINAS.map(d => {
    const priorIdx = disciplinasPrioridade.indexOf(d.id)
    const multiplicador = priorIdx === -1 ? 1 : priorIdx < 3 ? 1.5 : priorIdx < 6 ? 1.2 : 0.8
    return { ...d, pesoFinal: Math.round(d.peso * multiplicador) }
  })
  const pesoTotal = discComPeso.reduce((s, d) => s + d.pesoFinal, 0)

  // Coletar todos os dias disponíveis até fim da fase 2
  const diasDisponiveis = []
  const cursor = new Date(inicio)
  while (cursor <= fimFase2) {
    if (diasSemana.includes(cursor.getDay())) {
      diasDisponiveis.push(new Date(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  // Separar dias da fase 1 e fase 2
  const diasFase1 = diasDisponiveis.filter(d => d <= fimFase1)
  const diasFase2 = diasDisponiveis.filter(d => d > fimFase1)

  // Distribuir sessões proporcionalmente ao peso
  const totalFase1 = diasFase1.length
  const sessoes = []

  // Fase 1 — distribuir disciplinas proporcionalmente
  const fila = []
  discComPeso.forEach(d => {
    const qtd = Math.max(1, Math.round((d.pesoFinal / pesoTotal) * totalFase1))
    for (let i = 0; i < qtd; i++) fila.push(d)
  })

  // Embaralhar mantendo ordem de prioridade
  const filaNormalizada = []
  let idxFila = 0
  diasFase1.forEach((dia, i) => {
    const disc = fila[idxFila % fila.length]
    idxFila++
    filaNormalizada.push({
      date: dia.toISOString().slice(0, 10),
      fase: '1ª Fase',
      disciplina: disc.nome,
      cor: disc.cor,
      topico: gerarTopico(disc.id, i, '1'),
      metodos: gerarMetodos(disc.id, i),
    })
  })

  // Fase 2 — Direito Constitucional (pode ser ajustado)
  diasFase2.forEach((dia, i) => {
    filaNormalizada.push({
      date: dia.toISOString().slice(0, 10),
      fase: '2ª Fase',
      disciplina: 'Direito Constitucional',
      cor: '#0284c7',
      topico: gerarTopicoFase2(i),
      metodos: ['Peça Processual', 'Simulado'],
    })
  })

  return filaNormalizada.map((s, i) => ({ ...s, id: `u${i}` }))
}

function gerarTopico(discId, idx, fase) {
  const topicos = {
    etica: ['Lei 8.906/94: deveres, incompatibilidades, infrações e sanções', 'CED 02/2015: relações com cliente, sigilo, publicidade, honorários', 'Revisão Ética: questões FGV de exames anteriores'],
    civil: ['Pessoas, bens, negócios jurídicos e prescrição (CC arts. 1-232)', 'Obrigações: modalidades, extinção e inadimplemento (CC arts. 233-420)', 'Contratos em espécie e responsabilidade civil (CC arts. 481-954)', 'Família e sucessões (CC arts. 1.511-1.990)', 'Posse, propriedade e direitos reais (CC arts. 1.196-1.510)'],
    procc: ['Normas fundamentais e competência (CPC arts. 1-66)', 'Petição inicial, citação e resposta (CPC arts. 319-351)', 'Provas: ônus, documentos, testemunhas, perícia (CPC arts. 369-484)', 'Tutelas provisórias e cumprimento de sentença (CPC arts. 294-538)', 'Recursos: apelação, agravo, REsp, RE (CPC arts. 994-1044)'],
    const: ['Direitos fundamentais: individuais, coletivos, sociais (CF arts. 5-17)', 'Organização político-administrativa e poderes (CF arts. 18-135)', 'Controle de constitucionalidade: ADI, ADC, ADPF, ADO (Lei 9.868/99)', 'Remédios constitucionais: HC, HD, MS, MI, AP (CF art. 5º)'],
    penal: ['Teoria do crime: tipicidade, ilicitude, culpabilidade (CP arts. 1-28)', 'Concurso de agentes, penas e extinção da punibilidade (CP arts. 29-120)', 'Crimes contra a pessoa e o patrimônio (CP arts. 121-183)'],
    procp: ['Inquérito policial, ação penal e competência (CPP arts. 4-91)', 'Provas e prisão cautelar (CPP arts. 155-350)', 'Procedimentos e recursos (CPP arts. 394-667)'],
    trab: ['Contrato de trabalho, rescisão e FGTS (CLT arts. 2-19 + Lei 8.036/90)', 'Processo do trabalho: reclamação, audiência, recursos (CLT arts. 763-910)'],
    trib: ['Tributos, obrigação e crédito tributário (CTN arts. 1-95)', 'Competência tributária e limitações ao poder de tributar (CF arts. 145-162)'],
    emp: ['Empresário, sociedades e S/A (CC arts. 966-1195 + Lei 6.404/76)', 'Títulos de crédito: cheque, duplicata, nota promissória (leis específicas)'],
    adm: ['Atos administrativos, poderes e agentes públicos', 'Licitações (Lei 14.133/21) e responsabilidade civil do Estado'],
    simulado: ['Simulado FGV-padrão: 30 questões — revisão parcial', 'Simulado completo: 80 questões — condições reais de prova', 'Simulado: análise de desempenho por disciplina'],
  }
  const lista = topicos[discId] || ['Revisão e questões FGV']
  return lista[idx % lista.length]
}

function gerarTopicoFase2(idx) {
  const t = ['Estrutura da peça constitucional: cabeçalho, qualificação, fatos, fundamentos, pedidos',
    'Mandado de Segurança Individual (Lei 12.016/09 + CF art. 5º, LXIX)',
    'Habeas Corpus: HC liberatório e preventivo (CPP arts. 647-667)',
    'Mandado de Injunção (Lei 13.300/16 + CF art. 5º, LXXI)',
    'Ação Popular (Lei 4.717/65 + CF art. 5º, LXXIII)',
    'Simulado completo 2ª Fase: peça + discursiva em condições reais (4h30)',
    'Discursiva: controle de constitucionalidade — ADI, ADC, ADPF',
    'Revisão Final: lei seca das peças constitucionais']
  return t[idx % t.length]
}

function gerarMetodos(discId, idx) {
  if (discId === 'simulado') return ['Simulado', 'Questões FGV']
  if (idx % 4 === 0) return ['Lei Seca', 'Questões FGV']
  if (idx % 4 === 3) return ['Questões FGV', 'Súmulas STJ/STF']
  return ['Questões FGV', 'Lei Seca']
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function CronogramaWizard({ session, theme, onConcluir }) {
  const [etapa, setEtapa] = useState(1)
  const [config, setConfig] = useState({
    dataInicio: new Date().toISOString().slice(0, 10),
    diasSemana: [1, 3, 5, 6], // Seg, Qua, Sex, Sáb
    horasPorDia: 2,
    disciplinasPrioridade: TODAS_DISCIPLINAS.map(d => d.id),
    dataFimFase1: '2027-01-10',
    dataFimFase2: '2027-02-27',
  })
  const [gerando, setGerando] = useState(false)
  const [preview, setPreview] = useState(null)
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)

  function toggleDia(id) {
    setConfig(c => ({
      ...c,
      diasSemana: c.diasSemana.includes(id)
        ? c.diasSemana.filter(d => d !== id)
        : [...c.diasSemana, id].sort(),
    }))
  }

  function moverDisc(idx, dir) {
    setConfig(c => {
      const arr = [...c.disciplinasPrioridade]
      const novo = idx + dir
      if (novo < 0 || novo >= arr.length) return c
      ;[arr[idx], arr[novo]] = [arr[novo], arr[idx]]
      return { ...c, disciplinasPrioridade: arr }
    })
  }

  function reordenarDisc(origem, destino) {
    if (origem === destino) return
    setConfig(c => {
      const arr = [...c.disciplinasPrioridade]
      const [movida] = arr.splice(origem, 1)
      arr.splice(destino, 0, movida)
      return { ...c, disciplinasPrioridade: arr }
    })
  }

  function handleDragStart(idx) {
    setDragIdx(idx)
  }

  function handleDragOver(e, idx) {
    e.preventDefault()
    if (idx !== overIdx) setOverIdx(idx)
  }

  function handleDrop(idx) {
    if (dragIdx !== null) reordenarDisc(dragIdx, idx)
    setDragIdx(null)
    setOverIdx(null)
  }

  function handleDragEnd() {
    setDragIdx(null)
    setOverIdx(null)
  }

  function gerarPreview() {
    const sessoes = gerarSessoes(config)
    setPreview(sessoes)
    setEtapa(5)
  }

  async function confirmar() {
    setGerando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Apagar progresso das sessões antigas (os ids são recalculados a cada
      // geração, então progresso antigo ficaria órfão referenciando sessões
      // que não existem mais no novo cronograma)
      const { error: delErr } = await supabase.from('oab_sessoes').delete().eq('user_id', user.id)
      if (delErr) throw new Error('Erro ao limpar progresso antigo: ' + delErr.message)

      // Salvar a configuração do cronograma (usada pra reconstruir o
      // cronograma personalizado sempre que o app é reaberto)
      const { error: cfgErr } = await supabase.from('oab_cronograma_config').upsert({
        user_id: user.id,
        config,
        atualizado_em: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      if (cfgErr) throw new Error('Erro ao salvar configuração: ' + cfgErr.message)

      onConcluir(preview, config)
    } catch (e) {
      alert('Erro: ' + e.message)
    }
    setGerando(false)
  }

  const inp = (style = {}) => ({
    background: theme.raised, border: `1px solid ${theme.border}`,
    borderRadius: 8, color: theme.text, fontSize: 13,
    fontFamily: 'Inter, sans-serif', padding: '10px 12px',
    outline: 'none', width: '100%', boxSizing: 'border-box', ...style,
  })

  const btn = (primary, style = {}) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    background: primary ? theme.gold : theme.raised,
    border: `1px solid ${primary ? theme.gold : theme.border}`,
    color: primary ? '#0b0f1a' : theme.text,
    borderRadius: 8, padding: '10px 18px', fontSize: 13,
    fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', ...style,
  })

  const card = {
    background: theme.raised, border: `1px solid ${theme.border}`,
    borderRadius: 12, padding: '16px 18px', marginBottom: 12,
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Calendar size={18} color={theme.gold} />
          <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
            Configurar Cronograma — 48º Exame OAB
          </span>
        </div>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= etapa ? theme.gold : theme.border, transition: 'background .3s' }} />
          ))}
        </div>
      </div>

      {/* ── Etapa 1: Data de início ── */}
      {etapa === 1 && (
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.text, fontFamily: 'Georgia, serif', marginBottom: 6 }}>
            Quando você quer começar?
          </div>
          <div style={{ fontSize: 13, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
            Escolha a data da primeira sessão de estudos.
          </div>
          <div style={card}>
            <label style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Data de início
            </label>
            <input type="date" value={config.dataInicio}
              onChange={e => setConfig(c => ({ ...c, dataInicio: e.target.value }))}
              style={inp()} />
          </div>
          <div style={{ ...card, marginTop: 8 }}>
            <label style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              Datas do exame
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: theme.muted, marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>1ª Fase</div>
                <input type="date" value={config.dataFimFase1}
                  onChange={e => setConfig(c => ({ ...c, dataFimFase1: e.target.value }))}
                  style={inp()} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: theme.muted, marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>2ª Fase</div>
                <input type="date" value={config.dataFimFase2}
                  onChange={e => setConfig(c => ({ ...c, dataFimFase2: e.target.value }))}
                  style={inp()} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Etapa 2: Dias da semana ── */}
      {etapa === 2 && (
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.text, fontFamily: 'Georgia, serif', marginBottom: 6 }}>
            Quais dias você consegue estudar?
          </div>
          <div style={{ fontSize: 13, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
            Selecione todos os dias disponíveis na semana.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {DIAS_SEMANA.map(d => {
              const ativo = config.diasSemana.includes(d.id)
              return (
                <button key={d.id} onClick={() => toggleDia(d.id)}
                  style={{ ...btn(ativo), borderRadius: 10, padding: '12px 16px', flexDirection: 'column', gap: 2, minWidth: 52 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{d.label}</span>
                  {ativo && <Check size={11} />}
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
            {config.diasSemana.length} dia{config.diasSemana.length !== 1 ? 's' : ''} selecionado{config.diasSemana.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ── Etapa 3: Horas por dia ── */}
      {etapa === 3 && (
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.text, fontFamily: 'Georgia, serif', marginBottom: 6 }}>
            Quantas horas por dia?
          </div>
          <div style={{ fontSize: 13, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
            Seja realista — é melhor 1h consistente do que 4h esporádicas.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map(h => (
              <button key={h} onClick={() => setConfig(c => ({ ...c, horasPorDia: h }))}
                style={{ ...btn(config.horasPorDia === h), borderRadius: 10, padding: '14px 20px', flexDirection: 'column', gap: 4, flex: 1 }}>
                <span style={{ fontSize: 22, fontWeight: 700 }}>{h}h</span>
                <span style={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}>
                  {h === 1 ? 'Leve' : h === 2 ? 'Moderado' : h === 3 ? 'Intenso' : 'Imersão'}
                </span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '10px 14px', background: theme.gold + '11', border: `1px solid ${theme.gold}33`, borderRadius: 8, fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lightbulb size={14} color={theme.gold} /> Com {config.diasSemana.length} dia{config.diasSemana.length !== 1 ? 's' : ''}/semana × {config.horasPorDia}h = <strong style={{ color: theme.gold }}>{config.diasSemana.length * config.horasPorDia}h de estudo por semana</strong>
          </div>
        </div>
      )}

      {/* ── Etapa 4: Prioridade de disciplinas ── */}
      {etapa === 4 && (
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.text, fontFamily: 'Georgia, serif', marginBottom: 6 }}>
            Ordene por prioridade
          </div>
          <div style={{ fontSize: 13, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 16 }}>
            Arraste ou use as setas para colocar as mais importantes no topo. As primeiras receberão mais sessões.
          </div>
          <div>
            {config.disciplinasPrioridade.map((id, idx) => {
              const disc = TODAS_DISCIPLINAS.find(d => d.id === id)
              if (!disc) return null
              const arrastando = dragIdx === idx
              const alvoDoArraste = overIdx === idx && dragIdx !== null && dragIdx !== idx
              return (
                <div key={id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    background: theme.raised, border: `1px solid ${alvoDoArraste ? theme.gold : theme.border}`,
                    borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${disc.cor}`,
                    opacity: arrastando ? 0.4 : 1, cursor: 'grab',
                    transition: 'border-color .12s, opacity .12s',
                  }}>
                  <GripVertical size={14} color={theme.muted} style={{ flexShrink: 0, cursor: 'grab' }} />
                  <span style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', minWidth: 20, textAlign: 'center' }}>{idx + 1}</span>
                  <div style={{ flex: 1, fontSize: 13, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{disc.nome}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => moverDisc(idx, -1)} disabled={idx === 0}
                      style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: '3px 6px', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? theme.border : theme.muted }}>
                      ↑
                    </button>
                    <button onClick={() => moverDisc(idx, 1)} disabled={idx === config.disciplinasPrioridade.length - 1}
                      style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: '3px 6px', cursor: idx === config.disciplinasPrioridade.length - 1 ? 'default' : 'pointer', color: idx === config.disciplinasPrioridade.length - 1 ? theme.border : theme.muted }}>
                      ↓
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Etapa 5: Preview ── */}
      {etapa === 5 && preview && (
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.text, fontFamily: 'Georgia, serif', marginBottom: 6 }}>
            Seu cronograma está pronto
          </div>
          <div style={{ fontSize: 13, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 16 }}>
            Revise e confirme. Isso vai substituir o cronograma atual.
          </div>

          {/* Resumo */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { v: preview.length, l: 'sessões no total', c: theme.gold },
              { v: preview.filter(s => s.fase === '1ª Fase').length, l: 'na 1ª Fase', c: '#10b981' },
              { v: preview.filter(s => s.fase === '2ª Fase').length, l: 'na 2ª Fase', c: '#a78bfa' },
            ].map(({ v, l, c }) => (
              <div key={l} style={{ flex: 1, minWidth: 100, background: theme.raised, border: `1px solid ${c}33`, borderLeft: `3px solid ${c}`, borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c, fontFamily: 'IBM Plex Mono, monospace' }}>{v}</div>
                <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Primeiras sessões */}
          <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Próximas sessões
          </div>
          {preview.slice(0, 5).map((s, i) => (
            <div key={i} style={{ ...card, borderLeft: `3px solid ${s.cor || theme.gold}`, padding: '10px 14px', marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: s.cor || theme.gold, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>{s.disciplina}</span>
                <span style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
                  {new Date(s.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>{s.topico}</div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', textAlign: 'center', marginBottom: 16 }}>
            + {preview.length - 5} sessões até a 2ª Fase
          </div>
        </div>
      )}

      {/* Navegação */}
      <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'space-between' }}>
        {etapa > 1 && etapa < 5 && (
          <button onClick={() => setEtapa(e => e - 1)} style={btn(false)}>
            <ChevronLeft size={15} /> Voltar
          </button>
        )}
        {etapa === 5 && (
          <button onClick={() => setEtapa(1)} style={btn(false)}>
            <RotateCcw size={14} /> Reconfigurar
          </button>
        )}
        <div style={{ flex: 1 }} />
        {etapa < 4 && (
          <button onClick={() => setEtapa(e => e + 1)}
            disabled={etapa === 2 && config.diasSemana.length === 0}
            style={btn(true)}>
            Próximo <ChevronRight size={15} />
          </button>
        )}
        {etapa === 4 && (
          <button onClick={gerarPreview} style={btn(true)}>
            <Zap size={14} /> Gerar cronograma
          </button>
        )}
        {etapa === 5 && (
          <button onClick={confirmar} disabled={gerando} style={btn(true)}>
            <Check size={14} /> {gerando ? 'Salvando...' : 'Confirmar e salvar'}
          </button>
        )}
      </div>
    </div>
  )
}
