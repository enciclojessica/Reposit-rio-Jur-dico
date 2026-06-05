import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import {
  BookOpen, CheckCircle, Circle, ChevronDown, ChevronUp,
  Trophy, Target, Clock, TrendingUp, RefreshCw, Star
} from 'lucide-react'

// ── Estrutura de matérias OAB 1ª Fase ──────────────────────────
const MATERIAS_OAB = [
  {
    id: 'direito_civil',
    nome: 'Direito Civil',
    cor: '#3b82f6',
    temas: [
      'Teoria Geral do Direito Civil', 'Pessoa Natural e Jurídica', 'Bens',
      'Negócio Jurídico', 'Atos Jurídicos Lícitos e Ilícitos', 'Prescrição e Decadência',
      'Família', 'Direito das Sucessões', 'Contratos em Espécie',
      'Responsabilidade Civil', 'Direitos Reais', 'Posse',
    ],
  },
  {
    id: 'direito_constitucional',
    nome: 'Direito Constitucional',
    cor: '#f59e0b',
    temas: [
      'Teoria da Constituição', 'Direitos e Garantias Fundamentais',
      'Organização do Estado', 'Organização dos Poderes',
      'Defesa do Estado e Instituições Democráticas',
      'Tributação e Orçamento', 'Ordem Econômica e Financeira',
      'Ordem Social', 'Controle de Constitucionalidade',
    ],
  },
  {
    id: 'direito_penal',
    nome: 'Direito Penal',
    cor: '#ef4444',
    temas: [
      'Teoria da Lei Penal', 'Teoria do Crime', 'Punibilidade',
      'Teoria da Pena', 'Crimes contra a Pessoa',
      'Crimes contra o Patrimônio', 'Crimes contra a Administração Pública',
      'Legislação Penal Especial', 'Lei de Drogas',
    ],
  },
  {
    id: 'direito_processual_civil',
    nome: 'Direito Processual Civil',
    cor: '#8b5cf6',
    temas: [
      'Princípios e Normas Fundamentais', 'Jurisdição e Ação',
      'Partes e Procuradores', 'Litisconsórcio e Intervenção de Terceiros',
      'Atos Processuais', 'Tutelas Provisórias',
      'Procedimento Comum', 'Recursos', 'Execução',
      'Procedimentos Especiais', 'Processo nos Tribunais',
    ],
  },
  {
    id: 'direito_processual_penal',
    nome: 'Direito Processual Penal',
    cor: '#ec4899',
    temas: [
      'Princípios', 'Inquérito Policial', 'Ação Penal',
      'Jurisdição e Competência', 'Provas', 'Sujeitos Processuais',
      'Prisões e Medidas Cautelares', 'Procedimentos',
      'Nulidades', 'Recursos', 'Execução Penal',
    ],
  },
  {
    id: 'direito_tributario',
    nome: 'Direito Tributário',
    cor: '#10b981',
    temas: [
      'Sistema Tributário Nacional', 'Limitações ao Poder de Tributar',
      'Tributos em Espécie', 'Obrigação Tributária',
      'Crédito Tributário', 'Administração Tributária',
      'Processo Administrativo Tributário',
    ],
  },
  {
    id: 'direito_trabalho',
    nome: 'Direito do Trabalho',
    cor: '#f97316',
    temas: [
      'Princípios e Fontes', 'Contrato de Trabalho',
      'Remuneração e Salário', 'Jornada de Trabalho',
      'Férias', 'FGTS', 'Rescisão Contratual',
      'Estabilidade', 'Direito Coletivo do Trabalho',
    ],
  },
  {
    id: 'direito_administrativo',
    nome: 'Direito Administrativo',
    cor: '#06b6d4',
    temas: [
      'Conceito e Princípios', 'Poderes da Administração',
      'Atos Administrativos', 'Licitações e Contratos',
      'Serviços Públicos', 'Bens Públicos',
      'Responsabilidade Civil do Estado',
      'Controle da Administração', 'Improbidade Administrativa',
    ],
  },
  {
    id: 'etica_oab',
    nome: 'Ética e Estatuto da OAB',
    cor: '#c9a452',
    temas: [
      'Estatuto da OAB', 'Código de Ética e Disciplina',
      'Direitos e Deveres do Advogado', 'Sigilo Profissional',
      'Incompatibilidades e Impedimentos',
      'Processo Disciplinar', 'Publicidade na Advocacia',
    ],
  },
]

