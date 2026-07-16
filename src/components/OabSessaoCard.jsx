import { useState, useMemo } from 'react'
import { CheckCircle, Clock, Circle, Timer, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { DISC_COR } from '../data/disciplinas'
import { METODO_COR, fmt, diasAte, fmtTempo } from '../data/oabDashboardHelpers'
import { parseLeiSeca } from '../utils/parseLeiSeca'
import { parseSimuladoTopico } from '../utils/parseSimuladoTopico'
import Cronometro from './OabCronometro'
import OabLeiSecaCard from './OabLeiSecaCard'

// ── Card de sessão ─────────────────────────────────────────────────────────────
export default function SessaoCard({ s, dados, onAtualizar, onPraticar, theme }) {
  const [aberto, setAberto] = useState(false)
  const d = dados[s.id] || {}
  const temLeiSeca = (s.metodos || []).includes('Lei Seca')
  const rangesLeiSeca = useMemo(() => temLeiSeca ? parseLeiSeca(s.topico) : [], [temLeiSeca, s.topico])
  const status = d.status || 'A Fazer'
  const cor    = DISC_COR[s.disciplina] || '#6b7280'
  const dias   = diasAte(s.date)
  const hoje   = new Date().toISOString().split('T')[0]
  const ehHoje = s.date === hoje
  const passou = s.date < hoje

  const STATUS_CICLO = ['A Fazer', 'Em Andamento', 'Concluído']
  const STATUS_COR   = { 'A Fazer': '#6b7280', 'Em Andamento': '#f59e0b', 'Concluído': '#10b981' }
  const STATUS_ICON  = { 'A Fazer': Circle, 'Em Andamento': Clock, 'Concluído': CheckCircle }
  const Icon = STATUS_ICON[status]

  function avancarStatus() {
    const idx = STATUS_CICLO.indexOf(status)
    onAtualizar(s.id, { status: STATUS_CICLO[(idx+1) % STATUS_CICLO.length] })
  }

  function salvarTempo(seg) {
    const anterior = d.tempo_total || 0
    onAtualizar(s.id, { tempo_total: anterior + seg })
  }

  return (
    <div style={{
      background: theme.raised,
      border: `1px solid ${ehHoje ? cor : theme.border}`,
      borderLeft: `3px solid ${cor}`,
      borderRadius: 10,
      marginBottom: 8,
      overflow: 'hidden',
      boxShadow: ehHoje ? `0 0 0 2px ${cor}22` : 'none',
    }}>
      {/* Header clicável */}
      <div onClick={() => setAberto(a => !a)}
        style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}>

        {/* Ícone de status */}
        <button onClick={e => { e.stopPropagation(); avancarStatus() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: STATUS_COR[status], flexShrink: 0, padding: 0, marginTop: 1 }}>
          <Icon size={18} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Data + badges */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
              {fmt(s.date)}
            </span>
            {ehHoje && (
              <span style={{ fontSize: 10, fontWeight: 700, color: cor, background: cor+'18', border: `1px solid ${cor}44`, borderRadius: 4, padding: '1px 6px', fontFamily: 'IBM Plex Mono, monospace' }}>
                HOJE
              </span>
            )}
            {passou && status !== 'Concluído' && (
              <span style={{ fontSize: 10, fontWeight: 600, color: '#ef4444', background: '#ef444418', border: '1px solid #ef444433', borderRadius: 4, padding: '1px 6px', fontFamily: 'IBM Plex Mono, monospace' }}>
                ATRASADA
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 600, color: cor, background: cor+'18', border: `1px solid ${cor}33`, borderRadius: 4, padding: '1px 6px', fontFamily: 'IBM Plex Mono, monospace' }}>
              {s.disciplina}
            </span>
            <span style={{ fontSize: 10, color: STATUS_COR[status], background: STATUS_COR[status]+'18', border: `1px solid ${STATUS_COR[status]}33`, borderRadius: 4, padding: '1px 6px', fontFamily: 'IBM Plex Mono, monospace' }}>
              {status}
            </span>
          </div>

          <div style={{ fontSize: 13, color: theme.text, fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
            {s.topico}
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {s.metodos.map(m => {
              const mc = METODO_COR[m] || { bg: theme.border, text: theme.muted }
              return (
                <span key={m} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, background: mc.bg, color: mc.text, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 500 }}>
                  {m}
                </span>
              )
            })}
            {d.tempo_total > 0 && (
              <span style={{ fontSize: 10, color: theme.gold, background: theme.gold+'18', borderRadius: 4, padding: '1px 7px', fontFamily: 'IBM Plex Mono, monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Timer size={9} /> {fmtTempo(d.tempo_total)}
              </span>
            )}
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          {!passou && Math.abs(dias) <= 7 && (
            <span style={{ fontSize: 10, color: dias <= 0 ? '#ef4444' : theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
              {dias > 0 ? `${dias}d` : dias === 0 ? 'hoje' : `${Math.abs(dias)}d atrás`}
            </span>
          )}
          {aberto ? <ChevronUp size={15} color={theme.muted} /> : <ChevronDown size={15} color={theme.muted} />}
        </div>
      </div>

      {/* Detalhe expandido */}
      {aberto && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${theme.border}` }}>
          {/* Acertos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <span style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>Acertos (%):</span>
            <input
              type="number" min="0" max="100"
              value={d.acertos ?? ''}
              onChange={e => onAtualizar(s.id, { acertos: e.target.value === '' ? null : Math.min(100, Math.max(0, +e.target.value)) })}
              placeholder="—"
              style={{ width: 60, textAlign: 'center', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.text, fontSize: 13, padding: '4px 8px', fontFamily: 'Inter, sans-serif', outline: 'none' }}
            />
            {d.acertos !== null && d.acertos !== undefined && (
              <span style={{ fontSize: 13, fontWeight: 700, color: d.acertos >= 70 ? '#10b981' : d.acertos >= 50 ? '#f59e0b' : '#ef4444' }}>
                {d.acertos >= 70 ? 'Aproveitamento bom' : d.acertos >= 50 ? 'Reforçar' : 'Atenção necessária'}
              </span>
            )}
          </div>

          {/* Anotação */}
          <div style={{ marginTop: 10 }}>
            <textarea
              value={d.anotacao || ''}
              onChange={e => onAtualizar(s.id, { anotacao: e.target.value })}
              placeholder="Anotação sobre esta sessão..."
              rows={2}
              style={{ width: '100%', background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', color: theme.text, fontSize: 12, fontFamily: 'Inter, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Cronômetro */}
          <Cronometro sessionId={s.id} onSalvar={salvarTempo} theme={theme} />

          {rangesLeiSeca.length > 0 && (
            <OabLeiSecaCard ranges={rangesLeiSeca} theme={theme} />
          )}

          {/* Botão Praticar / Iniciar Simulado */}
          {onPraticar && (
            s.disciplina === 'Simulado Geral' ? (() => {
              const { quantidade, disciplinas } = parseSimuladoTopico(s.topico)
              const rotuloDisciplinas = disciplinas.length
                ? disciplinas.map(d => d.replace('Direito ', '')).join(', ')
                : 'todas as disciplinas'
              return (
                <button
                  onClick={() => onPraticar('__simulado__', s.topico)}
                  style={{ marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#0891b215', border: '1px solid #0891b244', borderRadius: 8, padding: '9px', fontSize: 12, fontWeight: 600, color: '#0891b2', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  <BookOpen size={13} /> Iniciar Simulado — {quantidade} questões ({rotuloDisciplinas})
                </button>
              )
            })() : (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => onPraticar(s.disciplina, s.topico)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: cor+'15', border: `1px solid ${cor}44`, borderRadius: 8, padding: '9px', fontSize: 12, fontWeight: 600, color: cor, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  <BookOpen size={13} /> Praticar questões
                </button>
                <button
                  onClick={() => onPraticar('__simulado_disc__' + s.disciplina, s.topico)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#0891b215', border: '1px solid #0891b244', borderRadius: 8, padding: '9px', fontSize: 12, fontWeight: 600, color: '#0891b2', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  <BookOpen size={13} /> Simular tudo
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
