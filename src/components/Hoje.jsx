import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { corDaArea } from '../shared'
import { estaPendente } from '../utils/spacedRepetition'
import { Dumbbell, Sparkles, Check } from 'lucide-react'

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000

export default function Hoje({ entradas, session, onIrParaFlashcards, onSelectEntrada }) {
  const { theme } = useTheme()
  const [revisaoMap, setRevisaoMap] = useState(null)     // flashcards: entrada_id -> { proxima_revisao }

  useEffect(() => {
    if (!session) { setRevisaoMap({}); return }

    supabase.from('flashcards').select('entrada_id, proxima_revisao').eq('user_id', session.user.id)
      .then(({ data }) => {
        const mapa = {}
        ;(data || []).forEach(r => { mapa[r.entrada_id] = r })
        setRevisaoMap(mapa)
      })
  }, [session])

  const cardsElegiveis = useMemo(() => entradas.filter(e => Array.isArray(e.teses) && e.teses.some(t => t.tese_assunto?.trim())), [entradas])
  const cardsPendentes = useMemo(() => {
    if (!revisaoMap) return 0
    return cardsElegiveis.filter(e => estaPendente(revisaoMap[e.id])).length
  }, [cardsElegiveis, revisaoMap])

  const novidades = useMemo(() => {
    const agora = Date.now()
    const recentes = entradas.filter(e => e.criado_em && (agora - new Date(e.criado_em).getTime()) < SETE_DIAS_MS)
    const base = recentes.length > 0 ? recentes : [...entradas].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)).slice(0, 5)
    return [...base].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)).slice(0, 8)
  }, [entradas])

  const carregando = revisaoMap === null
  const semPendencias = !carregando && cardsPendentes === 0

  const card = { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20 }
  const secLabel = { fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, fontFamily: 'IBM Plex Mono, monospace' }

  const data = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4, textTransform: 'capitalize' }}>
          Hoje
        </div>
        <div style={{ fontSize: 12, color: theme.muted, textTransform: 'capitalize' }}>{data}</div>
      </div>

      {/* ── Pendências ────────────────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={secLabel}>Pendências</div>

        {carregando ? (
          <div style={{ color: theme.muted, fontSize: 12 }}>Carregando...</div>
        ) : semPendencias ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <Check size={18} color={theme.success} />
            <div style={{ fontSize: 13, color: theme.text }}>Nada pendente hoje. Tudo revisado.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cardsPendentes > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', background: theme.raised, border: `1px solid ${theme.border}`, borderLeft: `3px solid ${theme.gold}`, borderRadius: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Dumbbell size={16} color={theme.gold} />
                  <div style={{ fontSize: 12, color: theme.text, fontFamily: 'IBM Plex Mono, monospace' }}>
                    {cardsPendentes} card{cardsPendentes !== 1 ? 's' : ''} de flashcard{cardsPendentes !== 1 ? 's' : ''} pendente{cardsPendentes !== 1 ? 's' : ''}
                  </div>
                </div>
                {onIrParaFlashcards && (
                  <button onClick={onIrParaFlashcards} style={{ background: theme.gold, color: '#0b0f1a', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Revisar
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Novidades ─────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={secLabel}>Novidades</div>
        {novidades.length === 0 ? (
          <div style={{ color: theme.muted, fontSize: 12 }}>Nenhuma entrada ainda.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {novidades.map(e => {
              const cor = corDaArea(e.area, theme)
              return (
                <div key={e.id} onClick={() => onSelectEntrada?.(e)}
                  style={{
                    padding: '10px 14px', background: theme.raised,
                    border: `1px solid ${theme.border}`, borderLeft: `3px solid ${cor}`,
                    borderRadius: 8, cursor: onSelectEntrada ? 'pointer' : 'default',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {e.area === 'Informativo' && (
                      <span style={{ fontSize: 8, color: '#10b981', border: '1px solid #10b98155', borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0 }}>
                        <Sparkles size={8} style={{ marginRight: 2, verticalAlign: -1 }} />novo
                      </span>
                    )}
                    <div style={{ fontSize: 13, color: theme.text, fontFamily: 'IBM Plex Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.tema}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: theme.muted, marginTop: 3 }}>
                    {e.area}{e.fonte && ` · ${e.fonte}`} · {new Date(e.criado_em).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