const STATUS = {
  nao_iniciado: { label: 'Não iniciado', cor: '#6b7280', icon: Circle },
  em_andamento: { label: 'Em andamento', cor: '#f59e0b', icon: Clock },
  revisando:    { label: 'Revisando',    cor: '#3b82f6', icon: RefreshCw },
  dominado:     { label: 'Dominado',     cor: '#10b981', icon: CheckCircle },
}

// ── Hook de persistência ────────────────────────────────────────
function useOabProgresso(session) {
  const [progresso, setProgresso] = useState({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!session) return
    carregar()
  }, [session])

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase
      .from('oab_progresso')
      .select('tema_id, status, anotacao, atualizado_em')
      .eq('user_id', session.user.id)
    if (data) {
      const map = {}
      data.forEach(r => { map[r.tema_id] = r })
      setProgresso(map)
    }
    setCarregando(false)
  }

  async function atualizarTema(temaId, novoStatus, anotacao) {
    const novo = { ...progresso, [temaId]: { tema_id: temaId, status: novoStatus, anotacao: anotacao ?? progresso[temaId]?.anotacao ?? '' } }
    setProgresso(novo)
    await supabase.from('oab_progresso').upsert({
      user_id:      session.user.id,
      tema_id:      temaId,
      status:       novoStatus,
      anotacao:     anotacao ?? progresso[temaId]?.anotacao ?? '',
      atualizado_em: new Date().toISOString(),
    }, { onConflict: 'user_id,tema_id' })
  }

  return { progresso, carregando, atualizarTema, carregar }
}

// ── Componente de tema individual ───────────────────────────────
function TemaRow({ temaId, nome, status, anotacao, onAtualizar, theme }) {
  const [editando, setEditando] = useState(false)
  const [nota, setNota]         = useState(anotacao || '')
  const statusAtual = STATUS[status] || STATUS.nao_iniciado
  const Icon = statusAtual.icon

  const proximoStatus = () => {
    const ordem = ['nao_iniciado', 'em_andamento', 'revisando', 'dominado']
    const idx = ordem.indexOf(status || 'nao_iniciado')
    return ordem[(idx + 1) % ordem.length]
  }

  return (
    <div style={{ borderBottom: `1px solid ${theme.border}`, padding: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => onAtualizar(temaId, proximoStatus(), nota)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: statusAtual.cor, flexShrink: 0, padding: 0 }}>
          <Icon size={18} />
        </button>
        <span style={{ flex: 1, fontSize: 13, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{nome}</span>
        <span style={{ fontSize: 10, color: statusAtual.cor, background: statusAtual.cor + '18', border: `1px solid ${statusAtual.cor}33`, borderRadius: 4, padding: '2px 7px', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {statusAtual.label}
        </span>
        <button onClick={() => setEditando(e => !e)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.muted, padding: 0 }}>
          <Star size={14} color={anotacao ? theme.gold : theme.muted} />
        </button>
      </div>
      {editando && (
        <div style={{ marginTop: 8, marginLeft: 28 }}>
          <textarea
            value={nota}
            onChange={e => setNota(e.target.value)}
            placeholder="Anotação pessoal sobre este tema..."
            rows={2}
            style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', color: theme.text, fontSize: 12, fontFamily: 'Inter, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
          <button onClick={() => { onAtualizar(temaId, status || 'nao_iniciado', nota); setEditando(false) }}
            style={{ marginTop: 4, background: theme.gold, border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 11, fontWeight: 600, color: '#0b0f1a', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Salvar anotação
          </button>
        </div>
      )}
    </div>
  )
}

// ── Card de matéria ─────────────────────────────────────────────
function MateriaCard({ materia, progresso, onAtualizar, theme }) {
  const [aberta, setAberta] = useState(false)

  const total    = materia.temas.length
  const dominados = materia.temas.filter(t => progresso[`${materia.id}__${t}`]?.status === 'dominado').length
  const emAndamento = materia.temas.filter(t => ['em_andamento','revisando'].includes(progresso[`${materia.id}__${t}`]?.status)).length
  const pct = Math.round((dominados / total) * 100)

  return (
    <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderLeft: `3px solid ${materia.cor}`, borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      <button onClick={() => setAberta(a => !a)}
        style={{ width: '100%', background: 'none', border: 'none', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>
            {materia.nome}
          </div>
          {/* Barra de progresso */}
          <div style={{ height: 5, background: theme.border, borderRadius: 3, overflow: 'hidden', width: '100%' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: materia.cor, borderRadius: 3, transition: 'width .4s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 5 }}>
            <span style={{ fontSize: 10, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>{pct}% dominado</span>
            <span style={{ fontSize: 10, color: '#10b981', fontFamily: 'IBM Plex Mono, monospace' }}>{dominados}/{total} temas</span>
            {emAndamento > 0 && <span style={{ fontSize: 10, color: '#f59e0b', fontFamily: 'IBM Plex Mono, monospace' }}>{emAndamento} em andamento</span>}
          </div>
        </div>
        {aberta ? <ChevronUp size={16} color={theme.muted} /> : <ChevronDown size={16} color={theme.muted} />}
      </button>

      {aberta && (
        <div style={{ padding: '0 16px 12px', borderTop: `1px solid ${theme.border}` }}>
          {materia.temas.map(tema => {
            const id = `${materia.id}__${tema}`
            return (
              <TemaRow
                key={id}
                temaId={id}
                nome={tema}
                status={progresso[id]?.status}
                anotacao={progresso[id]?.anotacao}
                onAtualizar={onAtualizar}
                theme={theme}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Dashboard principal ─────────────────────────────────────────
export default function OabDashboard({ session }) {
  const { theme } = useTheme()
  const { progresso, carregando, atualizarTema } = useOabProgresso(session)

  // Estatísticas globais
  const totalTemas = MATERIAS_OAB.reduce((acc, m) => acc + m.temas.length, 0)
  const dominados  = Object.values(progresso).filter(p => p.status === 'dominado').length
  const emAndamento = Object.values(progresso).filter(p => ['em_andamento','revisando'].includes(p.status)).length
  const pctGeral   = Math.round((dominados / totalTemas) * 100)

  if (carregando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: theme.gold, gap: 10 }}>
      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Carregando progresso...</span>
    </div>
  )

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Estudos OAB 1ª Fase
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
          Acompanhe seu progresso por matéria e tema. Clique no ícone para avançar o status.
        </div>
      </div>

      {/* Cards de estatística */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Progresso geral', valor: `${pctGeral}%`, cor: theme.gold, icon: TrendingUp },
          { label: 'Temas dominados', valor: `${dominados}/${totalTemas}`, cor: '#10b981', icon: Trophy },
          { label: 'Em andamento',    valor: emAndamento, cor: '#f59e0b', icon: Target },
        ].map((s, i) => (
          <div key={i} style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <s.icon size={16} color={s.cor} style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: s.cor, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{s.valor}</div>
            <div style={{ fontSize: 10, color: theme.muted, marginTop: 4, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Barra de progresso geral */}
      <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: theme.text, fontFamily: 'Inter, sans-serif' }}>Progresso total OAB</span>
          <span style={{ fontSize: 12, color: theme.gold, fontFamily: 'IBM Plex Mono, monospace' }}>{pctGeral}%</span>
        </div>
        <div style={{ height: 8, background: theme.border, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pctGeral}%`, background: `linear-gradient(90deg, ${theme.gold}, #10b981)`, borderRadius: 4, transition: 'width .6s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {Object.entries(STATUS).map(([key, s]) => {
            const count = key === 'nao_iniciado'
              ? totalTemas - Object.keys(progresso).length
              : Object.values(progresso).filter(p => p.status === key).length
            return (
              <span key={key} style={{ fontSize: 10, color: s.cor, fontFamily: 'IBM Plex Mono, monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.cor, display: 'inline-block' }} />
                {count} {s.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Lista de matérias */}
      {MATERIAS_OAB.map(m => (
        <MateriaCard
          key={m.id}
          materia={m}
          progresso={progresso}
          onAtualizar={atualizarTema}
          theme={theme}
        />
      ))}

      {/* Legenda */}
      <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 16px', marginTop: 8 }}>
        <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Como usar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(STATUS).map(([key, s]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <s.icon size={14} color={s.cor} />
              <span style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
                <b style={{ color: s.cor }}>{s.label}</b> — clique no ícone para avançar para o próximo status
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
